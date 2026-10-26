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
 const students=Array.from({length:24},(_,i)=>loadStudent(teacher.id,i+1,saveKey)).filter(Boolean);
 const rated=students.filter(x=>x.latest);
 const now=new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'});
 const summary=skills.map((skill,i)=>{
  const cells=[1,2,3].map(score=>{
   const matching=rated.filter(student=>answer(student,i)===score).map(s=>'#'+s.number);
   return `<td><strong>${matching.length} students</strong><span>${matching.length?matching.join(', '):'—'}</span></td>`;
  }).join('');
  return `<tr><th scope="row">${escapeHtml(skill)}</th>${cells}</tr>`;
 }).join('');
 const cards=students.map(student=>{
  const responsesHtml=skills.map((skill,i)=>{
   const rating=answer(student,i);
   return `<li><strong>${escapeHtml(skill)}</strong><span>${rating?'⭐'.repeat(rating)+' '+responses[rating]:'Not submitted'}</span></li>`;
  }).join('');
  const latest=student.latest?new Date(student.latest.submittedAt||student.latest.finished||Date.now()).toLocaleString('en-US',{dateStyle:'short',timeStyle:'short'}):'Not submitted';
  return `<article class="report-student">
    <h3>Student #${student.number}</h3>
    <p class="report-date">Latest rating: ${escapeHtml(latest)} ${student.submissions>1?'('+student.submissions+' submissions)':''}</p>
    <ul class="report-responses">${responsesHtml}</ul>
    <div class="report-metrics">
    <span><strong>${student.drops}</strong> correct drops</span>
    <span><strong>${student.attempts}</strong> drag attempts</span>
    <span><strong>${student.misses}</strong> misplaced drops</span>
    <span><strong>${student.clickOnly}</strong> click-only attempts</span>
    <span><strong>${student.bumps}</strong> obstacle bumps</span>
    <span><strong>${student.touch}</strong> touch attempts blocked</span>
    <span><strong>${student.friends}</strong> friends rescued</span>
    </div>
   </article>`;
 }).join('');
 const missing=students.filter(student=>!student.latest).map(student=>'#'+student.number);
 const teacherName=escapeHtml(teacher.name);
 shell(`<section class="class-report" id="class-report">
   <div class="report-actions">
    <button type="button" id="report-back">← Student numbers</button>
    <button type="button" id="report-print" class="primary">🖨 Print / Save as PDF</button>
   </div>
   <header class="report-header"><h2>Trackpad Adventure — Class Results</h2><p><strong>${teacherName}</strong> · ${escapeHtml(now)}</p></header>
   <p class="report-device-note"><strong>Device report only.</strong> This includes student numbers saved in this browser. Results from other student Chromebooks are not synchronized. Drag attempts are recorded interactions, not a measurement of the physical trackpad or which hands students used.</p>
   <div class="report-total"><strong>${students.length}</strong> student records on device · <strong>${rated.length}</strong> completed star ratings</div>
   <h3>What students said about each success criterion</h3>
   <table class="report-summary"><thead><tr><th>Objective</th><th>⭐ I need help</th><th>⭐⭐ I'm practicing</th><th>⭐⭐⭐ On my own</th></tr></thead><tbody>${summary}</tbody></table>
   <p class="report-missing">Student numbers without submitted ratings: <strong>${missing.length?missing.join(', '):'None among saved students'}</strong></p>
   <h3>Individual student results</h3>
   <div class="report-students">${cards||'<p>No student data was saved on this browser yet.</p>'}</div>
   <p class="report-footer">Prepared from the current device’s locally saved student progress. Correct drops and attempts include an unfinished activity when one is saved.</p>
  </section>`);
 document.getElementById('report-back').onclick=onBack;
 document.getElementById('report-print').onclick=()=>window.print();
}