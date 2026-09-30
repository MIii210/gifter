import Survey from '@/components/survey';export default async function Page({params}:{params:Promise<{token:string}>}){return <Survey token={(await params).token}/>}
