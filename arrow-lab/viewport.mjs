const app=document.getElementById('app');
const guided=location.pathname.includes('/arrow-lab/');
let pending=false;
export const starIcon='<img src="./assets/star-icon.png" alt="Rainbow Star">';
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
 // Phones and tablets need the FULL width for a readable maze and tap arrows.
 // The teacher-guide sidebar remains available on Chromebook/desktop only.
 const mobile=document.body.classList.contains('mobile-touch-enabled');
 const left=guided&&!mobile&&!document.body.classList.contains('lab-map-active')&&!document.body.classList.contains('lab-collection-active')?Math.min(260,Math.max(190,vw*.23)):0;
 document.documentElement.style.setProperty('--screen-top',top+'px');document.documentElement.style.setProperty('--guide-width',left+'px');document.documentElement.style.setProperty('--screen-height',(vh-top-8)+'px');
 // Never shrink the entire Arrow Adventure UI: keep full-size controls,
 // scroll longer screens and reserve the visible viewport for maze play.
 app.style.transform='none';
 app.style.left=left+'px';
 app.style.width=(vw-left)+'px';
 app.style.maxWidth=(vw-left)+'px';
 app.style.height=(vh-top-8)+'px';
 app.style.minHeight='0';
 app.style.overflowX='hidden';
 app.style.overflowY=document.body.classList.contains('playing')?'hidden':'auto';
 if(document.body.classList.contains('adventure-mode'))return;
 // Login/teacher selection uses the same readable, scrollable layout.
 app.style.overflowY='auto';
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(fitScreen)}}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.fonts.ready.then(schedule);app.addEventListener('load',schedule,true);app.addEventListener('toggle',schedule,true);schedule();
