/**
 * Automatic classroom progress: students choose only their teacher + number.
 * No setup, save code, login or teacher pairing is required.
 * Local storage is retained as a fallback. Both game variants use separate
 * records and the cloud database is not directly exposed to web clients.
 */
const API='https://vcjyhcnsuiwdeqqbiwgx.supabase.co/functions/v1/arrownaut-save';
const BACKUP_PREFIX='arrownaut-before-cloud-merge:';
const copy=value=>JSON.parse(JSON.stringify(value));
const union=(a=[],b=[])=>[...new Set([...(a||[]),...(b||[])])];
const sceneKey=o=>String(o?.planet??o?.world??'')+':'+String(o?.id??o?.key??'');
const getCompleted=p=>[...(p?.completed||[]),...(p?.mapTwo?.completed||[])];
const extraReward=id=>/-8$/.test(id)?10:1;
function blank(p){
 return !p || (!getCompleted(p).length&&!(p.purchases||[]).length&&!(p.rescued||[]).length&&
 !(p.worldScene||[]).length&&!(p.stars>0));
}
export function combineClassroomProgress(local,remote,getPrice=()=>0){
 if(!remote)return copy(local);
 if(!local||blank(local))return copy(remote);
 if(blank(remote))return copy(local);
 const ls=getCompleted(local),rs=getCompleted(remote);
 const leftExtra=ls.filter(x=>!rs.includes(x)),rightExtra=rs.filter(x=>!ls.includes(x));
 const leftBuys=(local.purchases||[]).filter(x=>!(remote.purchases||[]).includes(x));
 const rightBuys=(remote.purchases||[]).filter(x=>!(local.purchases||[]).includes(x));
 const cost=arr=>arr.reduce((sum,id)=>sum+(Number(getPrice(id))||0),0);
 const leftBalance=Math.max(0,(local.stars||0)+rightExtra.reduce((s,id)=>s+extraReward(id),0)-cost(rightBuys));
 const rightBalance=Math.max(0,(remote.stars||0)+leftExtra.reduce((s,id)=>s+extraReward(id),0)-cost(leftBuys));
 const scene=new Map();
 // Local wins only for duplicate decorations; unique objects from each remain.
 for(const obj of [...(remote.worldScene||[]),...(local.worldScene||[])])
  if(obj&&typeof obj==='object')scene.set(sceneKey(obj),copy(obj));
 const merged={...copy(remote),...copy(local),version:1,
  completed:union(remote.completed,local.completed),
  rescued:union(remote.rescued,local.rescued),
  seenIntros:union(remote.seenIntros,local.seenIntros),
  purchases:union(remote.purchases,local.purchases),
  worldScene:[...scene.values()],
  stars:Math.max(leftBalance,rightBalance),
  active:local.active||remote.active||null};
 if(local.mapTwo||remote.mapTwo){
  const a=remote.mapTwo||{},b=local.mapTwo||{};
  merged.mapTwo={...a,...b,version:1,completed:union(a.completed,b.completed),
   rescued:union(a.rescued,b.rescued),seenIntros:union(a.seenIntros,b.seenIntros),
   active:b.active||a.active||null};
 }
 return merged;
}
async function post(data){
 const body=JSON.stringify(data);
 const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},
  body,cache:'no-store'});
 let result;try{result=await res.json()}catch{result={error:'Cloud unavailable'}};
 if(!res.ok||!result.ok){
  const error=new Error(result.error||'Could not reach cloud saving');
  error.status=res.status;throw error;
 }
 return result;
}
export function makeCloudSave({game,getIdentity,getProgress,applyProgress,notice,getPrice=()=>0}){
 let revision=null,epoch=0,ready=false,dirty=false,busy=false,status='idle',queue=Promise.resolve(),panel=null;
 const identity=()=>{
  const x=getIdentity();
  if(!x?.teacher||!Number.isInteger(x.student))return null;
  return {game,teacher:x.teacher,student:x.student};
 };
 const scope=()=>{const id=identity();return id?game+':'+id.teacher+':'+id.student:''};
 const update=()=>{
  const button=document.querySelector('button[data-action="cloud"]');
  if(!button)return;
  button.textContent=status==='saved'?'☁️ Saved':status==='syncing'?'☁️ Saving…':
   status==='error'?'⚠️ Not Synced':'☁️ Auto Save';
  button.title=status==='saved'?'Progress saved online for every Chromebook':
   status==='error'?'Could not sync online; the progress on this Chromebook is kept.':
   'Progress loads and saves automatically using teacher and student number.';
 };
 const setStatus=x=>{status=x;update()};
 const localBackup=(progress,tag)=>{
  if(!progress)return;
  const key=BACKUP_PREFIX+scope()+':'+Date.now()+':'+tag;
  const json=JSON.stringify(progress);
  localStorage.setItem(key,json);
  if(localStorage.getItem(key)!==json)throw Error('Could not back up previous progress');
 };
 function loading(show){
  document.querySelector('.cloud-loading-overlay')?.remove();
  if(!show)return;
  const layer=document.createElement('div');
  layer.className='cloud-loading-overlay';
  layer.innerHTML='<div class="cloud-loading-card" role="status">☁️ Loading your saved levels…</div>';
  document.body.append(layer);
 }
 function fail(error){
  setStatus('error');
  notice('⚠️ NOT SYNCED online. Your work is still saved on this Chromebook. Please keep this browser until cloud saving works.');
  console.warn('Arrow-Naut cloud sync error:',String(error?.message||error));
 }
 function reset(){
  epoch++;revision=null;ready=false;dirty=false;busy=false;queue=Promise.resolve();
  loading(false);panel?.remove();panel=null;setStatus('idle');
 }
 async function commit(myEpoch){
  const id=identity();
  if(!id||revision===null||myEpoch!==epoch)return;
  for(let tries=0;tries<5;tries++){
   const local=copy(getProgress());
   try{
    const saved=await post({...id,action:'save',revision,progress:local});
    if(myEpoch!==epoch)return;
    revision=saved.revision;return;
   }catch(error){
    if(error.status!==409||tries===4)throw error;
    // Two Chromebooks wrote simultaneously. Load and combine, never reset
    // previously completed levels, rescued friends, or purchased items.
    const newest=await post({...id,action:'load'});
    if(myEpoch!==epoch)return;
    revision=newest.revision;
    if(newest.progress){
     const current=getProgress(),merged=combineClassroomProgress(current,newest.progress,getPrice);
     if(JSON.stringify(merged)!==JSON.stringify(current)){
      localBackup(current,'simultaneous-local');
      applyProgress(merged);
     }
    }
   }
  }
 }
 function enqueue(){
  if(!identity())return queue;
  dirty=true;
  if(!ready||busy)return queue;
  busy=true;setStatus('syncing');
  const myEpoch=epoch;
  queue=queue.catch(()=>{}).then(async()=>{
   try{
    while(dirty&&myEpoch===epoch&&ready){
     dirty=false;await commit(myEpoch);
    }
    if(myEpoch===epoch)setStatus('saved');
   }catch(error){if(myEpoch===epoch){dirty=true;fail(error)}}
   finally{if(myEpoch===epoch)busy=false}
  });
  return queue;
 }
 async function attach(){
  epoch++;const myEpoch=epoch;revision=null;ready=false;dirty=false;busy=false;
  if(!identity())return false;
  loading(true);setStatus('syncing');
  try{
   const loaded=await post({...identity(),action:'load'});
   if(myEpoch!==epoch)return false;
   revision=loaded.revision;
   const local=getProgress();
   if(loaded.progress){
    const merged=combineClassroomProgress(local,loaded.progress,getPrice);
    if(JSON.stringify(local)!==JSON.stringify(merged)){
     localBackup(local,'before-import');
     applyProgress(merged);
    }
    ready=true;
    if(JSON.stringify(loaded.progress)!==JSON.stringify(merged)){
     await enqueue();
    }else setStatus('saved');
   }else{
    ready=true;
    await enqueue();
   }
   if(myEpoch!==epoch)return false;
   return status==='saved';
  }catch(error){
   if(myEpoch===epoch)fail(error);
   return false;
  }finally{if(myEpoch===epoch)loading(false)}
 }
 function open(){
  if(!identity())return;
  panel?.remove();panel=document.createElement('div');panel.className='cloud-save-overlay';
  panel.innerHTML='<section class="cloud-save-panel" role="dialog" aria-modal="true">'+
   '<h2>☁️ Automatic Saving</h2>'+
   '<p>Your stars, levels, rescued friends, and My Stuff save automatically.</p>'+
   '<p>On any Chromebook, choose the same teacher and student number.</p>'+
   '<p role="status">'+(status==='saved'?'Saved online.':status==='error'?
    'Not synced online yet. Your work is still on this computer.':'Checking cloud saving…')+'</p>'+
   '<button type="button" data-cloud-retry="1">🔄 Try Saving Again</button>'+
   '<button type="button" data-cloud-close="1">Close</button></section>';
  document.body.append(panel);
  panel.addEventListener('click',async event=>{
   if(event.target.closest('[data-cloud-close]')){panel.remove();panel=null;return}
   if(event.target.closest('[data-cloud-retry]')){
    panel.remove();panel=null;await attach();
   }
  });
 }
 if(typeof window!=='undefined')window.addEventListener('online',()=>{
  if(identity()&&status==='error')void attach();
 });
 return {attach,enqueue,open,update,reset};
}
