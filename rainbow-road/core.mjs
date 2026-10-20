export function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function makeMaze(seed,level=1){
 const cols=level<3?3:4,rows=level===1?2:level<4?3:4,w=cols*2+1,h=rows*2+1,grid=Array.from({length:h},()=>Array(w).fill(1)),random=rng(seed),seen=new Set(['0,0']),stack=[[0,0]];grid[1][1]=0;
 while(stack.length){const [x,y]=stack.at(-1),ns=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[x+dx,y+dy,dx,dy]).filter(([nx,ny])=>nx>=0&&nx<cols&&ny>=0&&ny<rows&&!seen.has(nx+','+ny));if(!ns.length){stack.pop();continue}const[nx,ny,dx,dy]=ns[Math.floor(random()*ns.length)];grid[y*2+1+dy][x*2+1+dx]=0;grid[ny*2+1][nx*2+1]=0;seen.add(nx+','+ny);stack.push([nx,ny])}
 return {seed,level,w,h,grid,start:{x:1,y:1},goal:{x:w-2,y:h-2},player:{x:1,y:1},steps:0,complete:false,trail:[[1,1]]};
}
export function step(run,key,repeat=false){if(run.complete||repeat)return {moved:false,won:false};const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[key];if(!d)return {moved:false,won:false};const x=run.player.x+d[0],y=run.player.y+d[1];if(!run.grid[y]||run.grid[y][x]!==0)return {moved:false,won:false};run.player={x,y};run.steps++;run.trail.push([x,y]);run.complete=x===run.goal.x&&y===run.goal.y;return {moved:true,won:run.complete};}
export function nextRun(old){let seed=(old.seed+104729)>>>0,run=makeMaze(seed,old.level+1);for(let i=0;i<16&&JSON.stringify(run.grid)===JSON.stringify(old.grid);i++)run=makeMaze(++seed,old.level+1);return run;}
export function awardWallet(wallet){return {...wallet,total:wallet.total+5,earned:wallet.earned+5,finished:wallet.finished+1};}
