import assert from 'node:assert/strict';
import {makeLevel} from './levels.mjs';
import {arrowPattern} from '../../arrow-lab/adventure-core.mjs';
const items=Array.from({length:10},(_,i)=>({id:'art'+i,name:'Art '+i,image:'art'+i+'.png'}));
const orders=new Set();
for(let worldIndex=0;worldIndex<8;worldIndex++){
 const level=makeLevel({id:'test'+worldIndex,worldIndex,worldStage:5},{items,enemies:[],background:'bg.jpg'});
 assert.equal(level.patternVersion,2);assert.equal(level.legacyPattern.rounds[0].name,'AB');
 assert.equal(new Set(level.rounds.map(r=>r.name)).size,5);
 assert.equal(new Set(level.rounds.map(r=>r.palette.map(p=>p.id).join(','))).size,5);
 for(const r of level.rounds){assert.equal(new Set(r.palette.map(p=>p.id)).size,3);for(const t of r.fixed)assert.equal(t.asset.id,r.palette['ABC'.indexOf(t.accept[0])].id);}
 orders.add(level.rounds.map(r=>r.name).join(','));
 assert.deepEqual(level,makeLevel({id:'test'+worldIndex,worldIndex,worldStage:5},{items,enemies:[],background:'bg.jpg'}));
}
assert.equal(orders.size,8);
assert.equal(new Set(Array.from({length:256},(_,seed)=>arrowPattern(seed).join(','))).size,256);
for(let seed=0;seed<64;seed++)assert.notDeepEqual(arrowPattern(seed),arrowPattern(seed,1));
console.log('PASS eight distinct world schedules, five picture palettes per world, stable reload, legacy configuration retained, 256 arrow patterns');
