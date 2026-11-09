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
export function makeCloudSave({game,getIdentity,getProgress,applyProgress,notice}){
 let revision=null,session=0,activeScope='',status='unpaired',panel=null,queue=Promise.resolve();
 let pending=0,blocked=false;
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
  session++;revision=null;activeScope='';pending=0;blocked=false;
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
   if(localHasUnique){
    // Do not automatically overwrite either save if the student has separate
    // progress on multiple devices. The teacher can back up the local record.
    throw Error(cloudHasUnique?
      'Both computers contain different completed levels. Back up this Chromebook before combining them.':
      'This computer has levels not yet in the cloud. Ask your teacher to recover those levels safely.');
   }
   if(JSON.stringify(local)!==JSON.stringify(saved)){
    safeBackup(local,'import');
    applyProgress(copy(saved));
   }
   blocked=false;clearLoading();setStatus('saved');return true;
  }catch(error){if(tag===session)statusError(error);return false}
 }
 async function attach(){
  session++;pending=0;revision=null;activeScope='';blocked=false;
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
     '<button type="button" data-cloud-action="sync">🔄 Check My Saved Game</button>')+
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
   }else if(action==='sync'){
     const synced=await syncNow();
     msg(synced?'Cloud connection checked and your progress loaded.':
       'Cloud sync needs attention. Do not switch Chromebooks until this is resolved.');
   }
  });
 }
 return {attach,enqueue,open,update,reset,isPaired};
}
