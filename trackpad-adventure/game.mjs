import {starIcon} from '../game-ui/viewport.mjs?v=20261021-menu';
import {adventureWorlds,campaign,activityStatus,activityNames,friendForWorld,isWorldUnlocked,mapPath,makeWorldTask} from './campaign.mjs?v=20261027-blank-jpg';
import {downloadWorldMapJpegs} from './map-jpeg-export.mjs?v=20261026-mapjpg';
import {queueStudentSync} from './central-sync.mjs?v=20261026-central';
import {showClassReport} from './class-report.mjs?v=20261026-dated';
import {segmentHitsRect} from './collision.mjs';
import {saveKey,legacyKey,copyLegacy,isClaimed} from './identity.mjs?v=20261021-class24';
import {worldCosts,migrate,buyWorld,grow,place,buyDecoration,savePosition,decorations,switchPlayer} from './economy.mjs?v=20261021-class24';
const $=s=>document.querySelector(s),app=$('#app');
const [characters,lands,enemies]=await Promise.all(['characters','rainbow_lands','enemies'].map(n=>fetch(`rainbow-road/data/${n}.json`).then(r=>{if(!r.ok)throw Error('Could not load characters. Please refresh.');return r.json()}))).catch(e=>{app.textContent=e.message;throw e});
const teachers=await fetch('trackpad-adventure/teachers.json?v=20261021-class24').then(r=>{if(!r.ok)throw Error('Could not load teachers. Please refresh.');return r.json()});
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;');
const guideBadge=(name,color)=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="87" fill="${color}" stroke="black" stroke-width="7"/><text x="100" y="123" text-anchor="middle" font-family="Arial,sans-serif" font-size="64" font-weight="bold">${name}</text></svg>`);
for(const [id,name,initials,color] of [['ms_kaple','Ms. Kaple','MK','#ff2d8d'],['rigby','Rigby','R','#ffd600']])characters.push({id,name,levels:['Starter','Power-Up','Super Power'].map((name,i)=>({name,thumbnail:`trackpad-adventure/characters/${id}.webp`}))});
const vocabulary={microphone:'A microphone sends your voice into the computer.',projector:'A projector shows a computer picture on a wall or big screen.',taskbar:'The taskbar is the strip of buttons for opening or switching apps.',file:'A file is a saved piece of work, such as a picture or document.',window:'A window is the area on the screen where an app or program opens.',tab:'A browser tab holds a webpage inside the same window.',close:'The close button shuts a window or tab. It often looks like an X.',icon:'An icon is a small picture that represents an app, file, or action.',cursor:'The cursor is the pointer that shows where you are on the screen.',desktop:'A monitor is the screen that shows your work.',laptop:'A laptop is a computer that folds and travels with you.',keyboard:'A keyboard has keys for typing letters, numbers, and symbols.',trackpad:'A trackpad moves the cursor when you slide your finger.',mouse:'A mouse moves the cursor when you slide it on a table.',headphones:'Headphones let you listen without disturbing others.',printer:'A printer puts your work on paper.',webcam:'A webcam is a camera that sends your picture to the computer.',speakers:'Speakers play sound out loud.',usb_drive:'A USB drive stores files you can carry with you.',spacebar:'The spacebar adds a space between words.',enter_key:'The Enter key starts a new line or confirms a choice.',backspace:'Backspace erases the character just before the cursor.',arrow_keys:'Arrow keys move in four directions: up, down, left, and right.'};
const clues={microphone:'Pack the tool that sends our voice into the computer.',projector:'Pack the tool that shows a computer picture on a big screen.',taskbar:'Pack the strip of buttons for opening or switching apps.',file:'Pack the saved piece of computer work.',window:'Pack the area on the screen where an app opens.',tab:'Pack the part that holds a webpage inside a browser window.',close:'Pack the button that shuts a window or tab.',icon:'Pack the small picture that represents an app, file, or action.',cursor:'Pack the pointer that shows where we are on the screen.',desktop:'Pack the screen that shows our work.',laptop:'Pack the computer that folds and travels.',keyboard:'Pack the tool we use to type letters and numbers.',trackpad:'Pack the tool we slide a finger on to move the cursor.',mouse:'Pack the tool we slide on a table to move the cursor.',headphones:'Pack the tool for listening quietly.',printer:'Pack the machine that puts our work on paper.',webcam:'Pack the camera that sends our picture to the computer.',speakers:'Pack the tools that play sound out loud.',usb_drive:'Pack the small tool that stores files to carry with us.',spacebar:'Pack the key that makes a space between words.',enter_key:'Pack the key that starts a new line.',backspace:'Pack the key that erases just before the cursor.',arrow_keys:'Pack the keys that move up, down, left, and right.'};
const isGuide=id=>id==='ms_kaple'||id==='rigby';
const players=characters.filter(c=>!isGuide(c.id));
const asset=p=>p.replace(/^\//,''),image=(c,level=0)=>c.levels[level].thumbnail.startsWith('data:')?c.levels[level].thumbnail:asset(c.levels[level].thumbnail),equipment=['desktop','laptop','keyboard','trackpad','mouse'],extras=['microphone','projector','taskbar','file','window','tab','close','icon','cursor','headphones','printer','webcam','speakers','usb_drive','spacebar','enter_key','backspace','arrow_keys'],allItems=['desktop','mouse','speakers','keyboard','printer','microphone','projector','headphones','taskbar','file','window','tab','close','icon','cursor','laptop','trackpad','webcam','usb_drive','spacebar','enter_key','backspace','arrow_keys'],names={microphone:'Microphone',projector:'Projector',taskbar:'Taskbar',file:'File',window:'Window',tab:'Tab',close:'Close button',icon:'Icon',cursor:'Cursor',desktop:'Monitor',laptop:'Laptop',keyboard:'Keyboard',trackpad:'Trackpad',mouse:'Mouse',headphones:'Headphones',printer:'Printer',webcam:'Webcam',speakers:'Speakers',usb_drive:'USB drive',spacebar:'Spacebar',enter_key:'Enter key',backspace:'Backspace',arrow_keys:'Arrow keys'},pic=id=>extras.includes(id)?`trackpad-adventure/items/${id}.svg`:`game-assets/collectibles/computer/${id}_256.png`;
const criteria=['I can use both hands at the same time.','I can use one pointer finger to click and hold.','I can use one pointer finger to drag.','I can lift both of my pointer fingers to drop.'];
const ratingLabels=['','I need help','I’m practicing','I can do it on my own'];
const rescueMilestones=new Set([2,4,6,8,10]);
const availableForRescue=()=>state.friends.length>=players.length-1?[]:players.filter(c=>c.id!==state.hero&&!state.friends.includes(c.id));
const eligibleForUpgrade=()=>state.friends.filter(id=>Math.max(state.friendLevels?.[id]||0,state.playerLevels?.[id]||0)<2);
const ratingGifs=['two-hands.svg','click-and-hold.svg','drag.svg','drop.svg'];
const autoPrompted=new Set();let ratingReturn='home',autoRateEligibleDate=null;
function schoolClock(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23',minute:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));return {date:parts.year+'-'+parts.month+'-'+parts.day,hour:+parts.hour,minute:+parts.minute}}
function ratingIsComplete(){return criteria.every((_,i)=>[1,2,3].includes(state.ratingDraft?.[i]))}
function autoRateIfDue(){if(!teacher||!number||!state?.hero||state.pendingRescue||document.hidden)return;const clock=schoolClock();if(autoRateEligibleDate!==clock.date||clock.hour!==9||clock.minute!==0||state.lastRatingDate===clock.date)return;const identity=teacher.id+'/'+number+'/'+clock.date;if(autoPrompted.has(identity))return;autoPrompted.add(identity);autoRateEligibleDate=null;if(app.querySelector('#rate-submit'))return;rateScreen(document.body.classList.contains('playing')?'play':'home')}
let teacher=null,number,state,drag=null,worldDrag=null,task=null,shopReturn='home',hazardFrame=0,celebrationTimer=0;const key=(n,t=teacher)=>saveKey(t.id,n);
function fresh(){return {version:1,hero:null,land:lands[0].id,round:0,stage:0,stars:0,level:0,friends:[],records:[],current:null,checks:{},ownedWorlds:[],homes:{},friendLevels:{},collection:[],pendingRescue:null}}
function save(){state.teacherId=teacher.id;state.teacherName=teacher.name;state.studentNumber=number;try{localStorage.setItem(key(number),JSON.stringify(state))}catch(e){$('#feedback')&&( $('#feedback').textContent='Progress cannot save on this browser. Tell your teacher.')}queueStudentSync(teacher,number,state)}
function speak(text){if(!('speechSynthesis'in window)){alert('Read aloud is not available in this browser. Ask your teacher to read with you.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.82;speechSynthesis.speak(u)}
function reader(text){return `<button class="speaker" data-read="${encodeURIComponent(text)}" aria-label="Read aloud">🔊</button>`}
function heading(title,text=''){return `<h2>${title}${reader(title+'. '+text)}</h2>${text?`<p>${text}</p>`:''}`}
function topMenu(){return `<nav class="game-menu" aria-label="Game menu"><span class="menu-balance">⭐ ${state.stars} stars</span><button data-top="home"><span>🏠</span>Home</button><button data-top="play"><span>▶️</span>Play</button><button data-top="worlds"><span>🌍</span>Worlds</button><button data-top="rate" class="rate-top"><span>⭐</span>RATE</button><button data-top="shop" class="star-shop-button">${starIcon}<span>Star Shop</span></button></nav>`}
function shell(html){stopHazards();clearTimeout(celebrationTimer);$('#confetti').replaceChildren();app.classList.remove('celebrate');document.body.classList.remove('playing','world-playing');cancelWorldDrag();cancelDrag();if('speechSynthesis'in window)speechSynthesis.cancel();app.innerHTML=(number&&state?.hero?topMenu():'')+html;app.querySelectorAll('[data-top]').forEach(b=>b.onclick=()=>{const from=document.body.classList.contains('playing')?'play':shopReturn;switch(b.dataset.top){case 'home':home();break;case 'play':resumeCampaign();break;case 'worlds':home();break;case 'rate':rateScreen(from);break;case 'shop':shopReturn=from;shopTab='upgrades';stuff();break;}});$('#account').innerHTML=number?`<button id="logout">${esc(teacher.name)} · #${number} · Switch student</button>`:'';$('#logout')?.addEventListener('click',()=>{number=null;teacher=null;login()});window.scrollTo(0,0)}
function confetti(){$('#confetti').replaceChildren();clearTimeout(celebrationTimer);requestAnimationFrame(()=>app.classList.add('celebrate'));celebrationTimer=setTimeout(()=>app.classList.remove('celebrate'),700)}

