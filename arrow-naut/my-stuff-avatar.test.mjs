/** Regression: an explorer is a free, placeable My Stuff item in both grades.
 * Placement ID must remain stable when the student changes characters.
 * Run: node --test arrow-naut/my-stuff-avatar.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const picture=(src,alt,cls)=>`<img src="${src}" alt="${alt}" class="${cls}">`;
function renderFunction(source,helperName,endMark,dependencies){
 const begin=source.indexOf('const '+helperName+'=()=>');
 const end=source.indexOf(endMark,begin);
 assert.ok(begin>=0&&end>begin,'My Stuff renderer must keep a testable visible-world helper');
 const code=source.slice(begin,end)+'\nreturn stuff;';
 return new Function(...Object.keys(dependencies),code)(...Object.values(dependencies));
}
test('Second grade: students can place their own character without buying it, change character without losing placement',()=>{
 const state={progress:{scenePlanet:0,playerId:'one',purchases:[],rescued:[],
  worldScene:[{id:'avatar:self',planet:0,x:42,y:58,scale:1.4}]},scenePending:null};
 const source=read('./app.mjs');
 const render=renderFunction(source,'activeScenePlanet','function errorPage()',{
  state,PLANETS:[{id:'candy',name:'Candy Moon',friend:'Bunny'},{id:'rocket',name:'Rocket Launch',friend:'Turtle'}],
  sceneUnlocked:(_progress,index)=>index===0,SPACE_SHOP:[],SHOP_SPRITES:{},
  earnedItems:()=>[],friendPortrait:()=>'',planetImage:()=>'/planet.jpg',
  playerPortrait:id=>id==='one'?'/hero-one.png':'/hero-two.png',
  art:picture,esc:String
 });
 let html=render();
 assert.match(html,/data-place-item="avatar:self"/);
 assert.match(html,/data-move-scene="avatar:self"/);
 assert.match(html,/MY CHARACTER/);
 assert.match(html,/hero-one\.png/);
 assert.match(html,/--scene-scale:1\.4/);
 const original=JSON.stringify(state.progress.worldScene);
 state.progress.playerId='two';
 html=render();
 assert.match(html,/hero-two\.png/);
 assert.doesNotMatch(html,/hero-one\.png/);
 assert.match(html,/--scene-scale:1\.4/);
 assert.equal(JSON.stringify(state.progress.worldScene),original);
 state.progress.scenePlanet=1; // locked: still render and save in the visible world 0
 assert.match(render(),/data-move-scene="avatar:self"/);
 assert.match(source,/const planet=activeScenePlanet\(\)/);
 assert.match(source,/const world=activeScenePlanet\(\)/);
});
test('First grade: students can place their chosen astronaut and keep it in every scene on character changes',()=>{
 const characters=[{id:'one',name:'First astronaut',img:'/hero-one.png'},
  {id:'two',name:'Second astronaut',img:'/hero-two.png'}];
 const state={progress:{sceneWorld:0,character:'one',purchases:[],rescued:[],
  worldScene:[{key:'avatar:self',world:0,x:42,y:58,scale:1.6}]},pending:null};
 const source=read('../arrow-naut-jr/app.mjs');
 const render=renderFunction(source,'activeSceneWorld','function help()',{
  state,WORLDS:[{id:'candy',name:'Candy Moon',jpg:'/candy.jpg',friend:'/bunny.png'},
   {id:'rocket',name:'Rocket Launch',jpg:'/rocket.jpg',friend:'/turtle.png'}],
  sceneUnlocked:(_progress,index)=>index===0,ITEMS:[],
  chosen:()=>characters.find(x=>x.id===state.progress.character),
  fileImg:picture,esc:String
 });
 let html=render();
 assert.match(html,/data-place="avatar:self"/);
 assert.match(html,/data-move-scene="avatar:self"/);
 assert.match(html,/MY CHARACTER/);
 assert.match(html,/hero-one\.png/);
 assert.match(html,/--scene-scale:1\.6/);
 const original=JSON.stringify(state.progress.worldScene);
 state.progress.character='two';
 html=render();
 assert.match(html,/hero-two\.png/);
 assert.doesNotMatch(html,/hero-one\.png/);
 assert.match(html,/--scene-scale:1\.6/);
 assert.equal(JSON.stringify(state.progress.worldScene),original);
 state.progress.sceneWorld=1;
 assert.match(render(),/data-move-scene="avatar:self"/);
 assert.match(source,/world=activeSceneWorld\(\)/);
});
