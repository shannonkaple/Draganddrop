import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'the ten-level game must have an inline script');

function snippet(from, to) {
  const start = script.indexOf(from);
  const end = script.indexOf(to, start + from.length);
  assert.ok(start >= 0 && end > start, `cannot find ${from} ... ${to}`);
  return script.slice(start, end);
}
const guard = snippet('// BEGIN TRACKPAD INPUT GUARD', '// END TRACKPAD INPUT GUARD') +
  'globalThis.__guard={noteScreenContact,isTrackpadPointer};';
const startPointer = snippet('function startPointer(', 'function movePointer(');
const movePointer = snippet('function movePointer(', '// Never allow a remaining picture');
const endPointer = snippet('function cancelPointer(', "stage.addEventListener('pointermove'");
function pointer(type, id = 7, extra = {}) {
  return { pointerType:type, isPrimary:true, button:0, pointerId:id,
    clientX:20, clientY:20, cancelable:true, preventDefault(){}, stopPropagation(){}, ...extra };
}
function sandbox(extra={}) {
  let now=0;
  const context=vm.createContext({ performance:{now:()=>now}, Math, ...extra });
  vm.runInContext(guard,context);
  return { context, now(value){now=value;}, ...context.__guard };
}

test('the ten original questions remain intact',()=>{
  const levelsSrc = snippet('const levels=[', 'const stage=');
  const context=vm.createContext({
    item:(id,emoji,x,y,w,h,tx,ty,tw,th)=>({id,emoji,x,y,w,h,tx,ty,tw,th}),
    tilt:(p,targetAngle)=>({...p,angle:0,targetAngle}),
  });
  vm.runInContext(levelsSrc+'\nglobalThis.__levels=levels;',context);
  assert.equal(context.__levels.length,10);
  assert.deepEqual(Array.from(context.__levels,level=>level.type),[
    'select','select','move','move','resize','resize','rotate','rotate','mix','mix',
  ]);
});

test('the actual student game script parses without syntax errors',()=>{
  assert.doesNotThrow(()=>new vm.Script(script));
});

test('only physical mouse/Chromebook trackpad pointer events are accepted',()=>{
  const x=sandbox();
  assert.equal(x.isTrackpadPointer(pointer('mouse')),true);
  assert.equal(x.isTrackpadPointer(pointer('touch')),false);
  assert.equal(x.isTrackpadPointer(pointer('pen')),false);
  assert.equal(x.isTrackpadPointer(pointer('mouse',7,{isPrimary:false})),false);
  x.now(100);
  x.noteScreenContact();
  x.now(950);
  assert.equal(x.isTrackpadPointer(pointer('mouse')),false,'touch-generated compatibility mouse click must be ignored');
  x.now(1700);
  assert.equal(x.isTrackpadPointer(pointer('mouse')),true,'trackpad must work again after the brief suppression period');
});

test('touch/stylus cannot select a picture, while trackpad selection still works',()=>{
  let selected=0;
  const x=sandbox({levels:[{type:'select'}],index:0,stage:{focus(){}},selectOnly(){selected++;}});
  vm.runInContext(startPointer+'globalThis.__start=startPointer;',x.context);
  const piece={id:'star',done:false};
  for(const kind of ['touch','pen']){
    x.context.__start(pointer(kind),piece,{});
    assert.equal(selected,0,`${kind} selected a picture`);
  }
  x.now(400);
  x.noteScreenContact();
  x.now(500);
  x.context.__start(pointer('mouse'),piece,{});
  assert.equal(selected,0,'compatibility mouse pointer selected a picture');
  x.now(2001);
  x.context.__start(pointer('mouse'),piece,{});
  assert.equal(selected,1,'trackpad selection should still be possible');
});

test('touch/stylus/wrong-pointer movements cannot move, resize or rotate pieces',()=>{
  const piece={id:'fish',x:10,y:10,w:20,h:20,angle:0};
  const drag={id:'fish',pointerId:7,startX:0,startY:0,origX:10,origY:10,
    origW:20,origH:20,origAngle:0,corner:null,rotator:false,rect:{width:100,height:100},moved:false};
  let renders=0;
  const x=sandbox({drag,pieces:[piece],levels:[{type:'move',moveMode:'drag'}],index:0,
    clamp:(v,low,high)=>Math.min(high,Math.max(low,v)),getEl(){return {};},setRect(){renders++;}});
  vm.runInContext(movePointer+'globalThis.__move=movePointer;',x.context);
  for(const kind of ['touch','pen']){
    x.context.__move(pointer(kind));
    assert.equal(piece.x,10);
  }
  x.context.__move(pointer('mouse',12));
  assert.equal(piece.x,10,'other pointer must not alter active drag');
  x.now(500);
  x.noteScreenContact();
  x.now(800);
  x.context.__move(pointer('mouse'));
  assert.equal(piece.x,10,'touch compatibility mouse movement cannot move piece');
  x.now(2300);
  x.context.__move(pointer('mouse'));
  assert.ok(piece.x>10 && renders>0,'trackpad drag must still move picture');
});

test('touch or cancelled pointer release never verifies task completion',()=>{
  const piece={id:'fish',x:30,y:35,w:20,h:20,angle:25};
  const freshDrag=()=>({id:'fish',pointerId:7,origX:10,origY:11,origW:14,origH:15,origAngle:0});
  let checks=0;
  const x=sandbox({drag:freshDrag(),pieces:[piece],
    getEl(){return {};},setRect(){},overlapsFinished(){return false;},
    verify(){checks++;},showToast(){}});
  vm.runInContext(endPointer+'globalThis.__end=endPointer;globalThis.__cancel=cancelPointer;',x.context);
  x.context.__end(pointer('touch'));
  assert.equal(checks,0,'touch pointerup completed task');
  assert.equal(x.context.drag,null,'unsafe drag should have been cancelled');
  assert.equal(piece.x,10,'cancelled drag must restore its initial coordinates');
  x.context.drag=freshDrag();
  x.context.__cancel(pointer('mouse'));
  assert.equal(checks,0,'pointercancel completed task');
  x.context.drag=freshDrag();
  x.now(100); x.noteScreenContact(); x.now(500);
  x.context.__end(pointer('mouse'));
  assert.equal(checks,0,'touch-generated compatibility mouseup completed task');
  x.context.drag=freshDrag();
  x.now(2000);
  x.context.__end(pointer('mouse'));
  assert.equal(checks,1,'real mouse release should still verify task');
});

test('capture-stage protection blocks all touch gestures and cancels interrupted drags',()=>{
  assert.match(script,/stage\.addEventListener\('pointerdown',[\s\S]*?rejectScreenContact\(ev\)[\s\S]*?,true\)/);
  assert.match(script,/\['touchstart','touchmove','touchend','touchcancel'\]/);
  assert.match(script,/passive:false/);
  assert.match(script,/stage\.addEventListener\('pointercancel',cancelPointer\)/);
  assert.match(script,/ev\.pointerId!==drag\.pointerId/);
  assert.match(script,/if\(!isTrackpadPointer\(ev\)\)\{cancelPointer\(ev\);return;\}/);
});
