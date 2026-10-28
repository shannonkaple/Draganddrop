const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const requiredDrops=stage=>3+Math.max(1,Math.min(8,stage));
export function validDrop({pointerType,button,distance,x,y,rect}){
 return pointerType==='mouse'&&button===0&&distance>=18&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
}
export function mountDragActivity(root,{stage,background,items,completed=0,onDrop,onComplete}){
 let count=Math.min(completed,requiredDrops(stage)),active=null,disposed=false;
 const total=requiredDrops(stage),abort=new AbortController();
 root.innerHTML='<section class="drag-lesson"><div class="drag-instructions"><strong>1 CLICK &amp; HOLD</strong><strong>2 MOVE</strong><strong>3 LET GO</strong><span id="drag-progress" role="status"></span></div><div class="drag-field" style="background-image:url(&quot;'+esc(background)+'&quot;)"><div class="drag-source-tray"><span>CLICK &amp; HOLD</span><button class="drag-piece" aria-label="Drag the picture" type="button"></button></div><div class="drag-targets"></div></div><p class="drag-feedback" role="status">Use one finger to click and keep holding. Move to the matching picture, then let go.</p><div class="drag-footer"><button type="button" class="drag-listen">🔊 Hear the steps</button><span>Keep holding until you reach the matching spot.</span></div></section>';
 const piece=root.querySelector('.drag-piece'),targets=root.querySelector('.drag-targets'),feedback=root.querySelector('.drag-feedback');
 let current;
 function round(){
  current=items[count%items.length];
  const options=[current,...items.filter(i=>i.id!==current.id).slice(0,stage<3?1:2)];
  const offset=count%options.length;options.push(...options.splice(0,offset));
  piece.innerHTML='<img src="'+esc(current.image)+'" alt="'+esc(current.name)+'" draggable="false"><span>'+esc(current.name)+'</span>';
  piece.setAttribute('aria-label','Click and hold '+current.name+', move to its match, then release');
  targets.innerHTML=options.map(i=>'<div class="drag-target" data-item="'+esc(i.id)+'"><img src="'+esc(i.image)+'" alt="'+esc(i.name)+'" draggable="false"><span>'+esc(i.name)+'</span><small>DROP HERE</small></div>').join('');
  root.querySelector('#drag-progress').textContent=count+' / '+total+' drops';
 }
 function cancel(){
  if(!active)return;
  const old=active;active=null;old.ghost.remove();piece.classList.remove('drag-held');
  targets.querySelectorAll('.over').forEach(el=>el.classList.remove('over'));
  if(piece.hasPointerCapture(old.id))piece.releasePointerCapture(old.id);
 }
 function move(e){
  if(!active||e.pointerId!==active.id)return;
  if(!(e.buttons&1)){cancel();return}
  e.preventDefault();active.distance=Math.max(active.distance,Math.hypot(e.clientX-active.x,e.clientY-active.y));
  active.ghost.style.left=e.clientX+'px';active.ghost.style.top=e.clientY+'px';
  for(const target of targets.children){const r=target.getBoundingClientRect();target.classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)}
 }
 piece.addEventListener('pointerdown',e=>{
  if(disposed||active||count>=total)return;
  if(e.pointerType!=='mouse'||e.button!==0){feedback.textContent='Use your trackpad or mouse. Click and keep holding while you move.';return}
  e.preventDefault();const ghost=piece.cloneNode(true);ghost.removeAttribute('aria-label');ghost.setAttribute('aria-hidden','true');ghost.className='drag-ghost';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';document.body.append(ghost);
  active={id:e.pointerId,x:e.clientX,y:e.clientY,distance:0,pointerType:e.pointerType,button:e.button,ghost};piece.classList.add('drag-held');piece.setPointerCapture(e.pointerId);
  feedback.textContent='Keep holding! Move to '+current.name+', then let go.';
 },{signal:abort.signal});
 piece.addEventListener('pointermove',move,{signal:abort.signal});
 piece.addEventListener('pointerup',e=>{
  if(!active||e.pointerId!==active.id)return;
  const held=active;held.distance=Math.max(held.distance,Math.hypot(e.clientX-held.x,e.clientY-held.y));
  const target=[...targets.children].find(t=>t.dataset.item===current.id);
  const success=validDrop({...held,x:e.clientX,y:e.clientY,rect:target.getBoundingClientRect()});cancel();
  if(!success){feedback.textContent='Try again! Keep holding as you move. Let go inside the matching picture.';return}
  count++;onDrop(count);
  if(count===total){root.querySelector('#drag-progress').textContent=count+' / '+total+' drops';piece.disabled=true;feedback.textContent='You did it! Every picture was dragged and dropped.';onComplete();return}
  feedback.textContent='You held, moved, and let go! Now try the next picture.';round();
 },{signal:abort.signal});
 for(const event of ['pointercancel','lostpointercapture'])piece.addEventListener(event,cancel,{signal:abort.signal});
 window.addEventListener('blur',cancel,{signal:abort.signal});window.addEventListener('resize',cancel,{signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()},{signal:abort.signal});
 piece.addEventListener('dragstart',e=>e.preventDefault(),{signal:abort.signal});
 piece.addEventListener('click',()=>{feedback.textContent='Click and keep holding while you move. A click by itself does not move the picture.'},{signal:abort.signal});
 root.querySelector('.drag-listen').onclick=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance('Click and keep holding with one finger. Move the picture to its match. Let go inside the matching spot.');u.rate=.8;speechSynthesis.speak(u)};
 round();
 // If a tab closed between the last saved drop and its reward, finish exactly once on resume.
 if(count===total)queueMicrotask(()=>{if(!disposed)onComplete()});
 return {cancel,destroy(){disposed=true;cancel();abort.abort();window.speechSynthesis?.cancel()}};
}
