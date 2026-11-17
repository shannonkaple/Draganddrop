import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
function section(start,end){
 const from=source.indexOf(start),to=source.indexOf(end,from);
 assert.ok(from>=0&&to>from,'Committed purchase function must exist');
 return source.slice(from,to);
}
// Exercise the actual committed closures with an isolated student record,
// rather than duplicating their purchase logic inside the test.
const purchaseCode=section(' function commitPurchase(', ' function shopArt(')+
 '\n'+section(' function buyShopExclusive(', ' function starShop(');
function fixture({saved=true,stars=10,pirateOwned=false,emptyInventory=false}={}){
 const lands=[{id:'background_candy',theme:'candy'},{id:'background_pirate',theme:'pirate'}];
 const student={
  wallet:{rainbowStars:stars},
  ownedWorldIds:pirateOwned?['background_candy','background_pirate']:['background_candy'],
  primaryRainbowLandId:'background_candy',
  decorations:emptyInventory?{}:{background_pirate:['prior_item']},
  hiddenDecorations:emptyInventory?{}:{background_pirate:['prior_item']},
  mazeRuns:{unfinished:{player:{x:4,y:5}}},
  worldFriends:{candy:{isRescued:true}}
 };
 let refreshes=0,writes=0;
 const context={
  a:student,lands,backgroundHomes:lands,worldCosts:[0,4],saved,
  land:id=>lands.find(w=>w.id===id),
  owned:id=>student.ownedWorldIds.includes(id),
  shopExclusives:[{id:'shop_pirate_flag',world:'pirate',cost:3}],
  save:()=>{writes++},
  syncBannerStars:()=>{refreshes++}
 };
 const actions=runInNewContext(purchaseCode+'\n({buyHome,buyShopExclusive})',context);
 return {student,...actions,refreshes:()=>refreshes,writes:()=>writes};
}
const snapshot=student=>JSON.stringify(student);

test('failed world purchase restores stars, ownership, and every unrelated save field',()=>{
 const f=fixture({saved:false}),before=snapshot(f.student);
 assert.equal(f.buyHome('background_pirate'),false);
 assert.equal(snapshot(f.student),before);
 assert.equal(f.writes(),1);
 assert.equal(f.refreshes(),1);
});
test('successful world purchase deducts once and retains prior progress',()=>{
 const f=fixture(),progress=snapshot(f.student.mazeRuns);
 assert.equal(f.buyHome('background_pirate'),true);
 assert.equal(f.student.wallet.rainbowStars,6);
 assert.equal(f.student.ownedWorldIds.includes('background_pirate'),true);
 assert.equal(snapshot(f.student.mazeRuns),progress);
});
test('failed visit to an already-owned world restores the prior home',()=>{
 const f=fixture({saved:false,pirateOwned:true}),before=snapshot(f.student);
 assert.equal(f.buyHome('background_pirate'),false);
 assert.equal(snapshot(f.student),before);
});
test('failed shop-only purchase restores stars, inventory and hidden items',()=>{
 const f=fixture({saved:false,pirateOwned:true}),before=snapshot(f.student);
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),false);
 assert.equal(snapshot(f.student),before);
 assert.equal(f.refreshes(),1);
});
test('failed shop-only purchase does not leave a new empty-world inventory',()=>{
 const f=fixture({saved:false,pirateOwned:true,emptyInventory:true}),before=snapshot(f.student);
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),false);
 assert.equal(snapshot(f.student),before);
});
test('successful shop-only purchase adds one item, deducts once, and retains saves',()=>{
 const f=fixture({pirateOwned:true}),before=snapshot(f.student.mazeRuns);
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),true);
 assert.equal(f.student.wallet.rainbowStars,7);
 assert.equal(f.student.decorations.background_pirate.includes('shop_pirate_flag'),true);
 assert.equal(snapshot(f.student.mazeRuns),before);
 assert.equal(f.refreshes(),0);
});
test('duplicate shop-only purchase never charges twice',()=>{
 const f=fixture({pirateOwned:true});
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),true);
 const after=snapshot(f.student);
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),false);
 assert.equal(snapshot(f.student),after);
});
test('insufficient stars rejects a purchase without writing',()=>{
 const f=fixture({pirateOwned:true,stars:2}),before=snapshot(f.student);
 assert.equal(f.buyShopExclusive('background_pirate','shop_pirate_flag'),false);
 assert.equal(snapshot(f.student),before);
 assert.equal(f.writes(),0);
});
