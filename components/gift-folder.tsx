'use client';
import {useId,useLayoutEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {ChevronDown} from 'lucide-react';
import {GiftRecordStamp} from './gift-stamp';
import type {Friend,Gift} from '@/lib/model';

/** One DOM copy of each gift; first three travel from the folder to the grid. */
export default function GiftFolder({friend,gifts,index,avatar,onSelect}:{friend:Friend;gifts:Gift[];index:number;avatar:ReactNode;onSelect:(gift:Gift)=>void}){
 const [open,setOpen]=useState(false),[moving,setMoving]=useState(false),[ready,setReady]=useState(false),[height,setHeight]=useState(0);
 const root=useRef<HTMLElement>(null),grid=useRef<HTMLDivElement>(null),mounted=useRef(false);
 const regionId=useId();
 const ordered=[...gifts].sort((a,b)=>b.date.localeCompare(a.date));
 const signature=ordered.map(g=>`${g.id}:${g.name}:${g.date}`).join('|');
 useLayoutEffect(()=>{
  if(!root.current||!grid.current)return;
  const measure=()=>{
   const list=grid.current!,host=root.current!;
   const count=Math.min(3,ordered.length),thumbWidth=Math.min(104,host.clientWidth*.30),gap=-thumbWidth*.18;
   const start=(host.clientWidth-(thumbWidth*count+gap*Math.max(0,count-1)))/2;
   [...list.children].forEach((element,i)=>{
    const item=element as HTMLElement,stamp=item.querySelector<HTMLElement>('.gift-stamp-art');
    if(!stamp||!stamp.offsetWidth)return;
    const scale=thumbWidth/stamp.offsetWidth;
    item.style.setProperty('--preview-x',`${start+i*(thumbWidth+gap)-list.offsetLeft-item.offsetLeft}px`);
    // Reveal about 40% above the pocket lip; the remaining stamp sits behind the face.
    const previewTop=77-thumbWidth*(190/160)*.4+([2,-2,4][i%3]);
    item.style.setProperty('--preview-y',`${previewTop-list.offsetTop-item.offsetTop}px`);
    item.style.setProperty('--preview-scale',String(scale));
    item.style.setProperty('--preview-angle',`${[-9,2,10][i%3]}deg`);
   });
   setHeight(ordered.length?list.offsetHeight:0);setReady(true);
  };
  measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);
  observer?.observe(root.current);observer?.observe(grid.current);
  return()=>observer?.disconnect();
 },[signature]);
 useLayoutEffect(()=>{
  if(!mounted.current){mounted.current=true;return;}
  setMoving(true);
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const timer=setTimeout(()=>setMoving(false),reduced?180:680);
  return()=>clearTimeout(timer);
 },[open]);
 return <section ref={root} className={`folder-wrap animated-folder folder-${index%3} ${open?'expanded':''}`} data-open={open} data-moving={moving} data-ready={ready} style={{height:184+(open?height:0)} as CSSProperties}>
  <button type="button" className="folder" aria-expanded={open} aria-controls={regionId} onClick={()=>setOpen(v=>!v)}>
   <div className="folder-front"><span className="folder-label">{avatar}<b>{friend.name}</b></span><span>{gifts.length} 份心意 <ChevronDown size={17}/></span></div>
  </button>
  <div id={regionId} ref={grid} className="folder-shared-grid stamp-grid" aria-hidden={!open} inert={!open}>
   {ordered.map((gift,i)=><div key={gift.id} className={`folder-motion-item ${i<3?'folder-preview-item':''}`} style={{'--stagger':`${Math.min(i,3)*35}ms`} as CSSProperties}>
    <GiftRecordStamp gift={gift} onSelect={onSelect} disabled={!open}/>
   </div>)}
  </div>
 </section>;
}
