import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../my-stuff-picture-first-20261030.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=script.indexOf("shell('MY STUFF','<section");
const end=script.indexOf('enableCollectionDrag(id)',start);
const myStuff=script.slice(start,end);
test('My Stuff directions and three category buttons live in left rail',()=>{
 assert.ok(start>=0&&end>start);
 assert.match(myStuff,/class="my-stuff-side-panel"/);
 assert.ok(myStuff.indexOf('id="collection-report"')<myStuff.indexOf('</aside>'));
 for(const tab of ['worlds','characters','items']){
  assert.match(myStuff,new RegExp('data-stuff-tab="'+tab+'"'));
  assert.ok(myStuff.indexOf('data-stuff-tab="'+tab+'"')<myStuff.indexOf('</aside>'));
 }
});
test('original scene, shelf and placement hooks remain unchanged',()=>{
 for(const id of ['collection-scene','my-stuff-tray','stuff-scroll-prev','stuff-scroll-next','stuff-world-select']){
  assert.match(script,new RegExp(id));
 }
 assert.match(script,/enableCollectionDrag\(id\)/);
 assert.match(script,/activateCategory\(section\|\|inventoryCategory\)/);
});
test('image-first CSS is loaded last, preserves native ratio and grows thumbnails',()=>{
 assert.ok(html.lastIndexOf('my-stuff-picture-first-20261030.css')>html.lastIndexOf('header-and-menu-repair-20261030.css'));
 assert.match(css,/grid-column:1!important;grid-row:1 \/ 3!important/);
 assert.match(css,/grid-column:2!important;grid-row:2!important/);
 assert.match(css,/height:164px!important/);
 assert.match(css,/height:70px!important/);
 assert.match(css,/aspect-ratio:1672\/941!important/);
 assert.match(css,/background-size:contain!important/);
});
