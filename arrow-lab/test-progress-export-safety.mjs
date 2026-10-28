// Run: node arrow-lab/test-progress-export-safety.mjs
import assert from 'node:assert/strict';
import {buildArrowLabProgressCsv} from './progress-export.mjs';

const storageKey=n=>'arrow-lab-class-v1:homeroom:'+n;
const records=new Map([
 [storageKey(1),JSON.stringify({
  teacherName:'=HYPERLINK("https://invalid.example","click")',
  adventure:{completedLevelIds:['candy-1'],worldFriends:{candy:{homeLandId:'background_candy'},pirate:null,arctic:false},
   wallet:{rainbowStars:12},collectedComputerGearIds:['=SUM(1,1)','normal'],
   earnedSkillBadgeIds:['  +cmd']}
 })],
 [storageKey(2),JSON.stringify({
  teacherName:'Regular Teacher',
  adventure:{completedLevelIds:[],worldFriends:{candy:{},pirate:{}},
   wallet:{rainbowStars:0},collectedComputerGearIds:[],earnedSkillBadgeIds:[]}
 })]
]);
let writes=0;
const storage={
 getItem:k=>records.get(k)??null,
 setItem(){writes++;throw Error('export must not write')},
 removeItem(){writes++;throw Error('export must not delete')}
};
const before=[...records.entries()];
const csv=buildArrowLabProgressCsv([{id:'homeroom',name:'Homeroom'}],storage,2);
assert.match(csv,/"'=HYPERLINK\(""https:\/\/invalid\.example"",""click""\)"/,
 'quoted formula-like teacher names are made literal');
assert.match(csv,/"'=SUM\(1,1\) \/ normal"/,
 'equipment names cannot become spreadsheet formulas');
assert.match(csv,/"'  \+cmd"/,'leading whitespace before a formula is guarded');
assert.match(csv,/"1","1","12"/,'only actually rescued friends are counted');
assert.match(csv,/"0","2","0"/,'healthy saved friends still count');
assert.equal(writes,0,'read-only export');
assert.deepEqual([...records.entries()],before,'all original student save bytes remain unchanged');
console.log('PASS: CSV formula safety, accurate rescued friend count, original saves untouched');
