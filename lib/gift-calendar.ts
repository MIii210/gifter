import type {Friend, State} from './model';

const lunarFormatter=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
const fixed:Record<string,string>={'2-14':'情人节','3-8':'妇女节','5-20':'520心意节','6-1':'儿童节','9-10':'教师节','12-25':'圣诞节'};

/** Calendar labels are intentionally separate from gift occurrences. */
export function holiday(month:number,day:number,year:number){
 const label=fixed[`${month+1}-${day}`];if(label)return label;
 const date=new Date(Date.UTC(year,month,day,4));
 if(month===4&&date.getUTCDay()===0&&day>=8&&day<=14)return '母亲节';
 if(month===5&&date.getUTCDay()===0&&day>=15&&day<=21)return '父亲节';
 const parts=lunarFormatter.formatToParts(date);
 if(parts.find(p=>p.type==='month')?.value==='七月'&&Number(parts.find(p=>p.type==='day')?.value)===7)return '七夕';
 return undefined;
}

type DateParts={year:number;month:number;day:number};
export type GiftOccurrence={personId:string;eventId:string;eventName:string;occurrenceDate:string;friend:Friend;source:'birthday'|'anniversary'|'plan';order:number};
export type GiftCard={friend:Friend;personId:string;eventId:string;eventName:string;date:string;scene:string};

