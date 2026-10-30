// Arrow Lab header regression guard. Run: node --test arrow-lab/tests/header-menu-layout-contract.test.mjs
// Static checks only; visual overlap still needs Chromebook browser acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../header-and-menu-repair-20261030.css',import.meta.url),'utf8');
test('original single JPEG is used on the header (not SVG or overlaid text)',()=>{
 assert.match(html,/<img[^>]+id="lab-jpeg-banner"[^>]+src="\.\/assets\/arrow-adventure-header-user-20261028\.jpg"/);
 assert.match(html,/header-and-menu-repair-20261030\.css\?v=3/);
 assert.ok(html.lastIndexOf('header-and-menu-repair-20261030.css')>html.lastIndexOf('drag-drop-page-parity-20261030.css'));
 assert.doesNotMatch(html,/text headings replace|#lab-jpeg-banner\s*\{\s*display:none/i);
});
test('teacher picker, student number picker, and world map explicitly show JPEG',()=>{
 for(const selector of ['.lab-teacher-active','.lab-number-active','.lab-map-active']){
  assert.ok(css.includes(selector),'missing page selector '+selector);
 }
 assert.match(css,/\.brand>img#lab-jpeg-banner/);
 assert.match(css,/object-fit:contain!important/);
 assert.match(css,/aspect-ratio:6\/1!important/);
 assert.match(css,/width:100%!important;height:auto!important/);
});
test('menu lives in a distinct measured row and wraps under 1300px',()=>{
 assert.match(css,/\.lab-reference-toolbar\s*\{[\s\S]*?display:grid!important/);
 assert.match(css,/grid-auto-rows:minmax\(44px,auto\)!important/);
 assert.match(css,/@media\(max-width:1299px\)/);
 assert.match(css,/\.toolbar-center\{grid-column:1!important;grid-row:2!important/);
 assert.match(css,/\.toolbar-right\{grid-column:2!important;grid-row:2!important/);
 assert.match(css,/overflow:visible!important/);
});
test('content follows measured header and preserves login scrolling',()=>{
 assert.match(css,/top:var\(--screen-top,160px\)!important/);
 assert.match(css,/lab-teacher-active,.lab-number-active\) #app\{[\s\S]*?overflow-y:auto!important/);
});

test('banner has a dedicated clickable Store button in addition to Stars',()=>{
 const game=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
 assert.match(html,/id="lab-header-store"[^>]*>[^<]*Store<\/button>/);
 assert.match(html,/id="lab-banner-stars"/);
 assert.match(game,/\$\('lab-header-store'\)\.onclick=\(\)=>navigate\('shop'\)/);
 assert.match(css,/\.toolbar-center #lab-header-store:not\(\[hidden\]\):not\(\.hidden\)\{/);
 assert.doesNotMatch(css,/#lab-header-store\{display:none!important/);
 assert.match(css,/@media\(max-width:800px\)/);
});
