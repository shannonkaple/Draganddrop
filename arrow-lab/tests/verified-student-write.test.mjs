import test from 'node:test';
import assert from 'node:assert/strict';
import {writeVerifiedStudentRecord} from '../verified-student-write.mjs';

const student={adventure:{completedLevelIds:['lab_candy_1'],wallet:{rainbowStars:17},positions:{candy:{gift:{x:20,y:30}}}},wallet:{total:9}};
const storage=()=>{
  const records=new Map();
  return {records,getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value)};
};

test('persisted save preserves all nested progress exactly',()=>{
  const s=storage();
  assert.equal(writeVerifiedStudentRecord(s,'student-1',student),true);
  assert.deepEqual(JSON.parse(s.getItem('student-1')),student);
});

test('silent storage refusal is detected without falsely reporting success',()=>{
  const s=storage();s.records.set('student-1','previous-student-data');
  s.setItem=()=>{};
  assert.throws(()=>writeVerifiedStudentRecord(s,'student-1',student),/not persisted/);
  assert.equal(s.getItem('student-1'),'previous-student-data');
});

test('truncated or altered storage writes are detected',()=>{
  const s=storage();s.setItem=(key,value)=>s.records.set(key,value.slice(0,30));
  assert.throws(()=>writeVerifiedStudentRecord(s,'student-1',student),/not persisted/);
});

test('quota and blocked storage errors propagate to existing warning handler',()=>{
  const s=storage();s.setItem=()=>{throw new Error('QuotaExceededError')};
  assert.throws(()=>writeVerifiedStudentRecord(s,'student-1',student),/QuotaExceededError/);
});

test('unavailable storage or invalid record does not write',()=>{
  const s=storage();
  assert.throws(()=>writeVerifiedStudentRecord(null,'student-1',student),/unavailable/);
  assert.throws(()=>writeVerifiedStudentRecord(s,'',student),/unavailable/);
  assert.throws(()=>writeVerifiedStudentRecord(s,'student-1',undefined),/serialized/);
  assert.equal(s.records.size,0);
});
