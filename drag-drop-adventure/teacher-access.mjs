// Shared classroom teacher-code gate. Teacher preview never writes student progress.
const credential={"salt": [100, 114, 97, 103, 45, 116, 101, 97, 99, 104, 101, 114, 45, 118, 50, 33, 33], "hash": "4857916ef6b770a6b50e4b3f118c18e34126094274e64be3e19d3e6b471cbaf6"};
let unlocked=false;
export function isTeacherUnlocked(){return unlocked}
export function lockTeacher(){unlocked=false}
async function digest(password,salt){
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:150000,hash:'SHA-256'},material,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function teacherAccess(){
 if(unlocked)return true;
 const d=document.createElement('dialog');d.className='dialog teacher-access';
 d.innerHTML='<form><h2>Teacher code</h2><p>Enter your four-digit code to open settings and the fully unlocked teacher preview.</p><label>Teacher code<input name="password" type="password" inputmode="numeric" autocomplete="off" required minlength="4" maxlength="4"></label><p role="status"></p><div class="actions"><button type="submit">Unlock</button><button type="button" data-cancel>Cancel</button></div></form>';
 document.body.append(d);d.showModal();d.querySelector('input').focus();
 return new Promise(resolve=>{
  let finished=false;
  const finish=value=>{if(finished)return;finished=true;d.close();d.remove();resolve(value)};
  d.oncancel=e=>{e.preventDefault();finish(false)};d.querySelector('[data-cancel]').onclick=()=>finish(false);
  d.querySelector('form').onsubmit=async e=>{
   e.preventDefault();const form=e.target,status=d.querySelector('[role=status]'),button=form.querySelector('[type=submit]');
   button.disabled=true;
   try{
    const salt=credential.salt;
    const hash=await digest(form.elements.password.value,salt);
    if(finished)return;
    if(hash!==credential.hash){status.textContent='Incorrect code. Try again.';return}

    unlocked=true;finish(true);
   }catch{status.textContent='Could not check the code. Reload and try again.'}
   finally{button.disabled=false}
  };
 });
}
