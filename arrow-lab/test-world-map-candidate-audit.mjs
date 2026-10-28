// Run with: node arrow-lab/test-world-map-candidate-audit.mjs
// All seven existing illustrated world maps are recovered, NOT approved for
// classroom publication, until their art and all eight hotspots are reviewed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORLD_STOP_POINTS,APPROVED_WORLD_LEVEL_MAPS} from './level-map-model.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('./world-map-candidates-audit-20261028.json',import.meta.url),'utf8'));
assert.deepEqual(Object.keys(manifest.worlds),['pirate','arctic','castle','space','jurassic','ocean','lava']);
assert.deepEqual(manifest.baseImage,{width:2048,height:682});
assert.deepEqual(manifest.referenceStopCentersPercent,WORLD_STOP_POINTS.map(p=>[p.x,p.y]));
assert.deepEqual(Object.keys(APPROVED_WORLD_LEVEL_MAPS),['candy'],'Approved original Candy art is unchanged');
for(const [world,entry] of Object.entries(manifest.worlds)){
 assert.equal(entry.status,'published-needs-live-visual-qa',world);
 assert.equal(entry.width,2048,world);
 assert.equal(entry.height,682,world);
 assert.match(entry.sha256,/^[0-9a-f]{64}$/,world);
 assert.equal(entry.measuredStopCentersPercent.length,8,world);
 assert.equal(entry.referenceStopCentersPercent.length,8,world);
 assert.match(entry.candidateLibraryPath,new RegExp(world+'-world-map\\.jpg$'));
 assert.match(entry.intendedGithubPath,new RegExp(world+'-world-map\\.jpg$'));
 assert.ok(entry.maxDeviationFromCandyPx>10,world+' should not be treated as aligned');
 for(const [x,y] of entry.measuredStopCentersPercent){
  assert.ok(x>=0&&x<=100&&y>=0&&y<=100,world+' has an invalid hotspot');
 }
}
const adventure=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
assert.match(adventure,/const approved=APPROVED_WORLD_LEVEL_MAPS\[world\.id\]\|\|null/);
assert.doesNotMatch(adventure,/asset\(['"]arrow-lab\/world-maps\/(?:pirate|arctic|castle|space|jurassic|ocean|lava)/,'Never hardwire unapproved map art');
console.log('PASS: original seven world JPEGs published for visual QA, 56 image-matched centers retained');
