/**
 * One-time TEACHER pairing per classroom browser, then automatic student sync.
 * Students enter ONLY their existing teacher and student number.
 * All browser database access is mediated by the private Edge Function;
 * no anonymous or public database read/write permissions exist.
 */
const API='https://vcjyhcnsuiwdeqqbiwgx.supabase.co/functions/v1/arrownaut-save';
const DEVICE_KEY='arrownaut-trusted-classroom-browser-v1';
const backupPrefix='arrownaut-local-before-cloud:';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const copy=v=>JSON.parse(JSON.stringify(v));
const completions=p=>[...(p?.completed||[]),...(p?.mapTwo?.completed||[])];

const union=(a=[],b=[])=>[...new Set([...(a||[]),...(b||[])])];
const reward=id=>/-8$/.test(id)?10:1;
function sceneKey(e){return String(e?.planet??e?.world??'')+':'+String(e?.id??e?.key??'')}
export function combineClassroomProgress(local,remote,getPrice=()=>0){
 // Only COMPLETED work and existing inventory merge. In-progress puzzles may
 // be restarted because two Chromebooks cannot both be the active puzzle.
 const here=completions(local),there=completions(remote);
 const additionalLocal=here.filter(id=>!there.includes(id));
 const additionalRemote=there.filter(id=>!here.includes(id));
 const localPurchases=local?.purchases||[],remotePurchases=remote?.purchases||[];
 const value=id=>Number(getPrice(id))||0;
 const missingLocalPurchases=localPurchases.filter(id=>!remotePurchases.includes(id));
 const missingRemotePurchases=remotePurchases.filter(id=>!localPurchases.includes(id));
 const fromLocal=Math.max(0,(local?.stars||0)+additionalRemote.reduce((s,id)=>s+reward(id),0)-
  missingRemotePurchases.reduce((s,id)=>s+value(id),0));
 const fromRemote=Math.max(0,(remote?.stars||0)+additionalLocal.reduce((s,id)=>s+reward(id),0)-
  missingLocalPurchases.reduce((s,id)=>s+value(id),0));
 const scene=new Map();
 for(const e of [...(local?.worldScene||[]),...(remote?.worldScene||[])])
  if(e&&typeof e==='object')scene.set(sceneKey(e),copy(e));
 const merged={...copy(remote),completed:union(local.completed,remote.completed),
  purchases:union(localPurchases,remotePurchases),
  rescued:union(local.rescued,remote.rescued),
  seenIntros:union(local.seenIntros,remote.seenIntros),
  worldScene:[...scene.values()],stars:Math.max(fromLocal,fromRemote),active:null};
 if(local.mapTwo||remote.mapTwo){
  const a=local.mapTwo||{},b=remote.mapTwo||{};
  merged.mapTwo={...b,version:1,completed:union(a.completed,b.completed),
   rescued:union(a.rescued,b.rescued),seenIntros:union(a.seenIntros,b.seenIntros),active:null};
 }
 return merged;
}

