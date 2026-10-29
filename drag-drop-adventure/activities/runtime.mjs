import {ENGINES,stateFor,targetsFor,tryPlacement,progressFor,contains,positionAt,hitboxAt,swept,motionCollision} from './engines.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=(a,cls='')=>a?'<img class="'+cls+'" src="'+esc(a.image)+'" alt="'+esc(a.name||'')+'" draggable="false">':'';
const layout=(el,r)=>{for(const [k,axis] of [['left','x'],['top','y'],['width','w'],['height','h']])el.style[k]=(r[axis]/(axis==='x'||axis==='w'?10:6))+'%'};
export function mountActivity(root,{level,saved,onProgress,onComplete,reducedMotion=false,speed=2200}){
 const state=stateFor(level,saved),engine=ENGINES[level.engine],abort=new AbortController();
 const motion=!reducedMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 let active=null,disposed=false,frame=0,time=0,lastTime=null,finished=false,artError=false;
 root.innerHTML='<section class="activity-shell"><div class="activity-instructions"><p>'+esc(engine.instruction)+'</p><strong class="activity-count" aria-live="polite"></strong></div><div class="activity-frame"><div class="activity-board" role="group" aria-label="'+esc(level.title)+' play area"><img class="activity-background" src="'+esc(level.background)+'" alt="" draggable="false"><div class="activity-world"></div><div class="activity-targets"></div><div class="activity-pieces"></div><div class="activity-hazards"></div></div></div><div class="activity-feedback" role="status">Click and keep holding. Move. Let go inside a matching space.</div><div class="activity-tools"><button type="button" class="activity-listen">Hear directions</button><button type="button" class="activity-reset">Restart this activity</button><span>Finished placements save automatically.</span></div></section>';
 const board=root.querySelector('.activity-board'),world=root.querySelector('.activity-world'),targetLayer=root.querySelector('.activity-targets'),pieceLayer=root.querySelector('.activity-pieces'),hazardLayer=root.querySelector('.activity-hazards'),feedback=root.querySelector('.activity-feedback');
 const nodes=new Map(),targetNodes=new Map(),hazardNodes=new Map();
 const say=t=>feedback.textContent=t;
 root.addEventListener('error',e=>{if(e.target.tagName==='IMG'){artError=true;cancel();say('An artwork file could not load. Please reload this activity.');}},{capture:true,signal:abort.signal});
 if(level.container){const el=document.createElement('div');el.className='activity-container';el.setAttribute('aria-label','Packing area');layout(el,level.container);world.append(el)}
 for(const wall of level.walls){const el=document.createElement('div');el.className='activity-wall';el.setAttribute('aria-label','Maze wall');layout(el,wall);world.append(el)}
 function redraw(){
  targetLayer.replaceChildren();pieceLayer.replaceChildren();targetNodes.clear();nodes.clear();
  if(level.engine==='pattern'){
   for(const t of level.rounds[state.round].fixed){const el=document.createElement('div');el.className='activity-pattern-fixed';layout(el,t);el.innerHTML=image(t.asset);targetLayer.append(el)}
  }
  for(const t of targetsFor(level,state)){
   const el=document.createElement('div');el.className='activity-target';el.dataset.target=t.id;
   const completed=level.engine==='pattern'?state.roundPlaced[t.id]:t.capacity!==0&&Object.values(state.placed).includes(t.id);
   el.classList.toggle('filled',!!completed);
   el.innerHTML=image(t.asset,'target-reference')+'<span>'+esc(t.label||'Match here')+'</span>';
   if(completed)el.innerHTML=image(level.engine==='pattern'?level.pieces.find(p=>p.key===state.roundPlaced[t.id])?.asset:level.pieces.find(p=>state.placed[p.id]===t.id)?.asset)+'<span>Done</span>';
   if(completed&&level.engine==='order'){const p=level.pieces.find(p=>state.placed[p.id]===t.id),art=el.querySelector('img');if(p&&art){art.style.width=(p.w/t.w*100)+'%';art.style.height=(p.h/t.h*100)+'%'}}
   el.setAttribute('aria-label',(t.label||t.asset?.name||'Drop zone')+(completed?' — filled':''));
   targetLayer.append(el);targetNodes.set(t.id,el);layout(el,positionAt(t,time,motion));
  }
  for(const p of level.pieces){
   if(level.engine!=='pattern'&&state.placed[p.id])continue;
   const el=document.createElement('button');el.type='button';el.className='activity-piece';el.dataset.piece=p.id;
   el.setAttribute('aria-label','Click and hold '+p.asset.name+', move, then let go');el.innerHTML=image(p.asset);
   layout(el,{x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h});pieceLayer.append(el);nodes.set(p.id,el);
   el.addEventListener('pointerdown',e=>begin(e,p,el),{signal:abort.signal});
  }
  const progress=progressFor(level,state);root.querySelector('.activity-count').textContent=progress.done+' / '+progress.total+(level.engine==='pattern'?' · Pattern '+level.rounds[state.round].name:' done');
 }
 for(const h of level.hazards){const el=document.createElement('div');el.className='activity-hazard';el.innerHTML=image(h.asset);el.setAttribute('aria-label',h.asset.name+' — avoid this bad guy');hazardLayer.append(el);hazardNodes.set(h.id,el);layout(el,positionAt(h,time,motion))}
 function point(e){const b=board.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*1000,y:(e.clientY-b.top)/b.height*600}}
 function resetPiece(){if(active){const p=active.p;layout(active.el,{x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h});active.el.classList.remove('held')}}
 function cancel(message){resetPiece();if(active){try{active.el.releasePointerCapture(active.id)}catch{}}active=null;targetNodes.forEach(el=>el.classList.remove('over'));if(message)say(message)}
 function hazards(){return level.hazards.map(h=>hitboxAt(h,time,motion))}
 function blocked(from,to,p){
  if(engine.blocked)return engine.blocked(level,from,to,p,hazards());
  return hazards().some(h=>swept(from,to,h,Math.min(p.w,p.h)*.32));
 }
 function begin(e,p,el){
  if(e.button!==0||e.isPrimary===false||disposed||finished||artError||active)return;
  e.preventDefault();const down=point(e);active={p,el,id:e.pointerId,last:{x:p.x,y:p.y},offset:{x:down.x-p.x,y:down.y-p.y},down,distance:0};
  el.setPointerCapture(e.pointerId);el.classList.add('held');say('Keep holding. Move to your spot.');
 }
 function move(e){
  if(!active||e.pointerId!==active.id)return;e.preventDefault();
  const raw=point(e),next={x:raw.x-active.offset.x,y:raw.y-active.offset.y};
  active.distance=Math.max(active.distance,Math.hypot(raw.x-active.down.x,raw.y-active.down.y));
  if(blocked(active.last,next,active.p)){cancel('Oops! Back to the start. Try going around the wall or bad guy.');return}
  active.last=next;layout(active.el,{x:next.x-active.p.w/2,y:next.y-active.p.h/2,w:active.p.w,h:active.p.h});
  for(const t of targetsFor(level,state))targetNodes.get(t.id)?.classList.toggle('over',contains(hitboxAt(t,time,motion),next,t.snap??level.snap));
 }
 function release(e){
  if(!active||e.pointerId!==active.id)return;move(e);if(!active)return;
  const drag=active,p=drag.p;
  const candidates=targetsFor(level,state).filter(t=>contains(hitboxAt(t,time,motion),drag.last,t.snap??level.snap));
  candidates.sort((a,b)=>{const pa=positionAt(a,time,motion),pb=positionAt(b,time,motion);return Math.hypot(drag.last.x-pa.x-pa.w/2,drag.last.y-pa.y-pa.h/2)-Math.hypot(drag.last.x-pb.x-pb.w/2,drag.last.y-pb.y-pb.h/2)});
  cancel();
  if(drag.distance<12){say('Click and keep holding while you move the picture.');return}
  if(!candidates.length){say('Almost! Let go inside a matching space.');return}
  const result=tryPlacement(level,state,p.id,candidates[0].id);
  if(!result.ok){say(result.message);return}
  onProgress(structuredClone(state));redraw();
  say(result.complete?'You did it! Activity complete!':result.nextRound?'Great pattern! Try the next one.':'Great placement! Keep going.');
  if(result.complete){finished=true;cancelAnimationFrame(frame);onComplete()}
 }
 board.addEventListener('pointermove',move,{signal:abort.signal});board.addEventListener('pointerup',release,{signal:abort.signal});board.addEventListener('pointercancel',()=>cancel('Try that drag again.'),{signal:abort.signal});board.addEventListener('lostpointercapture',()=>{if(active)cancel()},{signal:abort.signal});
 window.addEventListener('blur',()=>{cancel();lastTime=null},{signal:abort.signal});document.addEventListener('visibilitychange',()=>{cancel();lastTime=null},{signal:abort.signal});
 function tick(now){
  if(disposed||finished)return;
  const before=time;if(lastTime!==null&&!document.hidden)time+=Math.min(40,now-lastTime)*2200/Math.max(1600,Math.min(3200,Number(speed)||2200));lastTime=now;
  for(const t of targetsFor(level,state))layout(targetNodes.get(t.id),positionAt(t,time,motion));
  for(const h of level.hazards){const prev=hitboxAt(h,before,motion),next=hitboxAt(h,time,motion);layout(hazardNodes.get(h.id),positionAt(h,time,motion));if(active&&motionCollision(active.last,prev,next,Math.min(active.p.w,active.p.h)*.32))cancel('The bad guy touched your picture. Try that drag again.');}
  frame=requestAnimationFrame(tick);
 }
 function fit(){
  cancel();const shell=root.querySelector('.activity-shell'),app=document.getElementById('app'),frameEl=root.querySelector('.activity-frame');
  const outer=app.getBoundingClientRect(),top=shell.getBoundingClientRect().top+app.scrollTop-outer.top;
  const chrome=[...shell.children].filter(e=>e!==frameEl).reduce((n,e)=>n+e.getBoundingClientRect().height,0);
  const h=Math.max(260,app.clientHeight-top-chrome-24),w=Math.min(frameEl.clientWidth,h*1000/600);
  board.style.width=w+'px';board.style.height=w*.6+'px';app.dispatchEvent(new Event('activity-layout'));
 }
 const observer=new ResizeObserver(fit);observer.observe(root);observer.observe(document.getElementById('app'));observer.observe(document.querySelector('body>header'));
 window.addEventListener('resize',fit,{signal:abort.signal});window.visualViewport?.addEventListener('resize',fit,{signal:abort.signal});
 root.querySelector('.activity-listen').onclick=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(engine.instruction);u.rate=.8;speechSynthesis.speak(u)};
 root.querySelector('.activity-reset').onclick=()=>{cancel();state.placed={};state.round=0;state.roundPlaced={};state.complete=false;onProgress(structuredClone(state));redraw();say('This activity restarted. Your other levels and stars are safe.')};
 redraw();if(progressFor(level,state).done>=progressFor(level,state).total)queueMicrotask(()=>{if(!disposed&&!finished){finished=true;onComplete()}});requestAnimationFrame(fit);document.fonts?.ready.then(()=>{if(!disposed)fit()});
 if(motion&&(level.hazards.some(h=>h.motion)||level.targets.some(t=>t.motion)))frame=requestAnimationFrame(tick);
 return {cancel,destroy(){disposed=true;cancel();cancelAnimationFrame(frame);observer.disconnect();abort.abort();window.speechSynthesis?.cancel()}};
}
