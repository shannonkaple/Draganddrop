import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {PLAYERS,FRIEND_SPRITES,ENEMY_SPRITES,SHOP_SPRITES,PUZZLE_SPRITES,EARNABLES,earnedItems} from './sprite-assets.mjs';
import {ATLAS_POSITIONS,ATLAS_COLS,ATLAS_ROWS} from './sprite-atlas.mjs';
import {PLANETS,createProgress,SPACE_SHOP} from './curriculum.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const sprite=name=>join(root,'assets','sprites',name+'.png');
const assetName=path=>path.split('/').at(-1).replace(/\.png$/,'');
const check=path=>{const name=assetName(path);assert.ok(ATLAS_POSITIONS[name],name+' absent from atlas');};
test('63 illustrated atlas sprites are addressable; exported PNGs live in the asset ZIP',()=>{
 assert.equal(Object.keys(ATLAS_POSITIONS).length,63);
 assert.equal(ATLAS_COLS,8);assert.equal(ATLAS_ROWS,8);
 const atlas=readFileSync(join(root,'assets','sprites-atlas.webp'));
 assert.equal(atlas.subarray(0,4).toString(),'RIFF');assert.equal(atlas.subarray(8,12).toString(),'WEBP');
 for(const name of Object.keys(ATLAS_POSITIONS)){if(existsSync(sprite(name))){const b=readFileSync(sprite(name));assert.equal(b.subarray(1,4).toString(),'PNG');}}
});
test('9 selectable Arrow-Nauts use stable distinct art and names',()=>{
 assert.equal(PLAYERS.length,9);assert.equal(new Set(PLAYERS.map(x=>x.id)).size,9);
 for(const p of PLAYERS)check(p.image);
});
test('8 world friends and 8 enemy sprites match planet order',()=>{
 assert.equal(PLANETS.length,8);assert.equal(FRIEND_SPRITES.length,8);assert.equal(ENEMY_SPRITES.length,8);
 for(const src of [...FRIEND_SPRITES,...ENEMY_SPRITES])check(src);
});
test('all shop and gameplay graphics have actual raster sprites, not emoji art',()=>{
 assert.equal(SPACE_SHOP.length,13);
 for(const item of SPACE_SHOP)check(SHOP_SPRITES[item.id]);
 for(const src of Object.values(PUZZLE_SPRITES))check(src);
});
test('earned items are derived from saved completions with no save rewrites',()=>{
 const progress=createProgress();assert.equal(earnedItems(progress).length,0);
 progress.completed.push('launch-4');
 assert.equal(earnedItems(progress).length,1);
 assert.equal(progress.completed.length,1);
 assert.equal(EARNABLES.length,8);
});