function parts(iso:string):DateParts|null{
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);if(!match)return null;
 const year=+match[1],month=+match[2],day=+match[3];
 if(month<1||month>12||day<1||day>daysInMonth(year,month))return null;
 return {year,month,day};
}
function daysInMonth(year:number,month:number){return new Date(Date.UTC(year,month,0)).getUTCDate();}
function iso(year:number,month:number,day:number){return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
function yearlyDate(source:DateParts,targetYear:number){return iso(targetYear,source.month,Math.min(source.day,daysInMonth(targetYear,source.month)));}
function toCard(event:GiftOccurrence):GiftCard{return {friend:event.friend,personId:event.personId,eventId:event.eventId,eventName:event.eventName,date:event.occurrenceDate,scene:event.eventName};}
function byDateStable(a:GiftOccurrence,b:GiftOccurrence){return a.occurrenceDate.localeCompare(b.occurrenceDate)||a.order-b.order;}
function uniquePeople(events:GiftOccurrence[]):GiftOccurrence[]{const seen=new Set<string>();return [...events].sort(byDateStable).filter(event=>{if(seen.has(event.personId))return false;seen.add(event.personId);return true;});}

/** Expands yearly birthdays, yearly custom anniversaries and one-off plans into one event pipeline. */
export function occurrencesBetween(state:State,start:string,end:string,endInclusive=true):GiftOccurrence[]{
 const from=parts(start),to=parts(end);if(!from||!to||start>end)return [];
 const events:GiftOccurrence[]=[];let order=0;
 for(let targetYear=from.year;targetYear<=to.year;targetYear++){
  for(const friend of state.friends){
   const birthday=parts(friend.birthday);
   if(birthday&&targetYear>=birthday.year)events.push({personId:friend.id,eventId:`birthday:${friend.id}`,eventName:'生日',occurrenceDate:yearlyDate(birthday,targetYear),friend,source:'birthday',order:order++});
   for(const anniversary of friend.anniversaries||[]){
    const base=parts(anniversary.date);const name=anniversary.name.trim();
    if(base&&name&&targetYear>=base.year)events.push({personId:friend.id,eventId:`anniversary:${anniversary.id}`,eventName:name,occurrenceDate:yearlyDate(base,targetYear),friend,source:'anniversary',order:order++});
   }
  }
 }
 const friends=new Map(state.friends.map(friend=>[friend.id,friend]));
 for(const plan of state.plans||[]){
  const friend=friends.get(plan.friendId);
  if(friend&&plan.status==='planned'&&!plan.cancelled&&parts(plan.date))events.push({personId:friend.id,eventId:`plan:${plan.id}`,eventName:plan.scene,occurrenceDate:plan.date,friend,source:'plan',order:order++});
 }
 return events.filter(event=>event.occurrenceDate>=start&&(endInclusive?event.occurrenceDate<=end:event.occurrenceDate<end)).sort(byDateStable);
}

export function occurrencesOn(state:State,date:string){return occurrencesBetween(state,date,date);}
export function occurrencesInMonth(state:State,year:number,month:number){const start=iso(year,month+1,1),end=iso(year,month+1,daysInMonth(year,month+1));return occurrencesBetween(state,start,end);}
export function cardsFromOccurrences(events:GiftOccurrence[]){return uniquePeople(events).map(toCard);}

/** Retained for callers that only need manually created full-date plans. */
export function plannedCards(state:State):GiftCard[]{
 const friends=new Map(state.friends.map(friend=>[friend.id,friend]));
 return (state.plans||[]).filter(plan=>plan.status==='planned'&&!plan.cancelled&&!!parts(plan.date)&&friends.has(plan.friendId)).map(plan=>({friend:friends.get(plan.friendId)!,personId:plan.friendId,eventId:`plan:${plan.id}`,eventName:plan.scene,date:plan.date,scene:plan.scene}));
}
export function peopleFor(state:State,month:number,day:number,year:number){return cardsFromOccurrences(occurrencesOn(state,iso(year,month+1,day))).map(card=>card.friend);}

/** Three calendar months, clamped to the last valid day at month end. */
export function threeMonthsFrom(date:string):string{
 const source=parts(date);if(!source)return date;
 const total=source.year*12+(source.month-1)+3,year=Math.floor(total/12),month=total%12+1;
 return iso(year,month,Math.min(source.day,daysInMonth(year,month)));
}
export function oneYearFrom(date:string):string{const source=parts(date);return source?iso(source.year+1,source.month,Math.min(source.day,daysInMonth(source.year+1,source.month))):date;}
export function upcomingThreeMonthCards(state:State,today:string){return cardsFromOccurrences(occurrencesBetween(state,today,threeMonthsFrom(today)));}
/** [today, today + one calendar year), one nearest yearly occurrence per person. */
export function upcomingYearCards(state:State,today:string){return cardsFromOccurrences(occurrencesBetween(state,today,oneYearFrom(today),false));}

export type GiftPageSections={current:GiftCard[];recent:GiftCard[];message:string;currentHeading:string};
export function giftPageSections(state:State,selectedDate:string,year:number,month:number,today:string):GiftPageSections{
 const dayView=!!selectedDate;
 const currentEvents=dayView?occurrencesOn(state,selectedDate):occurrencesInMonth(state,year,month);
 const current=cardsFromOccurrences(currentEvents);
 const recentAll=upcomingThreeMonthCards(state,today);
 const currentPeople=new Set(current.map(card=>card.personId));
 const recent=recentAll.filter(card=>!currentPeople.has(card.personId));
 if(current.length)return {current,recent,message:'',currentHeading:dayView?'当天的送礼计划':'当月的送礼计划'};
 const message=dayView?(selectedDate<today?'往事不可追，看看近期安排～':'该天没计划，先看下近期节日安排～'):'该月没计划，先看下近期节日安排～';
 return {current:[],recent:recentAll,message,currentHeading:''};
}

/** Compatibility helper used by the calendar planning entry: it intentionally uses the 1-year range. */
export function calendarSelection(state:State,selectedDate:string,today:string){
 const exact=selectedDate?cardsFromOccurrences(occurrencesOn(state,selectedDate)):[];
 if(exact.length)return {message:'当天的送礼计划',cards:exact};
 return {message:selectedDate&&selectedDate<today?'往事不可追，看看近期安排～':'该天没计划，先看下近期节日安排～',cards:upcomingYearCards(state,today)};
}
export function giftCardsForSelection(state:State,selectedDate:string,today:string){return calendarSelection(state,selectedDate,today).cards;}
