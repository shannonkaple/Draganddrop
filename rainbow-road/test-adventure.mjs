
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildLevel,route,walk,tile,migrateAdventure,upgradeFriend,completeLevel,rescueFriend} from './adventure-core.mjs';
const load=n=>JSON.parse(fs.readFileSync('rainbow-road/data/'+n+'.json','utf8'));
export async function runAdventureChecks(page){
 await page.addInitScript(()=>{window.__readAloud=[];speechSynthesis.speak=u=>window.__readAloud.push({text:u.text,rate:u.rate});speechSynthesis.cancel=()=>{}});
 const chars=load('characters'),lands=load('rainbow_lands'),levels=load('levels'),config=load('game_config');
 const all=[...chars.flatMap(c=>c.levels.flatMap(l=>[l.image,l.thumbnail])),...lands.flatMap(l=>[l.homeBackground,l.cardPreview]),...load('backgrounds').map(b=>b.image),...load('enemies').flatMap(e=>[e.image,e.thumbnail]),...load('computer_collectibles').flatMap(i=>[i.image,i.thumbnail]),...load('skill_badges').flatMap(i=>[i.image,i.thumbnail])];
 for(const p of new Set(all)){const file=path.join(process.cwd(),p.replace(/^\//,''));assert.ok(fs.existsSync(file),'Missing asset '+p);const response=await page.request.get('http://127.0.0.1:4173'+p);assert.equal(response.status(),200,p);}
 for(const c of chars)for(const stage of c.levels)for(const [p,size]of [[stage.image,512],[stage.thumbnail,256]]){const bytes=fs.readFileSync(p.slice(1));assert.equal(bytes.readUInt32BE(16),size,p);assert.equal(bytes.readUInt32BE(20),size,p);}
 assert.equal(new Set(levels.map(l=>l.backgroundImage)).size,12);
 for(let seed=1;seed<=60;seed++)for(const def of levels){const r=buildLevel(def,seed),blocked=new Set(r.hazards.flatMap(e=>e.path.map(tile)));let p=r.start;for(const stop of [...r.items,...(r.skill?[r.skill]:[]),r.goal]){assert.ok(route(r.grid,p,stop,blocked),'Safe route '+def.id+' seed '+seed);p=stop;}assert.equal(r.w,def.mazeGrid.width);assert.equal(r.h,def.mazeGrid.height);assert.equal(r.hazards.length,def.enemyIds.length);}
 let state=migrateAdventure(null,{character:'astro_ace',rescued:['astro_ace']},chars,lands);state.wallet.rainbowStars=8;assert.ok(upgradeFriend(state,'astro_ace',config.progression.upgradeCost));assert.equal(state.wallet.rainbowStars,6);assert.ok(upgradeFriend(state,'astro_ace',config.progression.upgradeCost));assert.equal(state.wallet.rainbowStars,2);assert.equal(upgradeFriend(state,'astro_ace',config.progression.upgradeCost),false);assert.ok(rescueFriend(state,'dizzy_dino',lands[1].id,'level_02'));assert.equal(rescueFriend(state,'dizzy_dino',lands[1].id,'level_03'),false);assert.equal(state.friends.dizzy_dino.upgradeStage,'starter');
 const rr=buildLevel(levels[0],9);assert.equal(completeLevel(state,rr,levels[0],config),2);assert.equal(completeLevel(state,rr,levels[0],config),0);
 await page.goto('http://127.0.0.1:4173/rainbow-road.html');await page.locator('[data-number="30"]').click();await page.locator('[data-hero="astro_ace"]').waitFor();await page.locator('[data-hero="astro_ace"]').locator('..').locator('[data-read-aloud]').click();assert.equal(await page.locator('[data-hero]').count(),8);assert.ok((await page.evaluate(()=>window.__readAloud.at(-1).text)).includes('Astro Ace'));await page.locator('[data-hero="astro_ace"]').click();await page.locator('[data-land="rainbow_meadow"]').locator('..').locator('[data-read-aloud]').click();assert.equal(await page.locator('[data-land]').count(),6);assert.ok((await page.evaluate(()=>window.__readAloud.at(-1).text)).includes('Rainbow Meadow'));await page.locator('[data-land="rainbow_meadow"]').click();const storageKey='rainbow-road-number-v2:30';
 const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),storageKey);
 for(const def of levels){
  console.log('Playing adventure level',def.number);
  assert.equal(await page.locator('.adventure-nav [data-nav]').count(),2);assert.equal(await page.locator('#teacher-settings').count(),0);if(def.number===1)await page.locator('#continue-adventure').click();else{await page.locator('#other-mazes > summary').click();await page.locator('[data-level="'+def.number+'"]').click();}
  if(await page.locator('#duck-ready').count())await page.locator('#duck-ready').click();
  for(const [width,height]of def.number===12?[[1366,768],[1280,720],[1024,600],[800,600],[1920,1080]]:[[1366,768]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);const box=await page.locator('#adventure-maze').boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,'Adventure overflow '+width+'x'+height);assert.ok(box.width/def.mazeGrid.width>=20,'Adventure tiles too small');}
  await page.setViewportSize({width:1366,height:768});
  if(def.number===1){assert.equal(await page.locator('#duck-button').isVisible(),false);await page.locator('.help-panel h3 [data-read-aloud]').click();assert.ok((await page.evaluate(()=>window.__readAloud.at(-1).text)).includes('Find the Mouse'));}let s=await saved(),r=s.adventure.activeRun;
  const stops=[...(r.skill?[r.skill]:[]),...r.items,r.goal];await page.keyboard.down('Space');
  for(const stop of stops){
   if((await saved()).adventure.activeRun.complete)break;
   await page.keyboard.up('Space');await page.keyboard.down('Space');
   s=await saved();r=s.adventure.activeRun;
   const blocked=new Set(r.hazards.flatMap(e=>e.path.map(tile)));const keys=route(r.grid,r.player,stop,blocked);assert.ok(keys);
   for(const k of keys)await page.keyboard.press(k);
   if(stop.type){
    const kind=stop.type;await page.locator('#adventure-dialog h2 [data-read-aloud]').click();assert.ok((await page.evaluate(()=>window.__readAloud.at(-1).text)).includes('Computer skill stop'));
    if(kind==='click')await page.locator('#skill-target').click();
    if(kind==='double_click'){await page.locator('#skill-target').click();await page.locator('#skill-target').click();}
    if(kind==='typing'){await page.locator('#skill-type').fill('cat');await page.locator('#check-type').click();}
    if(kind==='arrows')for(const k of ['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'])await page.keyboard.press(k);
    if(kind==='drag_and_drop'){await page.locator('#drag-picture').hover();const target=await page.locator('#drag-box').boundingBox();await page.mouse.down();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});await page.mouse.up();assert.equal(await page.locator('#adventure-dialog[open]').count(),0,'Drag skill did not accept a drop in the box');}
   }
  }
  await page.keyboard.up('Space');if(!await page.locator('#level-next').count())console.log('Goal diagnostic',def.number,JSON.stringify((await saved()).adventure.activeRun),await page.locator('#adventure-status').textContent());await page.locator('#level-next').click();
  if(def.rescueFriendOpportunity){await page.locator('[data-rescue]').first().click();await page.locator('#celebrate-next').click();await page.locator('[data-land]').first().click();}
  if(def.number<12)await page.locator('[data-nav="map"]').click();
 }
 let s=await saved();assert.equal(s.adventure.completedLevelIds.length,12);assert.equal(Object.keys(s.adventure.friends).length,8);assert.equal(s.adventure.collectedComputerGearIds.length,5);assert.equal(s.adventure.earnedSkillBadgeIds.length,4);assert.equal(s.wallet.total,60);
 await page.locator('#build-computer').click();assert.ok((await page.locator('h1').innerText()).includes('You Built'));
 await page.locator('[data-nav="stuff"]').click();await page.locator('[data-nav="friends"]').click();await page.locator('[data-upgrade="astro_ace"]').click();await page.locator('#celebrate-next').click();await page.locator('[data-upgrade="astro_ace"]').click();await page.locator('#celebrate-next').click();await page.locator('[data-move="dizzy_dino"]').click();await page.locator('[data-land="rainbow_reef"]').click();
 await page.reload();await page.locator('[data-number="30"]').click();await page.locator('[data-nav="stuff"]').click();await page.locator('[data-nav="friends"]').click();s=await saved();assert.equal(s.adventure.selectedPlayerCharacterId,'astro_ace');assert.equal(s.adventure.friends.astro_ace.upgradeStage,'super_power');assert.equal(s.adventure.friends.dizzy_dino.upgradeStage,'starter');assert.equal(s.adventure.friends.dizzy_dino.homeLandId,'rainbow_reef');assert.equal(s.wallet.total,60);
 console.log('PASS: all supplied asset paths and sprite dimensions; 720 safe solvable mazes; 12 browser-played levels; click/double-click/typing/drag/arrows; eight friends; independent upgrades; lands; rewards; reload; legacy wallet; five viewports.');
}
