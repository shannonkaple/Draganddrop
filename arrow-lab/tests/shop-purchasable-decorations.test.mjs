import assert from 'node:assert/strict';
import {newShopDecorationCatalog,publishedShopDecorations,isPublishedPngResponse,catalogWithArtAvailability} from '../shop-purchasable-decorations.mjs';

// No bundled sheets, borrowed collectible images or placeholder SVGs may be sold.
assert.equal(newShopDecorationCatalog.length,36);
assert.equal(new Set(newShopDecorationCatalog.map(item=>item.id)).size,36);
for(const world of ['space','jurassic','lava','ocean']) {
 const items=newShopDecorationCatalog.filter(item=>item.world===world);
 assert.equal(items.length,9,world+' needs 9 original shop-only items');
 for(const item of items) {
  assert.equal(item.shopOnly,true);
  assert.equal(item.kind,'decor');
  assert.ok(item.cost>0);
  assert.match(item.artPath,new RegExp('^arrow-lab/shop-decor/'+world+'/[^/]+\\.png$'));
  assert.ok(!item.artPath.includes('collectibles/'));
 }
}
const missing=await publishedShopDecorations(async()=>false);
assert.deepEqual(missing,[], 'do not display purchasable items with missing PNG art');
const result=await publishedShopDecorations(async path=>path.includes('/space/'));
assert.equal(result.length,9, 'published art activates only its own themed store');
const error=await publishedShopDecorations(async path=>{if(path.includes('/ocean/')) throw Error('not uploaded');return true;});
assert.equal(error.length,27,'one failed world must not block other available artwork');
// GitHub Pages can serve an HTML fallback with status 200 for missing paths.
const response=(ok,type)=>({ok,headers:{get:name=>name==='content-type'?type:null}});
assert.equal(isPublishedPngResponse(response(true,'image/png')),true);
assert.equal(isPublishedPngResponse(response(true,'image/png; charset=binary')),true);
assert.equal(isPublishedPngResponse(response(true,'text/html')),false);
assert.equal(isPublishedPngResponse(response(false,'image/png')),false);
assert.equal(isPublishedPngResponse(response(true,null)),false);
assert.equal(isPublishedPngResponse(null),false);
console.log('PASS: all new shop IDs, one PNG per item, world exclusivity, and missing-art safety');

// A transient failed HEAD must not erase a previously bought item from MY STUFF.
const unavailableCatalog=catalogWithArtAvailability(newShopDecorationCatalog,[]);
assert.equal(unavailableCatalog.length,36);
assert.ok(unavailableCatalog.every(item=>item.artUnavailable===true));
assert.deepEqual(unavailableCatalog.map(item=>item.id),newShopDecorationCatalog.map(item=>item.id));
assert.notStrictEqual(unavailableCatalog[0],newShopDecorationCatalog[0]);
const mixedCatalog=catalogWithArtAvailability(newShopDecorationCatalog,newShopDecorationCatalog.filter(item=>item.world==='space'));
assert.equal(mixedCatalog.filter(item=>!item.artUnavailable).length,9);
assert.equal(mixedCatalog.filter(item=>item.artUnavailable).length,27);
assert.equal(mixedCatalog.find(item=>item.world==='ocean').artPath,newShopDecorationCatalog.find(item=>item.world==='ocean').artPath);
console.log('PASS: unavailable artwork preserves saved decoration metadata without enabling purchases');
