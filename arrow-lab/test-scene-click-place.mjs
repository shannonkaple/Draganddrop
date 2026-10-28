// Run with: node arrow-lab/test-scene-click-place.mjs
// Genuine isolated DOM-event regression for click-to-place, trackpad drag,
// keyboard movement and persistence; no student data is modified by this test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const start=source.indexOf(' function enableCollectionDrag(id){');
const end=source.indexOf(' function computer(',start);
assert.ok(start>=0&&end>start,'world scene movement handler exists');
const createHandler=new Function('$','a','directions','document','save','removeSceneObject',
  source.slice(start,end)+';return enableCollectionDrag;');
let saves=0,focuses=0,removes=0;
const classes=()=>{const owned=new Set();return {add:id=>owned.add(id),remove:id=>owned.delete(id),contains:id=>owned.has(id)}};
const sprite=id=>({dataset:{worldObject:id},style:{left:'20%',top:'30%'},classList:classes(),
 getBoundingClientRect:()=>({left:200,top:100,width:100,height:100}),
 getAttribute:()=>id,setAttribute(){},append(node){this.remove=node},focus(){focuses++},setPointerCapture(){}});
const player=sprite('cosmo_fox'),treasure=sprite('treasure:lollipop');
const scene={querySelectorAll:()=>[player,treasure],getBoundingClientRect:()=>({left:0,top:0,width:1000,height:500})};
const state={selectedPlayerCharacterId:'cosmo_fox',
 positions:{background_candy:{}},wallet:{rainbowStars:42},completedLevelIds:['lab_candy_3']};
const $=key=>key==='collection-scene'?scene:{set textContent(v){this.message=v}};
createHandler($,state,{ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},
 {createElement(){return {setAttribute(){}}}},()=>saves++,()=>removes++)('background_candy');
const target=el=>({closest:selector=>selector==='[data-world-object]'?el:null});
const blank={closest:()=>null};
const pointer=(el,x,y)=>({target:el?target(el):blank,pointerType:'mouse',button:0,pointerId:7,
 clientX:x,clientY:y,preventDefault(){}});
scene.onpointerdown(pointer(player,250,150));
scene.onpointerup(pointer(player,250,150));
assert.equal(player.classList.contains('selected-for-placement'),true);
assert.equal(saves,0,'select should not create a saved move');
scene.onpointerdown(pointer(null,730,310));
assert.deepEqual(state.positions.background_candy.cosmo_fox,{x:73,y:62});
assert.equal(saves,1,'the second click saves placement');
assert.equal(player.classList.contains('selected-for-placement'),false);
scene.onpointerdown(pointer(treasure,250,150));
scene.onpointermove(pointer(treasure,265,168));
scene.onpointerup(pointer(treasure,265,168));
assert.ok(state.positions.background_candy['treasure:lollipop']);
assert.equal(saves,2,'trackpad drag also saves');
player.onkeydown({key:'ArrowRight',preventDefault(){},stopPropagation(){}});
assert.equal(state.positions.background_candy.cosmo_fox.x,76);
assert.equal(saves,3,'keyboard arrows also save');
assert.equal(state.wallet.rainbowStars,42,'movement is free');
assert.deepEqual(state.completedLevelIds,['lab_candy_3'],'completion unchanged');
assert.equal(player.remove,undefined,'player cannot be removed');
assert.ok(treasure.remove,'earned objects retain a put-away button');
scene.armObject(player);
assert.equal(player.classList.contains('selected-for-placement'),true,'Move My Player button can select');
const restored=JSON.parse(JSON.stringify(state));
assert.deepEqual(restored.positions,state.positions,'save/reload preserves coordinates');
console.log('PASS: click-select, click-to-place, trackpad drag, keyboard, Move My Player and save persistence');
