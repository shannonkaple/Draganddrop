// Arrow Lab regression: MY STUFF owned-world pictures and movable current player.
// Run with: node arrow-lab/test-my-stuff-player.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./visual-hotfix-20261027.css',import.meta.url),'utf8');
const game=fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
assert.match(html,/game\.mjs\?v=scene-placement-save-20261028e/);
assert.match(html,/visual-hotfix-20261027\.css\?v=my-stuff-player-20261028a/);
assert.match(game,/adventure\.mjs\?v=scene-placement-save-20261028e/);
assert.match(css,/\.my-stuff-quickworlds button:focus-visible/);
assert.match(source,/document\.querySelectorAll\('\[data-stuff-world\]'\)/);
assert.match(source,/id="stuff-change-player"/);
const a=source.indexOf('  const worldPreviews='),b=source.indexOf('  const worldOnlyGoods=',a);
assert.ok(a>=0&&b>a,'world thumbnail markup exists');
const makeWorldPreviews=new Function('purchased','id','img','esc',source.slice(a,b)+';return worldPreviews;');
const previews=makeWorldPreviews([{id:'background_candy',name:'Candy',cardPreview:'candy.jpg'},{id:'background_pirate',name:'Pirate',cardPreview:'pirate.jpg'}],
 'background_candy',(p,n)=>'<img src="'+p+'" alt="'+n+'">',s=>s);
assert.equal((previews.match(/data-stuff-world=/g)||[]).length,2,'one preview per owned world');
assert.match(previews,/aria-pressed="true"/);assert.match(previews,/aria-pressed="false"/);
assert.match(previews,/candy\.jpg/);assert.match(previews,/pirate\.jpg/);
const start=source.indexOf(' function enableCollectionDrag(id){'),end=source.indexOf(' function computer(',start);
assert.ok(start>=0&&end>start,'scene drag function exists');
const makeDrag=new Function('$','a','directions','document','save','removeSceneObject',source.slice(start,end)+';return enableCollectionDrag;');
let saves=0;const removed=[];
const sprite=key=>({dataset:{worldObject:key},style:{left:'20%',top:'30%'},classList:{add(){},remove(){}},
 setAttribute(){},getAttribute:()=>key,append(child){this.removeButton=child},
 getBoundingClientRect:()=>({left:0,top:0,width:80,height:80}),setPointerCapture(){}});
const player=sprite('cosmo_fox'),decoration=sprite('decor:lamp');
const scene={querySelectorAll:()=>[player,decoration],getBoundingClientRect:()=>({left:0,top:0,width:800,height:500})};
const state={selectedPlayerCharacterId:'cosmo_fox',positions:{background_candy:{}},friends:{cosmo_fox:{homeLandId:'background_candy'}},wallet:{rainbowStars:55}};
const $=id=>id==='collection-scene'?scene:{set textContent(v){this.value=v}};
makeDrag($,state,{ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},
 {createElement:()=>({setAttribute(){}})},()=>saves++,(id,key)=>removed.push(key))('background_candy');
assert.equal(player.tabIndex,0,'current player is keyboard focusable');
assert.equal(player.removeButton,undefined,'cannot accidentally delete current player');
assert.ok(decoration.removeButton,'decorations remain removable');
player.onkeydown({key:'ArrowRight',preventDefault(){},stopPropagation(){}});
assert.equal(state.positions.background_candy.cosmo_fox.x,23,'arrow moves player');
assert.equal(saves,1,'player position is saved');
decoration.onkeydown({key:'Delete',preventDefault(){}});
assert.deepEqual(removed,['decor:lamp'],'decoration remove behavior preserved');
const moveStart=source.indexOf("  $('stuff-move-player').onclick=()=>{");
const moveEnd=source.indexOf("  $('stuff-help').onclick=",moveStart);
assert.ok(moveStart>=0&&moveEnd>moveStart);
const bindMove=new Function('$','a','playerId','id','save','computer','document',source.slice(moveStart,moveEnd));
const buttons={'stuff-move-player':{},'collection-report':{}};
const moveState={friends:{cosmo_fox:{homeLandId:'background_candy'}},wallet:{rainbowStars:55},
 completedLevelIds:['lab_candy_1'],mazeRuns:{unfinished:{id:'unfinished'}}};
const worlds=[];let moveSaves=0,focusCount=0;
const findPlayer={querySelectorAll:()=>[{dataset:{worldObject:'cosmo_fox'},focus(){focusCount++}}]};
const button=id=>buttons[id];
bindMove(button,moveState,'cosmo_fox','background_pirate',()=>moveSaves++,id=>worlds.push(id),findPlayer);
buttons['stuff-move-player'].onclick();
assert.equal(moveState.friends.cosmo_fox.homeLandId,'background_pirate');
assert.deepEqual(worlds,['background_pirate']);assert.equal(moveSaves,1);
assert.equal(moveState.wallet.rainbowStars,55,'world transfer never spends stars');
assert.deepEqual(moveState.completedLevelIds,['lab_candy_1'],'world transfer preserves completions');
assert.ok(moveState.mazeRuns.unfinished,'world transfer preserves unfinished maze');
bindMove(button,moveState,'cosmo_fox','background_pirate',()=>moveSaves++,id=>worlds.push(id),findPlayer);
buttons['stuff-move-player'].onclick();
assert.equal(focusCount,1,'same-world move focuses existing player');
assert.equal(moveSaves,1,'focusing player does not change saves');
console.log('PASS: owned world picture strip, player keyboard positioning, safe transfer, retained saves and decor controls');
