/** Eight deterministic, solvable 12x7 Arrow-Naut planet finale mazes.
 * Pure logic; no DOM and no dependence on picture geometry.
 * Enemy patrol paths are legal corridor-to-corridor moves.
 */
export const MAZE_WIDTH=12,MAZE_HEIGHT=7;
const key=(x,y)=>x+','+y;
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const randomFor=seed=>{let v=(seed+1)>>>0;return ()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}};
/** Guaranteed safe solution corridor for the first world.
 * Enemy paths are off this corridor, including collisions from older saved runs.
 */
export function firstWorldSafeRoute(openCells){
 const open=new Set(openCells);
 const previous=new Map([[key(1,1),null]]),queue=[[1,1]];
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];
  if(x===10&&y===5)break;
  for(const [dx,dy] of directions){
   const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(!open.has(k)||previous.has(k))continue;
   previous.set(k,key(x,y));queue.push([nx,ny]);
  }
 }
 const route=new Set();let current=key(10,5);
 if(!previous.has(current))throw Error('First-world rescue route missing');
 while(current){route.add(current);current=previous.get(current)}
 return route;
}
/** Four different two-cell patrol lanes on side branches, never the required escape route.
 * If a maze has no side branches, carve connected alcoves for the bad guys.
 */
function safeSidePatrols(open,safe,planetIndex,start,goal){
 const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const touchesRoute=p=>directions.some(([dx,dy])=>safe.has(key(p.x+dx,p.y+dy)));
 const cells=[];
 for(let y=1;y<MAZE_HEIGHT-1;y++)for(let x=1;x<MAZE_WIDTH-1;x++){
  const p={x,y};
  if(safe.has(key(x,y))||dist(p,start)<=2||dist(p,goal)<=2)continue;
  cells.push(p);
 }
 const allowed=new Set(cells.map(p=>key(p.x,p.y))),chosen=[],used=new Set();
 for(let i=0;i<4;i++){
  let options=[];
  for(const a of cells){
   if(used.has(key(a.x,a.y)))continue;
   for(const [dx,dy] of [[1,0],[0,1]]){
    const b={x:a.x+dx,y:a.y+dy};
    if(!allowed.has(key(b.x,b.y))||used.has(key(b.x,b.y)))continue;
    const connected=[a,b].some(p=>open.has(key(p.x,p.y))||
     directions.some(([xx,yy])=>open.has(key(p.x+xx,p.y+yy))));
    if(!connected)continue;
    const original=Number(open.has(key(a.x,a.y)))+Number(open.has(key(b.x,b.y)));
    const nearby=Number(touchesRoute(a))+Number(touchesRoute(b));
    const separation=chosen.length?Math.min(...chosen.map(pair=>Math.min(
      dist(a,pair.a),dist(a,pair.b),dist(b,pair.a),dist(b,pair.b)))):4;
    const score=separation*8+original*4+nearby*2;
    options.push({a,b,score});
   }
  }
  options.sort((a,b)=>b.score-a.score||
   (a.a.y-b.a.y)||(a.a.x-b.a.x));
  if(!options.length)throw Error('Cannot build safe four-enemy patrols for planet '+planetIndex);
  const winner=options[0];
  open.add(key(winner.a.x,winner.a.y));open.add(key(winner.b.x,winner.b.y));
  used.add(key(winner.a.x,winner.a.y));used.add(key(winner.b.x,winner.b.y));
  chosen.push(winner);
 }
 return chosen.map(({a,b},i)=>({id:'hazard-'+(i+1),type:(planetIndex*3+i)%8,a,b}));
}
export function makeFinalMaze(planetIndex){
 if(!Number.isInteger(planetIndex)||planetIndex<0||planetIndex>7)throw Error('Unknown finale planet');
 const random=randomFor(20261102+planetIndex*173);
 const open=new Set([key(1,1)]),visited=new Set([key(1,1)]),stack=[[1,1]];
 // A spanning tree of corridors: every carved cell is reachable.
 while(stack.length){
  const [x,y]=stack[stack.length-1];
  const choices=directions.map(([dx,dy])=>[x+dx*2,y+dy*2,x+dx,y+dy])
   .filter(([nx,ny])=>nx>=1&&nx<=9&&ny>=1&&ny<=5&&!visited.has(key(nx,ny)));
  if(!choices.length){stack.pop();continue}
  const [nx,ny,mx,my]=choices[Math.floor(random()*choices.length)];
  visited.add(key(nx,ny));open.add(key(mx,my));open.add(key(nx,ny));stack.push([nx,ny]);
 }
 // The flag can be reached from the final cell without opening a side wall.
 open.add(key(10,5));
 const start={x:1,y:1},goal={x:10,y:5};
 const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const cells=[...open].map(v=>{const [x,y]=v.split(',').map(Number);return {x,y}})
  .filter(v=>distance(v,start)>3&&distance(v,goal)>2);
 // First planet: all four enemies patrol side corridors, NEVER the guaranteed rescue path.
 // This is a hard progression gate, so it must be genuinely beatable by students.
 if(planetIndex===0){
  const safe=firstWorldSafeRoute([...open]);
  const branches=[...open].filter(cell=>!safe.has(cell)).map(cell=>{
   const [x,y]=cell.split(',').map(Number);return {x,y};
  });
  const patrols=[];
  for(const a of branches){
   const neighbors=directions.map(([dx,dy])=>({x:a.x+dx,y:a.y+dy}))
    .filter(b=>open.has(key(b.x,b.y))&&!safe.has(key(b.x,b.y)));
   for(const b of neighbors){
    if(patrols.some(v=>v.a.x===b.x&&v.a.y===b.y&&v.b.x===a.x&&v.b.y===a.y))continue;
    patrols.push({a,b});
   }
  }
  const used=new Set(),enemies=[];
  for(const pair of patrols){
   if(enemies.length===4)break;
   const aa=key(pair.a.x,pair.a.y),bb=key(pair.b.x,pair.b.y);
   if(used.has(aa)||used.has(bb))continue;
   used.add(aa);used.add(bb);
   enemies.push({id:'hazard-'+(enemies.length+1),type:enemies.length,a:pair.a,b:pair.b});
  }
  if(enemies.length!==4)throw Error('First-world maze needs four safe side-branch patrols');
  const walls=[];
  for(let y=0;y<MAZE_HEIGHT;y++)for(let x=0;x<MAZE_WIDTH;x++)
   if(!open.has(key(x,y)))walls.push([x,y]);
  return {start,goal,walls,enemies,safeRoute:[...safe],open:[...open]};
 }
 const safe=firstWorldSafeRoute([...open]);
 const enemies=safeSidePatrols(open,safe,planetIndex,start,goal);
 const walls=[];
 for(let y=0;y<MAZE_HEIGHT;y++)for(let x=0;x<MAZE_WIDTH;x++)if(!open.has(key(x,y)))walls.push([x,y]);
 return {start,goal,walls,enemies,safeRoute:[...safe],open:[...open]};
}
function boardOpenFromWalls(walls){
 const blocked=new Set(walls.map(([x,y])=>key(x,y))),cells=[];
 for(let y=0;y<MAZE_HEIGHT;y++)for(let x=0;x<MAZE_WIDTH;x++)
  if(!blocked.has(key(x,y)))cells.push(key(x,y));
 return cells;
}
export function mazeInitial(mission){
 return {x:mission.mazeStart.x,y:mission.mazeStart.y,hits:0,
  enemies:mission.enemies.map(e=>({id:e.id,x:e.a.x,y:e.a.y,phase:0}))};
}
export function mazeMove(mission,state,direction){
 if(mission.kind!=='final-maze')throw Error('Not a final maze');
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[direction];
 if(!delta)return {ok:false,state,reason:'Use the arrow keys to move through the maze.'};
 const [dx,dy]=delta,x=state.maze.x+dx,y=state.maze.y+dy;
 if(x<0||y<0||x>=MAZE_WIDTH||y>=MAZE_HEIGHT||
    mission.walls.some(w=>w[0]===x&&w[1]===y))
  return {ok:false,state,reason:'A space-rock wall is blocking you. Try another direction.'};
 const next=JSON.parse(JSON.stringify(state));next.maze.x=x;next.maze.y=y;next.attempts++;
 if(next.maze.enemies.some(e=>e.x===x&&e.y===y)&&!(mission.planetIndex===0&&firstWorldSafeRoute(boardOpenFromWalls(mission.walls)).has(key(x,y)))){
  next.maze.x=mission.mazeStart.x;next.maze.y=mission.mazeStart.y;
  next.maze.hits++;return {ok:true,state:next,reason:'A bad guy caught you! Back to the start. Try again.'};
 }
 if(x===mission.mazeGoal.x&&y===mission.mazeGoal.y)next.complete=true;
 return {ok:true,state:next,reason:next.complete?'Final maze conquered!':'Keep going—avoid the patrolling bad guys!'};
}
export function mazeEnemyTick(mission,state){
 if(mission.kind!=='final-maze'||state.complete)return {ok:false,state};
 const next=JSON.parse(JSON.stringify(state));
 next.maze.enemies.forEach(enemy=>{
  const def=mission.enemies.find(e=>e.id===enemy.id);
  enemy.phase=enemy.phase===0?1:0;
  const target=enemy.phase?def.b:def.a;
  enemy.x=target.x;enemy.y=target.y;
 });
 const caught=next.maze.enemies.some(e=>e.x===next.maze.x&&e.y===next.maze.y)&&!(mission.planetIndex===0&&firstWorldSafeRoute(boardOpenFromWalls(mission.walls)).has(key(next.maze.x,next.maze.y)));
 if(caught){next.maze.x=mission.mazeStart.x;next.maze.y=mission.mazeStart.y;next.maze.hits++}
 return {ok:true,state:next,reason:caught?'A moving bad guy caught you! Back to the start.':'Watch the moving bad guys!'};
}
