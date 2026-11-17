/**
 * Teacher-only controls for local classroom records.
 * This passcode gate deters casual student access but is NOT server authentication.
 * Local backups/resets are device-only; teacher level access writes the cloud record.
 */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeName=s=>String(s??'class').replace(/[^a-z0-9_-]+/gi,'-');
export function openTeacherTools({teachers=[],teacherId='',prefix='',onReset=()=>{},onPreview=()=>{},onAdvance=async()=>{},mapOneWorlds=[],mapTwoWorlds=[]}={}){
 document.getElementById('teacher-tools-overlay')?.remove();
 let authorized=false;
 const overlay=document.createElement('div');
 overlay.id='teacher-tools-overlay';
 overlay.className='teacher-tools-overlay';
 overlay.setAttribute('role','presentation');
 document.body.append(overlay);
 const chooseClass=teachers.some(t=>t.id===teacherId)?teacherId:(teachers[0]?.id||'');
 function draw(){
  overlay.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="teacher-tools-title" class="teacher-tools-panel">
   <header><h2 id="teacher-tools-title">TEACHER ACCESS</h2><button type="button" data-teacher-close aria-label="Close teacher tools">×</button></header>
   ${authorized?`<p>Backups and resets affect this Chromebook only. Student level access below saves to the classroom cloud.</p>
   <label for="teacher-class">CLASS</label><select id="teacher-class">${teachers.map(t=>`<option value="${esc(t.id)}" ${t.id===chooseClass?'selected':''}>${esc(t.name)}</option>`).join('')}</select>
   <label for="teacher-number">STUDENT NUMBER (FOR ONE-STUDENT ACTIONS)</label><select id="teacher-number">${Array.from({length:30},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select>
   <section class="teacher-advance-form" aria-label="Move a student to a level">
    <h3>MOVE STUDENT TO A LEVEL</h3>
    <p>Unlocks this level and all earlier levels. Does not award stars, rescue friends, or mark lessons complete.</p>
    <label for="teacher-unlock-map">MAP</label><select id="teacher-unlock-map"><option value="one">MAP ONE</option><option value="two">MAP TWO (FINISHED WORLDS)</option></select>
    <label for="teacher-unlock-world">WORLD</label><select id="teacher-unlock-world"></select>
    <label for="teacher-unlock-level">START AT LEVEL</label><select id="teacher-unlock-level"></select>
    <button type="button" data-teacher-advance="1">SAVE LEVEL ACCESS ONLINE</button>
   </section>
   <div class="teacher-tool-actions"><button type="button" data-teacher-preview="1">PREVIEW ALL MAPS & LEVELS</button><button type="button" data-teacher-export="student">BACK UP STUDENT</button><button type="button" data-teacher-export="class">BACK UP CLASS</button><button type="button" data-teacher-reset="student">RESET ONE STUDENT</button><button type="button" data-teacher-reset="class">RESET ENTIRE CLASS</button></div>
   <p class="teacher-tools-note">Back up student data before resets. A reset permanently clears saved progress on THIS browser only. Teacher tools lock when closed.</p>
   `:`<p>Enter the teacher passcode to view settings. Students cannot see reset controls before unlocking.</p>
   <form id="teacher-pass-form"><label for="teacher-pass">TEACHER PASSCODE</label><input id="teacher-pass" type="password" inputmode="numeric" autocomplete="off" required maxlength="12"><button type="submit">UNLOCK</button></form>`}
   <p id="teacher-tools-message" role="status" aria-live="polite"></p>
   </section>`;
  if(!authorized)overlay.querySelector('#teacher-pass')?.focus();
 }
 function fillLevels(){
  const map=overlay.querySelector('#teacher-unlock-map')?.value||'one';
  const world=Number(overlay.querySelector('#teacher-unlock-world')?.value)||0;
  const level=overlay.querySelector('#teacher-unlock-level');
  if(!level)return;
  level.innerHTML=Array.from({length:8},(_,i)=>'<option value="'+i+'">LEVEL '+(i+1)+'</option>').join('');
 }
 function fillWorlds(){
  const map=overlay.querySelector('#teacher-unlock-map')?.value||'one';
  const worlds=map==='one'?mapOneWorlds:mapTwoWorlds;
  const select=overlay.querySelector('#teacher-unlock-world');if(!select)return;
  select.innerHTML=worlds.map((name,i)=>'<option value="'+i+'">'+esc(name)+'</option>').join('');
  fillLevels();
 }
 const message=(s)=>{const p=overlay.querySelector('#teacher-tools-message');if(p)p.textContent=s};
 const close=()=>{authorized=false;overlay.remove()};
 const current=()=>{
  const id=overlay.querySelector('#teacher-class')?.value||chooseClass;
  const num=Number(overlay.querySelector('#teacher-number')?.value)||1;
  return {id,num};
 };
 const key=(id,num)=>prefix+id+':'+num;
 const snapshot=(id,nums)=>{
  const records=[];for(const n of nums){const value=localStorage.getItem(key(id,n));if(value!==null)records.push({student:n,key:key(id,n),value})}
  return records;
 };
 function download(id,records){
  const blob=new Blob([JSON.stringify({format:'ms-kaple-local-records-v1',created:new Date().toISOString(),classId:id,records},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='ms-kaple-backup-'+safeName(id)+'-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 }
 overlay.addEventListener('click',async event=>{
  const btn=event.target.closest('button');if(!btn)return;
  if(btn.hasAttribute('data-teacher-close')){close();return}
  if(!authorized)return;
  if(btn.hasAttribute('data-teacher-preview')){close();onPreview();return}
  if(btn.hasAttribute('data-teacher-advance')){
   const {id,num}=current(),map=overlay.querySelector('#teacher-unlock-map')?.value||'one';
   const world=Number(overlay.querySelector('#teacher-unlock-world')?.value),stage=Number(overlay.querySelector('#teacher-unlock-level')?.value);
   const worlds=map==='one'?mapOneWorlds:mapTwoWorlds;
   if(!id||!worlds[world]||!Number.isInteger(stage)||stage<0||stage>7){message('Choose a valid student, world, and level.');return}
   if(!window.confirm('Save access through '+worlds[world]+' Level '+(stage+1)+' for student #'+num+' in '+id+'? This does NOT give stars or mark lessons complete.'))return;
   btn.disabled=true;message('Checking this student’s latest cloud save…');
   try{const result=await onAdvance({teacher:id,student:num,map,world,stage});
    message(result||'Student access saved online.');}
   catch(error){message('NOT SAVED ONLINE: '+String(error.message||error));}
   finally{btn.disabled=false}
   return;
  }
  const {id,num}=current();if(!id){message('Choose a class first.');return}
  const type=btn.dataset.teacherExport||btn.dataset.teacherReset;
  if(!type)return;
  const nums=type==='class'?Array.from({length:30},(_,i)=>i+1):[num];
  try{
   const records=snapshot(id,nums);
   if(btn.dataset.teacherExport){download(id,records);message('Backup created for '+records.length+' saved record(s) on this browser.');return}
   if(!records.length){message('No saved records found for this selection on this Chromebook.');return}
   const wording=type==='class'?'ALL '+records.length+' saved students in class '+id:'student #'+num+' in '+id;
   if(!window.confirm('RESET '+wording+' on THIS Chromebook? This cannot be undone. Export a backup first.'))return;
   if(type==='class'&&window.prompt('To confirm the WHOLE CLASS reset, type RESET CLASS exactly:')!=='RESET CLASS')return;
   download(id,records);
   for(const record of records){localStorage.removeItem(record.key);if(localStorage.getItem(record.key)!==null)throw Error('Storage refused to delete a record');}
   message('Reset '+records.length+' local student record(s). Backup downloaded.');
   onReset(id,nums);
  }catch(err){message('Action failed. Existing saved records may need inspection: '+String(err.message||err))}
 });
 overlay.addEventListener('change',event=>{
  if(event.target.id==='teacher-unlock-map')fillWorlds();
  if(event.target.id==='teacher-unlock-world')fillLevels();
 });
 overlay.addEventListener('submit',event=>{
  if(event.target.id!=='teacher-pass-form')return;event.preventDefault();
  if(overlay.querySelector('#teacher-pass')?.value==='8714'){authorized=true;draw();}
  else message('Incorrect teacher passcode.');
 });
 overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
 draw();
 return close;
}
