// Classroom UI gate. Credentials and class settings are local to this browser.
const key='drag-drop-adventure-teacher-password';
let unlocked=false;
export function lockTeacher(){unlocked=false}
async function digest(password,salt){
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:150000,hash:'SHA-256'},material,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function teacherAccess({change=false}={}){
 if(unlocked&&!change)return true;
 let credential;
 try{credential=JSON.parse(localStorage.getItem(key)||'null')}catch{return false}
 const creating=!credential||change;
 const d=document.createElement('dialog');d.className='dialog teacher-access';
 d.innerHTML='<form><h2>'+ (creating?'Set teacher password':'Teacher sign in')+'</h2><p>'+ (creating?'Choose a password with at least 8 characters. Set this up before students use this browser.':'Enter your teacher password to open settings and all-level preview.')+'</p><label>Password<input name="password" type="password" autocomplete="'+(creating?'new-password':'current-password')+'" required minlength="8"></label>'+(creating?'<label>Confirm password<input name="confirm" type="password" autocomplete="new-password" required minlength="8"></label>':'')+'<p role="status"></p><div class="actions"><button type="submit">'+(creating?'Save password':'Unlock')+'</button><button type="button" data-cancel>Cancel</button></div></form>';
 document.body.append(d);d.showModal();d.querySelector('input').focus();
 return new Promise(resolve=>{
  const finish=value=>{d.close();d.remove();resolve(value)};
  d.oncancel=e=>{e.preventDefault();finish(false)};d.querySelector('[data-cancel]').onclick=()=>finish(false);
  d.querySelector('form').onsubmit=async e=>{
   e.preventDefault();const form=e.target,status=d.querySelector('[role=status]'),button=form.querySelector('[type=submit]');
   if(creating&&form.elements.password.value!==form.elements.confirm.value){status.textContent='The passwords do not match.';return}
   button.disabled=true;
   try{
    const salt=creating?Array.from(crypto.getRandomValues(new Uint8Array(16))):credential.salt;
    const hash=await digest(form.elements.password.value,salt);
    if(!creating&&hash!==credential.hash){status.textContent='Incorrect password. Try again.';return}
    if(creating)localStorage.setItem(key,JSON.stringify({salt,hash}));
    unlocked=true;finish(true);
   }catch{status.textContent='Could not save or check the password. Allow browser storage and try again.'}
   finally{button.disabled=false}
  };
 });
}