function login(){number=null;autoRateEligibleDate=null;shell(`<div class="center">${heading('1. Pick your teacher','Choose your homeroom teacher. Then choose your classroom number.')}<div class="cards teacher-cards">${teachers.map(t=>`<button data-teacher="${t.id}">${esc(t.name)}</button>`).join('')}</div><details><summary>For the teacher</summary><button id="download">Download this device’s results</button><details><summary>Assign previous number-only progress</summary><p class="note">Old saves have no class label. Choose the class that owns the old saves on this device. This copies unassigned progress into empty slots only, keeps the original backups, and never replaces existing teacher-and-number progress.</p><label for="migration-pin">Teacher code</label><input id="migration-pin" type="password" inputmode="numeric" autocomplete="off"><div class="cards">${teachers.map(t=>`<button data-import="${t.id}">Assign old saves to ${esc(t.name)}</button>`).join('')}</div><p id="migration-status" role="status"></p></details><p class="note">Progress saves on this browser by teacher and student number. Each class has separate slots. Use the same browser and device to resume. Homeroom 15 is the remaining unnamed slot in the existing class list.</p></details></div>`);$('#download').onclick=download;app.querySelectorAll('[data-import]').forEach(b=>b.onclick=()=>{if($('#migration-pin').value!=='8714'){$('#migration-status').textContent='Enter the teacher code first.';return}const count=copyLegacy(localStorage,b.dataset.import);$('#migration-status').textContent=`Copied ${count} old saves. Original backups were kept.`})}
function pickNumber(){shell(`<div class="center"><button id="change-teacher">← Change teacher</button>${heading('2. Pick your number',teacher.name+' — choose your classroom number.')}<div class="numbers">${Array.from({length:24},(_,i)=>`<button data-number="${i+1}">${i+1}</button>`).join('')}</div><details><summary>For the teacher</summary><button id="print-report" type="button">🖨 Print Results Saved on This Device</button><p class="note">Progress saves on this browser by student number. Use a consistent device and number. This activity records pointer drags; it cannot detect a trackpad or the number of hands used. Observe hand placement during practice.</p><button id="download">Download this device’s results</button><p class="note">There are 8 worlds with 8 drag-and-drop activities in each world (64 in all). Complete a world to unlock the next and rescue its themed companion. Drag around the bad guys during independent tasks. Worlds cost 4–14 stars. Power-ups cost 3, then 5 stars. Star ratings are the student’s self-assessment, separate from measured results.</p></details></div>`);$('#download').onclick=download;$('#print-report').onclick=()=>{const code=prompt('Teacher code to view class results');if(code===null)return;if(code!=='8714'){alert('Incorrect teacher code.');return;}showClassReport({teacher,saveKey,shell,onBack:pickNumber})};$('#change-teacher').onclick=()=>{teacher=null;login()}}
let characterReturn='home';
function changeCharacter(from='home'){characterReturn=from;choose(true)}
function choose(changing=false){shell(`<div class="center">${changing?'<button id="cancel-character">← Back</button>':''}${heading('Pick your player',state.reselectGuide?'Ms. Kaple and Rigby are your guides. Choose an adventure player. Your progress and stars are saved.':'Choose a player. Your stars, rescues, and adventure stay saved. Each player keeps its own power-ups.')}<div class="cards">${players.map(c=>`<button class="card" data-hero="${c.id}"><img src="${image(c,Math.max(state.playerLevels?.[c.id]||0,state.friendLevels[c.id]||0))}" alt="">${c.name}${c.id===state.hero?' · Your player ✓':''}</button>`).join('')}</div></div>`);if(changing)$('#cancel-character').onclick=()=>characterReturn==='shop'?stuff():home()}


