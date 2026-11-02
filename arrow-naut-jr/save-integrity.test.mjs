import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedWrite,storageProbe,writeTabSession,readTabSession,clearTabSession,TAB_KEY} from './save-integrity.mjs';
import {createProgress} from './curriculum.mjs';
import {readProgress} from './engine.mjs';

function memoryStorage({ignoreWrites=false,failWrites=false}={}){
 const items=new Map();
 return {
  items,
  getItem:key=>items.get(key)??null,
  setItem:(key,value)=>{if(failWrites)throw Error('Quota blocked');if(!ignoreWrites)items.set(key,String(value))},
  removeItem:key=>items.delete(key)
 };
}
const key='mskaple-arrownaut-junior-v1:grade1-01:7';
test('completed stars, purchased and placed objects, rescued friends and unfinished puzzle survive a simulated refresh',()=>{
 const local=memoryStorage(),tab=memoryStorage();
 const before={...createProgress(),completed:['launch-1','launch-2'],stars:11,
  purchases:['trackpad','keyboard'],rescued:['launch'],
  worldScene:[{world:0,key:'item:trackpad',x:35,y:42},{world:1,key:'friend:launch',x:66,y:59}],
  sceneWorld:1,active:{id:'launch-3',mechanicVersion:2,selected:'rover',pieces:[],complete:false}};
 verifiedWrite(local,key,before);
 assert.equal(writeTabSession(tab,{teacher:'grade1-01',number:7,view:'stuff',world:1,stage:null}),true);
 const reloaded=readProgress(local.getItem(key));
 assert.deepEqual(reloaded.completed,before.completed);
 assert.equal(reloaded.stars,11);
 assert.deepEqual(reloaded.purchases,before.purchases);
 assert.deepEqual(reloaded.worldScene,before.worldScene);
 assert.deepEqual(reloaded.rescued,before.rescued);
 assert.equal(reloaded.active.id,'launch-3');
 assert.equal(readTabSession(tab).view,'stuff');
 assert.equal(readTabSession(tab).number,7);
});
test('corrupted old records stay untouched rather than resetting the child',()=>{
 const local=memoryStorage(),corrupted='{not valid';
 local.items.set(key,corrupted);
 assert.throws(()=>readProgress(local.getItem(key)));
 assert.equal(local.getItem(key),corrupted);
});
test('every actual write verifies bytes; silently ignored or blocked writes are rejected',()=>{
 const original={...createProgress(),stars:8};
 assert.throws(()=>verifiedWrite(memoryStorage({ignoreWrites:true}),key,original));
 assert.throws(()=>verifiedWrite(memoryStorage({failWrites:true}),key,original));
});
test('temporary storage probes never overwrite previously saved student records',()=>{
 const local=memoryStorage(),before={...createProgress(),stars:17};
 verifiedWrite(local,key,before);
 assert.equal(storageProbe(local),true);
 assert.deepEqual(readProgress(local.getItem(key)),before);
 assert.equal(local.items.size,1);
 assert.equal(storageProbe(memoryStorage({ignoreWrites:true})),false);
 assert.equal(storageProbe(memoryStorage({failWrites:true})),false);
});
test('session identity is tab-local, checked, and cleared when changing student',()=>{
 const tab=memoryStorage();
 const info={teacher:'grade1-01',number:7,view:'game',world:0,stage:2};
 assert.equal(writeTabSession(tab,info),true);
 assert.deepEqual(readTabSession(tab),info);
 tab.setItem(TAB_KEY,'{bad');
 assert.equal(readTabSession(tab),null);
 tab.setItem(TAB_KEY,JSON.stringify({...info,number:90}));
 assert.equal(readTabSession(tab),null);
 clearTabSession(tab);
 assert.equal(tab.getItem(TAB_KEY),null);
});
