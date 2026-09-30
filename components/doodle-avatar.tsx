/** Simple ink faces, inspired by the supplied line-drawing references. */
export default function DoodleAvatar({index=0,className=''}:{index?:number;className?:string}) {
 const faces = [
  <g key="face"><path d="M22 27q7-5 14-5m31 0q8-2 14 3M31 39q-7-3-7 12v16q0 10 7 5 4-3 3-17V44q0-5-3-5m42-1q-7-2-7 10v20q0 9 7 5 4-3 3-17V44q0-6-3-6M49 57l-6 12 13-1z"/><path d="M15 70q-3 10 10 10m50 0q11-1 12-9" stroke="var(--avatar-accent)" strokeWidth="4"/></g>,
  <g key="cat"><path d="M23 40l3-23 16 20 20-3 11-20 9 26M23 48l-13 2 10 8-9 15 13-5m58-22 10-5-6 12 9 11-12-2M36 51l1 4m26-8 1 4M31 63q9 9 19-1 5 10 17 0M43 69l4 15q7 9 13-2l1-12"/><path d="M23 79l4-3m47-44 4-1" stroke="var(--avatar-accent)"/></g>,
  <g key="grumpy"><path d="M19 28l18 18m27 0 18-18M18 70q28-24 62 1"/><path d="M19 56h.1m61 0h.1" strokeWidth="5"/><path d="M38 80q12 3 23 0" stroke="var(--avatar-accent)" strokeWidth="3"/></g>,
  <g key="bear"><path d="M24 34C5 23 19 4 33 14q7 5 6 13 12-4 25 0C70 1 97 15 79 35c17 17 12 40-2 45-17 7-43 7-56-3C9 68 12 48 24 34z"/><path d="M36 49v2m28-2v2M47 57q3-3 6 0l-3 4zm3 4q-6 9-12 3m12-3q5 8 12 2"/><path d="M25 60l5 1m39-1 5-1" stroke="var(--avatar-accent)" strokeWidth="4"/></g>,
  <g key="rabbit"><path d="M25 50C-2 13 18-1 31 16q9 14 10 25 10-3 18 0C64 8 88 0 88 22q0 14-17 31c16 26-2 38-23 37C17 88 10 70 25 50z"/><path d="M34 62v3m29-3v3M46 73h5"/><path d="M27 71h4m36 0h4" stroke="var(--avatar-accent)" strokeWidth="3"/></g>,
  <g key="candy"><path d="M23 39C31 16 63 12 77 37c15 23-3 41-26 42-26 1-40-16-28-40zM20 44l-13-6q-7 12 0 25l13-6m59-14 14-5q7 12 0 25l-12-5"/><path d="M37 47v3m27-3v3M46 59h9"/><path d="M32 59h3m32 0h3" stroke="var(--avatar-accent)" strokeWidth="3"/></g>,
 ];
 return <svg className={`art doodle-avatar ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{faces[((index%faces.length)+faces.length)%faces.length]}</svg>;
}
