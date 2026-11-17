// Chromebook touchscreens must not bypass trackpad practice; phones/tablets may drag by touch.
export const isMobileTouchDevice=()=>typeof navigator!=='undefined'&& !/CrOS/i.test(navigator.userAgent||'') && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||navigator.userAgentData?.mobile===true);
export const acceptsDragInput=e=>e.isPrimary!==false&&((e.pointerType==='mouse'&&e.button===0)||(e.pointerType==='touch'&&isMobileTouchDevice()));
// Pure mechanics. Logical coordinates are independent of artwork and screen size.
export const ACTIVITY_TYPES=['maze','sort','pack','path','pattern','scene','order','deliver'];
export const ACTIVITY_NAMES=['Maze Escape','Sorting Station','Pack It Up','Fix the Path','Pattern Power','Build the Scene','Put It in Order','Catch & Deliver'];
export const rect=(x,y,w,h)=>({x,y,w,h});
export const contains=(r,p,pad=0)=>p.x>=r.x-pad&&p.x<=r.x+r.w+pad&&p.y>=r.y-pad&&p.y<=r.y+r.h+pad;
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function swept(from,to,r,radius=0){
 let lo=0,hi=1;
 for(const [axis,start,size] of [['x','x','w'],['y','y','h']]){
  const d=to[axis]-from[axis],min=r[start]-radius,max=r[start]+r[size]+radius;
  if(Math.abs(d)<1e-8){if(from[axis]<min||from[axis]>max)return false;continue}
  const a=(min-from[axis])/d,b=(max-from[axis])/d;
  lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;
 }
 return true;
}
export function positionAt(entity,time,motion=true){
 const m=entity.motion;if(!motion||!m)return {...entity};
 const offset=Math.sin(time/(m.period||4000)*Math.PI*2+(m.phase||0))*(m.range||0);
 return {...entity,[m.axis]:entity[m.axis]+offset};
}
export function hitboxAt(entity,time,motion=true){
 const p=positionAt(entity,time,motion),h=entity.hitbox;
 return h?{...p,x:p.x+h.x,y:p.y+h.y,w:h.w,h:h.h}:p;
}
export function motionCollision(point,before,after,radius=0){
 return swept(point,{x:point.x-(after.x-before.x),y:point.y-(after.y-before.y)},before,radius);
}
export function stateFor(level,saved){
 const valid=saved?.version===2&&saved.engine===level.engine;
 return {version:2,engine:level.engine,placed:valid?{...saved.placed}:{},round:valid?Math.max(0,Math.min(level.rounds?.length-1||0,saved.round||0)):0,roundPlaced:valid?{...saved.roundPlaced}:{},complete:false};
}
const matched=(piece,target)=>target.accept.includes(piece.key);
function place(level,state,piece,target){
 if(state.placed[piece.id]||!matched(piece,target))return {ok:false,message:'Try another spot. You can do it!'};
 if(target.capacity!==0&&Object.values(state.placed).includes(target.id))return {ok:false,message:'That space is already filled.'};
 state.placed[piece.id]=target.id;
 return {ok:true,complete:Object.keys(state.placed).length===level.pieces.length};
}
export const mazeEngine={
 instruction:'Click and hold. Follow the winding route to EXIT. Stay away from the walls and bad guys.',
 drop(level,state,piece,target){return place(level,state,piece,target)},
 blocked(level,from,to,piece,hazards){return !contains(rect(piece.w/2,piece.h/2,1000-piece.w,600-piece.h),to)||[...level.walls,...hazards].some(r=>swept(from,to,r,Math.min(piece.w,piece.h)*.32))}
};
export const sortingEngine={instruction:'Drag each object to the group with the same kind of picture.',drop:place};
export const packingEngine={instruction:'Pack every object into a space that fits its size. Fill each space once.',drop(level,state,piece,target){
 if(piece.w>target.w+4||piece.h>target.h+4)return {ok:false,message:'This space is too small. Try a bigger space.'};
 return place(level,state,piece,target);
}};
export const pathEngine={instruction:'Repair the path. Drag each missing piece to its matching gap.',drop:place};
export const patternEngine={
 instruction:'Look at the repeating pattern. Drag the missing pictures into the empty spaces.',
 drop(level,state,piece,target){
  if(state.roundPlaced[target.id]||!matched(piece,target))return {ok:false,message:'Look at the pattern again. Try another picture.'};
  state.roundPlaced[target.id]=piece.key;
  const round=level.rounds[state.round],done=round.targets.every(t=>state.roundPlaced[t.id]);
  if(done){if(state.round===level.rounds.length-1)return {ok:true,complete:true};state.round++;state.roundPlaced={};return {ok:true,nextRound:true}}
  return {ok:true,complete:false};
 }
};
export const sceneEngine={instruction:'Build the scene. Drag each object onto its matching picture outline.',drop:place};
export const orderEngine={instruction:'Put the objects in order, from smallest to largest. Start at number 1.',drop:place};
export const deliveryEngine={instruction:'Click and hold an object. Follow its matching moving target, then let go inside it.',drop:place};
export const ENGINES={maze:mazeEngine,sort:sortingEngine,pack:packingEngine,path:pathEngine,pattern:patternEngine,scene:sceneEngine,order:orderEngine,deliver:deliveryEngine};
export function targetsFor(level,state){return level.engine==='pattern'?level.rounds[state.round].targets:level.targets}
export function tryPlacement(level,state,pieceId,targetId){
 const piece=level.pieces.find(p=>p.id===pieceId),target=targetsFor(level,state).find(t=>t.id===targetId);
 if(!piece||!target||state.complete)return {ok:false,message:'Try an empty matching spot.'};
 const result=ENGINES[level.engine].drop(level,state,piece,target);if(result.complete)state.complete=true;return result;
}
export function progressFor(level,state){
 if(level.engine==='pattern')return {done:state.round*2+Object.keys(state.roundPlaced).length,total:level.rounds.length*2};
 return {done:Object.keys(state.placed).length,total:level.pieces.length};
}
