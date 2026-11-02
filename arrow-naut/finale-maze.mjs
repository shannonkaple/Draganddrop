/** Eight deterministic, solvable 12x7 Arrow-Naut planet finale mazes.
 * Pure logic; no DOM and no dependence on picture geometry.
 * Enemy patrol paths are legal corridor-to-corridor moves.
 */
export const MAZE_WIDTH=12,MAZE_HEIGHT=7;
const key=(x,y)=>x+','+y;
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const randomFor=seed=>{let v=(seed+1)>>>0;return ()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296}};
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
 const enemies=[];
 for(let i=0;i<4;i++){
  const options=cells.filter(v=>!enemies.some(e=>key(e.a.x,e.a.y)===key(v.x,v.y)||key(e.b.x,e.b.y)===key(v.x,v.y)))
   .map(v=>({v,neighbors:directions.map(([dx,dy])=>({x:v.x+dx,y:v.y+dy}))
    .filter(n=>open.has(key(n.x,n.y))&&distance(n,start)>2&&distance(n,goal)>1)}))
   .filter(o=>o.neighbors.length);
  options.sort((a,b)=>{
   const score=v=>Math.min(distance(v,start),distance(v,goal),...enemies.map(e=>distance(v,e.a)),...enemies.map(e=>distance(v,e.b)));
   return score(b.v)-score(a.v);
  });
  if(!options.length)throw Error('Not enough enemy patrol corridors');
  const choice=options[Math.min(i%2,options.length-1)];
  const neighbor=choice.neighbors[Math.floor(random()*choice.neighbors.length)];
  enemies.push({id:'hazard-'+(i+1),type:(planetIndex*3+i)%8,a:choice.v,b:neighbor});
 }
 const walls=[];
 for(let y=0;y<MAZE_HEIGHT;y++)for(let x=0;x<MAZE_WIDTH;x++)if(!open.has(key(x,y)))walls.push([x,y]);
 return {start,goal,walls,enemies,open:[...open]};
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
 if(next.maze.enemies.some(e=>e.x===x&&e.y===y)){
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
 const caught=next.maze.enemies.some(e=>e.x===next.maze.x&&e.y===next.maze.y);
 if(caught){next.maze.x=mission.mazeStart.x;next.maze.y=mission.mazeStart.y;next.maze.hits++}
 return {ok:true,state:next,reason:caught?'A moving bad guy caught you! Back to the start.':'Watch the moving bad guys!'};
}
