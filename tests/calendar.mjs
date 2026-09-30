import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../lib/gift-calendar.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const calendar=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const friend=(id,birthday,anniversaries=[])=>({id,name:id,avatar:0,birthday,relation:'朋友',mbti:'',tags:[],personalities:[],anniversaries});
const state={friends:[
 friend('birthday','1995-10-08'),
 friend('anniversary','2024-10-10',[{id:'a1',date:'2024-10-03',name:'相识纪念日'}]),
 friend('leap','2024-02-29'),
 friend('near','2020-10-16'),
 friend('same-person','2020-10-01',[{id:'a2',date:'2020-10-02',name:'相识日'}]),
],plans:[
 {id:'once',friendId:'birthday',date:'2026-10-09',scene:'手动约定',status:'planned'},
 {id:'cancelled',friendId:'near',date:'2026-10-01',scene:'取消计划',status:'planned',cancelled:true},
 {id:'completed',friendId:'near',date:'2026-10-02',scene:'已完成',status:'completed'},
]};
const today='2026-09-30';

assert(calendar.occurrencesOn(state,'2026-10-08').some(x=>x.personId==='birthday'&&x.eventName==='生日'),'生日按月日出现在 2026');
assert(calendar.occurrencesOn(state,'2027-10-08').some(x=>x.personId==='birthday'),'生日按月日出现在 2027');
assert(!calendar.occurrencesOn(state,'1994-10-08').some(x=>x.personId==='birthday'),'生日首次年份前不生成');
assert(calendar.occurrencesOn(state,'2026-10-03').some(x=>x.eventName==='相识纪念日'),'自定义纪念日跨年循环');
assert(!calendar.occurrencesOn(state,'2023-10-03').some(x=>x.personId==='anniversary'),'纪念日首次年份前不生成');
assert(calendar.occurrencesOn(state,'2025-02-28').some(x=>x.personId==='leap'),'2 月 29 日非闰年落在 2 月 28 日');
assert(calendar.occurrencesOn(state,'2026-10-09').some(x=>x.eventName==='手动约定'),'一次性计划保留完整日期');
assert(!calendar.occurrencesOn(state,'2027-10-09').some(x=>x.eventName==='手动约定'),'一次性计划不循环');

const yearCards=calendar.upcomingYearCards(state,today);
const shortCards=calendar.upcomingThreeMonthCards(state,today);
assert(yearCards.some(x=>x.personId==='leap'),'一年的近期弹窗范围包含下一年生日');
assert(!shortCards.some(x=>x.personId==='leap'),'页面三个月范围不包含下一年生日');
assert.equal(yearCards.filter(x=>x.personId==='same-person').length,1,'一人多事件在近期列表仅保留最近一条');

const daySections=calendar.giftPageSections(state,'2026-10-08',2026,9,today);
assert.equal(daySections.currentHeading,'当天的送礼计划');
assert.deepEqual(daySections.current.map(x=>x.personId),['birthday']);
assert(!daySections.recent.some(x=>x.personId==='birthday'),'模块 2 以稳定 personId 去重');
const monthSections=calendar.giftPageSections(state,'',2026,9,today);
assert.equal(monthSections.currentHeading,'当月的送礼计划');
assert(monthSections.current.some(x=>x.personId==='birthday'));
const pastNoPlan=calendar.giftPageSections(state,'2026-09-29',2026,8,today);
assert.equal(pastNoPlan.message,'往事不可追，看看近期安排～');
const emptyMonth=calendar.giftPageSections(state,'',2026,10,today);
assert.equal(emptyMonth.message,'该月没计划，先看下近期节日安排～');

assert.deepEqual(calendar.peopleFor(state,9,8,2026).map(x=>x.id),['birthday'],'日历标记复用 occurrence 管线');
assert.equal(calendar.threeMonthsFrom('2026-11-30'),'2027-02-28');
for(const [y,date] of [[2024,'08-10'],[2025,'08-29'],[2026,'08-19'],[2027,'08-08']]){const [m,d]=date.split('-').map(Number);assert.equal(calendar.holiday(m-1,d,y),'七夕');}
for(const [m,d] of [[1,1],[2,17],[3,3],[4,5],[5,1],[6,19],[9,25],[10,1]])assert.equal(calendar.holiday(m-1,d,2026),undefined);
assert.equal(calendar.holiday(11,25,2026),'圣诞节');
console.log('PASS: yearly birthday/anniversary occurrences, first-effective year, leap handling, one-time plans, month/day sections, personId dedupe, 1-year vs 3-month ranges, and holiday whitelist.');