function mapSummary(){
 const c=campaign(state),hero=characters.find(x=>x.id===state.hero),total=c.completed.reduce((x,v)=>x+v,0);
 const world=adventureWorlds[c.unlocked],done=c.completed[c.unlocked];
 const friends=state.friends.map(id=>characters.find(x=>x.id===id)).filter(Boolean);
 const companions=adventureWorlds.filter(w=>c.companions.includes(w.id));
 const complete=c.completed.every(n=>n===8),remaining=8-done;
 return '<div class="arrow-map-hud">'+
   '<section class="arrow-player-card" aria-label="My character"><img class="arrow-player-art" src="'+image(hero,state.level)+'" alt="'+esc(hero.name)+'">'+
   '<div class="arrow-player-details"><small>MY CHARACTER</small><h2>'+esc(hero.name)+'</h2>'+
   '<span class="arrow-player-location">📍 '+esc(world.name)+'</span>'+
   '<span class="arrow-student-id">'+esc(teacher.name)+' #'+number+' · '+total+'/64 levels</span>'+
   '<button type="button" id="change-character">Change Character ›</button></div></section>'+
   '<section class="arrow-friend-card" aria-label="Next rescued friend"><div class="arrow-friend-info"><small>NEXT FRIEND</small>'+
   '<strong>'+(complete?'All 8 world friends rescued!':world.companionIcon+' '+esc(world.companion))+'</strong>'+
   '<div class="arrow-friend-meter" role="progressbar" aria-valuemin="0" aria-valuemax="8" aria-valuenow="'+done+'"><i style="width:'+(done/8*100)+'%"></i></div>'+
   '<span>'+(complete?'64 of 64 activities finished':remaining+' '+(remaining===1?'activity':'activities')+' to rescue · '+done+'/8 done')+'</span>'+
   '</div><div class="arrow-friend-icon" aria-hidden="true">'+(complete?'🌟':world.companionIcon)+'</div></section>'+
   '<div class="arrow-rewards-strip" aria-label="Stars and earned rewards"><strong>⭐ '+state.stars+' Stars</strong>'+
   '<div aria-label="Rescued friends">'+friends.map(ch=>'<img src="'+image(ch,Math.min(2,state.friendLevels[ch.id]||0))+'" alt="'+esc(ch.name)+'" title="'+esc(ch.name)+'">').join('')+
   companions.map(w=>'<span title="Rescued '+esc(w.companion)+'" aria-label="Rescued '+esc(w.companion)+'">'+w.companionIcon+'</span>').join('')+
   (!friends.length&&!companions.length?'<small>Your rescued friends appear here.</small>':'')+'</div></div></div>';
}
function home(){
 if(state.pendingRescue){rescueFlow();return}
 const c=campaign(state),allDone=c.completed.every(n=>n===8);
 // Align interactive world nodes to the new eight-island backdrop.
 const coords=[[13,25.5],[38.5,23.5],[63,25.5],[89,25.5],[10,81.5],[39,81.5],[63.5,81.5],[89,81.5]];
 const nodes=adventureWorlds.map((w,i)=>{
  const unlocked=isWorldUnlocked(state,i),done=c.completed[i],active=unlocked&&!allDone&&i===c.unlocked;
  const position=coords[i],status=done===8?'completed':active?'current':unlocked?'available':'locked';
  return '<button type="button" class="arrow-world-node blank-map-hotspot '+status+'" data-map-world="'+i+'" '+
   'style="left:'+position[0]+'%;top:'+position[1]+'%" '+(!unlocked?'disabled aria-disabled="true" ':'')+
   'aria-label="'+esc(w.name)+': '+(unlocked?done+' of 8 levels complete':'locked')+'"></button>';
 }).join('');
 const next=adventureWorlds[allDone?7:c.unlocked],nextStep=allDone?8:c.completed[c.unlocked]+1;
 shell('<section class="arrow-style-home" aria-label="Ms. Kaple Trackpad rainbow adventure home">'+
    mapSummary()+
    '<div class="arrow-map-heading"><span>🌈 8 magical worlds · 8 activities each</span><h2>Choose Your World!</h2>'+
    '<p>Follow the rainbow road. Earn stars. Rescue friends!</p></div>'+
    '<div class="arrow-world-stage" role="group" aria-label="Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava"><img class="map-jpeg-backdrop" src="trackpad-adventure/maps/overview-clean.jpg?v=20261027-blank-jpg" alt="" draggable="false">'+nodes+'</div>'+
    '<div class="arrow-home-actions">'+
      '<button type="button" id="continue-world" class="arrow-next-play">'+(allDone?'↻ REPLAY WORLD':'▶ PLAY NEXT')+' <small>'+esc(next.name)+' · Level '+nextStep+'</small></button>'+
      '<nav class="arrow-home-nav" aria-label="Game navigation">'+
      '<button type="button" id="arrow-nav-home" class="arrow-nav-home"><span>🏠</span>Home</button>'+
      '<button type="button" id="star-shop" class="arrow-nav-shop"><span>⭐</span>Star Shop</button>'+
      '<button type="button" id="see-my-friends" class="arrow-nav-friends"><span>🐾</span>My Friends</button></nav>'+
    '</div>'+
    '<div class="arrow-home-secondary"><span class="arrow-map2-locked">'+
     (allDone?'🌟 All eight worlds cleared · Map 2 coming soon!':'🔒 Map 2 · Coming soon!')+'</span>'+
     '<details class="arrow-map-more"><summary>⚙ More</summary><button type="button" id="arrow-nav-rate">⭐ RATE my skills</button>'+
      '<button type="button" id="arrow-nav-collections">💻 My Collections</button>'+
      '<button type="button" id="arrow-nav-levels">▶ Open Current World</button>'+
      '<button type="button" id="download-maps-jpg">Download matching JPEG maps (.zip)</button></details></div>'+
   '</section>');
 app.querySelectorAll('[data-map-world]').forEach(b=>b.onclick=()=>openCampaignWorld(Number(b.dataset.mapWorld)));
 $('#continue-world').onclick=()=>{if(allDone){openCampaignWorld(7);return}c.current=c.unlocked;startCampaignActivity(c.completed[c.unlocked])};
 $('#arrow-nav-home').onclick=home;
 $('#see-my-friends').onclick=()=>{shopReturn='home';state.land=state.ownedWorlds.includes(state.land)?state.land:lands[0].id;shopTab='upgrades';stuff()};
 $('#star-shop').onclick=()=>openShop('home');
 $('#arrow-nav-rate').onclick=()=>rateScreen('home');
 $('#arrow-nav-collections').onclick=()=>{shopReturn='home';shopTab='collection';stuff()};
 $('#arrow-nav-levels').onclick=()=>openCampaignWorld(allDone?7:c.unlocked);
 $('#download-maps-jpg').onclick=e=>downloadWorldMapJpegs(e.currentTarget);
 $('#change-character').onclick=()=>changeCharacter('home');
}

