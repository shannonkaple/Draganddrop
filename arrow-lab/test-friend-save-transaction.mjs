import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {upgradeFriend, placeFriend} from './adventure-core.mjs';

const source = readFileSync(new URL('./adventure.mjs', import.meta.url), 'utf8');
const begin = source.indexOf('function commitSceneMutation(change,fields){');
const finish = source.indexOf('function buyHome(id){', begin);
assert.ok(begin >= 0 && finish > begin, 'find the actual production transaction helper');
const helper = source.slice(begin, finish);

function harness(progress, mode) {
  let writes = 0;
  const commit = Function('a', 'persist', `let saved=false;function save(){try{saved=!!persist()}catch{saved=false}};${helper};return commitSceneMutation`)(progress, () => {
    writes++;
    if (mode === 'throw') throw new Error('Storage quota exceeded');
    return mode === 'ok';
  });
  return {commit, writes: () => writes};
}
function profile() {
  return {
    wallet: {rainbowStars: 12, legacyTokens: 7},
    friends: {hero: {upgradeStage: 'starter', homeLandId: 'background_candy'}},
    ownedWorldIds: ['background_candy', 'background_pirate'],
    completedLevelIds: ['lab_candy_1'],
    positions: {background_candy: {hero: {x: 20, y: 40}}}
  };
}
const costs = {power_up: 3, super_power_additional: 4};

for (const mode of ['ok', 'ignored', 'throw']) {
  test(`character upgrade ${mode}: transaction keeps wallet and stage consistent`, () => {
    const a = profile(), before = structuredClone(a), {commit, writes} = harness(a, mode);
    const changed = commit(() => upgradeFriend(a, 'hero', costs), ['wallet', 'friends']);
    assert.equal(changed, mode === 'ok');
    assert.equal(writes(), 1);
    if (mode === 'ok') {
      assert.equal(a.wallet.rainbowStars, 9);
      assert.equal(a.friends.hero.upgradeStage, 'power_up');
      assert.equal(a.wallet.legacyTokens, 7);
    } else assert.deepEqual(a, before);
  });
  test(`friend placement ${mode}: no unsaved world move`, () => {
    const a = profile(), before = structuredClone(a), {commit, writes} = harness(a, mode);
    const changed = commit(() => placeFriend(a, 'hero', 'background_pirate'), ['friends']);
    assert.equal(changed, mode === 'ok');
    assert.equal(writes(), 1);
    if (mode === 'ok') assert.equal(a.friends.hero.homeLandId, 'background_pirate');
    else assert.deepEqual(a, before);
  });
}
test('insufficient stars do not write or change the character', () => {
  const a = profile(); a.wallet.rainbowStars = 0;
  const before = structuredClone(a), {commit, writes} = harness(a, 'ok');
  assert.equal(commit(() => upgradeFriend(a, 'hero', costs), ['wallet', 'friends']), false);
  assert.equal(writes(), 0);
  assert.deepEqual(a, before);
});
test('unowned world placement is rejected without a write', () => {
  const a = profile(), before = structuredClone(a), {commit, writes} = harness(a, 'ok');
  assert.equal(commit(() => placeFriend(a, 'hero', 'background_lava'), ['friends']), false);
  assert.equal(writes(), 0);
  assert.deepEqual(a, before);
});
test('UI celebration and world navigation occur only after verified transaction', () => {
  assert.match(source, /if\(commitSceneMutation\(\(\)=>upgradeFriend\(a,b\.dataset\.upgrade,costs\),\['wallet','friends'\]\)\)\{celebrate\(/);
  assert.match(source, /const placed=commitSceneMutation\(\(\)=>placeFriend\(a,id,world\),\['friends'\]\);if\(!placed\)return;pendingFriend=null;sound\(\);computer\(/);
});
