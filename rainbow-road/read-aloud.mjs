
const labels=new Map([['↑','up'],['↓','down'],['←','left'],['→','right'],['␣','space bar']]);
export function spokenText(value){let text=String(value);for(const [symbol,word]of labels)text=text.replaceAll(symbol,' '+word+' ');return text.replace(/[🌈⭐🌟🏁✓★⌨🔊]/gu,' ').replace(/\s+/g,' ').trim()}
const sources=new WeakMap();let active=null,scheduled=false;
const supported='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;
function textOf(node){if(node.dataset.speech)return spokenText(node.dataset.speech);const clone=node.cloneNode(true);clone.querySelectorAll('[data-read-aloud]').forEach(n=>n.remove());clone.querySelectorAll('img').forEach(n=>n.remove());return spokenText(clone.textContent)}
function sectionText(heading){
 const scope=heading.closest('dialog,article,.panel')||document.getElementById('app');
 const intro=Array.from(scope.querySelectorAll('p')).filter(p=>p.offsetParent!==null&&p.id!=='skill-feedback'&&(scope.matches('dialog,article,.panel')||!p.closest('.adventure-cards,.level-cards,.side,nav,.audio-choice')));
 const special=scope.querySelector('#skill-sequence');
 return [textOf(heading),...intro.map(textOf),...(special?[textOf(special)]:[])].join('. ');
}
function reader(source,getText){
 const b=document.createElement('button');b.type='button';b.className='read-aloud';b.dataset.readAloud='true';b.textContent='🔊';b.setAttribute('aria-label','Read aloud');b.title='Read aloud';sources.set(b,{source,getText});
 if(!supported){b.disabled=true;b.title='Read aloud is not available in this browser'}return b;
}
function decorate(){
 scheduled=false;let changed=false;
 if(document.body.classList.contains("guided"))return;
 if(active&&(!active.source.isConnected||active.source.closest('dialog')&&!active.source.closest('dialog').open)){speechSynthesis.cancel();active=null}
 for(const heading of document.querySelectorAll('#app h1,#app h2,#app h3,#adventure-dialog h2,#characters h2,#win h2')){
  if(heading.closest('button')||heading.querySelector('[data-read-aloud]'))continue;
  changed=true;heading.append(reader(heading,()=>sectionText(heading)));
 }
 for(const status of document.querySelectorAll('#adventure-status,#status')){
  if(!status.querySelector('[data-read-aloud]')){changed=true;status.append(reader(status,()=>textOf(status)))}
 }
 for(const choice of document.querySelectorAll('[data-hero],[data-land],[data-rescue],[data-level],[data-character],[data-stuff]')){
  if(choice.parentElement.classList.contains('audio-choice'))continue;
  changed=true;const wrap=document.createElement('div');wrap.className='audio-choice';choice.before(wrap);wrap.append(choice,reader(choice,()=>textOf(choice)));
 }
 if(changed)window.dispatchEvent(new Event('resize'));
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(decorate)}}
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-read-aloud]');if(!button||button.disabled)return;
 e.preventDefault();e.stopImmediatePropagation();const record=sources.get(button);if(!record||!supported)return;
 const words=record.getText();if(!words)return;speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(words);utterance.lang='en-US';utterance.rate=.83;utterance.pitch=1;utterance.volume=1;
 const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang==='en-US')||voices.find(v=>v.lang.startsWith('en'));if(voice)utterance.voice=voice;
 active=record;button.setAttribute('aria-label','Read aloud again');speechSynthesis.speak(utterance);
},true);
const style=document.createElement('style');style.textContent=".read-aloud{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;width:44px;min-width:44px;height:44px;margin:3px 6px;padding:3px!important;border:2px solid #000!important;border-radius:50%;background:#FFD600!important;color:#000!important;font:23px Arial,sans-serif!important;line-height:1;cursor:pointer;letter-spacing:0}.read-aloud:hover{background:#FF8A00!important}.read-aloud:focus-visible{outline:4px solid #FF2D8D;outline-offset:3px}.audio-choice{min-width:0;position:relative;display:flex;flex-direction:column;align-items:stretch;gap:3px}.audio-choice>.read-aloud{align-self:center;margin:0 0 5px}.adventure-cards>.audio-choice>button:first-child{border:2px solid #000;background:#fff;border-radius:18px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;font:inherit;color:inherit;flex:1}.adventure-cards>.audio-choice>button:first-child:hover{background:#FFD600}.level-cards>.audio-choice>button:first-child{padding:0 0 12px;overflow:hidden;border:2px solid #000;border-radius:15px;display:flex;flex-direction:column;gap:8px;align-items:center;flex:1}.character-grid>.audio-choice>button:first-child{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;border-color:#000;font-size:16px;flex:1}body.playing .caption .read-aloud,body.playing .side h3 .read-aloud{height:32px;min-width:32px;width:32px;font-size:18px!important}";document.head.append(style);
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
window.addEventListener('pagehide',()=>{if(supported)speechSynthesis.cancel()});
schedule();

