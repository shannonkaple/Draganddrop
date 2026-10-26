/**
 * Ms. Kaple's Trackpad Adventure — central collector for one PRIVATE Google Sheet.
 * Bound to the teacher's spreadsheet via Extensions -> Apps Script.
 * Only accepts POST requests; there is NO endpoint to read student data.
 * IMPORTANT: District approval is required before publishing an "Anyone" receiver.
 */
const TEACHERS={
 "class-01":"Campbell","class-02":"Dupuy","class-03":"Ensminger",
 "class-04":"Flotte","class-05":"Gremillion","class-06":"Jeansonne",
 "class-07":"Johnson","class-08":"Lord","class-09":"Mansur",
 "class-10":"Monte","class-11":"Satterwhite","class-12":"Thomas",
 "class-13":"Toler","class-14":"Tucker","class-15":"Homeroom 15",
 "class-16":"Sims","class-17":"Juvenal","class-18":"Rizzutto"
};
const SPREADSHEET_ID="1vQLEDi8Jp_3ZCgLRrxDX5sN7MjUaBlc4lOPI20OtHzI";
const STUDENTS_TAB="Students", HISTORY_TAB="Rating History";
const STU_HEADERS=[
 "Teacher ID","Teacher","Student #","Last sync UTC","Last rating UTC",
 "Both hands (1-3)","Click & hold (1-3)","Drag (1-3)","Drop (1-3)",
 "Correct drops","Drag attempts","Misplaced drops","Click only",
 "Cancelled drags","Touch blocked","Bad-guy bumps","Friends rescued",
 "Friends upgraded","Stars balance","Adventure","Activity stage",
 "Latest submission ID","Last update ID"
];
const HISTORY_HEADERS=[
 "Teacher ID","Teacher","Student #","Submitted UTC","Both hands (1-3)",
 "Click & hold (1-3)","Drag (1-3)","Drop (1-3)","Submission ID"
];
function initialize(){
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
 if(!ss)throw new Error("Open this script from the teacher's Google Sheet.");
 const students=ss.getSheetByName(STUDENTS_TAB)||ss.insertSheet(STUDENTS_TAB);
 const ratings=ss.getSheetByName(HISTORY_TAB)||ss.insertSheet(HISTORY_TAB);
 if(students.getLastRow()===0)students.getRange(1,1,1,STU_HEADERS.length).setValues([STU_HEADERS]);
 if(ratings.getLastRow()===0)ratings.getRange(1,1,1,HISTORY_HEADERS.length).setValues([HISTORY_HEADERS]);
 return "Collector ready for this private sheet. Publish a Web app to get the /exec URL.";
}
function result_(message){
 return ContentService.createTextOutput(JSON.stringify({ok:true,message:message}))
   .setMimeType(ContentService.MimeType.JSON);
}
function number_(value,max){
 const n=Number(value);
 return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
}
function count_(data,key,max){return number_(data&&data[key],max)}
function normalizeRatings_(record){
 if(!record||!Array.isArray(record.values)||record.values.length!==4)return null;
 const values=record.values.map(Number);
 return values.every(x=>Number.isInteger(x)&&x>=1&&x<=3)?values:null;
}
function cell_(value){
 if(typeof value==="number")return value;
 const s=String(value==null?"":value).slice(0,200);
 return /^[=+@-]/.test(s)?"'"+s:s;
}
function studentsSheet_(ss){
 const sheet=ss.getSheetByName(STUDENTS_TAB);
 if(!sheet)throw new Error("Students tab missing. Run initialize().");
 return sheet;
}
function findRow_(sheet,teacherId,studentNo){
 const end=sheet.getLastRow();
 if(end<2)return 0;
 const values=sheet.getRange(2,1,end-1,3).getValues();
 for(let i=0;i<values.length;i++){
  if(values[i][0]===teacherId&&Number(values[i][2])===studentNo)return i+2;
 }
 return 0;
}
function doPost(e){
 let lock;
 try{
  const raw=e&&e.postData&&e.postData.contents;
  if(typeof raw!=="string"||raw.length>16000)return result_("invalid length");
  const p=JSON.parse(raw);
  if(!p||p.version!==1||!Object.prototype.hasOwnProperty.call(TEACHERS,p.teacherId))return result_("unknown classroom");
  const studentNo=Number(p.studentNumber);
  if(!Number.isInteger(studentNo)||studentNo<1||studentNo>24)return result_("invalid number");
  if(p.kind!=="snapshot"&&p.kind!=="rating")return result_("unknown kind");
  if(typeof p.eventId!=="string"||p.eventId.length<10||p.eventId.length>100)return result_("invalid event");
  const stats=p.stats||{};
  const ratings=normalizeRatings_(p.latestRating);
  if(p.kind==="rating"&&!ratings)return result_("four ratings required");
  lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))return result_("busy — client may retry");
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet=studentsSheet_(ss);
  const now=new Date().toISOString();
  let row=findRow_(sheet,p.teacherId,studentNo);
  const old=row?sheet.getRange(row,1,1,STU_HEADERS.length).getValues()[0]:[];
  const oldTime=Date.parse(old[3]||"")||0;
  const clientTime=number_(p.clientTime,9999999999999);
  // Ignore out-of-order snapshots only when the current server row has a newer client timestamp
  // from the same student's record. Rating submissions still enter the history below.
  const ratingTimes=Number(p.latestRating&&p.latestRating.submittedAt)||0;
  const oldRatingAt=Date.parse(old[4]||"")||0;
  const hasNewerRating=ratings&&ratingTimes>=oldRatingAt;
  const ratingDate=hasNewerRating?new Date(ratingTimes).toISOString():(old[4]||"");
  const r=hasNewerRating?ratings:[old[5]||"",old[6]||"",old[7]||"",old[8]||""];
  const values=[
   p.teacherId,TEACHERS[p.teacherId],studentNo,now,ratingDate,
   r[0],r[1],r[2],r[3],
   count_(stats,"drops",10000),count_(stats,"attempts",30000),
   count_(stats,"misses",30000),count_(stats,"clickOnly",30000),
   count_(stats,"cancelled",30000),count_(stats,"touchBlocked",30000),
   count_(stats,"enemyBumps",30000),count_(stats,"friends",7),
   count_(stats,"upgrades",21),count_(stats,"stars",10000),
   count_(stats,"round",2000),count_(stats,"stage",11),
   (hasNewerRating&&p.latestRating.id)||old[21]||"",
   p.eventId
  ].map(cell_);
  if(!row)row=sheet.getLastRow()+1;
  sheet.getRange(row,1,1,values.length).setValues([values]);
  if(p.kind==="rating"){
   const history=ss.getSheetByName(HISTORY_TAB);
   if(!history)throw new Error("Rating History tab missing.");
   const end=history.getLastRow(), start=Math.max(2,end-300);
   const existing=end>=2?history.getRange(start,9,end-start+1,1).getValues().flat():[];
   const id=String(p.latestRating.id||p.eventId).slice(0,100);
   if(existing.indexOf(id)===-1){
    history.appendRow([p.teacherId,TEACHERS[p.teacherId],studentNo,ratingDate||now,...ratings,id].map(cell_));
   }
  }
  return result_("received");
 }catch(error){
  console.error(error&&error.stack||error);
  return result_("invalid request");
 }finally{
  if(lock)try{lock.releaseLock()}catch(ignore){}
 }
}
// Deliberately no doGet() or public student-report endpoint.