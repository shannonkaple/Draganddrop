// Read-aloud affordances for all student-facing directions in BOTH adventure games.
// Buttons are injected next to real text, never into decorative artwork or maze cells.
const selectors=[
  '#app p',
  '#app .activity-feedback',
  '#app #adventure-status',
  '#app .drag-instructions',
  '#app .activity-instructions p',
  '.adventure-dialog .dialog-content p',
  '#shop p',
  '#win p'
].join(',');
const escCss='read-directions-button';
function speak(text){
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance)return;
  try{
    window.speechSynthesis.cancel();
    const utterance=new window.SpeechSynthesisUtterance(text);
    utterance.rate=.82;
    window.speechSynthesis.speak(utterance);
  }catch{/* Speech may be unavailable when school devices block it. */}
}
function addButtons(){
  for(const target of document.querySelectorAll(selectors)){
    if(target.querySelector(':scope > .'+escCss))continue;
    if(target.closest('button, [aria-hidden="true"]'))continue;
    if(!target.textContent?.trim())continue;
    const button=document.createElement('button');
    button.type='button';
    button.className=escCss;
    button.textContent='🔊';
    button.setAttribute('aria-label','Read these directions aloud');
    button.title='Read directions aloud';
    button.disabled=!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      const copy=target.cloneNode(true);
      copy.querySelectorAll('.'+escCss).forEach(b=>b.remove());
      speak(copy.textContent.trim());
    });
    target.append(button);
  }
}
let queued=false;
function schedule(){
 if(queued)return;
 queued=true;
 queueMicrotask(()=>{queued=false;addButtons()});
}
const observer=new MutationObserver(changes=>{
 if(changes.some(change=>change.addedNodes.length||change.type==='characterData'))schedule();
});
if(document.body){
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 schedule();
}else{
 document.addEventListener('DOMContentLoaded',()=>{
   observer.observe(document.body,{subtree:true,childList:true,characterData:true});
   schedule();
 },{once:true});
}
