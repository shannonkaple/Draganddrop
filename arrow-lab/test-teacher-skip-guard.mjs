// Run with: node arrow-lab/test-teacher-skip-guard.mjs
// Regression: teacher confirmation guards settings, progress exports and level skips.
// Invalid student actions must not change saved progress or read/export classroom records.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const game=readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
const adventure=readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');

const validator=game.match(/const verifyTeacherCode=value=>value===('([^']+)');/);
assert.ok(validator,'Game must define its existing teacher-code validator');
const verifyTeacherCode=new Function('value','return value==='+validator[1]);
assert.equal(verifyTeacherCode(validator[2]),true);
for(const value of ['',null,'0000',0,8714])assert.equal(verifyTeacherCode(value),false);
assert.ok(game.includes("!verifyTeacherCode($('arrow-teacher-code').value)"),'Legacy import must use the same code');
assert.ok(game.includes('teachers,verifyTeacherCode,onLogout:login'),'Adventure must receive the validator');
assert.ok(adventure.includes('verifyTeacherCode=()=>false'),'No validator must default to deny');
assert.ok(adventure.includes('id="teacher-skip-code" type="password"'));
assert.ok(adventure.includes('id="teacher-skip-feedback" role="status"'));
assert.ok(game.includes('adventure.mjs?v=teacher-tools-guard-20261028b'));
assert.ok(html.includes('game.mjs?v=teacher-tools-guard-20261028b'));

assert.ok(adventure.includes(" $('save-settings').onclick=()=>{if(!requireTeacherCode())return;"),'Settings changes must require teacher confirmation');
assert.ok(adventure.includes(" $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{\n if(!requireTeacherCode())return;"),'CSV export must require teacher confirmation');
const start=adventure.indexOf(" const requireTeacherCode=()=>{");
const end=adventure.indexOf(" $('close-settings').onclick",start);
assert.ok(start>0&&end>start,'Find the teacher skip handler');
const skipHandler=adventure.slice(start,end);
assert.ok(skipHandler.indexOf('if(!requireTeacherCode())return;')<skipHandler.indexOf('a.highestUnlockedLevel=next'));

function scenario(highestUnlockedLevel,code){
  const controls={
    'skip-level':{disabled:false,textContent:'Open next level'},
    'save-settings':{},
    'teacher-skip-code':{value:code,focus(){this.focused=true}},
    'teacher-skip-feedback':{textContent:''}
  };
  const a={highestUnlockedLevel};
  let writes=0,opened=null,closed=0;
  new Function('$','verifyTeacherCode','levels','a','save','closeModal','startLevel',skipHandler)(
    id=>controls[id],verifyTeacherCode,Array(64),a,
    ()=>{writes++},()=>{closed++},level=>{opened=level}
  );
  return {
    a,controls,
    skip:()=>controls['skip-level'].onclick(),
    saveSettings:()=>controls['save-settings'].onclick(),
    result:()=>({writes,opened,closed})
  };
}
const student=scenario(3,'wrong');
student.skip();
student.saveSettings();
assert.equal(student.a.highestUnlockedLevel,3);
assert.deepEqual(student.result(),{writes:0,opened:null,closed:0});
assert.equal(student.controls['teacher-skip-code'].focused,true);
assert.match(student.controls['teacher-skip-feedback'].textContent,/teacher code/i);

// The CSV handler must refuse access before it reads any student records.
const exportStart=adventure.indexOf(" $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{");
const exportEnd=adventure.indexOf("\n });\n }\n function keydown",exportStart);
assert.ok(exportStart>0&&exportEnd>exportStart,'Find teacher CSV handler');
const exportButtons={'close-settings':{},'export-progress':{}};
let exportsAttempted=0;
new Function('$','closeModal','requireTeacherCode','buildArrowLabProgressCsv',adventure.slice(exportStart,exportEnd))(
  id=>exportButtons[id],()=>{},()=>false,()=>{exportsAttempted++}
);
exportButtons['export-progress'].onclick();
assert.equal(exportsAttempted,0,'Student must not be able to read or export progress');

const teacher=scenario(3,validator[2]);
teacher.skip();
assert.equal(teacher.a.highestUnlockedLevel,4);
assert.deepEqual(teacher.result(),{writes:1,opened:4,closed:1});
const last=scenario(64,validator[2]);
assert.equal(last.controls['skip-level'].disabled,true);
assert.match(last.controls['skip-level'].textContent,/all 64/i);
console.log('PASS teacher confirmation for settings/export/skip, unchanged student saves, next-level opening, and level-64 guard');
