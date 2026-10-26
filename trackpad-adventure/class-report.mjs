const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const skills=[
 'Use both hands at the same time',
 'Click and hold with one finger',
 'Drag with a pointer finger',
 'Lift a finger to drop'
];
const responses=['','I need help','I’m practicing','I can do it on my own'];
const getCount=(items,key)=>items.reduce((sum,item)=>sum+(Number(item?.[key])||0),0);
function loadStudent(teacherId,studentNumber,saveKey){
 let data;
 try{data=JSON.parse(localStorage.getItem(saveKey(teacherId,studentNumber)))}catch{return null}
 if(!data)return null;
 const records=Array.isArray(data.records)?data.records:[];
 const submissions=records.filter(r=>r.type==='skill-rating').sort((a,b)=>(a.submittedAt||a.finished||0)-(b.submittedAt||b.finished||0));
 const latest=submissions.at(-1)||null;
 const activities=records.filter(r=>Array.isArray(r.done));
 if(data.current&&Array.isArray(data.current.done))activities.push(data.current);
 return {
  number:studentNumber,
  latest,
  submissions:submissions.length,
  ratings:latest?.ratings||null,
  drops:activities.reduce((count,item)=>count+(item.done?.length||0),0),
  attempts:getCount(activities,'attempts'),
  totalClicks:getCount(activities,'totalClicks'),
  misses:getCount(activities,'misses'),
  clickOnly:getCount(activities,'clickOnly'),
  cancelled:getCount(activities,'cancelled'),
  bumps:getCount(activities,'enemyBumps'),
  touch:getCount(activities,'touchBlocked'),
  stars:Number(data.stars)||0,
  friends:Array.isArray(data.friends)?data.friends.length:0
 };
}
function answer(student,index){
 const value=Number(student.ratings?.[index]);
 return [1,2,3].includes(value)?value:null;
}
export function showClassReport({teacher,saveKey,shell,onBack}){
 const students=Array.from({length:24},(_,i)=>loadStudent(teacher.id,i+1,saveKey));
 const present=students.filter(Boolean);
 const rated=present.filter(s=>s.latest);
 const labels=["","I need help","I'm practicing","I can do it on my own"];
 const skills=[
   ["Both hands","I can use both hands at the same time"],
   ["Click & hold","I can click and hold"],
   ["Drag","I can drag"],
   ["Drop","I can drop"]
 ];
 const title=escapeHtml(teacher.name);
 const now=new Date().toLocaleString("en-US",{dateStyle:"medium",timeStyle:"short"});
 const summary=skills.map(([short,full],index)=>{
  const cells=[1,2,3].map(score=>{
   const nums=rated.filter(s=>answer(s,index)===score).map(s=>s.number+"-"+teacher.name);
   return `<td><strong>${nums.length}</strong><small>${escapeHtml(nums.join(", ")||"—")}</small></td>`;
  }).join("");
  return `<tr><th scope="row">${escapeHtml(short)}</th>${cells}</tr>`;
 }).join("");
 const studentRows=students.map((s,i)=>{
  const name=escapeHtml((i+1)+"-"+teacher.name);
  const cells=s?[
    String(s.drops),
    String(s.attempts),
    ...[0,1,2,3].map(i=>escapeHtml(labels[answer(s,i)]||"Not submitted"))
  ]:["—","—","Not submitted","Not submitted","Not submitted","Not submitted"];
  return `<tr><th scope="row">${name}</th>${cells.map(x=>"<td>"+x+"</td>").join("")}</tr>`;
 }).join("");
 shell(`<section class="class-report">
 <div class="report-actions"><button type="button" id="report-back">← Student numbers</button><button type="button" id="report-print" class="primary">🖨 Print / Save as PDF</button></div>
 <header class="report-header"><h2>Ms. Kaple's Trackpad Adventure — ${title}</h2><p>${escapeHtml(now)} · ${present.length} student records on this device · ${rated.length} star check submissions</p></header>
 <p class="report-device-note"><strong>This device only.</strong> For complete classwide results from every Chromebook, open the private Central Results Google Sheet. The game detects correct click-hold-drag-drop actions, not whether students physically used two hands.</p>
 <h3>At a glance — student self-ratings</h3>
 <table class="report-summary"><thead><tr><th>Skill</th><th>⭐ Need help</th><th>⭐⭐ Practicing</th><th>⭐⭐⭐ On my own</th></tr></thead><tbody>${summary}</tbody></table>
 <h3>Student results by homeroom number</h3>
 <table class="report-summary report-observation"><thead><tr><th>Student</th><th>Successful drops</th><th>Attempts</th><th>Both hands</th><th>Click & hold</th><th>Drag</th><th>Drop</th></tr></thead><tbody>${studentRows}</tbody></table>
 <p class="report-footer">One attempt starts when a child presses a draggable item; a success requires placing the correct item in the backpack. Four skill answers are the student's latest self-ratings. In-progress and completed activities are counted.</p>
 </section>`);
 document.getElementById("report-back").onclick=onBack;
 document.getElementById("report-print").onclick=()=>window.print();
}
