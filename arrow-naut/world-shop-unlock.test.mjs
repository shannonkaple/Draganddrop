import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PLANETS,SPACE_SHOP,createProgress,sceneUnlocked as nautSceneUnlocked} from './curriculum.mjs';
import {SHOP_SPRITES} from './sprite-assets.mjs';
import {WORLDS,ITEMS,createProgress as juniorProgress,sceneUnlocked as juniorSceneUnlocked} from '../arrow-naut-jr/curriculum.mjs';
const currentDir=dirname(fileURLToPath(import.meta.url));
test('scenes unlock only after their matching rescue finale',()=>{
 for(let i=0;i<PLANETS.length;i++){
  const p=createProgress();
  p.completed=Array.from({length:7},(_,k)=>PLANETS[i].id+'-'+(k+1));
  assert.equal(nautSceneUnlocked(p,i),false,PLANETS[i].name);
  p.completed.push(PLANETS[i].id+'-8');
  assert.equal(nautSceneUnlocked(p,i),true,PLANETS[i].name);
 }
 for(let i=0;i<WORLDS.length;i++){
  const p=juniorProgress();
  p.completed=Array.from({length:7},(_,k)=>WORLDS[i].id+'-'+(k+1));
  assert.equal(juniorSceneUnlocked(p,i),false,WORLDS[i].name);
  p.completed.push(WORLDS[i].id+'-8');
  assert.equal(juniorSceneUnlocked(p,i),true,WORLDS[i].name);
 }
});
test('twelve original Arrow Adventure PNG items, no background purchases',()=>{
 const extras=SPACE_SHOP.filter(x=>x.id.startsWith('legacy-'));
 assert.equal(extras.length,12);
 const junior=ITEMS.filter(x=>x.id.startsWith('legacy-'));
 assert.equal(junior.length,12);
 assert.deepEqual(junior.map(x=>x.id).sort(),extras.map(x=>x.id).sort());
 for(const item of extras){
  assert.ok(item.price>0);
  const url=SHOP_SPRITES[item.id];
  assert.match(url,/^\.\.\/arrow-lab\/collectibles\/.+\.png$/);
  assert.ok(existsSync(join(currentDir,url)),'Missing '+url);
  assert.equal(junior.find(x=>x.id===item.id)?.img,url);
 }
 assert.ok(SPACE_SHOP.every(x=>!/background|wallpaper|world pass/i.test(x.id+' '+x.name)));
 assert.ok(ITEMS.every(x=>!/background|wallpaper|world pass/i.test(x.id+' '+x.name)));
});
test('gating does not mutate saved purchases, placements or stars',()=>{
 const p={...createProgress(),stars:26,purchases:['legacy-compass'],worldScene:[{id:'shop:legacy-compass',planet:0,x:42,y:37}]};
 const before=JSON.stringify(p);
 assert.equal(nautSceneUnlocked(p,0),false);
 assert.equal(JSON.stringify(p),before);
 const j={...juniorProgress(),stars:26,purchases:['legacy-compass'],worldScene:[{key:'item:legacy-compass',world:0,x:42,y:37}]};
 const saved=JSON.stringify(j);
 assert.equal(juniorSceneUnlocked(j,0),false);
 assert.equal(JSON.stringify(j),saved);
});
