import {createRequire} from 'node:module'; const {chromium}=createRequire(import.meta.url)('playwright');
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {segmentHitsRect} from './collision.mjs';
import {saveKey,legacyKey,copyLegacy} from './identity.mjs';
import {migrate,buyWorld,grow,place,buyDecoration,savePosition,switchPlayer,decorations} from './economy.mjs';
const obstacle={left:100,right:200,top:100,bottom:200};assert.ok(segmentHitsRect(0,150,400,150,obstacle,50));assert.ok(segmentHitsRect(0,70,400,70,obstacle,40));assert.ok(!segmentHitsRect(0,50,400,50,obstacle,40));assert.ok(segmentHitsRect(70,150,70,150,obstacle,40));
const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};storage.setItem(legacyKey(1),JSON.stringify({stars:7}));assert.equal(copyLegacy(storage,'class-01'),1);assert.equal(copyLegacy(storage,'class-02'),0);assert.ok(storage.getItem(legacyKey(1)));storage.setItem(saveKey('class-02',1),JSON.stringify({stars:2}));assert.equal(JSON.parse(storage.getItem(saveKey('class-01',1))).stars,7);assert.equal(JSON.parse(storage.getItem(saveKey('class-02',1))).stars,2);
const lands=JSON.parse(await fs.readFile('rainbow-road/data/rainbow_lands.json'));
const old=migrate({hero:'astro_ace',land:lands[0].id,stars:20,level:2,friends:['poppy_pup'],records:[{done:['mouse']}]},lands);assert.deepEqual(old.collection,['mouse']);assert.equal(old.homes.poppy_pup,lands[0].id);assert.equal(old.level,2);assert.ok(buyWorld(old,lands[1].id,lands));assert.equal(old.stars,14);assert.equal(buyWorld(old,lands[1].id,lands),false);assert.equal(old.stars,14);assert.equal(buyWorld(old,'invalid',lands),false);assert.ok(place(old,'poppy_pup',lands[1].id));assert.equal(place(old,'poppy_pup',lands[2].id),false);assert.ok(grow(old,'poppy_pup'));assert.ok(grow(old,'poppy_pup'));assert.equal(old.stars,6);assert.equal(grow(old,'poppy_pup'),false);assert.equal(grow(old,'stranger'),false);
const newcomer=migrate({hero:'astro_ace',land:lands[0].id,stars:6,level:0,friends:[],records:[]},lands);assert.equal(grow(newcomer,'astro_ace'),false);newcomer.stars=7;assert.ok(grow(newcomer,'astro_ace'));assert.equal(newcomer.stars,4);assert.ok(buyWorld(newcomer,lands[0].id,lands));
assert.ok(switchPlayer(newcomer,'poppy_pup',['astro_ace','poppy_pup']));assert.equal(newcomer.level,0);assert.ok(switchPlayer(newcomer,'astro_ace',['astro_ace','poppy_pup']));assert.equal(newcomer.level,1);assert.equal(switchPlayer(newcomer,'rigby',['astro_ace']),false);
for(const d of decorations)if(d.art)assert.ok((await fs.stat('trackpad-adventure/decorations/'+d.art+'.webp')).size>1000);

// Preserve the existing unit coverage, then exercise the current, JPEG-based world-map UI.
await import('./test-map.mjs');