function openCampaignWorld(i){
 if(!isWorldUnlocked(state,i))return;
 const c=campaign(state);c.current=i;c.level=Math.min(7,c.completed[i]);c.replay=c.completed[i]===8;save();worldLevelMap();
}
function worldLevelMap(){
 const c=campaign(state),w=adventureWorlds[c.current],finished=c.completed[c.current]===8;
 const centers=[[14,37],[37,37],[60,37],[83,37],[14,74],[37,74],[60,74],[83,74]];
 // Only transparent HTML hotspots sit over the eight EMPTY circles in the JPEG.
 const buttons=centers.map(([x,y],i)=>{
  const status=activityStatus(state,c.current,i);
  return `<button type="button" class="world-map-hotspot ${status}" data-campaign-level="${i}"
   style="left:${x}%;top:${y}%" ${status==='locked'?'disabled aria-disabled="true"':''}
   aria-label="${w.name}: ${i===7?'rescue friend, ':' '}level ${i+1}, ${status}"></button>`;
 }).join('');
 shell(`<section class="campaign-level-screen world-map-page" aria-label="${w.name} level map">
 <div class="world-map-toolbar">
  <button type="button" id="back-worlds" aria-label="Back to all eight worlds" title="All worlds">🏠</button>
  <span class="world-map-reward ${finished?'earned':''}" aria-label="${esc(w.companion)}, ${finished?'rescued':'rescued after the eighth level'}">${w.companionIcon}</span>
  <span class="world-map-stars" aria-label="${state.stars} stars">⭐ ${state.stars}</span>
 </div>
 <div class="world-map-art" role="group" aria-label="Eight blank level circles in ${w.name}">
  <img class="map-jpeg-backdrop" src="${mapPath(w)}" alt="" draggable="false">${buttons}
 </div></section>`);
 $('#back-worlds').onclick=home;
 app.querySelectorAll('[data-campaign-level]').forEach(b=>b.onclick=()=>startCampaignActivity(Number(b.dataset.campaignLevel)));
}
function startCampaignActivity(i){
 const c=campaign(state),status=activityStatus(state,c.current,i);
 if(status==='locked')return;
 c.level=i;c.replay=status==='complete';state.stage=i;state.round=c.current;
 if(!state.current||state.current.worldIndex!==c.current||state.current.activityIndex!==i)state.current=null;
 state.land=adventureWorlds[c.current].land;
 save();play();
}
function resumeCampaign(){
 if(state.pendingRescue){rescueFlow();return}
 const c=campaign(state);if(!isWorldUnlocked(state,c.current)){home();return}
 if(c.completed[c.current]===8){home();return}
 startCampaignActivity(c.completed[c.current]);
}
function campaignLevelFinished(){
 const c=campaign(state),i=c.current,l=c.level,w=adventureWorlds[i],newProgress=!c.replay&&l===c.completed[i];
 if(newProgress)c.completed[i]=Math.min(8,c.completed[i]+1);
 c.replay=false;state.stage=Math.min(7,c.completed[i]);state.current=null;task=null;
 state.ownedWorlds??=[];if(!state.ownedWorlds.includes(w.land))state.ownedWorlds.push(w.land);
 state.land=w.land;
 if(newProgress&&c.completed[i]===8&&!c.awarded.includes(i)){
  c.awarded.push(i);c.companions??=[];if(!c.companions.includes(w.id))c.companions.push(w.id);
  const friend=friendForWorld(i),character=characters.find(x=>x.id===friend);
  let gained=false;
  if(friend!==state.hero&&!state.friends.includes(friend)){
   state.friends.push(friend);state.homes[friend]=w.land;gained=true;
  }
  if(!gained)state.stars+=3;
  save();confetti();
  const next=isWorldUnlocked(state,i+1)&&i<7;
  shell(`<section class="campaign-win"><h2>🎉 ${w.name} Complete!</h2><p>All 8 levels finished!</p>
    <img src="${image(character,Math.max(state.friendLevels[friend]||0,state.playerLevels?.[friend]||0))}" alt="${esc(character.name)}">
    <h3>${w.companionIcon} You rescued ${esc(w.companion)}!</h3><p>${gained?esc(character.name)+' also joined your playable friends!':esc(character.name)+' was already on your team! +3 bonus stars'}</p>
    <p>⭐ ${state.stars} stars saved · ${state.friends.length} rescued friends</p>
    <button id="win-map" class="primary">${next?'Unlock '+adventureWorlds[i+1].name+' →':'Back to World Map →'}</button></section>`);
  $('#win-map').onclick=()=>{if(next)openCampaignWorld(i+1);else home()};
  return;
 }
 save();worldLevelMap();
}

let shopTab='menu';
function openShop(from='home'){shopReturn=from;shopTab='upgrades';stuff()}
function returnFromShop(){shopReturn==='play'?play():home()}
function decorationArt(d,shop=false){return d.art?`<img class="${shop?'decor-preview':'decor-art'}" src="trackpad-adventure/decorations/${d.art}.webp" alt="" draggable="false">`:`<span class="decor-picture">${d.emoji}</span>`}
function stuff(){shell(`<div class="toolbar"><button id="back">← ${shopReturn==='play'?'Back to mission':'Play'}</button><button id="my-world">🏡 My world</button><button id="change-character">Change character</button><strong>⭐ ${state.stars} Drag Stars</strong></div>${heading('Spend your Drag Stars!','Every correct drag earns a star. Worlds unlock by completing activities—not by spending stars. Use stars for character power-ups, friend homes and decorations.')}<h3>🏡 Friend Home Backgrounds</h3><div class="cards">${worldCards(false)}</div><h3>🌟 Character power-ups</h3>${!state.ownedWorlds.length?'<p class="note">Buy a world first, or keep 4 stars saved for your first home.</p>':''}<div class="cards">${[...new Set([state.hero,...state.friends])].map(id=>{const c=characters.find(c=>c.id===id),level=id===state.hero?state.level:state.friendLevels[id]||0,cost=[3,5][level];return `<article class="card shop-character"><img class="level-${level}" src="${image(c,level)}" alt=""><strong>${c.name}</strong><span>${c.levels[level].name}</span>${cost?`<button data-grow="${id}" ${state.stars<cost||(!state.ownedWorlds.length&&state.stars-cost<worldCosts[0])?'disabled':''}>Power up · ⭐ ${cost}</button>`:'<span>Super Power! 🌟</span>'}${id!==state.hero?`<button data-movefriend="${id}">🏡 Choose a world</button>`:'<span>Your player</span>'}</article>`}).join('')}</div><h3>🌷 World decorations</h3><p>For ${lands.find(l=>l.id===state.land).name}. Drag your decorations around after buying them.</p><div class="cards">${decorations.map(d=>{const owned=(state.decorations[state.land]||[]).includes(d.id);return `<button class="card" data-decoration="${d.id}" ${owned||!state.ownedWorlds.includes(state.land)||state.stars<d.cost?'disabled':''}>${decorationArt(d,true)}<strong>${d.name}</strong><span>${owned?'Owned ✓':'Buy · ⭐ '+d.cost}</span></button>`}).join('')}</div>${!state.ownedWorlds.includes(state.land)?'<p>Buy this world to decorate it.</p>':''}<details><summary>🔊 My tech words & collection</summary><h3>Tech words</h3><div class="tech-words">${[['Cursor','The cursor is the pointer that shows where you are on the screen.'],['Click and hold','Press the trackpad and keep it pressed with one hand.'],['Drag','Keep the click held while your other hand moves the item.'],['Drop','Let go to put the item in its new place.'],['Hardware','Hardware is the computer equipment you can touch.'],['Software','Software is the programs and apps a computer runs.']].map(([word,meaning])=>`<p><strong>${word}</strong>: ${meaning}${reader(word+'. '+meaning)}</p>`).join('')}</div><details class="skill-glossary"><summary>🔊 Mouse & trackpad words</summary>${[['Point','Move the cursor to something on the screen.'],['Click','Press and let go once to choose something.'],['Double-click','Click twice quickly in the same place.'],['Right-click','Use a secondary click to open more choices.'],['Click and hold','Press and keep the trackpad pressed.'],['Drag','Keep the click held while moving an item.'],['Drop','Let go to put the item in a new place.'],['Scroll up','Move the page to see what is above.'],['Scroll down','Move the page to see what is below.'],['Move the cursor','Slide your finger on the trackpad to move the pointer.'],['Select','Choose an item on the screen.'],['Highlight','Mark text or an item so it is selected.'],['Hover','Rest the cursor over something without clicking.'],['Tap','Touch the trackpad lightly and lift your finger.'],['Two-finger scroll','Slide two fingers together to move up or down a page.']].map(([word,meaning])=>`<p><strong>${word}</strong>: ${meaning}${reader(word+'. '+meaning)}</p>`).join('')}</details><h3>🖥 My computer collection · ${state.collection.length}/${allItems.length}</h3><div class="collection">${allItems.map(id=>`<div class="collectible ${state.collection.includes(id)?'':'locked'}"><img src="${pic(id)}" alt=""><span>${names[id]}</span>${state.collection.includes(id)?reader(vocabulary[id]):'🔒'}</div>`).join('')}</div></details>`);$('#back').onclick=returnFromShop;$('#my-world').onclick=worldView;$('#change-character').onclick=()=>changeCharacter('shop');splitShop()}

