export const SHOP_TIME_ZONE='Asia/Tashkent'
type Parts={year:number;month:number;day:number;hour:number;minute:number}
function parts(value:Date,zone:string):Parts{
 const values=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(value).map(p=>[p.type,Number(p.value)]))
 return values as Parts
}
const wall=(p:Parts)=>Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)
/** Resolve a dated local wall clock with the zone's seasonal rules, never a saved offset. */
function instant(p:Parts,zone:string){
 const target=wall(p);let result=target
 for(let i=0;i<4;i++){const difference=target-wall(parts(new Date(result),zone));if(!difference)break;result+=difference}
 if(wall(parts(new Date(result),zone))!==target)throw new RangeError('Выберите корректное местное время')
 return new Date(result)
}
export function validClock(clock:string){return /^([01]\d|2[0-3]):[0-5]\d$/.test(clock)}
const clock=(p:Parts)=>`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}`
export function workingHours(start:string,end:string,zone:string,now=new Date()){
 const date=parts(now,SHOP_TIME_ZONE),[sh,sm]=start.split(':').map(Number),[eh,em]=end.split(':').map(Number)
 const begin=instant({...date,hour:sh,minute:sm},SHOP_TIME_ZONE)
 const finish=new Date(instant({...date,hour:eh,minute:em},SHOP_TIME_ZONE).getTime()+(end<=start?86400000:0))
 const localStart=parts(begin,zone),localEnd=parts(finish,zone)
 const dayDifference=Math.round((Date.UTC(localEnd.year,localEnd.month-1,localEnd.day)-Date.UTC(localStart.year,localStart.month-1,localStart.day))/86400000)
 return {start:clock(localStart),end:clock(localEnd),begin,finish,dayDifference}
}
export function localWorkClock(value:string,anchor:Date,zone:string){
 if(!validClock(value))throw new RangeError('Введите время в формате ЧЧ:ММ')
 const [hour,minute]=value.split(':').map(Number)
 return clock(parts(instant({...parts(anchor,zone),hour,minute},zone),SHOP_TIME_ZONE))
}
