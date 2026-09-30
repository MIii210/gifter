import Notebook from '@/components/notebook';
import PhonePreview from '@/components/phone-preview';

export const dynamic = 'force-dynamic';

export default async function Page({searchParams}:{searchParams:Promise<{screen?:string}>}){
  const params=await searchParams;
  return params.screen==='1'?<div className="phone-app"><Notebook/></div>:<PhonePreview/>;
}
