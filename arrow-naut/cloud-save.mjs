/**
 * Portable, private student-progress backup for Arrow-Naut (both grades).
 * Does not put student records on an open table or in a public URL.
 * Every cloud account is protected by an unguessable 16-character code.
 * A local verified save ALWAYS happens first; never silently throw it away.
 */
const API='https://vcjyhcnsuiwdeqqbiwgx.supabase.co/functions/v1/arrownaut-save';
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const clean=v=>String(v??'').toUpperCase().replace(/[^A-Z2-9]/g,'');
const codeDisplay=v=>clean(v).match(/.{1,4}/g)?.join('-')||'';
const linkKey=(game,teacher,student)=>'arrownaut-cloud-link-v1:'+game+':'+teacher+':'+student;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const count=p=>(p?.completed?.length||0)+(p?.mapTwo?.completed?.length||0);
function freshCode(){
 const raw=new Uint8Array(16);crypto.getRandomValues(raw);
 return [...raw].map(x=>alphabet[x%alphabet.length]).join('');
}
async function post(data){
 const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store'});
 let body;try{body=await response.json()}catch{body={error:'Cloud connection unavailable'}}
 if(!response.ok||!body.ok)throw new Error(body.error||'Cloud save failed');
 return body;
}
const keyFor=(getIdentity,game)=>{
 const {teacher,student}=getIdentity();
 if(!teacher||!Number.isInteger(student))return null;
 return {game,teacher,student};
};
export function makeCloudSave({game,getIdentity,getProgress,applyProgress,notice}){
 let code='',revision=0,scope='',status='unlinked',paused=false;
 let queue=Promise.resolve(),panel=null;
 const identity=()=>keyFor(getIdentity,game);
 const key=()=>{const id=identity();return id?linkKey(id.game,id.teacher,id.student):''};
 function update(){
  const b=document.querySelector('button[data-action="cloud"]');
  if(b){
   b.textContent=status==='saved'?'☁️ Cloud Saved':status==='syncing'?'☁️ Saving…':status==='error'?'⚠️ Not Synced':code?'☁️ Cloud Save':'☁️ Save Code';
   b.title=status==='error'?'Cloud not saved. Your work is stored only on this Chromebook until this is fixed.':'Access this student progress on other Chromebooks';
  }
 }
 function setStatus(next){status=next;update()}
 function reset(){code='';revision=0;paused=false;status='unlinked';scope='';panel?.remove();panel=null;update()}
 function announceError(error){
  paused=true;setStatus('error');
  notice('NOT SAVED TO CLOUD. Work is still on THIS computer. Click ⚠️ Not Synced before switching Chromebooks.');
  console.warn('Cloud save unavailable',String(error?.message||error));
 }
 async function loadRemote(importMode=false){
  const id=identity();if(!id||!code)return;
  const thisScope=key();const response=await post({...id,code,action:'load'});
  if(thisScope!==key())return;
  revision=response.revision;
  const local=getProgress(),remote=response.progress;
  if(!remote||remote.version!==1||!Array.isArray(remote.completed))throw new Error('Cloud record invalid; local save was not changed');
  // Never overwrite unique completed levels just because another device is newer.
  const localIDs=[...(local?.completed||[]),...(local?.mapTwo?.completed||[])];
  const remoteSet=new Set([...(remote.completed||[]),...(remote.mapTwo?.completed||[])]);
  const remoteIDs=[...(remote.completed||[]),...(remote.mapTwo?.completed||[])];
  const localSet=new Set(localIDs);
  const localHasUnique=localIDs.some(x=>!remoteSet.has(x));
  const remoteHasUnique=remoteIDs.some(x=>!localSet.has(x));
  if(localHasUnique && remoteHasUnique){
   throw new Error('This Chromebook and the cloud each have different completed levels. Ask the teacher to back up this computer before merging.');
  }
  if(localHasUnique&&!remoteHasUnique){
   // This original device has the most completed lessons. Keep it and safely
   // upload using the current server revision.
   setStatus('syncing');enqueue(local);return;
  }
  if(remoteHasUnique||importMode||(!localHasUnique&&!remoteHasUnique&&count(remote)>count(local))){
    if(remoteHasUnique&&local&&JSON.stringify(local)!==JSON.stringify(remote)){
      const backup='arrownaut-before-cloud-import:'+thisScope+':'+Date.now();
      localStorage.setItem(backup,JSON.stringify(local));
    }
    applyProgress(remote);
  }
  paused=false;setStatus('saved');
 }
 function enqueue(progress){
  const id=identity(),thisScope=key();
  if(!id||!code||paused)return;
  setStatus('syncing');
  const snapshot=JSON.parse(JSON.stringify(progress));
  queue=queue.catch(()=>{}).then(async()=>{
   if(thisScope!==key()||paused)return;
   try{
    const saved=await post({...id,code,revision,action:'save',progress:snapshot});
    if(thisScope!==key())return;
    revision=saved.revision;setStatus('saved');
   }catch(e){if(thisScope===key())announceError(e)}
  });
 }
 async function attach(){
  const k=key();if(!k){reset();return}
  scope=k;revision=0;paused=false;code=clean(localStorage.getItem(k)||'');
  if(code.length!==16){code='';setStatus('unlinked');return}
  setStatus('syncing');
  try{await loadRemote(false)}catch(e){announceError(e)}
 }
 const button=(label,action)=>'<button type="button" data-cloud-action="'+action+'">'+label+'</button>';
 function open(){
  if(!identity())return;
  panel?.remove();
  panel=document.createElement('div');panel.className='cloud-save-overlay';
  panel.innerHTML='<section class="cloud-save-panel" role="dialog" aria-modal="true" aria-labelledby="cloud-title">'+
   '<h2 id="cloud-title">☁️ Save Your Game</h2><p>Play on another Chromebook using your private SAVE CODE.</p>'+
   '<p class="cloud-save-student">'+esc(identity().teacher)+' · Student #'+identity().student+'</p>'+
   (code?'<p class="cloud-code" aria-label="Your private cloud save code">'+codeDisplay(code)+'</p>'+
       '<p>Keep this code somewhere safe. Never post it online.</p>'+button('📋 Copy Code','copy')+button('🔄 Sync Now','sync'):
     '<label for="cloud-existing-code">Already have a SAVE CODE?</label><input id="cloud-existing-code" autocomplete="off" spellcheck="false" maxlength="19" placeholder="XXXX-XXXX-XXXX-XXXX">'+
     button('🔓 Open My Saved Game','connect')+
     '<p>First time? On the Chromebook with your MOST completed levels:</p>'+
     button('✨ Make My Save Code','create'))+
     '<p class="cloud-save-result" role="status"></p>'+
     button('✖ Close','close')+'</section>';
  document.body.append(panel);
  const result=()=>panel?.querySelector('.cloud-save-result');
  const msg=t=>{if(result())result().textContent=t};
  panel.addEventListener('click',async e=>{
   const action=e.target.closest('[data-cloud-action]')?.dataset.cloudAction;if(!action)return;
   if(action==='close'){panel.remove();panel=null;return}
   if(action==='copy'){try{await navigator.clipboard.writeText(codeDisplay(code));msg('Code copied. Save it securely!')}catch{msg('Write down the code above.')}return}
   if(action==='sync'){paused=false;try{await loadRemote(false);if(!paused)enqueue(getProgress());msg('Cloud connection checked.')}catch(err){announceError(err);msg(String(err.message))}return}
   if(action==='create'){
    try{
     const id=identity(),progress=getProgress(),newCode=freshCode();
     const created=await post({...id,code:newCode,action:'create',progress});
     const k=key();if(!k)return;
     localStorage.setItem(k,newCode);
     code=newCode;revision=created.revision;paused=false;setStatus('saved');
     open();panel?.querySelector('.cloud-save-result')?.append('Cloud save created! Copy or write down this code to use on other computers.');
    }catch(err){msg('Could not start cloud saving. Local progress is still safe. '+err.message)}
    return;
   }
   if(action==='connect'){
    const candidate=clean(panel.querySelector('#cloud-existing-code')?.value||'');
    if(candidate.length!==16){msg('Enter the 16-character save code.');return}
    const previous=code;code=candidate;paused=false;
    try{
      const local=getProgress();
      const response=await post({...identity(),code,action:'load'});
      const remote=response.progress;
      const localIDs=[...(local?.completed||[]),...(local?.mapTwo?.completed||[])];
      const remoteIDs=new Set([...(remote?.completed||[]),...(remote?.mapTwo?.completed||[])]);
      if(localIDs.some(x=>!remoteIDs.has(x)))throw new Error('This computer has completed levels not in the cloud. Start cloud saving on that original Chromebook or back up this record before linking.');
      const k=key();
      if(!k)return;
      localStorage.setItem(k,candidate);revision=response.revision;
      if(local&&JSON.stringify(local)!==JSON.stringify(remote))
        localStorage.setItem('arrownaut-before-cloud-import:'+k+':'+Date.now(),JSON.stringify(local));
      applyProgress(remote);setStatus('saved');open();msg('Connected! Your cloud progress is loaded.');
    }catch(err){code=previous;msg('Could not connect: '+err.message)}
   }
  });
 }
 return {attach,enqueue,open,update,reset};
}
