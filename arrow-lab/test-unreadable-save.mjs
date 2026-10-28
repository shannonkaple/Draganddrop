// Run: node arrow-lab/test-unreadable-save.mjs
// An existing unreadable student localStorage record MUST NEVER be overwritten.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const loadStart=src.indexOf('let stored={},studentSaveUnreadable=false;');
const loadEnd=src.indexOf('let a=migrateAdventure',loadStart);
const handlerStart=src.indexOf('function showStorageWarning(){');
const handlerEnd=src.indexOf('function clearClock(){',handlerStart);
assert.ok(loadStart>0&&loadEnd>loadStart&&handlerStart>0&&handlerEnd>handlerStart);
const decode=new Function('localStorage','key',
  src.slice(loadStart,loadEnd)+';return {stored,studentSaveUnreadable};');
const bindSaver=new Function('localStorage','document','key','a','r','studentSaveUnreadable',
  'let saved=true;'+src.slice(handlerStart,handlerEnd)+';return {save,wasSaved:()=>saved};');
function exercise(original){
 let raw=original,writes=0;const warnings=new Map();
 const store={getItem:()=>raw,setItem(k,next){raw=next;writes++}};
 const doc={getElementById:id=>warnings.get(id)||null,
  createElement:()=>({id:'',setAttribute(k,v){this[k]=v},remove(){warnings.delete(this.id)}}),
  body:{append(element){warnings.set(element.id,element)}}};
 const {studentSaveUnreadable}=decode(store,'student');
 const a={wallet:{rainbowStars:17},mazeRuns:{},completedLevelIds:['lab_candy_1']};
 const bound=bindSaver(store,doc,'student',a,null,studentSaveUnreadable);
 const warnedBeforeWrite=warnings.has('arrow-lab-storage-warning');
 bound.save();return {raw,writes,warning:warnings.get('arrow-lab-storage-warning'),
  studentSaveUnreadable,wasSaved:bound.wasSaved(),warnedBeforeWrite};
}
for(const corrupt of ['{broken','null','[]','42','"string"']){
 const r=exercise(corrupt);
 assert.equal(r.studentSaveUnreadable,true);
 assert.equal(r.warnedBeforeWrite,true,'warn before first attempted write');
 assert.equal(r.writes,0,'corrupt data must not be overwritten');
 assert.equal(r.raw,corrupt,'old bytes must remain exactly unchanged');
 assert.equal(r.wasSaved,false,'never falsely report a saved profile');
 assert.equal(r.warning.role,'alert','accessible warning');
}
const healthy=exercise('{"otherField":"preserve","wallet":{"total":9}}');
assert.equal(healthy.studentSaveUnreadable,false);
assert.equal(healthy.wasSaved,true);assert.equal(healthy.writes,1);
assert.equal(JSON.parse(healthy.raw).otherField,'preserve','unrelated legacy keys kept');
assert.equal(JSON.parse(healthy.raw).wallet.total,9,'existing legacy wallet kept');
const first=exercise(null);
assert.equal(first.studentSaveUnreadable,false);assert.equal(first.writes,1);
assert.equal(first.wasSaved,true);
console.log('PASS: 5 corrupt formats untouched, immediate alerts, healthy saved data and new profiles');
