const app=document.getElementById('app');
const guided=location.pathname.includes('/drag-drop-adventure/');
let pending=false;
export const starIcon='<img src="../arrow-lab/assets/star-icon.png" alt="Rainbow Star">';
if(guided){document.body.classList.add('guided');const guide=document.createElement('aside');guide.id='kaple-guide';guide.innerHTML='<div class="guide-bubble"><button id="guide-speak" aria-label="Read Ms. Kaple’s instructions">🔊</button><p id="guide-words">Choose your teacher. Then choose your number.</p><div id="guide-pictures" aria-label="Picture steps">👩‍🏫 → 🔢</div></div><div class="guide-cast"><img class="kaple-portrait" src="../trackpad-adventure/characters/ms_kaple.webp" alt="Ms. Kaple"><img class="rigby-portrait" src="../trackpad-adventure/characters/rigby.webp" alt="Rigby"></div>';document.body.append(guide);document.getElementById('guide-speak').onclick=()=>{if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(document.getElementById('guide-words').textContent);u.rate=.83;speechSynthesis.speak(u)};}
export function tellGuide(words,pictures){const w=document.getElementById('guide-words');if(!w)return;if(w.textContent!==words)w.textContent=words;if(pictures!==undefined){const p=document.getElementById('guide-pictures');if(p.innerHTML!==pictures)p.innerHTML=pictures;}}
const paged=new WeakSet();
function paginate(){
 for(const grid of app.querySelectorAll('.adventure-cards,.cards,.collection,.level-cards,.character-grid')){
 if(paged.has(grid)||grid.querySelector('[data-teacher],[data-number],[data-hero]'))continue;
 const children=[...grid.children];if(children.length<=6)continue;paged.add(grid);let page=0;const count=grid.classList.contains('friend-cards')?3:6;
 const bar=document.createElement('nav');bar.className='choice-pages';bar.setAttribute('aria-label','More choices');bar.innerHTML='<button type="button">← Back</button><span></span><button type="button">Next →</button>';grid.after(bar);const [prev,next]=bar.querySelectorAll('button');
 const show=()=>{children.forEach((c,i)=>c.hidden=i<page*count||i>=(page+1)*count);prev.disabled=page===0;next.disabled=(page+1)*count>=children.length;bar.querySelector('span').textContent=(page+1)+' / '+Math.ceil(children.length/count);schedule()};prev.onclick=()=>{page--;show()};next.onclick=()=>{page++;show()};show();
 }
}
export function fitScreen(){
 pending=false;if(!app)return;paginate();
 if(guided&&!document.body.classList.contains('adventure-mode')){if(app.querySelector('[data-teacher]'))tellGuide('Choose your teacher. Then choose your number.','👩‍🏫 → 🔢');else if(app.querySelector('[data-number]'))tellGuide('Choose your classroom number.','🔢 → ✓');else if(app.querySelector('#maze'))tellGuide('Use your arrow keys. Start at the star and finish at the flag.','⭐ → ⬆️ ⬅️ ⬇️ ➡️ → 🏁');}
 const vh=window.visualViewport?.height||innerHeight, vw=window.visualViewport?.width||innerWidth;
 const top=Math.ceil(document.querySelector('body>header').getBoundingClientRect().bottom)+4;
 const hasGuide=guided&&!['lab-map-active','lab-world-active','activity-playing','lab-collection-active'].some(name=>document.body.classList.contains(name));
 const compact=hasGuide&&vw<=700;
 document.body.classList.toggle('compact-directions',compact);
 const left=hasGuide&&!compact?Math.min(260,Math.max(190,vw*.23)):0;
 document.documentElement.style.setProperty('--screen-top',top+'px');document.documentElement.style.setProperty('--guide-width',left+'px');document.documentElement.style.setProperty('--screen-height',(vh-top-8)+'px');
 // Never shrink the entire Arrow Adventure UI: keep full-size controls,
 // scroll longer screens and reserve the visible viewport for maze play.
 app.style.transform='none';
 app.style.left=left+'px';
 app.style.width=(vw-left)+'px';
 app.style.maxWidth=(vw-left)+'px';
 const guide=document.getElementById('kaple-guide');
 const guideHeight=compact?Math.min(Math.max(80,(vh-top-8)*.4),guide.querySelector('.guide-bubble').scrollHeight+16):0;
 document.documentElement.style.setProperty('--compact-guide-height',guideHeight+'px');
 app.style.top=(top+guideHeight)+'px';
 app.style.height=Math.max(0,vh-top-guideHeight-8)+'px';
 app.style.minHeight='0';
 app.style.overflowX='hidden';
 app.style.overflowY=document.body.classList.contains('playing')?'hidden':'auto';
 // Fit every drag level around its actual wrapped directions and controls.
 const lesson=app.querySelector('.drag-lesson'),field=app.querySelector('.drag-field');
 if(lesson&&field){
  const otherHeight=lesson.getBoundingClientRect().bottom-app.getBoundingClientRect().top+app.scrollTop-field.getBoundingClientRect().height+16;
  field.style.height=Math.max(260,Math.min(540,app.clientHeight-otherHeight-8))+'px';
 }
 if(document.body.classList.contains('adventure-mode'))return;
 // Login/teacher selection uses the same readable, scrollable layout.
 app.style.overflowY='auto';
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(fitScreen)}}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
if(guided)new MutationObserver(schedule).observe(document.getElementById('kaple-guide'),{childList:true,subtree:true,characterData:true});
new ResizeObserver(schedule).observe(document.querySelector('body>header'));
new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.fonts.ready.then(schedule);app.addEventListener('load',schedule,true);app.addEventListener('toggle',schedule,true);schedule();

// Visible scroll controls for students who are still learning trackpad gestures.
const scrollControls=document.createElement('nav');
scrollControls.className='student-scroll-controls';scrollControls.setAttribute('aria-label','Scroll the page');
scrollControls.innerHTML='<button type="button" aria-label="Scroll up" title="Scroll up">▲</button><button type="button" aria-label="Scroll down" title="Scroll down">▼</button>';
document.body.append(scrollControls);
const [scrollUp,scrollDown]=scrollControls.querySelectorAll('button');
function updateScrollControls(){
 const overflow=app.scrollHeight>app.clientHeight+2;
 scrollControls.hidden=!overflow;
 scrollUp.disabled=app.scrollTop<=1;
 scrollDown.disabled=app.scrollTop+app.clientHeight>=app.scrollHeight-2;
}
function scrollPage(direction){app.scrollBy({top:direction*Math.max(100,app.clientHeight*.65),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
scrollUp.onclick=()=>scrollPage(-1);scrollDown.onclick=()=>scrollPage(1);
app.addEventListener('scroll',updateScrollControls,{passive:true});
app.addEventListener('activity-layout',updateScrollControls);
new ResizeObserver(updateScrollControls).observe(app);
new MutationObserver(()=>requestAnimationFrame(updateScrollControls)).observe(app,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(updateScrollControls));
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]')||e.target.closest('input,select,textarea,[contenteditable=true]'))return;
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&app.scrollHeight>app.clientHeight+2){e.preventDefault();app.scrollBy({top:e.key==='ArrowDown'?80:-80,behavior:'instant'})}
});
requestAnimationFrame(updateScrollControls);
