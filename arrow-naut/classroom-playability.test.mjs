/** Classroom regression: all CURRENTLY OPENABLE Map One and Map Two levels.
 * Run with: node --test arrow-naut/classroom-playability.test.mjs
 * This checks level IDs, valid boards, enemy starting positions, and real
 * artwork paths. Separate route tests exercise moves, resizing and rescues.
 * It does not claim to replace browser/Chromebook interaction testing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createMission as grade2,PLANETS} from './curriculum.mjs';
import {planetImage,GALAXY_MAP} from './art-assets.mjs';
import {PUZZLE_SPRITES,PLAYERS,FRIEND_SPRITES,ENEMY_SPRITES} from './sprite-assets.mjs';
import {createMission as grade1,WORLDS,CHARACTERS,ENEMIES,GALAXY} from '../arrow-naut-jr/curriculum.mjs';
import {LOST_WORLDS,createMapTwoMission,MAP_TWO_THEMES} from './map-two.mjs';
const root=dirname(fileURLToPath(import.meta.url));
function image(dir,reference,context){
 assert.equal(typeof reference,'string',context+' missing image reference');
 assert.match(reference,/\.(?:png|jpe?g)$/i,context+' must reference full PNG/JPEG art');
 assert.ok(existsSync(resolve(root,dir,reference)),context+' missing file '+reference);
}
function occupied(piece,x=piece.x,y=piece.y){
 const rel=piece.cells??(piece.shape==='L'?[[0,0],[0,1],[0,2],[1,2]]:
 piece.shape==='T'?[[0,0],[1,0],[2,0],[1,1],[1,2]]:null);
 if(rel)return rel.map(([dx,dy])=>[x+dx,y+dy]);
 const cells=[];for(let xx=0;xx<piece.w;xx++)for(let yy=0;yy<piece.h;yy++)cells.push([x+xx,y+yy]);return cells;
}
function bounds(cells,context){
 for(const [x,y] of cells)assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<12&&y<7,context+' goes outside board at '+x+','+y);
}
test('128 unique original missions have legal object starts and targets',()=>{
 const seen=new Set();
 for(let world=0;world<8;world++)for(let stage=0;stage<8;stage++)for(const [grade,mission] of [['second',grade2(world,stage)],['first',grade1(world,stage)]]){
  const key=grade+':'+mission.id;assert.ok(!seen.has(key),key+' duplicated');seen.add(key);
  const occup=new Set();
  for(const piece of mission.pieces){
   const cells=occupied(piece);bounds(cells,key+' start '+piece.id);
   for(const cell of cells){const k=cell.join(',');assert.ok(!occup.has(k),key+' overlapping starts at '+k);occup.add(k)}
   if(piece.goal)bounds(occupied({...piece,w:piece.goal.w??piece.w,h:piece.goal.h??piece.h},piece.goal.x,piece.goal.y),key+' goal '+piece.id);
  }
  for(const point of mission.pickups||[])bounds([[point.x,point.y]],key+' pickup');
 }
 assert.equal(seen.size,128);
});
test('second-grade moving enemies never begin on an object, wall, star, or dock',()=>{
 for(let world=0;world<8;world++)for(let stage=0;stage<16;stage++){
  const m=grade2(world,stage),fixed=new Set((m.obstacles||[]).map(p=>p.join(',')));
  for(const p of m.pieces){for(const [x,y] of occupied(p))fixed.add(x+','+y);
   if(p.goal)for(const [x,y] of occupied({...p,w:p.goal.w??p.w,h:p.goal.h??p.h},p.goal.x,p.goal.y))fixed.add(x+','+y)}
  for(const p of m.pickups||[])fixed.add(p.x+','+p.y);
  for(const e of m.hazards||[]){bounds([[e.x,e.y]],m.id+' enemy');assert.ok(!fixed.has(e.x+','+e.y),m.id+' enemy starts inside another object at '+e.x+','+e.y)}
 }
});
test('all 128 Map One missions use existing full artwork',()=>{
 image('.',GALAXY_MAP,'second main map');image('../arrow-naut-jr',GALAXY,'first main map');
 for(const p of PLAYERS)image('.',p.image,'player '+p.name);
 for(const p of FRIEND_SPRITES)image('.',p,'second rescue friend');
 for(const p of ENEMY_SPRITES)image('.',p,'second enemy');
 for(const p of CHARACTERS)image('../arrow-naut-jr',p.img,'junior avatar');
 for(const p of ENEMIES)image('../arrow-naut-jr',p,'junior enemy');
 for(let w=0;w<8;w++){image('.',planetImage(w),'second world '+w);
  image('../arrow-naut-jr',WORLDS[w].jpg,'junior world '+w);
  image('../arrow-naut-jr',WORLDS[w].friend,'junior rescue '+w);
  for(let st=0;st<8;st++){
   const a=grade2(w,st),b=grade1(w,st);
   for(const p of a.pieces)image('.',PUZZLE_SPRITES[p.id]||'./assets/standalone/crate_blue.png',a.id+' '+p.id);
   for(const p of a.pickups||[])image('.',p.image,a.id+' pickup '+p.id);
   for(const p of b.pieces)image('../arrow-naut-jr',p.img,b.id+' '+p.id);
   for(const p of b.pickups||[])image('../arrow-naut-jr',p.img,b.id+' pickup '+p.id);
   if(b.gate)image('../arrow-naut-jr',b.gate.img,b.id+' gate');
  }
 }
});
test('only the two built Map Two worlds are playable and their 16 missions have artwork',()=>{
 assert.equal(LOST_WORLDS.length,2);assert.equal(MAP_TWO_THEMES.length,8);
 const ids=new Set();
 for(let w=0;w<LOST_WORLDS.length;w++){
  image('.',LOST_WORLDS[w].scene,'Map Two world '+w);
  image('.',LOST_WORLDS[w].friendImage,'Map Two rescue '+w);
  for(let stage=0;stage<8;stage++){
   const m=createMapTwoMission(w,stage);assert.ok(!ids.has(m.id));ids.add(m.id);
   for(const p of m.pieces){bounds(occupied(p),m.id+' start');image('.',p.art,m.id+' picture '+p.id)}
  }
 }
 assert.equal(ids.size,16);
 for(const theme of MAP_TWO_THEMES.slice(2))assert.equal(theme.active,false,theme.name+' must remain locked until built');
});
