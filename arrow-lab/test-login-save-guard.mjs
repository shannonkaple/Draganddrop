// Run: node arrow-lab/test-login-save-guard.mjs
// The teacher/number login saves legacy maze data BEFORE openAdventure loads.
// It must never overwrite unreadable original student data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
const start=src.indexOf('function save(){'),end=src.indexOf('function restore(){',start);
assert.ok(start>0&&end>start,'find the actual login save handler');
const makeSaver=new Function('localStorage','key','identity','run','wallet',
 'let saving=true;'+src.slice(start,end)+';return {save,wasSaved:()=>saving};');
function exercise(original){
 let raw=original,writes=0;
 const storage={getItem:()=>raw,setItem(k,v){raw=v;writes++}};
 const saver=makeSaver(storage,()=>'teacher-3',{teacherId:'teacher',teacherName:'Teacher',number:3},
  {level:1},{total:8});
 saver.save();return {raw,writes,saved:saver.wasSaved()};
}
for(const original of ['{broken','','   ','null','[]','42','"text"',
 '{"adventure":"broken"}','{"adventure":[]}','{"adventure":false}']){
 const r=exercise(original);
 assert.equal(r.writes,0,'corrupt record must not be overwritten: '+original);
 assert.equal(r.raw,original,'preserve original bytes: '+original);
 assert.equal(r.saved,false,'never report successful save for corrupt record');
}
for(const original of [null,'{"adventure":null,"other":"keep"}',
 '{"adventure":{"mazeRuns":{"a":{"x":1}}},"other":"keep"}']){
 const r=exercise(original);
 assert.equal(r.writes,1,'new/valid record should save');
 assert.equal(r.saved,true);
 assert.equal(JSON.parse(r.raw).teacherId,'teacher');
 if(original!==null)assert.equal(JSON.parse(r.raw).other,'keep','preserve unrelated fields');
 if(original?.includes('mazeRuns'))assert.deepEqual(JSON.parse(r.raw).adventure.mazeRuns,{a:{x:1}},
  'preserve existing maze runs');
}
console.log('PASS: 10 corrupt login saves preserved; 3 valid/new saves retained progress');
