const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const requiredDrops=stage=>3+Math.max(1,Math.min(8,stage));
export function validDrop({pointerType,button,distance,x,y,rect}){
 return pointerType==='mouse'&&button===0&&distance>=18&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
}
// Swept full-token collision: a fast move or final release cannot jump a blocker.
export function hitsBlocker(from,to,rect,halfWidth=0,halfHeight=0){
 const bounds={left:rect.left-halfWidth,right:rect.right+halfWidth,top:rect.top-halfHeight,bottom:rect.bottom+halfHeight};
 let enter=0,exit=1;
 for(const [axis,low,high] of [['x','left','right'],['y','top','bottom']]){
  const delta=to[axis]-from[axis];
  if(Math.abs(delta)<1e-9){if(from[axis]<bounds[low]||from[axis]>bounds[high])return false;continue}
  const a=(bounds[low]-from[axis])/delta,b=(bounds[high]-from[axis])/delta;
  enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
  if(enter>exit)return false;
 }
 return true;
}
export function blockerPlan(stage,available,reducedMotion=false){
 if(stage<2||!available)return [];
 const count=stage<4?1:Math.min(2,available);
 return Array.from({length:count},(_,i)=>({moving:!reducedMotion&&(stage===3||stage===5&&i===0||stage===6||stage===8)}));
}
export function movingBlockerHit(point,previous,current,halfWidth,halfHeight){
 return hitsBlocker(point,{x:point.x-(current.left-previous.left),y:point.y-(current.top-previous.top)},previous,halfWidth,halfHeight);
}
export function mountDragActivity(root,{stage,background,items,enemies=[],reducedMotion=false,speed=2200,completed=0,onDrop,onComplete}){
 let count=Math.min(completed,requiredDrops(stage)),active=null,disposed=false;
 const total=requiredDrops(stage),abort=new AbortController(),plan=blockerPlan(stage,enemies.length,reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches),hasBlocker=plan.length>0;
 let frame=0,blockers=[];
 root.innerHTML='<section class="drag-lesson"><div class="drag-instructions"><strong>1 CLICK &amp; HOLD</strong><strong>2 MOVE</strong><strong>3 LET GO</strong><span id="drag-progress" role="status"></span></div><div class="drag-field" style="background-image:url(&quot;'+esc(background)+'&quot;)"><div class="drag-source-tray"><span>CLICK &amp; HOLD</span><button class="drag-piece" aria-label="Drag the picture" type="button"></button></div><div class="drag-targets"></div><div class="drag-blockers"></div></div><p class="drag-feedback" role="status">Use one finger to click and keep holding. Move to the matching picture, then let go.</p><div class="drag-footer"><button type="button" class="drag-listen">🔊 Hear the steps</button><span>Keep holding until you reach the matching spot.</span></div></section>';
 const piece=root.querySelector('.drag-piece'),targets=root.querySelector('.drag-targets'),feedback=root.querySelector('.drag-feedback');
 const field=root.querySelector('.drag-field'),blockerLayer=root.querySelector('.drag-blockers');
 const instructions='Click and keep holding with one finger. Move to the matching picture'+(hasBlocker?', going around the bad guys. Keep the whole picture away from them':'')+'. Then let go.';
 feedback.textContent=instructions;
 root.querySelector('.drag-footer span').textContent=hasBlocker?'Go around the bad guys. Keep holding!':'Keep holding until you reach the matching spot.';
 let current;
 function bodyRect(el){const r=el.getBoundingClientRect(),pad=r.width*.10;return {left:r.left+pad,right:r.right-pad,top:r.top+pad,bottom:r.bottom-pad}}
 function placeBlocker(){
  if(!hasBlocker||disposed)return;
  const area=field.getBoundingClientRect(),source=root.querySelector('.drag-source-tray').getBoundingClientRect(),goal=targets.getBoundingClientRect();
  const center=(source.right+goal.left)/2-area.left,spread=Math.min(48,(goal.left-source.right)*.24);
  blockers.forEach((b,i)=>{b.x=center+(blockers.length>1?(i?spread:-spread):0);b.y=area.height/2+(blockers.length>1?(i?10:-10):0);b.amplitude=Math.min(26,area.height*.075);b.el.style.left=b.x+'px';b.el.style.top=b.y+'px';b.rect=bodyRect(b.el)});
 }
 const observer=new ResizeObserver(()=>{cancel();placeBlocker()});observer.observe(field);
 function blocked(){cancel();feedback.textContent='Oops! A bad guy blocked your picture. Try again and go around. Your finished drops are safe.'}
 function blockedAt(x,y){
  if(!active||!hasBlocker)return false;
  const hit=blockers.some(b=>hitsBlocker(active.last,{x,y},bodyRect(b.el),active.halfWidth,active.halfHeight));
  active.last={x,y};if(hit){blocked();return true}return false;
 }
 function animate(time){
  if(disposed||count>=total)return;
  for(const [i,b] of blockers.entries()){
   const previous=b.rect;
   if(b.moving)b.el.style.top=(b.y+Math.sin(time/Math.max(1600,Math.min(3200,Number(speed)||2200))+i*Math.PI)*b.amplitude)+'px';
   const current=bodyRect(b.el);
   if(active&&previous&&movingBlockerHit(active.last,previous,current,active.halfWidth,active.halfHeight))blocked();
   b.rect=current;
  }
  frame=requestAnimationFrame(animate);
 }
 function round(){
  current=items[count%items.length];
  const options=[current,...items.filter(i=>i.id!==current.id).slice(0,stage<3?1:2)];
  const offset=count%options.length;options.push(...options.splice(0,offset));
  piece.innerHTML='<img src="'+esc(current.image)+'" alt="'+esc(current.name)+'" draggable="false"><span>'+esc(current.name)+'</span>';
  piece.setAttribute('aria-label','Click and hold '+current.name+', move to its match, then release');
  targets.innerHTML=options.map(i=>'<div class="drag-target" data-item="'+esc(i.id)+'"><img src="'+esc(i.image)+'" alt="'+esc(i.name)+'" draggable="false"><span>'+esc(i.name)+'</span><small>DROP HERE</small></div>').join('');
  root.querySelector('#drag-progress').textContent=count+' / '+total+' drops';
  if(hasBlocker){
   cancelAnimationFrame(frame);blockerLayer.replaceChildren();
   blockers=plan.map((config,i)=>{const enemy=enemies[(stage-2+count+i)%enemies.length],el=document.createElement('div');el.className='drag-blocker';el.setAttribute('role','img');el.setAttribute('aria-label',enemy.name+(config.moving?' — moving bad guy':' — stationary bad guy'));el.innerHTML='<img src="'+esc(enemy.image)+'" alt="" draggable="false">';blockerLayer.append(el);return {...config,el}});
   placeBlocker();if(blockers.some(b=>b.moving))frame=requestAnimationFrame(animate);
  }
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
  e.preventDefault();if(blockedAt(e.clientX,e.clientY))return;active.distance=Math.max(active.distance,Math.hypot(e.clientX-active.x,e.clientY-active.y));
  active.ghost.style.left=e.clientX+'px';active.ghost.style.top=e.clientY+'px';
  for(const target of targets.children){const r=target.getBoundingClientRect();target.classList.toggle('over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)}
 }
 piece.addEventListener('pointerdown',e=>{
  if(disposed||active||count>=total)return;
  if(e.pointerType!=='mouse'||e.button!==0){feedback.textContent='Use your trackpad or mouse. Click and keep holding while you move.';return}
  e.preventDefault();const ghost=piece.cloneNode(true);ghost.removeAttribute('aria-label');ghost.setAttribute('aria-hidden','true');ghost.className='drag-ghost';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';document.body.append(ghost);
  const ghostRect=ghost.getBoundingClientRect();
  active={last:{x:e.clientX,y:e.clientY},halfWidth:ghostRect.width/2,halfHeight:ghostRect.height/2,id:e.pointerId,x:e.clientX,y:e.clientY,distance:0,pointerType:e.pointerType,button:e.button,ghost};piece.classList.add('drag-held');piece.setPointerCapture(e.pointerId);
  feedback.textContent='Keep holding! '+(hasBlocker?'Go around the bad guys. ':'')+'Move to '+current.name+', then let go.';
 },{signal:abort.signal});
 piece.addEventListener('pointermove',move,{signal:abort.signal});
 piece.addEventListener('pointerup',e=>{
  if(!active||e.pointerId!==active.id)return;
  if(blockedAt(e.clientX,e.clientY))return;
  const held=active;held.distance=Math.max(held.distance,Math.hypot(e.clientX-held.x,e.clientY-held.y));
  const target=[...targets.children].find(t=>t.dataset.item===current.id);
  const success=validDrop({...held,x:e.clientX,y:e.clientY,rect:target.getBoundingClientRect()});cancel();
  if(!success){feedback.textContent='Try again! Keep holding as you move. Let go inside the matching picture.';return}
  count++;onDrop(count);if(count===total)cancelAnimationFrame(frame);
  if(count===total){root.querySelector('#drag-progress').textContent=count+' / '+total+' drops';piece.disabled=true;feedback.textContent='You did it! Every picture was dragged and dropped.';onComplete();return}
  feedback.textContent='You held, moved, and let go! Now try the next picture.';round();
 },{signal:abort.signal});
 for(const event of ['pointercancel','lostpointercapture'])piece.addEventListener(event,cancel,{signal:abort.signal});
 window.addEventListener('blur',cancel,{signal:abort.signal});window.addEventListener('resize',cancel,{signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()},{signal:abort.signal});
 piece.addEventListener('dragstart',e=>e.preventDefault(),{signal:abort.signal});
 piece.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();feedback.textContent='Use your trackpad or mouse. Click and keep holding while you move.'}},{signal:abort.signal});
 root.querySelector('.drag-listen').onclick=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(instructions);u.rate=.8;speechSynthesis.speak(u)};
 round();
 // If a tab closed between the last saved drop and its reward, finish exactly once on resume.
 if(count===total)queueMicrotask(()=>{if(!disposed)onComplete()});
 return {cancel,destroy(){disposed=true;cancelAnimationFrame(frame);cancel();observer.disconnect();abort.abort();window.speechSynthesis?.cancel()}};
}
