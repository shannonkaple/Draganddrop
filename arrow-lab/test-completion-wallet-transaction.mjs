import test from 'node:test';
import assert from 'node:assert/strict';
import {withLegacyMazeCompletion} from './completion-wallet-transaction.mjs';
import {writeVerifiedStudentRecord} from './verified-student-write.mjs';

const original=()=>({
  adventure:{completedLevelIds:['lab_candy_1'],wallet:{rainbowStars:12}},
  wallet:{total:10,earned:20,finished:2,other:'keep'},
  profile:{name:'saved student'},scenes:{candy:[{id:'decor',x:20,y:40}]}
});
test('completion awards the legacy practice wallet in one merged record',()=>{
  const old=original();
  const merged=withLegacyMazeCompletion(old,5);
  assert.deepEqual(merged.wallet,{total:15,earned:25,finished:3,other:'keep'});
  assert.deepEqual(merged.adventure,old.adventure);
  assert.deepEqual(merged.scenes,old.scenes);
  assert.deepEqual(old.wallet,{total:10,earned:20,finished:2,other:'keep'});
});
test('replay or zero-star completion never awards practice wallet',()=>{
  const old=original();
  assert.equal(withLegacyMazeCompletion(old,0),old);
});
test('missing legacy wallet remains absent, no new wallet schema',()=>{
  const old={adventure:{completedLevelIds:['lab_candy_1']},profile:{id:7}};
  assert.equal(withLegacyMazeCompletion(old,5),old);
});
test('invalid legacy wallet blocks completion before any storage write',()=>{
  const old={...original(),wallet:['corrupt']};
  assert.throws(()=>withLegacyMazeCompletion(old,5),/Invalid legacy wallet/);
});
test('one verified write stores adventure and legacy reward together',()=>{
  const old=original(), writes=[];
  const storage={getItem:()=>writes.at(-1)||null,setItem:(_k,v)=>writes.push(v)};
  const next=withLegacyMazeCompletion({...old,adventure:{...old.adventure,completedLevelIds:['lab_candy_1','lab_candy_2']}},5);
  writeVerifiedStudentRecord(storage,'student',next);
  assert.equal(writes.length,1);
  assert.deepEqual(JSON.parse(writes[0]),next);
});
test('silently ignored storage cannot persist half the award',()=>{
  const old=original(), raw=JSON.stringify(old);
  const storage={getItem:()=>raw,setItem:()=>{}};
  const next=withLegacyMazeCompletion({...old,adventure:{completedLevelIds:['lab_candy_1','lab_candy_2']}},5);
  assert.throws(()=>writeVerifiedStudentRecord(storage,'student',next),/not persisted/);
  assert.deepEqual(JSON.parse(storage.getItem('student')),old);
});
test('thrown storage write leaves the previous record untouched',()=>{
  const old=original(), raw=JSON.stringify(old);
  const storage={getItem:()=>raw,setItem:()=>{throw Error('quota')}};
  const next=withLegacyMazeCompletion({...old,adventure:{completedLevelIds:['lab_candy_1','lab_candy_2']}},5);
  assert.throws(()=>writeVerifiedStudentRecord(storage,'student',next),/quota/);
  assert.deepEqual(JSON.parse(storage.getItem('student')),old);
});
