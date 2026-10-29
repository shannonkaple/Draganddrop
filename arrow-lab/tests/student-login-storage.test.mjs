// node --test arrow-lab/tests/student-login-storage.test.mjs
// Student selection must not rewrite legacy wallet/run data before adventure migration.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canSaveStudentProgress} from '../student-storage-probe.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('writable storage probe never changes an existing student record',()=>{
 const studentKey='arrow-lab-class-v1:teacher:7';
 const original='{"wallet":{"total":99,"earned":145},"adventure":{"completedLevelIds":["lab_candy_1"],"wallet":{"rainbowStars":87}}}';
 const records=new Map([[studentKey,original]]);
 const storage={setItem:(k,v)=>records.set(k,v),getItem:k=>records.get(k)??null,removeItem:k=>records.delete(k)};
 assert.equal(canSaveStudentProgress(()=>storage),true);
 assert.deepEqual([...records],[[studentKey,original]]);
});

test('blocked, quota-limited and silently failing storage are detected without overwriting student saves',()=>{
 assert.equal(canSaveStudentProgress(()=>{throw Error('SecurityError')}),false);
 assert.equal(canSaveStudentProgress(()=>({setItem(){throw Error('QuotaExceededError')},removeItem(){}})),false);
 assert.equal(canSaveStudentProgress(()=>({setItem(){},getItem(){return null},removeItem(){}})),false);
 let removed=false;
 assert.equal(canSaveStudentProgress(()=>({setItem(){},getItem(){throw Error('read blocked')},removeItem(){removed=true}})),false);
 assert.equal(removed,true);
});

test('student number click only probes storage and launches adventure; it never preemptively saves a generated legacy wallet',()=>{
 const game=read('../game.mjs');
 const login=game.match(/document\.querySelectorAll\('\[data-number\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{([\s\S]*?)\}\);/);
 assert.ok(login,'student number click handler exists');
 assert.match(login[1],/restore\(\);saving=canSaveStudentProgress\(\);if\(!saving\)showLoginStorageWarning\(\);launchAdventure\(\)/);
 assert.doesNotMatch(login[1],/\bsave\(\)/);
 assert.match(game,/import \{canSaveStudentProgress\} from '\.\/student-storage-probe\.mjs\?/);
});
