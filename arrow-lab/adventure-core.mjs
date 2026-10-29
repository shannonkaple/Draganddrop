
import {rng} from '../rainbow-road/core.mjs';
export const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
export const tile=p=>p.x+','+p.y;
export function route(grid,start,goal,blocked=new Set()){
 const q=[[start,[]]],seen=new Set([tile(start)]);
 for(let i=0;i<q.length;i++){const[p,keys]=q[i];if(tile(p)===tile(goal))return keys;for(const[k,[dx,dy]]of Object.entries(directions)){const n={x:p.x+dx,y:p.y+dy},id=tile(n);if(grid[n.y]?.[n.x]===0&&!seen.has(id)&&!blocked.has(id)){seen.add(id);q.push([n,[...keys,k]])}}}return null;
}
export function walk(start,keys){let p={...start};return keys.map(k=>{const[dx,dy]=directions[k];p={x:p.x+dx,y:p.y+dy};return {...p}})}
export function buildLevel(def,seed,easy=false){
 const w=def.mazeGrid.width,h=def.mazeGrid.height,grid=Array.from({length:h},()=>Array(w).fill(1)),random=rng(seed),stack=[[1,1]],seen=new Set(['1,1']);grid[1][1]=0;
 while(stack.length){const[x,y]=stack.at(-1),ns=Object.values(directions).map(([dx,dy])=>[x+dx*2,y+dy*2,dx,dy]).filter(([a,b])=>a>0&&a<w-1&&b>0&&b<h-1&&!seen.has(a+','+b));if(!ns.length){stack.pop();continue}const[a,b,dx,dy]=ns[Math.floor(random()*ns.length)];grid[y+dy][x+dx]=0;grid[b][a]=0;seen.add(a+','+b);stack.push([a,b]);}
 // Add loops so hazards can guard optional shortcuts while a safe route stays open.
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(grid[y][x]===1&&((x%2===0&&y%2===1)||(x%2===1&&y%2===0))&&random()<.18)grid[y][x]=0;
 const start={x:1,y:1},goal={x:w-2,y:h-2},roads=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(!grid[y][x]&&(x!==1||y!==1)&&(x!==goal.x||y!==goal.y))roads.push({x,y});
 const shuffled=[...roads].sort(()=>0);for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const placed=[start,goal],available=[...shuffled];
 const spread=()=>{let best=0,score=-1;available.forEach((p,i)=>{const n=Math.min(...placed.map(q=>dist(p,q)));if(n>score){score=n;best=i}});const p=available.splice(best,1)[0];placed.push(p);return p};
 const items=(def.collectibleIds||def.computerGearIds||[]).map(id=>({id,...spread(),collected:false}));
 const needsSkill=def.primarySkill!=='arrows'&&def.primarySkill!=='mixed'||(def.skillBadgeIds||[]).length>0;
 const skill=needsSkill?{...spread(),done:false,type:def.primarySkill}:null;
 const stops=[...items,...(skill?[skill]:[]),goal],safe=new Set([tile(start)]);let p=start;
 for(const stop of stops){for(const n of walk(p,route(grid,p,stop)))safe.add(tile(n));p=stop}
 const excluded=new Set([tile(start),tile(goal),...items.map(tile),...(skill?[tile(skill)]:[])]);
 const side=roads.filter(n=>!safe.has(tile(n))&&!excluded.has(tile(n))),hazards=[];
 // Keep every enemy away from the guaranteed safe path and collectables.
 // Make additional side alcoves only where required, never blocking a corridor.
 for(let y=1;y<h-1&&side.length<(def.enemyIds||[]).length*3;y++)for(let x=1;x<w-1&&side.length<(def.enemyIds||[]).length*3;x++){
   const p={x,y};
   if(grid[y][x]===1&& !safe.has(tile(p)) && !excluded.has(tile(p)) &&
      Object.values(directions).some(([dx,dy])=>grid[y+dy]?.[x+dx]===0)){
     grid[y][x]=0;side.push(p);
   }
 }

 if(easy){
   // Gentle mode still displays four distinct, world-appropriate bad guys.
   // They stay stationary, off the protected route, so young learners can plan.
   const taken=[],candidates=[...side];
   for(const id of def.enemyIds||[]){
     const free=candidates.filter(p=>!taken.some(q=>tile(q)===tile(p)));
     if(!free.length)break;
     const score=p=>Math.min(...[start,goal,...taken].map(q=>dist(p,q)));
     free.sort((a,b)=>score(b)-score(a));
     const pos=free[0];
     taken.push(pos);
     hazards.push({id,path:[pos],index:0});
   }
 }else{
   // Reserve connected, disjoint outward patrols BEFORE assigning enemy spawns.
   // An early enemy must not trap the fourth one in a one-tile alcove.
   const ids=def.enemyIds||[];
   const moving=ids.filter(id=>def.number>=4&&!['prickly_cactus','chomper_plant'].includes(id));
   const stationary=ids.filter(id=>!moving.includes(id));
   const inBounds=p=>p.x>0&&p.x<w-1&&p.y>0&&p.y<h-1;
   const allowed=p=>inBounds(p)&&!safe.has(tile(p))&&!excluded.has(tile(p));
   const neighbors=p=>Object.values(directions).map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(allowed);
   const starts=side.filter(allowed);
   const options=[];
   // A patrol starts on a genuine corridor; side pockets may be opened only
   // off the protected route, and never through an item, skill or other enemy.
   for(const start of starts)for(const middle of neighbors(start))for(const end of neighbors(middle)){
     if(tile(end)===tile(start))continue;
     const path=[start,middle,end],cells=path.map(tile);
     const walls=path.filter(p=>grid[p.y][p.x]===1).length;
     options.push({path,cells,walls,noise:random()});
   }
   const used=new Set(),chosen=[],spawnPositions=[];
   const overlap=option=>option.cells.some(key=>used.has(key));
   const separation=pos=>spawnPositions.length
     ?Math.min(...spawnPositions.map(other=>dist(pos,other)))
     :Math.min(dist(pos,start),dist(pos,goal));
   const rank=option=>separation(option.path[0])*30-option.walls*10+
     Math.min(dist(option.path[0],start),dist(option.path[0],goal))*2+option.noise;
   let searches=0;
   function allocate(index){
     if(index===moving.length)return true;
     if(++searches>5000)return false;
     const available=options.filter(o=>!overlap(o)).sort((x,y)=>rank(y)-rank(x));
     for(const option of available){
       for(const key of option.cells)used.add(key);
       chosen.push({id:moving[index],path:[...option.path]});
       spawnPositions.push(option.path[0]);
       if(allocate(index+1))return true;
       spawnPositions.pop();chosen.pop();
       for(const key of option.cells)used.delete(key);
     }
     return false;
   }
   if(!allocate(0)){
     // If the maze is too constrained for four 3-cell corridors, keep four
     // unique enemies without crossing the guaranteed student route.
     used.clear();chosen.length=0;spawnPositions.length=0;
     for(const id of moving){
       const option=options.filter(o=>!overlap(o)).sort((x,y)=>rank(y)-rank(x))[0];
       if(option){for(const key of option.cells)used.add(key);chosen.push({id,path:[...option.path]});spawnPositions.push(option.path[0])}
       else{
         const pos=starts.find(p=>!used.has(tile(p)));
         if(pos){used.add(tile(pos));chosen.push({id,path:[pos]});spawnPositions.push(pos)}
       }
     }
   }
   // Reserve stationary enemy positions only after all moving paths fit.
   for(const id of stationary){
     const available=starts.filter(p=>!used.has(tile(p)));
     available.sort((x,y)=>separation(y)-separation(x));
     const pos=available[0]||Array.from({length:h-2},(_,i)=>i+1).flatMap(y=>Array.from({length:w-2},(_,i)=>({x:i+1,y}))).find(p=>allowed(p)&&!used.has(tile(p)));
     if(pos){used.add(tile(pos));spawnPositions.push(pos);chosen.push({id,path:[pos]})}
   }
   for(const entry of chosen){
     const path=entry.path;
     if(path.length>1){
       const desired=2+Math.floor(random()*3);
       while(path.length-1<desired){
         const extension=neighbors(path.at(-1)).filter(p=>!used.has(tile(p)));
         if(!extension.length)break;
         extension.sort((x,y)=>Number(grid[x.y][x.x]===0)-Number(grid[y.y][y.x]===0));
         const next=extension[0];path.push(next);used.add(tile(next));
       }
       // Each timed step advances one tile, then retraces its own route.
       path.push(...path.slice(1,-1).reverse());
     }
     for(const p of path)grid[p.y][p.x]=0;
     hazards.push({id:entry.id,path,index:0});
   }
 }
 let barrier=null;if(def.ducking!=='none'&&!easy){const main=walk(start,route(grid,start,goal));barrier=main.find((n,i)=>i>=2&&i<main.length-2&&!excluded.has(tile(n)))||null}
 return {id:def.id,seed,w,h,grid,start,goal,player:{...start},checkpoint:{...start},steps:0,items,skill,hazards,barrier,safe:[...safe],complete:false,rewarded:false,trail:[[1,1]],duckLearned:!barrier};
}
// Upgrade only the ENEMY ROSTER of an older, already-started maze. Preserve its
// exact player tile, collectibles, arrow trials, stars, and all existing patrols.
// Earlier versions sometimes saved fewer than four or duplicated enemy IDs.
export function restoreSavedEnemyRoster(run,definition,easy=false){
 const wanted=[...new Set(definition.enemyIds||[])].slice(0,4);
 if(wanted.length!==4||!Array.isArray(run?.grid)||!Array.isArray(run?.hazards))return false;
 const {grid,w,h}=run;
 const inside=p=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>0&&p.x<w-1&&p.y>0&&p.y<h-1;
 const adjacent=(p,q)=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y)===1;
 const valid=e=>e&&Array.isArray(e.path)&&e.path.length>0&&
   e.path.every((p,i)=>inside(p)&&grid[p.y]?.[p.x]===0&&(!i||adjacent(e.path[i-1],p)))&&
   Number.isInteger(e.index)&&e.index>=0&&e.index<e.path.length;
 // Keep the original enemy objects and their exact patrol indexes whenever valid.
 const old=run.hazards.filter(valid),kept=[],assigned=new Set();
 // Reserve each valid existing sprite ID first, so repairing a duplicate never
 // renames another legitimate bad guy or reorders its saved patrol.
 const firstForId=new Map();
 for(const e of old)if(wanted.includes(e.id)&&!firstForId.has(e.id))firstForId.set(e.id,e);
 const reserved=new Set(firstForId.keys());
 let remapped=false;
 for(const e of old){
   if(kept.length>=4)break;
   if(firstForId.get(e.id)===e){kept.push(e);assigned.add(e.id);continue}
   const id=wanted.find(id=>!reserved.has(id));if(!id)continue;
   e.id=id;remapped=true;reserved.add(id);assigned.add(id);kept.push(e);
 }
 if(!remapped&&kept.length===4&&run.hazards.length===4&&run.hazards.every((e,i)=>e===kept[i]))return false;
 const blocked=new Set(kept.flatMap(e=>e.path.map(tile)));
 const protectedTiles=new Set([run.start,run.goal,run.player,run.checkpoint,run.skill,run.barrier,
   ...(run.items||[]),...(run.trail||[]).slice(-5)].filter(inside).map(tile));
 if(Array.isArray(run.safe)&&run.safe.length){
   for(const key of run.safe)if(typeof key==='string')protectedTiles.add(key);
 }else{
   // Old save formats had no safe-route array. Protect the shortest objective
   // route before adding any enemy, rather than gambling with completed pickups.
   let from=inside(run.start)?run.start:run.player;
   for(const goal of [...(run.items||[]),...(run.skill?[run.skill]:[]),run.goal]){
     if(!inside(from)||!inside(goal))continue;
     const keys=route(grid,from,goal,blocked);
     if(keys){protectedTiles.add(tile(from));for(const p of walk(from,keys))protectedTiles.add(tile(p))}
     from=goal;
   }
 }
 const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 const cells=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)cells.push({x,y});
 const available=p=>inside(p)&&!blocked.has(tile(p))&&!protectedTiles.has(tile(p));
 const near=p=>Object.values(directions).map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(available);
 const otherPositions=()=>[run.player,run.start,run.goal,...kept.map(e=>e.path[e.index])].filter(inside);
 let changed=remapped||kept.length!==run.hazards.length||kept.some((e,i)=>e!==run.hazards[i]);
 for(const id of wanted.filter(id=>!assigned.has(id))){
   const starts=cells.filter(p=>available(p)&&grid[p.y][p.x]===0);
   let best=null,bestScore=-Infinity;
   if(!easy)for(const first of starts)for(const second of near(first))if(tile(second)!==tile(first)){
     for(const third of near(second)){
       if(tile(third)===tile(first))continue;
       const path=[first,second,third];
       const carved=path.filter(p=>grid[p.y][p.x]===1).length;
       const separation=Math.min(...otherPositions().map(p=>distance(p,first)));
       const score=separation*4-carved*15+distance(first,run.player||run.start);
       if(score>bestScore){bestScore=score;best=path}
     }
   }
   if(!best){
     // A tiny legacy maze can still show a distinct stationary enemy without
     // deleting a student's saved maze or spawning on an objective.
     const first=starts.sort((a,b)=>Math.min(...otherPositions().map(p=>distance(p,b)))-
       Math.min(...otherPositions().map(p=>distance(p,a))))[0];
     if(!first)continue;
     best=[first];
   }
   for(const p of best){grid[p.y][p.x]=0;blocked.add(tile(p))}
   const path=best.length>1?[...best,...best.slice(1,-1).reverse()]:best;
   kept.push({id,path,index:0});assigned.add(id);changed=true;
 }
 if(changed)run.hazards=kept;
 return changed;
}

