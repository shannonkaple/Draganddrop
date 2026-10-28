// Run: node arrow-lab/test-world-level-map.mjs
// This is source-level QA; it does NOT replace live Chromebook browser checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORLD_MAP_SIZE,WORLD_STOP_POINTS,WORLD_IDS,WORLD_STOP_POINTS_BY_WORLD,PUBLISHED_WORLD_LEVEL_MAPS,APPROVED_WORLD_LEVEL_MAPS,worldStopModels} from './level-map-model.mjs';
assert.deepEqual(WORLD_MAP_SIZE,{width:2048,height:682});
assert.equal(WORLD_STOP_POINTS.length,8);
assert.deepEqual(WORLD_STOP_POINTS.map(p=>[p.x,p.y]),[
  [6.7,41.7],[20.8,53.7],[33.1,70.6],[39.4,42.3],
  [53.5,57],[69.2,51.5],[84.2,69.8],[92.1,37.4]
]);
assert.deepEqual(Object.keys(APPROVED_WORLD_LEVEL_MAPS),['candy'],'Original Candy art protected');
assert.equal(Object.keys(PUBLISHED_WORLD_LEVEL_MAPS).length,8,'Seven existing original JPEG world maps included');
const levels=Array.from({length:64},(_,i)=>({id:'level_'+(i+1),number:i+1}));
for(let world=0;world<8;world++){
  const first=world*8,progress={
    completedLevelIds:[levels[first].id],
    highestUnlockedLevel:first+3,
    mazeRuns:{[levels[first+1].id]:{id:levels[first+1].id,complete:false,player:{x:3,y:2}}}
  };
  const cards=worldStopModels(world,levels,progress);
  assert.equal(cards.length,8,'Each world has eight stops');
  assert.equal(cards[0].completed,true,'Completed maze stays replayable');
  assert.equal(cards[0].unlocked,true);
  assert.equal(cards[1].started,true,'Saved run is visible as in progress');
  assert.equal(cards[1].symbol,'↪');
  assert.equal(cards[2].unlocked,true,'Next unlocked maze remains selectable');
  assert.equal(cards[3].unlocked,false,'Future maze stays locked');
  cards.forEach((stop,i)=>{
    assert.equal(stop.position,WORLD_STOP_POINTS_BY_WORLD[WORLD_IDS[world]][i],'Use eight precisely measured stops for each world');
    assert.equal(stop.level.number,first+i+1,'Correct global maze number');
  });
}
const src=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./classroom-layout.css',import.meta.url),'utf8');
assert.match(src,/const stops=worldStopModels\(i,levels,a\)/);
assert.match(src,/const picture=PUBLISHED_WORLD_LEVEL_MAPS\[world\.id\]/,'Display original full-resolution world JPEG');
assert.doesNotMatch(src,/world-maps\/(?:pirate|arctic|castle|space|jurassic|ocean|lava)-world-map\.(?:jpg|png)/);
assert.match(src,/const positions=WORLD_STOP_POINTS\.map/,'Candy map uses same center array');
assert.match(css,/lab-world-active \.lab-candy-world \.lab-candy-scenery/,'The art is sized at its natural aspect ratio');
assert.match(css,/object-fit:contain!important/,'No image distortion from cover');
assert.match(html,/id="lab-jpeg-banner"/);
console.log('PASS: 8 illustrated world maps, 64 saved stages and 56 measured world-specific stop coordinates');
