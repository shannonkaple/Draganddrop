import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCloudSave,combineClassroomProgress,updateClassroomStudent} from './cloud-save.mjs';

const duplicate=x=>JSON.parse(JSON.stringify(x));
const progress=(completed=[],details={})=>({
 version:1,completed,stars:completed.length,purchases:[],rescued:[],
 seenIntros:[],worldScene:[],active:null,...details
});
const fakeStorage=()=>{const map=new Map();return {
 getItem:key=>map.has(key)?map.get(key):null,
 setItem:(key,value)=>{map.set(key,String(value))},
 removeItem:key=>map.delete(key),
 keys:()=>[...map.keys()]
}};
function harness({local=progress(),remote=null,server=null,student=11,teacher='class-01'}={}){
 const storage=fakeStorage();globalThis.localStorage=storage;
 const requests=[],messages=[];
 const cloud=server||{progress:remote?duplicate(remote):null,revision:remote?3:0};
 let current=duplicate(local),failed=false;
 globalThis.document={
  querySelector:()=>null,
  createElement:()=>({className:'',innerHTML:'',remove(){},addEventListener(){}}),
  body:{append(){}}
 };
 globalThis.window={addEventListener(){}};
 globalThis.fetch=async(_url,options)=>{
  const req=JSON.parse(options.body);requests.push(req);
  if(failed)throw Error('Internet offline');
  const answer=(code,payload)=>new Response(JSON.stringify(payload),{status:code});
  if(req.action==='load')return answer(200,{ok:true,revision:cloud.revision,progress:duplicate(cloud.progress)});
  if(req.action==='save'){
   if(req.revision!==cloud.revision)return answer(409,{error:'A newer record exists'});
   cloud.revision++;cloud.progress=duplicate(req.progress);
   return answer(200,{ok:true,revision:cloud.revision});
  }
  return answer(400,{error:'Unexpected action'});
 };
 const client=makeCloudSave({game:'naut',
  getIdentity:()=>({teacher,student}),
  getProgress:()=>current,
  applyProgress:value=>{current=duplicate(value)},
  getPrice:id=>({'telescope':5,'moon-buggy':3,'robot-pet':4})[id]||0,
  notice:message=>messages.push(message)
 });
 return {client,server:cloud,requests,messages,storage,
  progress:()=>current,edit:value=>{current=duplicate(value);client.enqueue()},
  disconnect:()=>{failed=true},
  reconnect:()=>{failed=false}
 };
}
test('new Chromebook automatically restores student progress using only teacher + number',async()=>{
 const old=progress(['launch-1','launch-2'],{stars:2,rescued:['launch'],
  purchases:['moon-buggy'],worldScene:[{planet:0,id:'shop:moon-buggy',x:44,y:60}]});
 const a=harness({remote:old,local:progress()});
 assert.equal(await a.client.attach(),true);
 assert.deepEqual(a.progress(),old);
 assert.deepEqual(a.requests.map(x=>x.action),['load']);
 assert.equal(a.requests[0].teacher,'class-01');
 assert.equal(a.requests[0].student,11);
 assert.equal(a.requests[0].deviceToken,undefined);
 assert.equal(a.requests[0].pairingCode,undefined);
});
test('first visit automatically uploads older local progress and resumes on another Chromebook',async()=>{
 const local=progress(['launch-1','launch-2'],{stars:2});
 const a=harness({local});
 assert.equal(await a.client.attach(),true);
 assert.deepEqual(a.requests.map(x=>x.action),['load','save']);
 assert.deepEqual(a.server.progress,local);
 const b=harness({server:a.server,local:progress()});
 assert.equal(await b.client.attach(),true);
 assert.deepEqual(b.progress(),local);
});
test('completed levels, stars, My Stuff, and rescued friends merge across older Chromebooks without a prompt',async()=>{
 const left=progress(['launch-1','launch-2'],{stars:4,
  purchases:['moon-buggy'],rescued:['launch'],
  worldScene:[{planet:0,id:'shop:moon-buggy',x:18,y:55,scale:2}]});
 const right=progress(['launch-1','moon-1'],{stars:5,
  purchases:['robot-pet'],rescued:['moon'],
  worldScene:[{planet:1,id:'shop:robot-pet',x:75,y:55,scale:3}]});
 const a=harness({local:left,remote:right});
 assert.equal(await a.client.attach(),true);
 for(const id of ['launch-1','launch-2','moon-1'])assert.ok(a.progress().completed.includes(id));
 for(const id of ['moon-buggy','robot-pet'])assert.ok(a.progress().purchases.includes(id));
 assert.equal(a.progress().worldScene.length,2);
 assert.deepEqual(new Set(a.progress().rescued),new Set(['launch','moon']));
 assert.deepEqual(a.server.progress,a.progress());
 assert.ok(a.storage.keys().some(x=>x.startsWith('arrownaut-before-cloud-merge:')));
});
test('each newly completed level automatically updates the cloud',async()=>{
 const a=harness({remote:progress(['launch-1'])});
 assert.equal(await a.client.attach(),true);
 const updated=progress(['launch-1','launch-2'],{stars:2});
 a.edit(updated);
 // A second read waits for async save instead of assuming it succeeded.
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.deepEqual(a.server.progress.completed,updated.completed);
 assert.equal(a.server.progress.stars,2);
});
test('simultaneous changes on different Chromebooks are combined after version conflict',async()=>{
 const a=harness({remote:progress(['launch-1'])});
 assert.equal(await a.client.attach(),true);
 a.server.revision++;
 a.server.progress=progress(['launch-1','moon-1']);
 a.edit(progress(['launch-1','launch-2']));
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.deepEqual(new Set(a.server.progress.completed),
  new Set(['launch-1','launch-2','moon-1']));
 assert.equal(a.progress().completed.length,3);
});
test('offline saving warns clearly and keeps local progress intact',async()=>{
 const a=harness({local:progress(['launch-1'])});
 a.disconnect();
 assert.equal(await a.client.attach(),false);
 assert.deepEqual(a.progress().completed,['launch-1']);
 assert.ok(a.messages.some(x=>x.includes('NOT SYNCED')));
});
test('unfinished work is not mistaken for a blank new Chromebook',()=>{
 const local=progress([],{active:{id:'launch-1',pieces:[{id:'x',x:3,y:2}]}});
 const remote=progress([],{active:null});
 const merged=combineClassroomProgress(local,remote);
 assert.deepEqual(merged.active,local.active);
});
test('Map Two achievements are retained when Map One progress merges',()=>{
 const a=progress(['launch-1'],{mapTwo:{version:1,completed:['lost-aurora-1'],rescued:[],seenIntros:[],active:null}});
 const b=progress(['launch-1','moon-1'],{mapTwo:{version:1,completed:['lost-clockwork-1'],rescued:['lost-clockwork'],seenIntros:[],active:null}});
 const merged=combineClassroomProgress(a,b);
 assert.deepEqual(new Set(merged.mapTwo.completed),new Set(['lost-aurora-1','lost-clockwork-1']));
 assert.deepEqual(new Set(merged.completed),new Set(['launch-1','moon-1']));
});
test('public game client does not contain teacher pairing codes or secret database keys',async()=>{
 const {readFileSync}=await import('node:fs');
 const s=readFileSync(new URL('./cloud-save.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(s,/pairingCode|deviceToken|teacher-pair/);
 assert.doesNotMatch(s,/FMRBHMSTAEQ35D7HGJC78HWJ|sb_secret_/);
 assert.doesNotMatch(s,/\.from\(['"]arrownaut_cloud_saves/);
});

test('teacher advancement saves to the correct remote student and restores on another Chromebook',async()=>{
 const old=progress(['launch-1','launch-2'],{stars:12,rescued:['launch'],purchases:['moon-buggy'],
  worldScene:[{planet:0,id:'friend:launch',x:50,y:45}]});
 const a=harness({remote:old,local:progress()});
 const changed=await updateClassroomStudent({game:'naut',teacher:'class-01',student:11,
  local:progress(),validate:value=>value||progress(),
  mutate:value=>({...value,teacherUnlockThrough:27,teacherTarget:{map:'one',world:3,stage:3}})});
 assert.equal(changed.teacherUnlockThrough,27);
 assert.deepEqual(a.server.progress.completed,old.completed);
 assert.deepEqual(a.server.progress.rescued,old.rescued);
 assert.deepEqual(a.server.progress.purchases,old.purchases);
 assert.equal(a.server.progress.stars,12);
 assert.deepEqual(a.requests.map(r=>r.action),['load','save','load']);
 const b=harness({server:a.server,local:progress()});
 assert.equal(await b.client.attach(),true);
 assert.equal(b.progress().teacherUnlockThrough,27);
 assert.equal(b.progress().stars,12);
});
test('teacher level overrides cannot be lost when old Chromebooks merge',()=>{
 const newer=progress(['launch-1'],{teacherUnlockThrough:71});
 const old=progress(['launch-1','launch-2'],{teacherUnlockThrough:10});
 assert.equal(combineClassroomProgress(old,newer).teacherUnlockThrough,71);
 assert.equal(combineClassroomProgress(newer,old).teacherUnlockThrough,71);
 assert.equal(combineClassroomProgress(progress(),newer).teacherUnlockThrough,71);
 const remote=progress(['launch-1'],{teacherUnlockThrough:72,teacherTarget:{map:'two',world:1,stage:0}});
 const stale=progress(['launch-1'],{teacherUnlockThrough:7,teacherTarget:{map:'one',world:0,stage:7}});
 assert.deepEqual(combineClassroomProgress(stale,remote).teacherTarget,remote.teacherTarget);
});
test('teacher advancement fails offline without changing existing cloud progress',async()=>{
 const a=harness({remote:progress(['launch-1'],{stars:1})});
 a.disconnect();
 await assert.rejects(updateClassroomStudent({game:'naut',teacher:'class-01',student:11,
  local:progress(),validate:v=>v||progress(),mutate:v=>({...v,teacherUnlockThrough:33})}),/offline/);
 assert.equal(a.server.progress.teacherUnlockThrough,undefined);
});
