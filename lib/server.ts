import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { seed, type State } from './model';
import {upgradeDemoGifts} from './demo-gifts';

const GUEST_COOKIE = 'gift_demo_session';
export const database = () => { if(!env.DB) throw new Error('数据库未连接'); return env.DB; };

export function guestCookie(headersLike:Headers){
  const value=headersLike.get('cookie')?.match(/(?:^|;\s*)gift_demo_session=([0-9a-f-]{36})(?:;|$)/i)?.[1];
  return value&&/^[0-9a-f-]{36}$/i.test(value)?value:null;
}
export function newGuestCookie(){return `${GUEST_COOKIE}=${crypto.randomUUID()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;}
export async function owner(){
  const u=await getChatGPTUser(); if(u) return u.userId;
  const guest=guestCookie(await headers());if(guest)return `guest:${guest}`;
  if(process.env.NODE_ENV !== 'production') return 'local-preview';
  throw new Error('DEMO_SESSION_REQUIRED');
}
export async function read(ownerId:string):Promise<{state:State;revision:number}> {
 for(let attempt=0;attempt<4;attempt++){
  let row=await database().prepare('SELECT data,revision FROM notebooks WHERE owner=?').bind(ownerId).first<{data:string;revision:number}>();
  if(!row){
   await database().prepare('INSERT OR IGNORE INTO notebooks(owner,data,revision) VALUES (?,?,0)').bind(ownerId,JSON.stringify(seed())).run();
   row=await database().prepare('SELECT data,revision FROM notebooks WHERE owner=?').bind(ownerId).first<{data:string;revision:number}>();
  }
  const state=JSON.parse(row!.data) as State;
  if(!upgradeDemoGifts(state))return {state,revision:row!.revision};
  const result=await database().prepare('UPDATE notebooks SET data=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify(state),ownerId,row!.revision).run();
  if(result.meta.changes)return {state,revision:row!.revision+1};
 }
 throw Error('CONFLICT');
}
export async function save(ownerId:string,state:State,revision:number){const r=await database().prepare('UPDATE notebooks SET data=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify(state),ownerId,revision).run();if(!r.meta.changes)throw new Error('CONFLICT');}
export function failure(e:unknown){const m=e instanceof Error?e.message:'保存失败';const status=m==='UNAUTHORIZED'||m==='DEMO_SESSION_REQUIRED'?401:m==='CONFLICT'?409:400;const message=m==='UNAUTHORIZED'?'请先登录':m==='DEMO_SESSION_REQUIRED'?'体验已过期，请刷新页面继续':m==='CONFLICT'?'记录刚刚有更新，请重试':m;return Response.json({error:message},{status});}
