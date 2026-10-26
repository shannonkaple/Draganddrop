import {centralWebAppUrl} from './central-config.mjs?v=20261026-school-live';
const QUEUE_KEY='ms-kaple-central-sync-queue-v1';
let scheduled=0, sending=false;
const enabled=()=>typeof centralWebAppUrl==='string'&&/^https:\/\/script\.google\.com\/(?:a\/macros\/centralcss\.org\/s|macros\/s)\/[A-Za-z0-9_-]+\/exec$/.test(centralWebAppUrl.trim());
function queued(){
 try{const result=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(result)?result:[]}
 catch{return []}
}
function store(items){
 try{localStorage.setItem(QUEUE_KEY,JSON.stringify(items.slice(-50)))}catch{}
}
function telemetry(state){
 const records=[...(Array.isArray(state.records)?state.records:[])];
 if(state.current&&Array.isArray(state.current.done))records.push(state.current);
 const tasks=records.filter(row=>Array.isArray(row.done));
 const total=(field)=>tasks.reduce((sum,row)=>sum+(Number(row[field])||0),0);
 const friends=Array.isArray(state.friends)?state.friends.length:0;
 const levels=state.friendLevels||{};
 const upgrades=Object.values(levels).reduce((n,x)=>n+(Number(x)||0),0);
 return {
  drops:tasks.reduce((n,row)=>n+row.done.length,0),
  attempts:total('attempts'),misses:total('misses'),
  clickOnly:total('clickOnly'),cancelled:total('cancelled'),
  touchBlocked:total('touchBlocked'),enemyBumps:total('enemyBumps'),
  friends,upgrades,stars:Number(state.stars)||0,
  round:Number(state.round)||0,stage:Number(state.stage)||0
 };
}
function latestRating(state){
 const history=Array.isArray(state.records)?state.records:[];
 const last=history.filter(row=>row.type==='skill-rating').at(-1);
 if(!last)return null;
 const values=[0,1,2,3].map(i=>Number(last.ratings?.[i]));
 if(!values.every(v=>Number.isInteger(v)&&v>=1&&v<=3))return null;
 const stamp=Number(last.submittedAt||last.finished||Date.now());
 return {values,submittedAt:stamp,id:'rating-'+state.teacherId+'-'+state.studentNumber+'-'+stamp};
}
export function queueStudentSync(teacher,number,state,kind='snapshot'){
 if(!enabled()||!teacher?.id||!Number.isInteger(Number(number))||!state?.hero)return;
 const latest=latestRating(state);
 if(kind==='rating'&&!latest)return;
 const eventId=kind+'-'+teacher.id+'-'+number+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);
 const packet={
  version:1,kind,teacherId:teacher.id,studentNumber:Number(number),
  eventId,clientTime:Date.now(),stats:telemetry(state),latestRating:latest
 };
 const current=queued();
 const pending=kind==='snapshot'?current.filter(item=>!(item.kind==='snapshot'&&item.teacherId===teacher.id&&item.studentNumber===Number(number))):current;
 pending.push(packet);store(pending);
 schedule(kind==='rating'?2500:11000);
}
function schedule(delay){
 if(!enabled()||scheduled)return;
 scheduled=setTimeout(()=>{scheduled=0;flushStudentSync()},delay+Math.floor(Math.random()*3000));
}
export async function flushStudentSync(){
 if(!enabled()||sending||!navigator.onLine)return;
 sending=true;
 try{
  for(const item of queued().slice(0,8)){
   try{
    // Text/plain + no-cors avoids browser preflight and works with Apps Script's /exec URL.
    // The response is opaque, so use the private Sheet to VERIFY receipt; do not claim confirmed success.
    await fetch(centralWebAppUrl,{method:'POST',mode:'no-cors',credentials:'include',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(item),keepalive:true});
    const list=queued();
    const idx=list.findIndex(p=>p.eventId===item.eventId);
    if(idx>=0){list.splice(idx,1);store(list)}
   }catch{
    // Keep unsent event for the next online attempt.
    break;
   }
  }
 }finally{sending=false;if(queued().length)schedule(30000)}
}
if(enabled()){
 window.addEventListener('online',()=>schedule(1500));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(2000)});
 window.addEventListener('pagehide',()=>{
   const packet=queued()[0];
   if(packet&&navigator.sendBeacon){
    try{navigator.sendBeacon(centralWebAppUrl,new Blob([JSON.stringify(packet)],{type:'text/plain'}))}catch{}
   }
 });
 setInterval(()=>schedule(3000),60000);
 schedule(5000);
}