function worldView(){const world=lands.find(l=>l.id===state.land);if(!state.ownedWorlds.includes(world.id)){stuff();return}const ids=[...new Set([state.hero,...state.friends.filter(id=>state.homes[id]===world.id)])];const props=state.decorations[world.id]||[];shell(`<div class="toolbar"><button id="world-back">← ${shopReturn==='play'?'Back to mission':'Play'}</button><button id="world-shop" class="shop-wallet">⭐ ${state.stars} · Star Shop</button></div><div class="world-instruction">${heading(world.name,'CLICK AND HOLD a friend or an item. DRAG to a new place. DROP to let go. Your layout saves.')}<div class="world-tabs">${lands.filter(l=>state.ownedWorlds.includes(l.id)).map(l=>`<button data-visit="${l.id}" aria-pressed="${l.id===world.id}">${l.name}</button>`).join('')}</div></div><section id="friend-world" class="friend-world" style="background-image:url('${asset(world.homeBackground)}')" aria-label="Drag friends around ${world.name}">${ids.map((id,i)=>{const c=characters.find(c=>c.id===id),level=id===state.hero?state.level:state.friendLevels[id]||0,pos=state.positions[world.id]?.[id]||{x:18+(i%4)*21,y:50+Math.floor(i/4)*18};return `<div class="world-rescue level-${level}" data-world-drag="${id}" style="left:${pos.x}%;top:${pos.y}%" role="img" aria-label="Drag ${c.name}"><img src="${image(c,level)}" alt="" draggable="false"><span>${c.name}</span></div>`}).join('')}${props.map((id,i)=>{const d=decorations.find(d=>d.id===id),pos=state.positions[world.id]?.['decor:'+id]||{x:14+(i%5)*18,y:30+(Math.floor(i/5)%3)*24};return `<div class="world-decor" data-world-drag="decor:${id}" style="left:${pos.x}%;top:${pos.y}%" role="img" aria-label="Drag ${d.name}">${decorationArt(d)}</div>`}).join('')}</section><p id="world-status" role="status">Drag your friends and decorations anywhere in this world.</p><details><summary>Move a friend to another world</summary><div class="cards">${state.friends.map(id=>`<button data-movefriend="${id}">${characters.find(c=>c.id===id).name} · ${state.homes[id]?lands.find(l=>l.id===state.homes[id]).name:'Choose a home'}</button>`).join('')||'<p>Finish an adventure to rescue your first friend.</p>'}</div></details>`);document.body.classList.add('world-playing');$('#world-back').onclick=returnFromShop;$('#world-shop').onclick=stuff;app.querySelectorAll('[data-world-drag]').forEach(el=>el.onpointerdown=beginWorldDrag);app.querySelectorAll('[data-visit]').forEach(b=>b.onclick=()=>{state.land=b.dataset.visit;save();worldView()})}
function beginWorldDrag(e){if(e.pointerType!=='mouse'){$('#world-status').textContent='Use your trackpad and two hands to drag your friend.';e.preventDefault();return}if(e.button!==0||worldDrag)return;e.preventDefault();const el=e.currentTarget;el.setPointerCapture(e.pointerId);const r=el.getBoundingClientRect();worldDrag={el,id:el.dataset.worldDrag,pointerId:e.pointerId,dx:e.clientX-(r.left+r.width/2),dy:e.clientY-(r.top+r.height/2),oldLeft:el.style.left,oldTop:el.style.top};el.classList.add('being-moved')}
function cancelWorldDrag(){if(!worldDrag)return;worldDrag.el.style.left=worldDrag.oldLeft;worldDrag.el.style.top=worldDrag.oldTop;worldDrag.el.classList.remove('being-moved');worldDrag=null}
window.addEventListener('pointermove',e=>{if(!worldDrag||e.pointerId!==worldDrag.pointerId)return;e.preventDefault();const r=$('#friend-world').getBoundingClientRect(),x=Math.max(8,Math.min(92,(e.clientX-worldDrag.dx-r.left)/r.width*100)),y=Math.max(18,Math.min(86,(e.clientY-worldDrag.dy-r.top)/r.height*100));worldDrag.x=x;worldDrag.y=y;worldDrag.el.style.left=x+'%';worldDrag.el.style.top=y+'%'},{passive:false});
window.addEventListener('pointerup',e=>{if(!worldDrag||e.pointerId!==worldDrag.pointerId)return;const d=worldDrag;d.el.classList.remove('being-moved');if(d.x!==undefined){savePosition(state,state.land,d.id,d.x,d.y);save();$('#world-status').textContent='Great drop! Your new place is saved.'}worldDrag=null});
window.addEventListener('pointercancel',cancelWorldDrag);window.addEventListener('blur',cancelWorldDrag);
function splitShop(){
 const titles=[...app.querySelectorAll(':scope > h3')],ids=['worlds','upgrades','decor'];const sections=[];
 titles.forEach((h,i)=>{const box=document.createElement('section');box.dataset.shopSection=ids[i];h.before(box);let n=h;while(n&&!(n!==h&&(n.tagName==='H3'||n.tagName==='DETAILS'))){const next=n.nextSibling;box.append(n);n=next}sections.push(box)});
 const collection=app.querySelector(':scope > details');if(collection){const words=document.createElement('section');words.dataset.shopSection='words';words.innerHTML='<h3>Tech words</h3><div class="cards word-cards"></div>';collection.querySelectorAll('.tech-words p,.skill-glossary p').forEach(p=>words.querySelector('.word-cards').append(p));collection.before(words);sections.push(words);const grid=collection.querySelector('.collection'),title=[...collection.querySelectorAll('h3')].at(-1);const shelf=document.createElement('section');shelf.dataset.shopSection='collection';shelf.append(title,grid);collection.replaceWith(shelf);sections.push(shelf)}
 const menu=document.createElement('div');menu.className='shop-tabs';menu.innerHTML=[['worlds','🌍','Worlds'],['upgrades','🌟','Upgrades'],['decor','🌷','Decorations'],['collection','💻','Collection'],['words','🔊','Words']].map(([id,icon,name])=>`<button id="shop-${id}" data-shop-tab="${id}"><span>${icon}</span>${name}</button>`).join('');app.querySelector('h2').after(menu);
 const show=tab=>{shopTab=tab;sections.forEach(s=>s.hidden=s.dataset.shopSection!==tab);menu.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shopTab===tab)));window.dispatchEvent(new Event('resize'))};menu.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.shopTab));show(shopTab);
}
function worldCards(placing){return lands.map((l,i)=>{const owned=state.ownedWorlds.includes(l.id),cost=worldCosts[i];return `<button class="card" ${placing?`data-place="${l.id}"`:`data-world="${l.id}"`} ${!owned&&state.stars<cost?'disabled':''}><img class="land" src="${asset(l.cardPreview)}" alt=""><strong>${l.name}</strong><span>${owned?(placing?'Place friend here':'Visit world ✓'):(placing?'Buy & place':'Buy home')+' · ⭐ '+cost}</span>${!owned&&state.stars<cost?`<small>Earn ${cost-state.stars} more stars</small>`:''}</button>`}).join('')}
function moveFriend(id){state.movingFriend=id;save();placement(id,false)}
function placement(id,rescue){const c=characters.find(c=>c.id===id);shell(`<div class="toolbar"><button id="place-back">← ${rescue?'Choose a friend':'My star shop'}</button><strong>⭐ ${state.stars} Drag Stars</strong></div><div class="center">${heading('Where will '+c.name+' live?','Choose a world you own, or spend stars to buy one.')}<img class="hero" src="${image(c,state.friendLevels[id]||0)}" alt=""><div class="cards">${worldCards(true)}</div></div>`);$('#place-back').onclick=()=>{if(rescue){state.friends=state.friends.filter(x=>x!==id);state.pendingRescue.friend=null;save();rescueChoice()}else stuff()};app.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{const world=b.dataset.place;if(!state.ownedWorlds.includes(world)&&!buyWorld(state,world,lands))return;if(!place(state,id,world))return;state.land=world;state.movingFriend=null;if(rescue)advanceAfterCheckpoint();save();confetti();if(rescue)rescueDone(id);else worldView()})}
function advanceAfterCheckpoint(){state.pendingRescue=null;if(state.stage>=11){state.round++;state.stage=0;state.checks={}}}
function rescueFlow(){if(state.pendingRescue?.kind==='upgrade'){upgradeChoice();return}if(state.pendingRescue.friend)placement(state.pendingRescue.friend,true);else rescueChoice()}
function rescueChoice(){const remaining=availableForRescue();if(!remaining.length){advanceAfterCheckpoint();save();home();return}shell(`<div class="center">${heading('Choose a friend to rescue!','Your stars can buy a home for your new friend.')}<p>⭐ ${state.stars} Drag Stars</p><div class="cards">${remaining.map(c=>`<button class="card" data-rescue="${c.id}"><img src="${image(c,Math.max(state.playerLevels?.[c.id]||0,state.friendLevels[c.id]||0))}" alt="">${c.name}${c.id===state.hero?' · Your player ✓':''}</button>`).join('')}</div></div>`);app.querySelectorAll('[data-rescue]').forEach(b=>b.onclick=()=>{const id=b.dataset.rescue;state.friends.push(id);state.pendingRescue.friend=id;save();confetti();placement(id,true)})}
function rescueDone(id){const c=characters.find(c=>c.id===id),l=lands.find(l=>l.id===state.homes[id]);shell(`<div class="center">${heading(c.name+' is home!',c.name+' now lives in '+l.name+'.')}<div class="home" style="background-image:url('${asset(l.homeBackground)}')"><img class="hero" src="${image(c)}" alt=""></div><p>⭐ ${state.stars} Drag Stars left to spend</p><button id="again" class="primary">${state.stage===0?'Play a new adventure':'Keep playing ▶'}</button><p><button id="see">🌍 Visit my friends & shop</button></p></div>`);$('#again').onclick=play;$('#see').onclick=worldView}

