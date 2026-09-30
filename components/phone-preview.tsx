'use client';
import {useEffect,useRef,useState} from 'react';
import {BatteryFull,Signal,Wifi} from 'lucide-react';

/** An isolated 393 × 852 viewport keeps fixed bars AND portal layers inside the device. */
export default function PhonePreview(){
 const host=useRef<HTMLDivElement>(null);
 const [scale,setScale]=useState(1);
 const [src,setSrc]=useState('/?screen=1#home');
 useEffect(()=>{
  setSrc('/?screen=1'+(window.location.hash||'#home'));
  const resize=()=>{if(host.current)setScale(Math.min(1,(host.current.clientWidth-16)/417,(host.current.clientHeight-16)/876));};
  resize();const observer=new ResizeObserver(resize);if(host.current)observer.observe(host.current);
  return()=>observer.disconnect();
 },[]);
 return <div className="device-stage" ref={host}>
  <div className="device-size" style={{width:417*scale,height:876*scale}}>
   <div className="iphone-16" style={{transform:`scale(${scale})`}} aria-label="iPhone 16 手机样机">
    <div className="iphone-screen">
     <iframe title="心意手账" src={src} className="phone-app-frame"/>
     <div className="phone-status" aria-hidden="true"><span>9:41</span><div className="dynamic-island"/><span className="phone-indicators"><Signal size={16}/><Wifi size={16}/><BatteryFull size={22}/></span></div>
     <div className="phone-home-indicator" aria-hidden="true"/>
    </div>
   </div>
  </div>
 </div>;
}
