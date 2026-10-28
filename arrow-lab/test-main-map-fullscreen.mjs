// Run: node arrow-lab/test-main-map-fullscreen.mjs
// Source-level map geometry and fullscreen modal-state regressions.
// Browser visual QA and the original 2048x682 image binary are independent checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const adventure=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const game=fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./classroom-layout.css',import.meta.url),'utf8');
const mapCss=fs.readFileSync(new URL('./world-map.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const image='arrow-lab/assets/arrow-adventure-eight-worlds-user-20261028.png';
assert.ok(adventure.includes(image),'user-provided exact 2048×682 PNG referenced by main map');
assert.match(adventure,/class="lab-map-art-frame"/,'correct proportional coordinate container');
assert.match(adventure,/class="lab-main-map-art"/,'map is an HTML image rather than stretched CSS background');
const match=adventure.match(/const coords=(\[\[[^;]+\]\]);/);
assert.ok(match,'eight approved map platform locations are defined');
const coords=JSON.parse(match[1]);
const expected=[[7.5,57],[19.7,45.8],[32.3,59.7],[43.2,45.6],[56.1,60.8],[67.6,45.6],[81.1,60.9],[92.7,45.7]];
assert.deepEqual(coords,expected);
assert.equal(coords.length,8);
assert.match(css,/aspect-ratio:2048\s*\/\s*682!important/,'source aspect preserved');
assert.match(css,/object-fit:contain!important/,'original art never cropped');
assert.match(css,/lab-map-fallback/,'old map kept safe if source PNG missing');
assert.doesNotMatch(mapCss,/\.svg(?:\?|['"])/,'SVG main world art gone');
assert.match(css,/#continue-adventure\.lab-next-play\{\n position:static!important/,'play next does not cover a circle');
assert.match(css,/lab-map-canvas>\.lab-world-node/,'hotspots over same image frame');
assert.match(css,/dialog#adventure-dialog\[open\]/,'fullscreen modal stays in viewport');
assert.match(game,/const dialogs=\[\.\.\.document\.querySelectorAll\('dialog\[open\]'\)\]/,'all open dialogs are remembered');
assert.match(game,/for\(const d of dialogs\)if\(d\.isConnected&&!d\.open\)/,'dialogs restored after fullscreen');
assert.match(game,/d\.showModal\(\)/,'native modal reopened in top layer');
assert.match(html,/world-map\.css\?v=/);
console.log('PASS: 8 exact platform centers, no-crop image frame, safe old map fallback, fullscreen modal stacking');