function makeTask(){return makeWorldTask(state,allItems)}

function play(){if(state.pendingRescue){rescueFlow();return}const mapState=campaign(state),gameWorld=adventureWorlds[mapState.current];if(!state.current||state.current.worldIndex!==mapState.current||state.current.activityIndex!==mapState.level){state.current=makeTask();save()}task=state.current;const practice=mapState.level<4,review=mapState.level===7,title=activityNames[mapState.level]+' · '+gameWorld.name,expected=task.ids.find(id=>!task.done.includes(id))||task.ids.at(-1),finished=task.done.length===task.ids.length,instruction=finished?'Great work! Choose Next.':practice?`Drag the ${names[expected].toLowerCase()} to the ${gameWorld.targetName.toLowerCase()}.`:`${clues[expected]} Drag it to the ${gameWorld.targetName.toLowerCase()}.`,badGuys=mapState.level>=2?[enemies[(mapState.current+mapState.level)%enemies.length],...(mapState.level>=5?[enemies[(mapState.current+mapState.level+3)%enemies.length]]:[])]:[],world=lands.find(l=>l.id===gameWorld.land)||lands[0];
let visibleIds=task.ids.filter(id=>!task.done.includes(id)).slice(0,3);if(!visibleIds.length)visibleIds=[expected];if(review){visibleIds=[expected,...allItems.filter(id=>id!==expected).slice((task.done.length*2)%8,(task.done.length*2)%8+2)];if(task.done.length%2)visibleIds.reverse()}
shell(`<div class="toolbar"><button id="home">← Home</button><span class="tag">${title} · ${task.done.length}/${task.ids.length} packed</span><button id="spend-stars" class="shop-wallet">⭐ ${state.stars} · Star Shop</button></div><section class="guide-mission" data-guide="${review?'rigby':'ms_kaple'}" aria-label="${review?'Rigby':'Ms. Kaple'}’s packing request"><img class="mission-guide" src="${image(characters.find(c=>c.id===(review?'rigby':'ms_kaple')))}" alt="${review?'Rigby':'Ms. Kaple'}"><div class="speech-bubble"><span class="guide-name">${review?'RIGBY SAYS':'MS. KAPLE SAYS'}</span><div class="speech-content">${practice&&!finished?`<img class="request-picture" src="${pic(expected)}" alt="">`:''}<p class="packing-request">${instruction}</p>${reader(instruction+'. '+(!finished&&practice?vocabulary[expected]:finished?'':'Find the right item and pack it in the bag.'))}</div></div></section><div class="steps"><span>1. CLICK AND HOLD</span><span>2. DRAG</span><span>3. DROP</span></div><section class="board story-board adventure-field layout-${(state.round*11+state.stage)%4}" style="background-image:url('${mapPath(gameWorld)}')" aria-label="${gameWorld.name} drag and drop mission"><div class="world-label">📍 ${gameWorld.name} · Level ${mapState.level+1}/8</div><div class="rainbow-trail" aria-hidden="true"></div>${badGuys.map((enemy,i)=>`<div class="bad-guy hazard-${i} ${[7,9].includes(state.stage)?'patrol':''}" aria-label="Avoid ${enemy.name}"><div class="enemy-body"><img src="${asset(enemy.thumbnail)}" alt="${enemy.name}"></div><span>${enemy.name}</span></div>`).join('')}<div class="supplies" aria-label="Scattered supplies">${visibleIds.map((id,i)=>`<div class="piece supply-${i} ${finished?'placed':''}" data-piece="${id}" role="img" aria-label="Drag ${names[id]}"><img draggable="false" src="${pic(id)}" alt=""><span>${names[id]}</span></div>`).join('')}</div><div class="target bag-target ${finished?'done':''}" data-target="${expected}"><span class="bag-picture" aria-hidden="true">${gameWorld.target}</span><strong>${gameWorld.targetName}</strong><span>${practice?names[expected]:'Drop the right item here'}</span><span>${task.done.length} / ${task.ids.length} packed</span></div>${badGuys.length?'<div class="field-tip">Drag around the bad guys. Keep holding!</div>':''}</section><p id="feedback" role="status" class="center">${finished?'Bag packed! Choose Next.':practice?vocabulary[expected]:'Find the tech item. Pack it to earn ⭐ 1!'}</p><div class="center game-footer"><button class="speaker" id="help" aria-label="Hear the instructions">🔊</button><button id="next" class="primary" ${finished?'':'hidden'}>Next →</button></div>`);document.body.classList.add('playing');$('.speech-bubble').append($('.steps'));$('#home').onclick=worldLevelMap;$('#spend-stars').onclick=()=>openShop('play');$('#help').onclick=()=>speak(gameWorld.action+' '+instruction+'. '+criteria.join(' ')+(badGuys.length?' Keep holding and drag around the bad guys. If you bump a bad guy, try again.':''));$('#next').onclick=complete;document.querySelectorAll('[data-piece]').forEach(el=>el.onpointerdown=beginDrag);$('.adventure-field')?.addEventListener('pointerdown',trackBoardClick,true);startHazards()}

