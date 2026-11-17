/** Regression: second-grade ownership requires earned rescues; first-grade avatars unchanged.
 * Existing student layout IDs remain saved even when legacy free characters are hidden.
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
test('Second grade: only genuinely rescued characters appear in My Stuff',()=>{
 const state={progress:{scenePlanet:0,playerId:'astro-pup',purchases:[],rescued:[],
  mapTwo:{rescued:[]},worldScene:[{id:'avatar:self',planet:0,x:42,y:58,scale:1.4},
  {id:'friend:launch',planet:0,x:33,y:50,scale:2},
  {id:'lostfriend:lost-aurora',planet:0,x:72,y:48,scale:2}]},scenePending:null};
 const source=read('./app.mjs');
 const render=renderFunction(source,'activeScenePlanet','function errorPage()',{
  state,PLANETS:[{id:'launch',name:'Candy Moon',friend:'Stella'},{id:'moon',name:'Rocket Launch',friend:'Turtle'}],
  LOST_WORLDS:[{id:'lost-aurora',name:'Aurora Garden',friend:'Lumi',friendImage:'/lumi.png'}],
  sceneUnlocked:(_progress,index)=>index===0,SPACE_SHOP:[],SHOP_SPRITES:{},
  earnedItems:()=>[],friendPortrait:()=>'/earned-bunny.png',planetImage:()=>'/planet.jpg',
  art:picture,esc:String
 });
 const previous=JSON.stringify(state.progress.worldScene);
 let html=render();
 assert.doesNotMatch(html,/data-place-item="avatar:self"/);
 assert.doesNotMatch(html,/data-move-scene="avatar:self"/);
 assert.doesNotMatch(html,/data-place-item="friend:launch"/);
 assert.doesNotMatch(html,/data-place-item="lostfriend:lost-aurora"/);
 state.progress.rescued=['launch'];
 html=render();
 assert.match(html,/data-place-item="friend:launch"/);
 assert.match(html,/data-move-scene="friend:launch"/);
 assert.doesNotMatch(html,/data-place-item="lostfriend:lost-aurora"/);
 state.progress.mapTwo.rescued=['lost-aurora'];
 html=render();
 assert.match(html,/data-place-item="lostfriend:lost-aurora"/);
 assert.match(html,/data-move-scene="lostfriend:lost-aurora"/);
 assert.equal(JSON.stringify(state.progress.worldScene),previous,'Old layout records must be retained unchanged');
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

test('Both My Stuff scenes support 5x pictures while keeping action buttons unscaled',()=>{
 for(const [appPath,cssPath] of [
  ['./app.mjs','./app.css'],
  ['../arrow-naut-jr/app.mjs','../arrow-naut-jr/style.css']]){
  const app=read(appPath),css=read(cssPath);
  assert.match(app,/Math\.max\(\.5,Math\.min\(5,Number\([xe]\.scale\)\|\|1\)\)/,
   appPath+' must render up to 5x, including existing saved items');
  assert.match(app,/scene-resizable-art/,
   appPath+' must wrap only the illustration, not the buttons');
  assert.match(app,/data-scene-scale="bigger"/,
   appPath+' must retain the plus button');
  assert.match(app,/data-scene-scale="smaller"/,
   appPath+' must retain the minus button');
  assert.match(css,/\.scene-resizable-art\{[\s\S]*?transform:scale\(var\(--scene-scale,1\)\)/,
   cssPath+' must scale artwork, not controls');
 }
});
test('Junior bad guys are pictures with no distracting BAD GUY or BLOCK captions',()=>{
 const app=read('../arrow-naut-jr/app.mjs');
 assert.doesNotMatch(app,/junior-danger-label">BAD GUY/,
  'moving and rescue enemies should not display BAD GUY labels');
 assert.doesNotMatch(app,/junior-block-label">BLOCK/,
  'ice walls and other blocks should show art only, no BLOCK label');
 assert.match(app,/moving-enemy-picture/,
  'moving enemy original pictures must stay visible');
 assert.match(app,/enemy-picture/,
  'rescue enemy original pictures must stay visible');
});

test('Both games show picture-labeled navigation and a direct Home Map exit from Shop and My Stuff',()=>{
 for(const path of ['./app.mjs','../arrow-naut-jr/app.mjs']){
  const source=read(path);
  const header=source.slice(source.indexOf('function header(){'),source.indexOf('function ',source.indexOf('function header(){')+10));
  const shop=source.slice(source.indexOf('function shop(){'),source.indexOf('function ',source.indexOf('function shop(){')+10));
  const stuff=source.slice(source.indexOf('function stuff(){'),source.indexOf('function ',source.indexOf('function stuff(){')+10));
  assert.match(header,/🏠 Home Map/,path+' needs an icon and words on Home Map navigation');
  assert.match(header,/⭐ Star Shop/,path+' needs a star shop icon');
  assert.match(header,/🎒 My Stuff/,path+' needs a bag icon');
  assert.match(shop,/class="kid-home-button" data-action="home"/,path+' shop should have a direct Home Map button');
  assert.match(stuff,/class="kid-home-button" data-action="home"/,path+' My Stuff should have a direct Home Map button');
  assert.match(shop,/data-action="stuff"/,path+' shop should have a visible My Stuff button');
  assert.match(stuff,/data-action="shop"/,path+' My Stuff should have a visible Shop button');
 }
});
