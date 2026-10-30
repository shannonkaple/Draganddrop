import assert from 'node:assert/strict';
import {navigateWithVerifiedSave} from './navigation-save-guard.mjs';

const cases = [
  ['successful verified write permits navigation', () => {
    let writes=0,leaves=0,warnings=0;
    assert.equal(navigateWithVerifiedSave(()=>{writes++;return true},()=>leaves++,()=>warnings++),true);
    assert.deepEqual([writes,leaves,warnings],[1,1,0]);
  }],
  ['silent ignored write leaves current screen intact', () => {
    let leaves=0,warnings=0;
    assert.equal(navigateWithVerifiedSave(()=>false,()=>leaves++,()=>warnings++),false);
    assert.deepEqual([leaves,warnings],[0,1]);
  }],
  ['storage exception leaves current screen intact', () => {
    let leaves=0,warnings=0;
    assert.equal(navigateWithVerifiedSave(()=>{throw Error('QuotaExceededError')},()=>leaves++,()=>warnings++),false);
    assert.deepEqual([leaves,warnings],[0,1]);
  }],
  ['a failed attempt can be retried without losing the screen', () => {
    let canWrite=false,leaves=0;
    const persist=()=>canWrite;
    assert.equal(navigateWithVerifiedSave(persist,()=>leaves++),false);
    canWrite=true;
    assert.equal(navigateWithVerifiedSave(persist,()=>leaves++),true);
    assert.equal(leaves,1);
  }],
  ['navigation helper does not change the student's progress', () => {
    const progress={stars:27,completed:['candy-1'],run:{player:{x:2,y:4}},rescued:['bunny']};
    const before=JSON.stringify(progress);
    navigateWithVerifiedSave(()=>false,()=>{throw Error('must not leave')});
    assert.equal(JSON.stringify(progress),before);
  }],
  ['invalid callbacks cannot trigger a navigation', () => {
    assert.equal(navigateWithVerifiedSave(null,()=>{}),false);
    assert.equal(navigateWithVerifiedSave(()=>true,null),false);
  }]
];
for(const [name,run] of cases){run();console.log('PASS '+name)}
