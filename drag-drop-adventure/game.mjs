import {teacherAccess,lockTeacher} from './teacher-access.mjs?v=20261029-teacherlock1';
import './viewport.mjs?v=20261029-mouseonly';
import {openAdventure} from './adventure.mjs?v=varied-patterns-20261029';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let controller=null;
const teachers=await fetch(new URL('./teachers-grade2.json?v=20261028-wide',import.meta.url)).then(r=>{if(!r.ok)throw Error('Class list could not load');return r.json()});
function login(){
 controller?.cleanup();controller=null;lockTeacher();document.body.classList.remove('teacher-preview');$('header-stars').hidden=true;$('header-stuff').hidden=true;$('header-profile').textContent='';document.body.classList.remove('playing','adventure-mode','lab-map-active');$('who').classList.add('hidden');
 $('app').innerHTML='<div class="hero"><h1>DRAG &amp; DROP ADVENTURE</h1><p>Click. Hold. Move. Let go!</p><p>Choose your teacher. Then choose your classroom number.</p></div><section class="panel"><h2>1. Second Grade · Pick your teacher</h2><div class="adventure-cards">'+teachers.map(t=>'<button data-teacher="'+t.id+'">'+esc(t.name)+'</button>').join('')+'</div></section>';
 document.querySelectorAll('[data-teacher]').forEach(b=>b.onclick=()=>numbers(teachers.find(t=>t.id===b.dataset.teacher)));
 $('help').onclick=()=>alert('Click and keep holding with one finger. Move the picture to its matching spot. Let go inside the spot.');
}
function numbers(teacher){
 $('app').innerHTML='<button id="back">← Change teacher</button><section class="panel"><h2>2. Pick your number</h2><p>'+esc(teacher.name)+'</p><div class="numbers">'+Array.from({length:24},(_,i)=>'<button data-number="'+(i+1)+'">'+(i+1)+'</button>').join('')+'</div></section><p>Progress saves for your teacher and number on this browser.</p>';
 $('back').onclick=login;
 document.querySelectorAll('[data-number]').forEach(b=>b.onclick=async()=>{
  const number=Number(b.dataset.number);$('app').innerHTML='<p role="status">Opening your adventure…</p>';
  try{controller=await openAdventure({number,storageKey:'drag-drop-adventure-v1:'+teacher.id+':'+number,teacherName:teacher.name,teachers,onLogout:login,goPractice:login,onTeacher:openTeacher})}
  catch(error){console.error(error);$('app').innerHTML='<section class="panel"><h2>Could not open your adventure.</h2><p>Please refresh and try again.</p><button id="retry">Choose student</button></section>';$('retry').onclick=login}
 });
}
async function openTeacher(){
 if(!await teacherAccess())return;
 controller?.cleanup();
 controller=await openAdventure({number:'Preview',storageKey:'drag-drop-adventure-teacher-preview',teacherName:'Teacher',teachers,onLogout:login,goPractice:login,onTeacher:openTeacher,preview:true});
 controller.teacherSettings();
}
$('teacher-access').onclick=openTeacher;
$('heading-toggle').onclick=()=>{const open=document.querySelector('body>header').classList.toggle('heading-open');$('heading-toggle').setAttribute('aria-expanded',String(open));$('heading-toggle').textContent=open?'Shrink heading':'Show heading'};
$('header-stars').onclick=()=>controller?.goShop();
$('header-stuff').onclick=()=>controller?.goStuff();
$('global-home').onclick=()=>controller?controller.goHome():login();
window.arrowLabToggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
$('global-fullscreen').onclick=window.arrowLabToggleFullscreen;
document.addEventListener('fullscreenchange',()=>{$('global-fullscreen').textContent=document.fullscreenElement?'Exit Full Screen':'⛶ Full Screen';$('global-fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement))});
login();
