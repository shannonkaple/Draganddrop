import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCloudSave,combineClassroomProgress} from './cloud-save.mjs';

function fakeStorage(){
 const m=new Map();
 return {
  getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>{m.set(k,String(v))},
  removeItem:k=>{m.delete(k)},
  keys:()=>[...m.keys()]
 };
}
const setup=(progress,remote)=>{
 const saved={...progress},reports=[],requests=[];
 globalThis.localStorage=fakeStorage();
 localStorage.setItem('arrownaut-trusted-classroom-browser-v1','a'.repeat(64));
 globalThis.document={
  querySelector:()=>null,
  createElement:()=>({className:'',innerHTML:'',remove(){},addEventListener(){}}),
  body:{append(){}}
 };
 globalThis.fetch=async(_url,options)=>{
  const request=JSON.parse(options.body);
  requests.push(request);
  if(request.action==='load')return new Response(JSON.stringify({ok:true,progress:remote,revision:remote?3:0}),{status:200});
  if(request.action==='save')return new Response(JSON.stringify({ok:true,revision:request.revision+1}),{status:200});
  throw Error('Unexpected action');
 };
 let current=saved;
 const client=makeCloudSave({game:'naut',
  getIdentity:()=>({teacher:'grade2-01',student:10}),
  getProgress:()=>current,
  applyProgress:p=>{current=p},
  notice:s=>{reports.push(s)}
 });
 return {client,requests,reports,current:()=>current};
};
const progress=(completed=[],extra={})=>({version:1,completed,stars:completed.length,
 purchases:[],rescued:[],worldScene:[],active:null,...extra});
test('on a different paired Chromebook, load existing levels automatically',async()=>{
 const remote=progress(['launch-1','launch-2','launch-3'],{stars:3});
 const s=setup(progress([]),remote);
 assert.equal(await s.client.attach(),true);
 assert.deepEqual(s.current(),remote);
 assert.deepEqual(s.requests.map(r=>r.action),['load']);
 assert.equal(s.client.isPaired(),true);
});
test('on the original paired Chromebook, preserve its local work when cloud has no record',async()=>{
 const original=progress(['launch-1','launch-2'],{stars:2});
 const s=setup(original,null);
 assert.equal(await s.client.attach(),true);
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.deepEqual(s.requests.map(r=>r.action),['load','save']);
 assert.deepEqual(s.requests[1].progress,original);
 assert.equal(s.requests[1].revision,0);
});
test('never silently overwrite unique local levels with a different cloud save',async()=>{
 const local=progress(['launch-1','launch-2']);
 const remote=progress(['launch-1','moon-1']);
 const s=setup(local,remote);
 assert.equal(await s.client.attach(),false);
 assert.deepEqual(s.current(),local);
 assert.deepEqual(s.requests.map(r=>r.action),['load']);
 assert.ok(s.reports.some(s=>s.includes('NOT SAVED')));
});
test('without teacher pairing, student cannot accidentally upload their local data',async()=>{
 const p=progress(['launch-1']);
 const s=setup(p,null);
 localStorage.removeItem('arrownaut-trusted-classroom-browser-v1');
 assert.equal(await s.client.attach(),false);
 s.client.enqueue(p);
 await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(s.requests.length,0);
 assert.equal(s.client.isPaired(),false);
});
test('cloud save does not put student code or teacher pairing key in the public client',async()=>{
 const {readFileSync}=await import('node:fs');
 const content=readFileSync(new URL('./cloud-save.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(content,/FMRBHMSTAEQ35D7HGJC78HWJ/);
 assert.doesNotMatch(content,/\.from\(['"]arrownaut_cloud_saves/);
 assert.match(content,/teacher setup key/i);
});

test('teacher-assisted merge keeps unique completed levels, rescues, inventory and scenery',()=>{
 const left=progress(['launch-1','launch-2'],{
  stars:3,purchases:['moon-buggy'],rescued:['launch'],
  worldScene:[{planet:0,id:'shop:moon-buggy',x:28,y:31,scale:1.6}]
 });
 const right=progress(['launch-1','moon-1'],{
  stars:5,purchases:['robot-pet'],rescued:['moon'],
  worldScene:[{planet:1,id:'shop:robot-pet',x:60,y:60,scale:1.2}]
 });
 const merged=combineClassroomProgress(left,right,id=>({'moon-buggy':2,'robot-pet':3})[id]||0);
 assert.deepEqual(new Set(merged.completed),new Set(['launch-1','launch-2','moon-1']));
 assert.deepEqual(new Set(merged.purchases),new Set(['moon-buggy','robot-pet']));
 assert.deepEqual(new Set(merged.rescued),new Set(['launch','moon']));
 assert.equal(merged.worldScene.length,2);
 assert.equal(merged.active,null);
 assert.ok(merged.stars>=0);
});
test('teacher-assisted merge preserves both Map Two worlds without clearing earlier Map One work',()=>{
 const left=progress(['launch-1'],{
  mapTwo:{version:1,completed:['lost-aurora-1'],rescued:[],seenIntros:[],active:null}
 });
 const right=progress(['launch-1','moon-1'],{
  mapTwo:{version:1,completed:['lost-clockwork-1'],rescued:[],seenIntros:[],active:null}
 });
 const merged=combineClassroomProgress(left,right);
 assert.deepEqual(new Set(merged.mapTwo.completed),new Set(['lost-aurora-1','lost-clockwork-1']));
 assert.deepEqual(new Set(merged.completed),new Set(['launch-1','moon-1']));
});

test('do not discard My Stuff purchases when cloud has the same completed lessons',async()=>{
 const local=progress(['launch-1'],{purchases:['telescope']});
 const remote=progress(['launch-1'],{purchases:[]});
 const x=setup(local,remote);
 assert.equal(await x.client.attach(),false);
 assert.deepEqual(x.current().purchases,['telescope']);
 assert.ok(x.reports.some(x=>x.includes('NOT SAVED')));
});
