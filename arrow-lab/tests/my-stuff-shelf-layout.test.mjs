// node --test arrow-lab/tests/my-stuff-shelf-layout.test.mjs
// Static regression guard; real Chromebook/mobile visual QA remains mandatory.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const css=read('../scene-shelf-and-mobile-layout.css');
const index=read('../index.html');
const viewport=read('../viewport.mjs');
const game=read('../game.mjs');
const adventure=read('../adventure.mjs');

test('the final stylesheet replaces the clipped 2x2 inventory grid with a horizontal scrollable shelf BELOW the scene',()=>{
 assert.ok(index.includes('scene-shelf-and-mobile-layout.css?v='));
 assert.ok(index.indexOf('scene-shelf-and-mobile-layout.css')>index.indexOf('classroom-layout.css'));
 assert.match(css,/\.my-stuff-room\s*\{[\s\S]*?grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/\.my-stuff-stage\s*\{[\s\S]*?grid-row:2!important/);
 assert.match(css,/\.my-stuff-toolbox\s*\{[\s\S]*?grid-row:4!important/);
 assert.match(css,/#my-stuff-tray\s*\{[\s\S]*?display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;[\s\S]*?overflow-x:auto!important;overflow-y:hidden!important/);
 assert.ok(adventure.includes("trayEl.scrollLeft=inventoryScrollLeft"));
 assert.ok(adventure.includes("trayEl.scrollBy({left:"));
 assert.ok(adventure.includes("trayEl.scrollLeft+trayEl.clientWidth>=trayEl.scrollWidth-1"));
 assert.ok(adventure.includes("const treasures=earnedKeys(a)"));
 assert.ok(adventure.includes("treasureCards+friendCards+decorationCards"));
});

test('mobile uses full viewport width and scrolls to visible touch arrows instead of hiding them',()=>{
 assert.ok(viewport.includes("const mobile=document.body.classList.contains('mobile-touch-enabled')"));
 assert.ok(viewport.includes("const left=guided&&!mobile"));
 assert.match(css,/\.mobile-touch-enabled #kaple-guide\{display:none!important\}/);
 assert.match(css,/\.mobile-touch-enabled\.guided\.adventure-mode\.playing #app\s*\{[\s\S]*?overflow-y:auto!important/);
 assert.match(css,/#app>\.adventure-layout\s*\{[\s\S]*?flex:0 0 auto!important/);
 assert.match(css,/#app>\.mobile-arrow-pad\s*\{[\s\S]*?flex:0 0 auto!important/);
 assert.ok(adventure.includes("mobileTouch?'This is your world! Touch and drag"));
 assert.ok(adventure.includes("mobileTouch?'Tap an item, then tap an empty spot"));
});

test('the browser loads refreshed scripts while keeping both viewport imports identical',()=>{
 assert.ok(index.includes('./game.mjs?v=mobile-fullwidth-shelf-20261028b'));
 assert.ok(game.includes('./adventure.mjs?v=mobile-fullwidth-shelf-20261028b'));
 assert.ok(game.includes('./viewport.mjs?v=mobile-fullwidth-shelf-20261028a'));
 assert.ok(adventure.includes('./viewport.mjs?v=mobile-fullwidth-shelf-20261028a'));
});
