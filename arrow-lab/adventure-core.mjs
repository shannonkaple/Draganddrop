
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
 if(!easy)for(let y=1;y<h-1&&side.length<(def.enemyIds||[]).length*3;y++)for(let x=1;x<w-1&&side.length<(def.enemyIds||[]).length*3;x++){
   const p={x,y};
   if(grid[y][x]===1&& !safe.has(tile(p)) && !excluded.has(tile(p)) &&
      Object.values(directions).some(([dx,dy])=>grid[y+dy]?.[x+dx]===0)){
     grid[y][x]=0;side.push(p);
   }
 }
 if(!easy){
   const used=new Set(),dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
   const positions=[];
   // Reserve all four different enemy spawning tiles BEFORE allocating long patrols.
   // Otherwise an early patrol can consume the fourth enemy's only open tile.
   for(const id of def.enemyIds||[]){
     const available=side.filter(p=>!used.has(tile(p))&&!safe.has(tile(p))&&!excluded.has(tile(p)));
     if(!available.length)break;
     const score=p=>{
       const separation=positions.length?Math.min(...positions.map(h=>dist(p,h.pos))):Math.min(dist(p,start),dist(p,goal));
       return separation*100+Math.min(dist(p,start),dist(p,goal))*3+random();
     };
     let pos=available[0],best=-Infinity;
     for(const p of available){const value=score(p);if(value>best){best=value;pos=p}}
     positions.push({id,pos});
     used.add(tile(pos));
   }
   for(const {id,pos} of positions){
     const path=[pos];
     if(def.number>=4&&!['prickly_cactus','chomper_plant'].includes(id)){
       const patrolSteps=2+Math.floor(random()*3); // a 2–4 tile outing, then follow the same path home
        for(let step=0;step<patrolSteps;step++){
         let secondary=side.filter(p=>dist(p,path.at(-1))===1&&!used.has(tile(p))&&!safe.has(tile(p))&&!excluded.has(tile(p)));
         if(!secondary.length){
           // The older maze generator often left moving enemies stuck after
           // only one step. Open a connected side pocket instead of teleporting.
           // Never carve the protected student route, objectives or other spawns.
           const tail=path.at(-1);
           const candidates=Object.values(directions).map(([dx,dy])=>({x:tail.x+dx,y:tail.y+dy}))
             .filter(p=>p.x>0&&p.x<w-1&&p.y>0&&p.y<h-1&&grid[p.y][p.x]===1
               &&!used.has(tile(p))&&!safe.has(tile(p))&&!excluded.has(tile(p)));
           if(candidates.length){
             const score=p=>Math.min(...positions.filter(h=>h.id!==id).map(h=>dist(p,h.pos)),99);
             candidates.sort((a,b)=>score(b)-score(a));
             const pocket=candidates[0];grid[pocket.y][pocket.x]=0;side.push(pocket);
             secondary=[pocket];
           }
         }
         if(!secondary.length)break;
         // Keep patrols away from other reserved spawns and safe/required routes.
         secondary.sort((a,b)=>{
           const far=q=>Math.min(...positions.filter(h=>h.id!==id).map(h=>dist(q,h.pos)),99);
           return far(b)-far(a);
         });
         path.push(secondary[0]);used.add(tile(secondary[0]));
       }
       if(path.length>2)path.push(...path.slice(1,-1).reverse());
     }
     hazards.push({id,path,index:0});
   }
 }
 let barrier=null;if(def.ducking!=='none'&&!easy){const main=walk(start,route(grid,start,goal));barrier=main.find((n,i)=>i>=2&&i<main.length-2&&!excluded.has(tile(n)))||null}
 return {id:def.id,seed,w,h,grid,start,goal,player:{...start},checkpoint:{...start},steps:0,items,skill,hazards,barrier,safe:[...safe],complete:false,rewarded:false,trail:[[1,1]],duckLearned:!barrier};
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
 return {...a,mazesSinceRescue:Math.max(0,Math.min(3,Math.floor(Number(a.mazesSinceRescue)||0))),pendingRescueFriendId:ids.includes(a.pendingRescueFriendId)&&!friends[a.pendingRescueFriendId]?a.pendingRescueFriendId:null,ownedWorldIds:Array.isArray(a.ownedWorldIds)?a.ownedWorldIds:[...new Set(Object.values(friends).map(f=>f.homeLandId))],decorations:a.decorations||{},positions:a.positions||{},schemaVersion:1,selectedPlayerCharacterId:main,unavailableSelectedPlayerCharacterId,primaryRainbowLandId:landIds.includes(a.primaryRainbowLandId)?a.primaryRainbowLandId:null,friends,unlockedCharacterIds:Object.keys(friends),completedLevelIds:Array.isArray(a.completedLevelIds)?a.completedLevelIds:[],rescuedAtLevelIds:Array.isArray(a.rescuedAtLevelIds)?a.rescuedAtLevelIds:[],highestUnlockedLevel:unlockedFromSavedProgress(a),wallet:{rainbowStars:Math.max(0,Number(a.wallet?.rainbowStars)||0)},lifetimeStarsEarned:Math.max(0,Number(a.lifetimeStarsEarned)||0),collectedComputerGearIds:Array.isArray(a.collectedComputerGearIds)?a.collectedComputerGearIds:[],earnedSkillBadgeIds:Array.isArray(a.earnedSkillBadgeIds)?a.earnedSkillBadgeIds:[],settings:{soundEnabled:false,reducedMotion:false,...a.settings}};
}
export function upgradeFriend(a,id,costs){
 const f=a.friends[id];if(!f||f.upgradeStage==='super_power')return false;
 const next=f.upgradeStage==='starter'?'power_up':'super_power',cost=next==='power_up'?costs.power_up:costs.super_power_additional;
 if(a.wallet.rainbowStars<cost)return false;a.wallet.rainbowStars-=cost;f.upgradeStage=next;return true;
}
export function completeLevel(a,run,def,config){
 if(run.rewarded)return 0;run.rewarded=true;
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
export function rescueFriend(a,id,world,levelId){if(!rescueReady(a)||a.friends[id]||!a.ownedWorldIds.includes(world))return false;a.friends[id]={isRescued:true,upgradeStage:'starter',homeLandId:world};a.unlockedCharacterIds=Object.keys(a.friends);if(levelId&&!a.rescuedAtLevelIds.includes(levelId))a.rescuedAtLevelIds.push(levelId);a.mazesSinceRescue=0;a.pendingRescueFriendId=null;return true}