function trackBoardClick(e){if(e.pointerType!=='mouse'||e.button!==0||!task||task.done.length===task.ids.length)return;task.totalClicks=(task.totalClicks||0)+1;state.lastInteractionAt=Date.now();save()}
function feedback(text){$('#feedback').textContent=text}
function cancelDrag(){if(!drag)return;drag.ghost.remove();drag.el.classList.remove('held');document.querySelectorAll('.hot').forEach(e=>e.classList.remove('hot'));drag=null}
function beginDrag(e){if(e.pointerType!=='mouse'){task.touchBlocked++;save();feedback('Use your trackpad and two hands. Screen touching does not move the pictures.');e.preventDefault();return}if(e.button!==0||task.done.length===task.ids.length||drag)return;e.preventDefault();task.attempts=(task.attempts||0)+1;save();const el=e.currentTarget;el.setPointerCapture(e.pointerId);const ghost=document.createElement('img');ghost.src=el.querySelector('img').src;ghost.className='ghost';ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.alt='';document.body.append(ghost);el.classList.add('held');drag={el,ghost,id:el.dataset.piece,pointerId:e.pointerId,x:e.clientX,y:e.clientY,distance:0,started:performance.now()};}
function hitsEnemy(x1,y1,x2,y2){if(!drag)return false;const token=drag.ghost.getBoundingClientRect();for(const el of document.querySelectorAll('.enemy-body'))if(segmentHitsRect(x1,y1,x2,y2,el.getBoundingClientRect(),token.width/2,token.height/2))return true;return false}
function bumpEnemy(){if(!drag)return;task.enemyBumps=(task.enemyBumps||0)+1;cancelDrag();save();feedback('Bumped the bad guy! Try again. Click and hold, drag around, then drop.')}
function stopHazards(){if(hazardFrame)cancelAnimationFrame(hazardFrame);hazardFrame=0}
function startHazards(){stopHazards();const field=$('.adventure-field'),moving=[...document.querySelectorAll('.bad-guy.patrol')];if(!field||!moving.length)return;const started=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;function tick(now){if(!field.isConnected)return;const seconds=(now-started)/1000,r=field.getBoundingClientRect();moving.forEach((el,i)=>{const phase=seconds*(reduce?.45:.8)+i*Math.PI,dx=i===0?Math.sin(phase)*Math.min(48,r.width*.045):0,dy=i===1?Math.sin(phase)*Math.min(25,r.height*.06):0;el.style.translate=dx+'px '+dy+'px'});if(drag&&hitsEnemy(drag.x,drag.y,drag.x,drag.y))bumpEnemy();hazardFrame=requestAnimationFrame(tick)}hazardFrame=requestAnimationFrame(tick)}

window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();if(hitsEnemy(drag.x,drag.y,e.clientX,e.clientY)){bumpEnemy();return}drag.distance+=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';document.querySelectorAll('[data-target]').forEach(el=>{const r=el.getBoundingClientRect();el.classList.toggle('hot',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)})},{passive:false});
window.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pointerId)return;if(hitsEnemy(drag.x,drag.y,e.clientX,e.clientY)){bumpEnemy();return}const d=drag;let didPack=false;let target=null;document.querySelectorAll('[data-target]').forEach(el=>{const r=el.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)target=el});if(d.distance<12){task.clickOnly++;feedback('Click and hold, then drag the picture. Drop into the adventure bag by letting go.')}else if(target?.dataset.target===d.id){task.done.push(d.id);state.stars++;state.collection=[...new Set([...state.collection,d.id])];didPack=true;task.drags.push({id:d.id,pixels:Math.round(d.distance),milliseconds:Math.round(performance.now()-d.started)});d.el.classList.add('placed');target.classList.add('done');feedback(task.done.length===task.ids.length?'You did it! Choose Next.':'Great drop! Try the next picture.');if(task.done.length===task.ids.length)$('#next').hidden=false}else{task.misses++;feedback('Check the mission. Click and hold the requested item, drag it to the bag, then drop.')}cancelDrag();save();if(didPack){play();if(task.done.length<task.ids.length)feedback('⭐ +1! '+names[d.id]+' packed. '+vocabulary[d.id])}});
window.addEventListener('pointercancel',()=>{if(drag){task.cancelled++;cancelDrag();save();feedback('Try that drag again.')}});window.addEventListener('blur',()=>{if(drag){task.cancelled++;cancelDrag();save()}});document.addEventListener('dragstart',e=>e.preventDefault());
function complete(){if(!task||task.done.length!==task.ids.length||state.current!==task)return;const c=campaign(state);state.records.push({...task,stage:c.level,round:c.current,type:'world-activity',finished:Date.now()});state.collection=[...new Set([...state.collection,...task.done])];save();confetti();campaignLevelFinished()}