const arraysInclude=(a,b)=>b.every(x=>a.includes(x));
function getDevice(){
 try{const value=localStorage.getItem(DEVICE_KEY);return /^[a-f0-9]{64}$/.test(value||'')?value:null}
 catch{return null}
}
async function post(data){
 const body=JSON.stringify(data);
 const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},
  body,cache:'no-store',keepalive:body.length<59000});
 let result;try{result=await response.json()}catch{result={error:'Cloud unavailable'}}
 if(!response.ok||!result.ok)throw new Error(result.error||'Cloud request failed');
 return result;
}
export function makeCloudSave({game,getIdentity,getProgress,applyProgress,notice,getPrice=()=>0}){
 let revision=null,session=0,activeScope='',status='unpaired',panel=null,queue=Promise.resolve();
 let pending=0,blocked=false,lastConflict=null;
 const identity=()=>{
  const {teacher,student}=getIdentity();
  return teacher&&Number.isInteger(student)?{game,teacher,student}:null;
 };
 const scope=()=>{const x=identity();return x?x.game+':'+x.teacher+':'+x.student:''};
 const isPaired=()=>!!getDevice();
 const update=()=>{
  const button=document.querySelector('button[data-action="cloud"]');
  if(!button)return;
  button.textContent=status==='saved'?'☁️ Saved':
   status==='syncing'?'☁️ Syncing…':status==='error'?'⚠️ Not Synced':
   isPaired()?'☁️ Cloud Sync':'☁️ Teacher Setup';
  button.title=status==='saved'?'Progress is stored online and can load on another paired classroom Chromebook':
   status==='error'?'Cloud save failed. This computer still has a local copy.':
   'Teacher pairs the classroom browser once. Students do not need a code.';
 };
 const setStatus=v=>{status=v;update()};
 const note=message=>{notice(message);console.warn('Arrow-Naut cloud sync:',message)};
 function safeBackup(progress,reason){
  if(!progress)return;
  const key=backupPrefix+scope()+':'+Date.now()+':'+reason;
  try{
   const value=JSON.stringify(progress);localStorage.setItem(key,value);
   if(localStorage.getItem(key)!==value)throw Error('Backup did not verify');
  }catch{throw Error('The previous progress cannot be backed up. The game will not overwrite it.')}
 }
 function clearLoading(){document.querySelector('.cloud-loading-overlay')?.remove()}
 function showLoading(){
  clearLoading();
  const overlay=document.createElement('div');overlay.className='cloud-loading-overlay';
  overlay.innerHTML='<div class="cloud-loading-card" role="status" aria-live="polite">☁️ Loading your saved game…</div>';
  document.body.append(overlay);
 }
 function reset(){
  session++;revision=null;activeScope='';pending=0;blocked=false;lastConflict=null;
  panel?.remove();panel=null;clearLoading();queue=Promise.resolve();
  setStatus(isPaired()?'idle':'unpaired');
 }
 const statusError=error=>{
  blocked=true;setStatus('error');clearLoading();
  note('⚠️ CLOUD NOT SAVED. Your progress is still on this Chromebook. Tell your teacher before switching computers.');
  console.warn('Cloud sync error:',String(error?.message||error));
 };
 function enqueue(progress){
  const current=identity(),device=getDevice(),tag=session;
  if(!current||!device||blocked||revision===null||activeScope!==scope())return;
  const snapshot=copy(progress);pending++;setStatus('syncing');
  queue=queue.catch(()=>{}).then(async()=>{
   if(tag!==session||blocked)return;
   try{
    const result=await post({action:'save',deviceToken:device,...current,revision,progress:snapshot});
    if(tag!==session)return;
    revision=result.revision;pending=Math.max(0,pending-1);
    if(pending===0)setStatus('saved');
   }catch(error){if(tag===session)statusError(error)}
  });
 }
 async function syncNow(){
  if(!identity())return false;
  const device=getDevice(),tag=session;
  if(!device){setStatus('unpaired');return false}
  const current=identity();activeScope=scope();blocked=false;setStatus('syncing');
  showLoading();
  try{
   // Always drain writes for this student before reading cloud data.
   await queue.catch(()=>{});
   if(tag!==session)return false;
   const remote=await post({action:'load',deviceToken:device,...current});
   if(tag!==session)return false;
   revision=remote.revision;
   const local=getProgress(),saved=remote.progress;
   lastConflict=null;
   if(saved===null){
    // First sync of this student. Preserve existing local progress from an
    // older Chromebook and upload it as the initial remote record.
    enqueue(local);clearLoading();return true;
   }
   if(!saved||saved.version!==1||!Array.isArray(saved.completed))
    throw Error('Cloud record has an unexpected format. No local work was changed.');
   const here=completions(local),there=completions(saved);
   const localHasUnique=!arraysInclude(there,here);
   const cloudHasUnique=!arraysInclude(here,there);
   const localOnlyPurchase=(local?.purchases||[]).some(id=>!(saved.purchases||[]).includes(id));
   const remoteSceneKeys=new Set((saved.worldScene||[]).map(sceneKey));
   const localOnlyScene=(local?.worldScene||[]).some(e=>!remoteSceneKeys.has(sceneKey(e)));
   const localOnlyRescue=(local?.rescued||[]).some(id=>!(saved.rescued||[]).includes(id));
   if(localHasUnique||localOnlyPurchase||localOnlyScene||localOnlyRescue){
    // Keep BOTH records intact until teacher explicitly approves a merge.
    lastConflict={local:copy(local),remote:copy(saved),revision};
    throw Error(cloudHasUnique?
      'Two Chromebooks have different completed levels. Ask your teacher to combine them safely.':
      'This Chromebook has more completed levels. Ask your teacher to combine its progress with the cloud.');
   }
   if(JSON.stringify(local)!==JSON.stringify(saved)){
    safeBackup(local,'import');
    applyProgress(copy(saved));
   }
   blocked=false;clearLoading();setStatus('saved');return true;
  }catch(error){if(tag===session)statusError(error);return false}
 }
 async function mergePending(){
  const conflict=lastConflict,current=identity(),device=getDevice(),tag=session;
  if(!conflict||!current||!device)return false;
  // Include anything completed after the initial sync conflict, not just
  // the snapshot taken when the two Chromebooks first disagreed.
  const original=getProgress();
  const merged=combineClassroomProgress(original,conflict.remote,getPrice);
  safeBackup(original,'before-merge');
  safeBackup(conflict.remote,'remote-before-merge');
  setStatus('syncing');blocked=true;
  try{
   const saved=await post({action:'save',deviceToken:device,...current,
    revision:conflict.revision,progress:merged});
   if(tag!==session)return false;
   revision=saved.revision;
   applyProgress(copy(merged));lastConflict=null;blocked=false;setStatus('saved');
   return true;
  }catch(error){if(tag===session)statusError(error);return false}
 }
 async function attach(){
  session++;pending=0;revision=null;activeScope='';blocked=false;lastConflict=null;
  if(!getDevice()){setStatus('unpaired');return false}
  return syncNow();
 }
 function open(){
  if(!identity())return;
  panel?.remove();panel=document.createElement('div');panel.className='cloud-save-overlay';
  const paired=isPaired();
  panel.innerHTML='<section class="cloud-save-panel" role="dialog" aria-modal="true" aria-labelledby="cloud-title">'+
   '<h2 id="cloud-title">☁️ Classroom Saving</h2>'+
   '<p>'+ (paired?'This computer is connected. Students just choose their teacher and number.':
     'TEACHER SETUP: Pair this Chromebook once. Students never have to type a save code.')+'</p>'+
   '<p class="cloud-save-student">'+esc(identity().teacher)+' · Student #'+identity().student+'</p>'+
   (!paired?'<label for="cloud-classroom-key">Teacher setup key (teacher only)</label>'+
     '<input type="password" id="cloud-classroom-key" autocomplete="off" spellcheck="false" placeholder="Teacher enters once">'+
     '<button type="button" data-cloud-action="pair">🔗 Pair This Computer</button>':
     '<button type="button" data-cloud-action="sync">🔄 Check My Saved Game</button>'+
     (lastConflict?'<p>Two Chromebooks have different saved work. Ask your teacher to combine it.</p>'+
     '<button type="button" data-cloud-action="merge">🧩 Combine Both Saves</button>':''))+
   '<p class="cloud-save-result" role="status"></p>'+
   '<button type="button" data-cloud-action="close">Close</button></section>';
  document.body.append(panel);
  const msg=t=>{const el=panel?.querySelector('.cloud-save-result');if(el)el.textContent=t};
  panel.addEventListener('click',async e=>{
   const action=e.target.closest('button[data-cloud-action]')?.dataset.cloudAction;
   if(!action)return;
   if(action==='close'){panel.remove();panel=null;return}
   if(action==='pair'){
    const input=panel?.querySelector('#cloud-classroom-key');
    const pairingCode=input?.value?.trim()||'';
    if(pairingCode.replace(/[^a-zA-Z2-9]/g,'').length!==24){
      msg('Please ask your teacher to enter the complete setup key.');return
    }
    msg('Connecting this classroom computer…');
    try{
     const result=await post({action:'pair',pairingCode});
     localStorage.setItem(DEVICE_KEY,result.deviceToken);
     if(localStorage.getItem(DEVICE_KEY)!==result.deviceToken)throw Error('Cannot store secure browser pairing');
     input.value='';panel?.remove();panel=null;
     const synced=await attach();
     if(!synced)open();
    }catch(error){msg('Pairing failed. '+error.message);setStatus('unpaired')}
   }else if(action==='merge'){
     if(!lastConflict)return;
     if(!window.confirm('Teacher: combine completed levels and purchased items from BOTH computers? A backup of each record will be saved on this Chromebook.'))return;
     const saved=await mergePending();
     msg(saved?'Both saves combined! Completed levels and My Stuff are kept.':
       'Could not combine the saves. No original record was deleted.');
     if(saved){panel?.remove();panel=null}
   }else if(action==='sync'){
     const synced=await syncNow();
     msg(synced?'Cloud connection checked and your progress loaded.':
       'Cloud sync needs attention. Do not switch Chromebooks until this is resolved.');
   }
  });
 }
 return {attach,enqueue,open,update,reset,isPaired};
}