// Restore legitimately unlocked stages when an old save's separate counter
// is missing or stale. Never change the saved maze, earned stars or completions.
export function unlockedFromSavedProgress(a){
 const numberFor=id=>{
  const m=/^lab_(candy|pirate|arctic|castle|space|jurassic|ocean|lava)_([1-8])$/.exec(String(id||''));
  return m?worldIds.indexOf(m[1])*8+Number(m[2]):null;
 };
 let unlocked=Math.max(1,Number(a.highestUnlockedLevel)||1);
 for(const id of Array.isArray(a.completedLevelIds)?a.completedLevelIds:[]){
  const n=numberFor(id);if(n!==null)unlocked=Math.max(unlocked,n+1);
 }
 const active=[...Object.entries(a.mazeRuns&&typeof a.mazeRuns==='object'&&!Array.isArray(a.mazeRuns)?a.mazeRuns:{}),[a.activeRun?.id,a.activeRun]];
 for(const [id,run] of active){
  const n=numberFor(id);
  if(n!==null&&run?.id===id&&!run.complete&&Number.isInteger(run.w)&&run.w>=5&&Number.isInteger(run.h)&&run.h>=5&&Array.isArray(run.grid)&&run.grid.length===run.h&&run.grid.every(row=>Array.isArray(row)&&row.length===run.w)&&run.grid[run.player?.y]?.[run.player?.x]===0&&Array.isArray(run.items)&&Array.isArray(run.hazards))unlocked=Math.max(unlocked,n);
 }
 return Math.max(1,Math.min(64,Math.floor(unlocked)));
}
// Preserve saved character unlock IDs even when an older roster temporarily
// omits a character or the student's friend record has not been loaded yet.
function mergedUnlockedCharacterIds(previous,friends,selected){
 const prior=Array.isArray(previous)?previous.filter(id=>typeof id==='string'&&id.trim()):[];
 return [...new Set([...prior,...Object.keys(friends||{}),...(typeof selected==='string'&&selected?[selected]:[])])];
}
export function migrateAdventure(previous,legacy,characters,lands){
 const a=previous&&typeof previous==='object'?previous:{},ids=characters.map(c=>c.id),landIds=lands.map(l=>l.id),friends={};
 // The practice-game wallet may have its own character. It is NOT an Arrow Lab
 // onboarding choice: a first-time Arrow Lab student must explicitly choose once.
 // Keep legacy rescued friends, purchases and rewards separately below.
 const main=ids.includes(a.selectedPlayerCharacterId)?a.selectedPlayerCharacterId:null;
 // Do not erase a selected character if a shared character roster temporarily
 // stops publishing it. Prompt for an available choice, but retain the old ID.
 const unavailableSelectedPlayerCharacterId=main
   ?(a.unavailableSelectedPlayerCharacterId||null)
   :(a.selectedPlayerCharacterId||a.unavailableSelectedPlayerCharacterId||null);
 for(const [id,f] of Object.entries(a.friends||{})){
   if(!f||typeof f!=='object')continue;
   // Preserve even temporarily unavailable characters and custom friend fields.
   // Rendering uses a neutral placeholder until their original art returns.
   friends[id]=ids.includes(id)
     ?{...f,isRescued:true,upgradeStage:['starter','power_up','super_power'].includes(f.upgradeStage)?f.upgradeStage:'starter',homeLandId:landIds.includes(f.homeLandId)?f.homeLandId:landIds[0]}
     :{...f};
 }
 for(const id of legacy?.rescued||[])if(ids.includes(id)&&!friends[id])friends[id]={isRescued:true,upgradeStage:'starter',homeLandId:landIds[0]};
 if(main&&!friends[main])friends[main]={isRescued:true,upgradeStage:'starter',homeLandId:landIds[0]};
 return {...a,mazesSinceRescue:Math.max(0,Math.min(3,Math.floor(Number(a.mazesSinceRescue)||0))),pendingRescueFriendId:ids.includes(a.pendingRescueFriendId)&&!friends[a.pendingRescueFriendId]?a.pendingRescueFriendId:null,ownedWorldIds:Array.isArray(a.ownedWorldIds)?a.ownedWorldIds:[...new Set(Object.values(friends).map(f=>f.homeLandId))],decorations:a.decorations||{},positions:a.positions||{},schemaVersion:1,selectedPlayerCharacterId:main,unavailableSelectedPlayerCharacterId,primaryRainbowLandId:landIds.includes(a.primaryRainbowLandId)?a.primaryRainbowLandId:null,friends,unlockedCharacterIds:mergedUnlockedCharacterIds(a.unlockedCharacterIds,friends,a.selectedPlayerCharacterId||a.unavailableSelectedPlayerCharacterId),completedLevelIds:Array.isArray(a.completedLevelIds)?a.completedLevelIds:[],rescuedAtLevelIds:Array.isArray(a.rescuedAtLevelIds)?a.rescuedAtLevelIds:[],highestUnlockedLevel:unlockedFromSavedProgress(a),wallet:{rainbowStars:Math.max(0,Number(a.wallet?.rainbowStars)||0)},lifetimeStarsEarned:Math.max(0,Number(a.lifetimeStarsEarned)||0),collectedComputerGearIds:Array.isArray(a.collectedComputerGearIds)?a.collectedComputerGearIds:[],earnedSkillBadgeIds:Array.isArray(a.earnedSkillBadgeIds)?a.earnedSkillBadgeIds:[],settings:{soundEnabled:false,reducedMotion:false,...a.settings}};
}
export function upgradeFriend(a,id,costs){
 const f=a.friends[id];if(!f||f.upgradeStage==='super_power')return false;
 const next=f.upgradeStage==='starter'?'power_up':'super_power',cost=next==='power_up'?costs.power_up:costs.super_power_additional;
 if(a.wallet.rainbowStars<cost)return false;a.wallet.rainbowStars-=cost;f.upgradeStage=next;return true;
}
export function completeLevel(a,run,def,config){
 // A completed maze may be replayed with a freshly generated run. Award its
 // stars only once, even if a caller forgets to set run.rewarded on replay.
 // Preserve the saved completion and wallet exactly as they are.
 if(run.rewarded||a.completedLevelIds.includes(def.id)){run.rewarded=true;return 0}
 run.rewarded=true;
 const rules=config.progression.starRewards,n=rules.completion+(run.items.length?rules.itemCollection:0)+(run.skill?.done?rules.skillChallenge:0);
 a.wallet.rainbowStars+=n;a.lifetimeStarsEarned+=n;a.mazesSinceRescue=Math.min(3,(a.mazesSinceRescue||0)+1);
 if(!a.completedLevelIds.includes(def.id))a.completedLevelIds.push(def.id);
 a.highestUnlockedLevel=Math.min(64,Math.max(a.highestUnlockedLevel,def.number+1));return n;
}
export const worldIds=['candy','pirate','arctic','castle','space','jurassic','ocean','lava'];
export function pendingWorldRescue(a){return worldIds.find(id=>!a.worldFriends?.[id]&&Array.from({length:8},(_,i)=>`lab_${id}_${i+1}`).every(level=>a.completedLevelIds.includes(level)))||null}
export function rescueReady(a){return !!pendingWorldRescue(a)}
export function rescueWorld(a,id,home){if(pendingWorldRescue(a)!==id||!a.ownedWorldIds.includes(home))return false;(a.worldFriends??={})[id]={homeLandId:home};a.pendingRescueFriendId=null;return true}
export function arrowPattern(seed,attempt=0){const patterns=[['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'],['ArrowRight','ArrowRight','ArrowUp','ArrowLeft'],['ArrowDown','ArrowLeft','ArrowUp','ArrowRight'],['ArrowLeft','ArrowUp','ArrowUp','ArrowRight'],['ArrowUp','ArrowLeft','ArrowDown','ArrowDown'],['ArrowRight','ArrowDown','ArrowLeft','ArrowUp']];return [...patterns[(Math.abs(seed)+attempt)%patterns.length]]}
export function buyWorld(a,id,lands,costs){const index=lands.findIndex(l=>l.id===id);if(index<0)return false;if(a.ownedWorldIds.includes(id))return true;const cost=costs[index];if(!Number.isFinite(cost)||a.wallet.rainbowStars<cost)return false;a.wallet.rainbowStars-=cost;a.ownedWorldIds.push(id);return true}
export function placeFriend(a,id,world){if(!a.friends[id]||!a.ownedWorldIds.includes(world))return false;a.friends[id].homeLandId=world;return true}
export function rescueFriend(a,id,world,levelId){if(!rescueReady(a)||a.friends[id]||!a.ownedWorldIds.includes(world))return false;a.friends[id]={isRescued:true,upgradeStage:'starter',homeLandId:world};a.unlockedCharacterIds=mergedUnlockedCharacterIds(a.unlockedCharacterIds,a.friends,id);if(levelId&&!a.rescuedAtLevelIds.includes(levelId))a.rescuedAtLevelIds.push(levelId);a.mazesSinceRescue=0;a.pendingRescueFriendId=null;return true}

// Switching playable characters must never overwrite previously unlocked IDs,
// earned stars, rescued friends, world ownership or arranged scene positions.
export function choosePlayerCharacter(a,id,starterWorldId){
 if(typeof id!=='string'||!id)return false;
 a.selectedPlayerCharacterId=id;
 a.friends??={};
 a.friends[id]??={isRescued:true,upgradeStage:'starter',homeLandId:starterWorldId};
 a.unlockedCharacterIds=mergedUnlockedCharacterIds(a.unlockedCharacterIds,a.friends,id);
 return true;
}