function finishAdventure(){
 if(state.pendingRescue)return;
 if(state.stage===11){advanceAfterCheckpoint();save();play();return}
 if(!rescueMilestones.has(state.stage))return;
 if(availableForRescue().length){state.pendingRescue={kind:'rescue',friend:null};save();rescueFlow();return}
 if(eligibleForUpgrade().length){state.pendingRescue={kind:'upgrade'};save();upgradeChoice();return}
 play();
}
function upgradeChoice(){
 const options=eligibleForUpgrade();
 if(!options.length){advanceAfterCheckpoint();save();play();return}
 shell(`<div class="center"><h2>🌟 Power Up a Rescued Friend!</h2><p>You rescued all 7 friends! Choose a friend to grow stronger.</p><div class="cards">${options.map(id=>{const c=characters.find(x=>x.id===id),level=Math.max(state.friendLevels?.[id]||0,state.playerLevels?.[id]||0);return `<button class="card" data-reward-upgrade="${id}"><img src="${image(c,level)}" alt=""><strong>${c.name}</strong><span>${c.levels[level].name} → ${c.levels[level+1].name}</span></button>`}).join('')}</div></div>`);
 app.querySelectorAll('[data-reward-upgrade]').forEach(button=>button.onclick=()=>{
  const id=button.dataset.rewardUpgrade;if(!eligibleForUpgrade().includes(id))return;
  const c=characters.find(x=>x.id===id),level=Math.max(state.friendLevels?.[id]||0,state.playerLevels?.[id]||0)+1;
  state.friendLevels[id]=level;(state.playerLevels??={})[id]=level;if(state.hero===id)state.level=level;
  advanceAfterCheckpoint();save();
  shell(`<div class="center"><h2>🌟 ${c.name} powered up!</h2><img class="hero" src="${image(c,level)}" alt="${c.name}"><p>${c.levels[level].name} unlocked and saved.</p><button class="primary" id="continue-upgrade">Keep playing ▶</button></div>`);
  $('#continue-upgrade').onclick=play;
 });
}
function rateScreen(from='home'){
 ratingReturn=from==='play'?'play':'home';
 const day=schoolClock().date;
 if(state.ratingDraftDate!==day){state.ratingDraft={};state.ratingDraftDate=day}
 const pictures=ratingGifs.map(file=>'trackpad-adventure/rate-gifs/'+file);
 shell(`<div class="center rate-page">
 <h2>⭐ My Success Criteria Star Check</h2>
 <p class="rate-intro">How well can you do each skill? Choose 1, 2, or 3 stars.</p>
 <p class="rate-key">⭐ I need help &nbsp; ⭐⭐ I’m practicing &nbsp; ⭐⭐⭐ I can do it on my own</p>
 <div class="rate-questions">${criteria.map((c,i)=>`<section class="criterion rate-criterion">
 <img class="criterion-gif" src="${pictures[i]}" alt="A demonstration of this trackpad skill">
 <div class="criterion-answer"><h3>${i+1}. ${c}${reader(c)}</h3>
 <div class="rating" role="group" aria-label="${c}">${[1,2,3].map(n=>`<button type="button" data-check="${i}" data-rating="${n}" aria-pressed="${state.ratingDraft[i]===n}" aria-label="${n} stars: ${ratingLabels[n]}"><span aria-hidden="true">${'⭐'.repeat(n)}</span><span>${ratingLabels[n]}</span></button>`).join('')}</div></div></section>`).join('')}</div>
 <div class="rate-bottom"><p id="rating-progress" role="status">${criteria.filter((_,i)=>[1,2,3].includes(state.ratingDraft[i])).length} of 4 skills rated</p>
 <button id="rate-submit" class="primary" ${ratingIsComplete()?'':'disabled'}>Submit to Ms. Kaple ✓</button>
 <button id="rate-back" type="button">Back to game</button></div>
 </div>`);
 $('#rate-submit').onclick=submitRating;
 $('#rate-back').onclick=()=>ratingReturn==='play'?play():home();
}
function submitRating(){
 if(!ratingIsComplete())return;
 const today=schoolClock().date,answers={...state.ratingDraft};
 state.records.push({type:'skill-rating',round:state.round,ratings:answers,submittedAt:Date.now(),submittedDate:today});
 state.lastRatingDate=today;state.lastInteractionAt=Date.now();save();queueStudentSync(teacher,number,state,'rating');
 shell(`<div class="center rate-thanks"><h2>⭐ Great job!</h2><p>Your four star ratings have been saved for Ms. Kaple.</p><p>Student #${number} · ${esc(teacher.name)}</p><button class="primary" id="rate-done">Back to adventure ▶</button></div>`);
 $('#rate-done').onclick=()=>ratingReturn==='play'?play():home();
}

function download(){
 const ratingWords=['','I need help','I’m practicing','I can do it on my own'];
 const rows=[['Student','Date','Successful click-hold-drag-drops','Attempts','Both hands self-rating','Click & hold self-rating','Drag self-rating','Drop self-rating']];
 for(const t of teachers)for(let n=1;n<=24;n++){
  let data;try{data=JSON.parse(localStorage.getItem(saveKey(t.id,n)))}catch{}
  if(!data)continue;
  const activities=[...(Array.isArray(data.records)?data.records:[]),...(data.current?[data.current]:[])].filter(r=>Array.isArray(r.done));
  const successful=activities.reduce((total,r)=>total+r.done.length,0);
  const attempts=activities.reduce((total,r)=>total+(Number(r.attempts)||0),0);
  const ratings=(data.records||[]).filter(r=>r.type==='skill-rating').at(-1)?.ratings||{};
  const timestamps=[data.lastInteractionAt||0,data.current?.started||0,...(data.records||[]).map(r=>r.finished||r.submittedAt||0)].map(Number).filter(Number.isFinite);
  const latest=Math.max(0,...timestamps);const date=latest?new Date(latest).toLocaleDateString('en-US'):'';
  rows.push([n+'-'+t.name,date,successful,attempts,...[0,1,2,3].map(i=>ratingWords[ratings[i]]||'Not submitted')]);
 }
 const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='trackpad-adventure-simple-results.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

setInterval(autoRateIfDue,10000);
window.addEventListener('focus',autoRateIfDue);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)autoRateIfDue()});
app.addEventListener('click',e=>{const read=e.target.closest('[data-read]');if(read){speak(decodeURIComponent(read.dataset.read));return}const b=e.target.closest('button');if(!b)return;if(b.dataset.teacher){teacher=teachers.find(t=>t.id===b.dataset.teacher);pickNumber();return}if(b.dataset.number){number=+b.dataset.number;const entryClock=schoolClock();autoRateEligibleDate=entryClock.hour<9?entryClock.date:null;try{state=JSON.parse(localStorage.getItem(key(number)))||fresh()}catch{state=fresh()}migrate(state,lands);if(isGuide(state.hero)){state.hero=null;state.reselectGuide=true}save();state.hero?home():(characterReturn='home',choose())}if(b.dataset.hero&&players.some(c=>c.id===b.dataset.hero)){switchPlayer(state,b.dataset.hero,players.map(c=>c.id));save();characterReturn==='shop'?stuff():home()}if(b.dataset.world){if(!state.ownedWorlds.includes(b.dataset.world)&&!buyWorld(state,b.dataset.world,lands))return;state.land=b.dataset.world;save();worldView()}if(b.dataset.grow){if(grow(state,b.dataset.grow)){save();stuff();confetti()}}if(b.dataset.movefriend)moveFriend(b.dataset.movefriend);if(b.dataset.decoration&&buyDecoration(state,b.dataset.decoration)){save();worldView();confetti()}if(b.dataset.check!==undefined){const i=Number(b.dataset.check),n=Number(b.dataset.rating);if(!Number.isInteger(i)||i<0||i>=criteria.length||![1,2,3].includes(n))return;state.ratingDraft ||= {};state.ratingDraft[i]=n;save();const group=b.closest('.rating');group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#rating-progress').textContent=criteria.filter((_,j)=>[1,2,3].includes(state.ratingDraft[j])).length+' of 4 skills rated';$('#rate-submit').disabled=!ratingIsComplete()}});
login();
