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
export function mountDragActivity(root,{stage,background,items,enemies=[],completed=0,onDrop,onComplete}){
 let count=Math.min(completed,requiredDrops(stage)),active=null,disposed=false;
 const total=requiredDrops(stage),abort=new AbortController(),hasBlocker=stage>=2&&enemies.length>0;
 root.innerHTML='<section class="drag-lesson"><div class="drag-instructions"><strong>1 CLICK &amp; HOLD</strong><strong>2 MOVE</strong><strong>3 LET GO</strong><span id="drag-progress" role="status"></span></div><div class="drag-field" style="background-image:url(&quot;'+esc(background)+'&quot;)"><div class="drag-source-tray"><span>CLICK &amp; HOLD</span><button class="drag-piece" aria-label="Drag the picture" type="button"></button></div><div class="drag-targets"></div><div class="drag-blocker" hidden role="img"></div></div><p class="drag-feedback" role="status">Use one finger to click and keep holding. Move to the matching picture, then let go.</p><div class="drag-footer"><button type="button" class="drag-listen">🔊 Hear the steps</button><span>Keep holding until you reach the matching spot.</span></div></section>';
 const piece=root.querySelector('.drag-piece'),targets=root.querySelector('.drag-targets'),feedback=root.querySelector('.drag-feedback');
 const field=root.querySelector('.drag-field'),blocker=root.querySelector('.drag-blocker');
 const instructions='Click and keep holding with one finger. Move to the matching picture'+(hasBlocker?', going around the bad guy. Keep the whole picture away from its striped border':'')+'. Then let go.';
 feedback.textContent=instructions;
 root.querySelector('.drag-footer span').textContent=hasBlocker?'Go around the bad guy. Keep holding!':'Keep holding until you reach the matching spot.';
 let current;
 function placeBlocker(){
  if(!hasBlocker||disposed)return;
  const area=field.getBoundingClientRect(),source=root.querySelector('.drag-source-tray').getBoundingClientRect(),goal=targets.getBoundingClientRect();
  blocker.style.left=((source.right+goal.left)/2-area.left)+'px';
  blocker.style.top=(area.height/2)+'px';
 }
 const observer=new ResizeObserver(()=>{cancel();placeBlocker()});observer.observe(field);
 function blockedAt(x,y){
  if(!active||!hasBlocker)return false;
  const hit=hitsBlocker(active.last,{x,y},blocker.getBoundingClientRect(),active.halfWidth,active.halfHeight);
  active.last={x,y};
  if(hit){cancel();feedback.textContent='Oops! The bad guy blocked your picture. Try again and go around the striped border. Your finished drops are safe.';return true}
  return false;
 }
 function round(){
  current=items[count%items.length];
  const options=[current,...items.filter(i=>i.id!==current.id).slice(0,stage<3?1:2)];
  const offset=count%options.length;options.push(...options.splice(0,offset));
  piece.innerHTML='<img src="'+esc(current.image)+'" alt="'+esc(current.name)+'" draggable="false"><span>'+esc(current.name)+'</span>';
  piece.setAttribute('aria-label','Click and hold '+current.name+', move to its match, then release');
  targets.innerHTML=options.map(i=>'<div class="drag-target" data-item="'+esc(i.id)+'"><img src="'+esc(i.image)+'" alt="'+esc(i.name)+'" draggable="false"><span>'+esc(i.name)+'</span><small>DROP HERE</small></div>').join('');
  root.querySelector('#drag-progress').textContent=count+' / '+total+' drops';
  if(hasBlocker){const enemy=enemies[(stage-2+count)%enemies.length];blocker.hidden=false;blocker.setAttribute('aria-label',enemy.name+' — blocker. Drag around the striped border.');blocker.innerHTML='<img src="'+esc(enemy.image)+'" alt="'+esc(enemy.name)+'" draggable="false"><small>GO AROUND</small>';placeBlocker()}
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
  feedback.textContent='Keep holding! '+(hasBlocker?'Go around the bad guy. ':'')+'Move to '+current.name+', then let go.';
 },{signal:abort.signal});
 piece.addEventListener('pointermove',move,{signal:abort.signal});
 piece.addEventListener('pointerup',e=>{
  if(!active||e.pointerId!==active.id)return;
  if(blockedAt(e.clientX,e.clientY))return;
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
 piece.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();feedback.textContent='Use your trackpad or mouse. Click and keep holding while you move.'}},{signal:abort.signal});
 root.querySelector('.drag-listen').onclick=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(instructions);u.rate=.8;speechSynthesis.speak(u)};
 round();
 // If a tab closed between the last saved drop and its reward, finish exactly once on resume.
 if(count===total)queueMicrotask(()=>{if(!disposed)onComplete()});
 return {cancel,destroy(){disposed=true;cancel();observer.disconnect();abort.abort();window.speechSynthesis?.cancel()}};
}
