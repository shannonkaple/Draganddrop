'use strict';
const el=id=>document.getElementById(id);
const cards=el('arcadeCards'), play=el('playArea'), body=el('gameBody'), back=el('allGames'), read=el('read');
let selected=null, cleanup=null;
let art={'spotlight':'round2.webp','macys-match':'art-match/star.webp','parade-order':'art-tv/cinema-tv-shell.png','nyc-maze':'brand/maze-car.webp'};
if(new URLSearchParams(location.search).get('preview')==='maker'||/\/thanksgiving-parade\/games(?:\/|$)/.test(location.pathname))el('makerLink').href='../index.html';
function speak(text){if(!window.speechSynthesis||!text)return;const u=new SpeechSynthesisUtterance(text);u.rate=.82;u.lang='en-US';speechSynthesis.cancel();speechSynthesis.speak(u)}
const spotlight={id:'spotlight',title:'Parade Spotlight',blurb:'Ten real photos. Find ten things in each.',mount(root){const f=document.createElement('iframe');f.title='Parade Spotlight photo game';f.src='hunt.html';root.replaceChildren(f);return null}};
const cityMaze={id:'nyc-maze',title:'NYC Maze',blurb:'Guide the parade car through New York City streets.',mount:(root)=>window.mountParadeMaze(root,home)};
const all=[...(window.arcadeOrder||[]),spotlight,...(window.arcadeMatch||[]),cityMaze];
const prizeArt=['duck','clover-bunny','poppy-penguin','comet-unicorn','purple-dragon','cinnamon-giraffe','waffle-corgi','orbit-robot'].map(k=>'art-b/'+(k==='duck'?'doodle-duck':k)+'.webp');
const prizeKey='kaple-parade-arcade-balloons-v1';let prizes=0,prizeTimer;
try{prizes=Math.max(0,Math.min(999999,parseInt(localStorage.getItem(prizeKey)||'0',10)||0))}catch{}
function displayPrizes(){
 el('balloonTotal').textContent=prizes+' '+(prizes===1?'balloon':'balloons')+' earned';
 el('prizeRecent').replaceChildren(...Array.from({length:Math.min(6,prizes)},(_,i)=>{
  const img=document.createElement('img'), path=prizeArt[(Math.max(0,prizes-6)+i)%prizeArt.length];img.src=window.portableArt?.[path]||path;img.alt='';return img
 }));
}
window.paradeReward=game=>{
 if(!selected||game!==selected)return;
 prizes++;try{localStorage.setItem(prizeKey,String(prizes))}catch{}displayPrizes();
 const s=el('prizeStatus');s.textContent='You earned a balloon!';s.classList.add('prize-pop');clearTimeout(prizeTimer);prizeTimer=setTimeout(()=>{s.textContent='';s.classList.remove('prize-pop')},2300);
};
displayPrizes();
function home(){if(typeof cleanup==='function')cleanup();cleanup=null;body.replaceChildren();window.speechSynthesis?.cancel();play.hidden=true;cards.hidden=false;back.hidden=true;read.hidden=true;if(selected)cards.querySelector('[data-game="'+selected+'"]')?.focus();selected=null}
function launch(g){if(typeof cleanup==='function')cleanup();selected=g.id;cards.hidden=true;play.hidden=false;back.hidden=false;read.hidden=!window.speechSynthesis||selected==='spotlight';el('gameTitle').textContent=g.title;cleanup=g.mount(body,{});back.scrollIntoView({block:'nearest'});el('gameTitle').focus({preventScroll:true})}
all.forEach(g=>{const button=document.createElement('button'),img=document.createElement('img'),words=document.createElement('div'),name=document.createElement('b'),desc=document.createElement('span');button.type='button';button.className='card';button.dataset.game=g.id;img.alt='';img.src=art[g.id];img.className=g.id==='spotlight'?'photo-chip':'';name.textContent=g.title;desc.textContent=g.blurb;words.append(name,desc);button.append(img,words);button.onclick=()=>launch(g);cards.append(button)});
back.onclick=home;read.onclick=()=>{const lines=[...body.querySelectorAll('.game-direction,.arcade-b-directions,.pe-heading,.pe-label,.pe-feedback')].filter(n=>n.getClientRects().length>0).map(n=>n.textContent.trim()).filter(Boolean);speak(lines.length?lines.join('. '):body.innerText)};
window.addEventListener('message',event=>{const frame=body.querySelector('iframe');if(selected!=='spotlight'||!frame||event.source!==frame.contentWindow)return;if(event.data?.kind==='parade-spotlight-height'&&Number.isFinite(event.data.height))frame.style.height=Math.max(390,Math.min(1600,event.data.height+10))+'px';if(event.data?.kind==='parade-spotlight-reward')window.paradeReward('spotlight')});
