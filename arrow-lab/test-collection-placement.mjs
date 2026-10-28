// Run with node arrow-lab/test-collection-placement.mjs.
// This tests the actual inventory state mutations without replacing student saves.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 isSupportedCollectibleArt,earnedKeys,visibleCollectedKeys,toggleCollectedInWorld
} from './collection-inventory.mjs';

assert.equal(isSupportedCollectibleArt('arrow-lab/collectibles/candy/lollipop.png'),true);
assert.equal(isSupportedCollectibleArt('/game-assets/collectibles/computer/mouse_256.png'),true);
assert.equal(isSupportedCollectibleArt('treasure.jpeg?v=2'),true);
assert.equal(isSupportedCollectibleArt('background.jpg'),true);
assert.equal(isSupportedCollectibleArt('fake-collectible.svg'),false);
assert.equal(isSupportedCollectibleArt('fake-collectible.svg?x=y'),false);
assert.equal(isSupportedCollectibleArt('model.webp'),false);

const world='background_candy',world2='background_pirate';
const state={
 wallet:{rainbowStars:81},
 completedLevelIds:['lab_candy_1'],
 ownedWorldIds:[world,world2],
 selectedPlayerCharacterId:'cosmo_fox',
 collectedWorldItems:['lollipop','treasure_chest','lollipop'],
 collectedComputerGearIds:['keyboard'],
 earnedSkillBadgeIds:['arrows'],
 collectionExtraObjects:{},
 positions:{[world]:{'cosmo_fox':{x:11,y:31}}}
};
const original=JSON.stringify(state);
assert.deepEqual(earnedKeys(state),['lollipop','treasure_chest','keyboard','arrows']);
assert.deepEqual(visibleCollectedKeys(state,world),[]);
assert.deepEqual(toggleCollectedInWorld(state,world,'not-earned'),{changed:false,added:false});
const result=toggleCollectedInWorld(state,world,'lollipop');
assert.equal(result.changed,true);
assert.equal(result.added,true);
assert.deepEqual(visibleCollectedKeys(state,world),['lollipop']);
assert.ok(result.position.x>=30&&result.position.x<=70,'new item starts inside view');
assert.ok(result.position.y>=30&&result.position.y<=75,'new item starts inside view');
assert.deepEqual(state.positions[world].cosmo_fox,{x:11,y:31},'do not move player');
toggleCollectedInWorld(state,world,'keyboard');
toggleCollectedInWorld(state,world2,'arrows');
assert.deepEqual(visibleCollectedKeys(state,world),['lollipop','keyboard']);
assert.deepEqual(visibleCollectedKeys(state,world2),['arrows']);
assert.equal(toggleCollectedInWorld(state,world,'lollipop').added,false);
assert.deepEqual(visibleCollectedKeys(state,world),['keyboard']);
assert.ok(earnedKeys(state).includes('lollipop'),'put-away treasure still owned');
assert.equal(state.wallet.rainbowStars,81);
assert.deepEqual(state.ownedWorldIds,[world,world2]);
assert.deepEqual(state.completedLevelIds,['lab_candy_1']);
const restored=JSON.parse(JSON.stringify(state));
assert.deepEqual(visibleCollectedKeys(restored,world),['keyboard'],'placements survive JSON save/reload');
assert.notEqual(JSON.stringify(state),original,'toggle is a real state mutation');

const game=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./classroom-layout.css',import.meta.url),'utf8');
assert.match(game,/toggleCollectedInWorld\(a,id,key\)/,'button calls saved placement helper');
assert.match(game,/const treasureGoods=visibleCollectedKeys\(a,id\)/,'world actually renders placed treasures');
assert.match(game,/const treasures=earnedKeys\(a\)/,'owned collectibles appear in MY STUFF');
assert.match(game,/\.filter\(canSpawnPickup\)/,'new pickups are restricted to PNG/JPEG');
assert.match(game,/hasObjects\?treasureCards\+friendCards\+decorationCards/,'collected items listed first');
assert.match(css,/scroll-snap-type:x proximity!important/,'collected inventory scrolls on Chromebook');
assert.match(css,/\.world-object\.recently-added/,'newly placed items are highlighted');
console.log('PASS: PNG/JPEG policy, saved inventory, two worlds, placement, remove, persistence, Chromebook shelf');
