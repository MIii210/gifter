import type {CSSProperties} from 'react';
import type {Gift} from '@/lib/model';

const artworks = [
 ['mug','Mug','马克杯'],['reading-book','Book','书籍'],['mushroom-lamp','Light','台灯'],['bouquet','Flower','花束'],
 ['candle','Candle','蜡烛'],['headphones','Music','耳机'],['scarf','Scarf','围巾'],['camera','Camera','相机'],
 ['journal','Journal','手账'],['teapot','Tea','茶壶'],['perfume','Scent','香水'],['tote','Bag','帆布包'],
 ['fountain-pen','Pen','钢笔'],['music-box','Melody','音乐盒'],['tea-tin','Tea','茶叶'],['plant','Plant','盆栽'],
];
export const giftTypeNames=artworks.map(a=>a[2]);
const colors=['#388b87','#67764b','#507d9b','#b55d49'];
export function artIndex(index:number){return Number.isInteger(index)&&index>=0&&index<artworks.length?index:0;}

export function GiftRecordStamp({gift,onSelect,disabled=false}:{gift:Gift;onSelect:(gift:Gift)=>void;disabled?:boolean}){
 return <button type="button" className="stamp" onClick={()=>onSelect(gift)} disabled={disabled} aria-label={`查看${gift.name}，${gift.date}`}>
  <GiftStamp index={gift.art}/><span className="stamp-name">{gift.name}</span><small>{gift.date.replaceAll('-','.')}</small>
 </button>;
}

export function GiftDrawing({index=0,className=''}:{index?:number;className?:string}){
 const [file]=artworks[artIndex(index)];
 return <img className={`gift-drawing ${className}`} src={`/art/stamps/${file}.webp`} alt="" aria-hidden="true" width={320} height={320} loading="lazy" decoding="async"/>;
}

// Border geometry is separate from the illustration, keeping every stamp crisp at any size.
function perforation(){
 let d='M5 5';
 for(let x=5;x<155;x+=25)d+=` Q${x+5} 3 ${x+7} 5 Q${x+12.5} 19 ${x+18} 5 Q${x+22} 4 ${x+25} 5`;
 for(let y=5;y<185;y+=30)d+=` Q157 ${y+5} 155 ${y+8} Q141 ${y+15} 155 ${y+22} Q156 ${y+26} 155 ${y+30}`;
 for(let x=155;x>5;x-=25)d+=` Q${x-5} 187 ${x-7} 185 Q${x-12.5} 171 ${x-18} 185 Q${x-22} 186 ${x-25} 185`;
 for(let y=185;y>5;y-=30)d+=` Q3 ${y-5} 5 ${y-8} Q19 ${y-15} 5 ${y-22} Q4 ${y-26} 5 ${y-30}`;
 return d+'Z';
}
const border=perforation();

export default function GiftStamp({index=0}:{index?:number}){
 const n=artIndex(index);
 return <span className="gift-stamp-art" style={{'--stamp-ink':colors[n%4]} as CSSProperties} aria-hidden="true">
  <svg className="stamp-frame" viewBox="0 0 160 190" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
   <path d={border}/>
   <path d="M18 22L141 21 142 168 19 169Z"/>
   <path d="M117 34l14-.4m-14 6 14 .3m-14 5.7 14-.3"/>
  </svg>
  <span className="stamp-word">{artworks[n][1]}</span>
  <GiftDrawing index={n}/>
  <span className="stamp-number">{String(n+1).padStart(2,'0')}</span>
 </span>;
}
