
import {rng} from './core.mjs';
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
 const items=(def.computerGearIds||[]).map((id,i)=>({id,...shuffled[i],collected:false}));
 const needsSkill=def.primarySkill!=='arrows'&&def.primarySkill!=='mixed'||(def.skillBadgeIds||[]).length>0;
 const skill=needsSkill?{...shuffled[items.length],done:false,type:def.primarySkill}:null;
 const stops=[...items,...(skill?[skill]:[]),goal],safe=new Set([tile(start)]);let p=start;
 for(const stop of stops){for(const n of walk(p,route(grid,p,stop)))safe.add(tile(n));p=stop}
 const excluded=new Set([tile(start),tile(goal),...items.map(tile),...(skill?[tile(skill)]:[])]);
 const side=roads.filter(n=>!safe.has(tile(n))&&!excluded.has(tile(n))),hazards=[];
 // Carve optional alcoves if the safe route uses every existing branch.
 if(!easy)for(let y=1;y<h-1&&side.length<(def.enemyIds||[]).length*2;y++)for(let x=1;x<w-1&&side.length<(def.enemyIds||[]).length*2;x++)if(grid[y][x]===1&&Object.values(directions).some(([dx,dy])=>grid[y+dy]?.[x+dx]===0)){grid[y][x]=0;side.push({x,y})}
 if(!easy)for(const id of def.enemyIds||[]){const pos=side.find(n=>!hazards.some(e=>e.path.some(q=>tile(q)===tile(n))));if(!pos)continue;let path=[pos];if(def.number>=4&&!['prickly_cactus','chomper_plant'].includes(id)){const second=side.find(n=>Math.abs(n.x-pos.x)+Math.abs(n.y-pos.y)===1&&!hazards.some(e=>e.path.some(q=>tile(q)===tile(n))));if(second)path.push(second)}hazards.push({id,path,index:0})}
 let barrier=null;if(def.ducking!=='none'&&!easy){const main=walk(start,route(grid,start,goal));barrier=main.find((n,i)=>i>=2&&i<main.length-2&&!excluded.has(tile(n)))||null}
 return {id:def.id,seed,w,h,grid,start,goal,player:{...start},checkpoint:{...start},steps:0,items,skill,hazards,barrier,safe:[...safe],complete:false,rewarded:false,trail:[[1,1]],duckLearned:!barrier};
}
export function migrateAdventure(previous,legacy,characters,lands){
 const a=previous&&typeof previous==='object'?previous:{},ids=characters.map(c=>c.id),landIds=lands.map(l=>l.id),friends={};
 const main=ids.includes(a.selectedPlayerCharacterId)?a.selectedPlayerCharacterId:ids.includes(legacy?.character)?legacy.character:null;
 for(const[id,f]of Object.entries(a.friends||{}))if(ids.includes(id))friends[id]={isRescued:true,upgradeStage:['starter','power_up','super_power'].includes(f.upgradeStage)?f.upgradeStage:'starter',homeLandId:landIds.includes(f.homeLandId)?f.homeLandId:landIds[0]};
 for(const id of legacy?.rescued||[])if(ids.includes(id)&&!friends[id])friends[id]={isRescued:true,upgradeStage:'starter',homeLandId:landIds[0]};
 if(main&&!friends[main])friends[main]={isRescued:true,upgradeStage:'starter',homeLandId:landIds[0]};
 return {...a,mazesSinceRescue:Math.max(0,Math.min(3,Math.floor(Number(a.mazesSinceRescue)||0))),pendingRescueFriendId:ids.includes(a.pendingRescueFriendId)&&!friends[a.pendingRescueFriendId]?a.pendingRescueFriendId:null,ownedWorldIds:Array.isArray(a.ownedWorldIds)?a.ownedWorldIds:[...new Set(Object.values(friends).map(f=>f.homeLandId))],decorations:a.decorations||{},positions:a.positions||{},schemaVersion:1,selectedPlayerCharacterId:main,primaryRainbowLandId:landIds.includes(a.primaryRainbowLandId)?a.primaryRainbowLandId:null,friends,unlockedCharacterIds:Object.keys(friends),completedLevelIds:Array.isArray(a.completedLevelIds)?a.completedLevelIds:[],rescuedAtLevelIds:Array.isArray(a.rescuedAtLevelIds)?a.rescuedAtLevelIds:[],highestUnlockedLevel:Math.max(1,Math.min(12,Number(a.highestUnlockedLevel)||1)),wallet:{rainbowStars:Math.max(0,Number(a.wallet?.rainbowStars)||0)},lifetimeStarsEarned:Math.max(0,Number(a.lifetimeStarsEarned)||0),collectedComputerGearIds:Array.isArray(a.collectedComputerGearIds)?a.collectedComputerGearIds:[],earnedSkillBadgeIds:Array.isArray(a.earnedSkillBadgeIds)?a.earnedSkillBadgeIds:[],settings:{soundEnabled:false,reducedMotion:false,...a.settings}};
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
 a.highestUnlockedLevel=Math.min(12,Math.max(a.highestUnlockedLevel,def.number+1));return n;
}
export function rescueReady(a){return (a.mazesSinceRescue||0)>=3}
export function buyWorld(a,id,lands,costs){const index=lands.findIndex(l=>l.id===id);if(index<0)return false;if(a.ownedWorldIds.includes(id))return true;const cost=costs[index];if(!Number.isFinite(cost)||a.wallet.rainbowStars<cost)return false;a.wallet.rainbowStars-=cost;a.ownedWorldIds.push(id);return true}
export function placeFriend(a,id,world){if(!a.friends[id]||!a.ownedWorldIds.includes(world))return false;a.friends[id].homeLandId=world;return true}
export function rescueFriend(a,id,world,levelId){if(!rescueReady(a)||a.friends[id]||!a.ownedWorldIds.includes(world))return false;a.friends[id]={isRescued:true,upgradeStage:'starter',homeLandId:world};a.unlockedCharacterIds=Object.keys(a.friends);if(levelId&&!a.rescuedAtLevelIds.includes(levelId))a.rescuedAtLevelIds.push(levelId);a.mazesSinceRescue=0;a.pendingRescueFriendId=null;return true}
