
import {directions,tile,route,buildLevel,migrateAdventure,upgradeFriend,completeLevel,rescueFriend} from './adventure-core.mjs';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=new URL('../',import.meta.url),asset=p=>new URL(p.replace(/^\//,''),root).href;
const img=(p,name,cls='')=>'<img class="'+cls+'" src="'+asset(p)+'" alt="'+esc(name)+'" draggable="false">';
const readJSON=async n=>{const r=await fetch(new URL('./data/'+n+'.json',import.meta.url));if(!r.ok)throw Error('Could not load '+n);return r.json()};
let dataPromise;
export async function openAdventure({number,goPractice,onLogout}){
 const names=['characters','rainbow_lands','levels','game_config','enemies','computer_collectibles','skill_badges'];
 const values=await(dataPromise??=Promise.all(names.map(readJSON)));const data=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
 const chars=data.characters,lands=data.rainbow_lands,levels=data.levels,config=data.game_config,key='rainbow-road-number-v2:'+number;
 let stored;try{stored=JSON.parse(localStorage.getItem(key)||'{}')}catch{stored={}}
 let a=migrateAdventure(stored.adventure,stored.wallet,chars,lands),r=null,def=null,duck=false,interval=null,warning=null,closed=false,view='map',pendingFriend=null,challengeKeys=null,report='Look, choose, press and release, check.',saved=true;
 let settings;try{settings=JSON.parse(localStorage.getItem('arrow-adventure-teacher-settings')||'{}')}catch{settings={}}
 settings={difficulty:'standard',speed:2200,hints:true,sound:false,reducedMotion:false,touchArrows:false,...settings};
 const char=id=>chars.find(c=>c.id===id),land=id=>lands.find(l=>l.id===id),look=id=>char(id).levels.find(l=>l.id===(a.friends[id]?.upgradeStage||'starter'));
 const pic=id=>img(look(id).image,char(id).name,'friend-art');
 const currentStage=id=>['Starter','Power-Up','Super Power'][char(id).levels.findIndex(l=>l.id===(a.friends[id]?.upgradeStage||'starter'))];
 function save(){try{const old=JSON.parse(localStorage.getItem(key)||'{}');localStorage.setItem(key,JSON.stringify({...old,adventure:{...a,activeRun:r}}));saved=true}catch{saved=false}}
 function clearClock(){clearInterval(interval);clearTimeout(warning);interval=null;warning=null;duck=false}
 function cleanup(){closed=true;clearClock();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);observer?.disconnect();$('adventure-dialog')?.remove();document.body.classList.remove('adventure-mode');}
 function sound(){if(!settings.sound)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),gain=ctx.createGain();o.frequency.setValueAtTime(660,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(990,ctx.currentTime+.25);gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.4);o.onended=()=>ctx.close()}catch{}}
 function modal(title,body,bind){clearClock();let d=$('adventure-dialog');if(!d){d=document.createElement('dialog');d.id='adventure-dialog';d.className='dialog adventure-dialog';document.body.append(d)}d.setAttribute('aria-labelledby','adventure-dialog-title');d.innerHTML='<h2 id="adventure-dialog-title">'+title+'</h2>'+body;d.oncancel=e=>e.preventDefault();if(!d.open)d.showModal();bind?.(d);return d}
 function closeModal(){$('adventure-dialog')?.close();if(view==='maze')clock()}
 function celebrate(title,id,after){
 sound();modal(title,'<div class="celebrate '+(settings.reducedMotion?'still':'')+'">🌟 '+(id?pic(id):'🌈')+' 🌟</div><p>You kept trying. Look what you earned!</p><button id="celebrate-next" class="primary">Hooray! →</button>',()=>{$('celebrate-next').onclick=()=>{closeModal();after()}})}
 function shell(title,content){
 clearClock();document.body.classList.remove('playing');document.body.classList.add('adventure-mode');document.body.classList.toggle('reduce-adventure-motion',settings.reducedMotion);
 $('who').classList.remove('hidden');$('who').onclick=()=>{save();cleanup();onLogout()};
 $('app').innerHTML='<nav class="adventure-nav"><strong>Number '+number+' · ⭐ '+a.wallet.rainbowStars+' Rainbow Stars</strong><div class="actions"><button data-nav="map">Adventure map</button><button data-nav="friends">My friends</button><button data-nav="lands">Rainbow Lands</button><button data-nav="computer">My computer</button><button id="teacher-settings" class="small">Teacher</button></div></nav><h1 class="adventure-title">'+title+'</h1>'+content+(saved?'':'<p role="alert">Progress could not save on this browser.</p>');
 document.querySelectorAll('[data-nav]').forEach(b=>{b.disabled=!a.selectedPlayerCharacterId||!a.primaryRainbowLandId;b.onclick=()=>navigate(b.dataset.nav)});$('teacher-settings').disabled=!a.selectedPlayerCharacterId||!a.primaryRainbowLandId;$('teacher-settings').onclick=teacher;
 }
 function navigate(where){if(r)save();if(where==='map')map();if(where==='friends')friends();if(where==='lands')homeMap();if(where==='computer')computer()}
 function selectCharacter(){
 view='select';shell('Choose your adventure hero!','<p>Pick one hero to stay with you. You can rescue the other friends along the way!</p><div class="adventure-cards">'+chars.map(c=>'<button data-hero="'+c.id+'">'+img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong></button>').join('')+'</div>');
 document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{a.selectedPlayerCharacterId=b.dataset.hero;a.friends[b.dataset.hero]={isRescued:true,upgradeStage:'starter',homeLandId:lands[0].id};a.unlockedCharacterIds=Object.keys(a.friends);save();chooseLand()});
 }
 function chooseLand(){
 view='select';shell('Choose your Rainbow Land','<p>Your hero and rescued friends will have a home. You can visit and move between all six lands!</p>'+landCards());
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{a.primaryRainbowLandId=b.dataset.land;a.friends[a.selectedPlayerCharacterId].homeLandId=b.dataset.land;save();map()});
 }
 function landCards(){return '<div class="adventure-cards land-cards">'+lands.map(l=>'<button data-land="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong></button>').join('')+'</div>'}
 function map(){
 view='map';shell('Your A-Mazing Adventure','<div class="hero-summary">'+pic(a.selectedPlayerCharacterId)+'<div><h2>'+esc(char(a.selectedPlayerCharacterId).name)+'</h2><p>'+currentStage(a.selectedPlayerCharacterId)+' · '+Object.keys(a.friends).length+'/8 friends · '+a.completedLevelIds.length+'/12 levels</p></div></div><div class="level-cards">'+levels.map(l=>'<button data-level="'+l.number+'" '+(l.number>a.highestUnlockedLevel?'disabled':'')+'>'+img(l.backgroundImage,l.title)+'<strong>'+l.number+'. '+esc(l.title)+'</strong><span>'+ (a.completedLevelIds.includes(l.id)?'✓ Replay for more stars':l.number>a.highestUnlockedLevel?'Keep exploring to unlock':'Let’s explore!')+'</span></button>').join('')+'</div><p><button id="endless">Endless arrow practice</button></p>');
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.level)));$('endless').onclick=()=>{save();cleanup();goPractice()};
 }
 function homeMap(){
 view='lands';shell('My Rainbow Lands','<p>Every friend has a home. Choose a land to visit.</p>'+landCards());
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>visit(b.dataset.land));
 }
 function visit(id){
 view='land';const l=land(id),residents=Object.keys(a.friends).filter(c=>a.friends[c].homeLandId===id);
 shell(esc(l.name),'<div class="land-scene" style="background-image:url('+asset(l.homeBackground)+')">'+residents.map(c=>'<button data-resident="'+c+'">'+pic(c)+'<span>'+esc(char(c).name)+'</span></button>').join('')+'</div><p>'+residents.length+' friends live here.</p><button id="make-home">Make this my main home</button> <button id="visit-friends">Move or upgrade friends</button>');
 document.querySelectorAll('[data-resident]').forEach(b=>b.onclick=()=>friends());$('make-home').onclick=()=>{a.primaryRainbowLandId=id;save();$('make-home').textContent='✓ My main home'};$('visit-friends').onclick=friends;
 }
 function friends(){
 view='friends';const costs=config.progression.upgradeCost;
 shell('My Rainbow Friends','<p>Upgrade each friend separately: Power-Up costs '+costs.power_up+' stars; Super Power costs '+costs.super_power_additional+' more.</p><div class="adventure-cards friend-cards">'+chars.map(c=>{const f=a.friends[c.id];if(!f)return '<div class="locked-friend">'+img(c.levels[0].thumbnail,c.name)+'<strong>'+esc(c.name)+'</strong><p>Waiting to be rescued</p></div>';const cost=f.upgradeStage==='starter'?costs.power_up:costs.super_power_additional;return '<article>'+pic(c.id)+'<h3>'+esc(c.name)+(c.id===a.selectedPlayerCharacterId?' · My hero':'')+'</h3><p>'+currentStage(c.id)+' · '+esc(look(c.id).name)+'</p><p>'+esc(land(f.homeLandId).name)+'</p><button data-upgrade="'+c.id+'" '+(f.upgradeStage==='super_power'||a.wallet.rainbowStars<cost?'disabled':'')+'>'+(f.upgradeStage==='super_power'?'★ Super Power!':'Upgrade · '+cost+' stars')+'</button><button data-move="'+c.id+'">Move home</button></article>'}).join('')+'</div>');
 document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(upgradeFriend(a,b.dataset.upgrade,costs)){save();celebrate(currentStage(b.dataset.upgrade)+' unlocked!',b.dataset.upgrade,friends)}});
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>place(b.dataset.move,()=>friends()));
 }
 function place(id,after){
 pendingFriend=id;view='place';shell('Choose a home for '+esc(char(id).name),pic(id)+landCards());
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{a.friends[id].homeLandId=b.dataset.land;save();pendingFriend=null;after()});
 }
 function computer(){
 view='computer';const cards=(items,owned)=>items.map(i=>'<article class="'+(owned.includes(i.id)?'earned-item':'waiting-item')+'">'+img(i.image,i.name)+'<strong>'+esc(i.name)+'</strong><p>'+(owned.includes(i.id)?'✓ Collected':'Keep exploring')+'</p></article>').join('');
 const all=data.computer_collectibles.every(i=>a.collectedComputerGearIds.includes(i.id))&&data.skill_badges.every(i=>a.earnedSkillBadgeIds.includes(i.id));
 shell('My Rainbow Computer','<h2>My computer equipment</h2><div class="adventure-cards">'+cards(data.computer_collectibles,a.collectedComputerGearIds)+'</div><h2>My computer skills</h2><div class="adventure-cards">'+cards(data.skill_badges,a.earnedSkillBadgeIds)+'</div>'+(all&&a.completedLevelIds.includes('level_12')?'<button id="build-computer" class="primary">Build my Rainbow Computer! 🌈</button>':'<p>Collect all five items and four skill badges, then finish level 12. Replay any level to collect something you missed.</p>'));
 if($('build-computer'))$('build-computer').onclick=finale;
 }
 function finale(){view='finale';sound();shell('You Built Your Rainbow Computer!','<div class="computer-build celebrate '+(settings.reducedMotion?'still':'')+'">'+data.computer_collectibles.map(i=>img(i.image,i.name)).join('')+'</div><p>You used arrows, clicked, double-clicked, typed, and kept trying!</p><button id="more-adventures" class="primary">Keep adventuring →</button>');a.computerBuilt=true;save();$('more-adventures').onclick=map;}
 function startLevel(n,restart=false){
 clearClock();def=levels[n-1];if(!def||n>a.highestUnlockedLevel)return;
 const old=a.activeRun,valid=old&&old.id===def.id&&!old.complete&&old.w===def.mazeGrid.width&&old.h===def.mazeGrid.height&&Array.isArray(old.grid)&&old.grid.length===old.h&&Array.isArray(old.items)&&Array.isArray(old.hazards)&&old.grid[old.player?.y]?.[old.player?.x]===0;
 r=valid&&!restart?old:buildLevel(def,crypto.getRandomValues(new Uint32Array(1))[0],settings.difficulty==='gentle');a.activeRun=r;save();maze();
 if(r.barrier&&!r.duckLearned)modal('A new move: DUCK!','<p>Hold the <strong>SPACE bar</strong> while you press an arrow to move under a striped low bridge. Let go to stand up.</p><p>The DOWN arrow still moves down. You can also hold the big Duck button.</p><button id="duck-ready" class="primary">I’m ready to try!</button>',()=>{$('duck-ready').onclick=()=>{r.duckLearned=true;save();closeModal()}});
 }
 function maze(){
 view='maze';shell(esc(def.title),'<div class="quest-strip"><span>⭐ '+def.number+'/12</span><span id="quest-items"></span><span>⌨ Arrows move'+(r.barrier?' · Hold SPACE to duck':'')+'</span></div><div class="play-layout adventure-layout"><section><div class="board-wrap scenic-board" style="background-image:url('+asset(def.backgroundImage)+')"><div id="adventure-maze" class="maze" tabindex="0" aria-label="Use your keyboard arrows. Start at the star. Collect the items and reach the checkered flag."></div></div><p id="adventure-status" class="caption" role="status">'+esc(report)+'</p></section><aside class="side"><section class="panel"><h3>Look. Choose. Press.</h3><div class="keypad"><button class="key up" data-direction="ArrowUp">↑</button><button class="key left" data-direction="ArrowLeft">←</button><button class="key down" data-direction="ArrowDown">↓</button><button class="key right" data-direction="ArrowRight">→</button></div><p>One press. One move.<br>Let the key come up.</p><button id="duck-button" class="primary" aria-pressed="false">Hold to DUCK ␣</button><p class="small">Go around the silly obstacles.<br>Striped bridge? Hold SPACE.</p></section><section class="panel"><h3>My hero</h3><div class="hero-mini">'+pic(a.selectedPlayerCharacterId)+'</div><p>'+currentStage(a.selectedPlayerCharacterId)+'</p><button id="restart-level">Restart level</button><button id="hint-route">Show a hint</button><button id="adventure-full">Full screen</button></section></aside></div>');
 document.body.classList.add('playing');
 $('restart-level').onclick=()=>startLevel(def.number,true);$('hint-route').onclick=()=>{if(!settings.hints){status('Your teacher has turned hints off. Stop, look, and try one arrow.');return}const target=r.items.find(i=>!i.collected)||(!r.skill?.done&&r.skill)||r.goal;const keys=route(r.grid,r.player,target);status(keys?.length?'Try '+keys[0].slice(5).toUpperCase()+' next.':'You are at your next stop.');};
 $('adventure-full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})};
 document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{if(settings.touchArrows)move(b.dataset.direction);else status('Press that arrow on your keyboard.');});
 const db=$('duck-button');db.onpointerdown=e=>{e.preventDefault();db.setPointerCapture(e.pointerId);setDuck(true)};db.onpointerup=db.onpointercancel=db.onlostpointercapture=()=>setDuck(false);db.onkeydown=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();setDuck(true)}};db.onkeyup=()=>setDuck(false);
 draw();clock();requestAnimationFrame(()=>{$('adventure-maze')?.focus({preventScroll:true});fit()});
 }
 function status(t){report=t;if($('adventure-status'))$('adventure-status').textContent=t}
 function setDuck(v){duck=v;$('duck-button')?.setAttribute('aria-pressed',String(v));$('adventure-maze')?.classList.toggle('ducking',v)}
 function draw(){
 if(view!=='maze'||!r)return;const m=$('adventure-maze');if(!m)return;m.style.setProperty('--w',r.w);m.style.setProperty('--h',r.h);let html='';
 for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const p={x,y},id=tile(p),item=r.items.find(i=>tile(i)===id&&!i.collected),enemy=r.hazards.find(e=>tile(e.path[e.index])===id),warn=r.hazards.find(e=>e.warning&&tile(e.warning)===id),here=tile(r.player)===id,bridge=r.barrier&&tile(r.barrier)===id,skill=r.skill&&!r.skill.done&&tile(r.skill)===id;
 let art='';if(x===1&&y===1)art='<span class="tile-symbol">⭐</span>';if(tile(r.goal)===id)art='<span class="tile-symbol">🏁</span>';if(item)art=img(data.computer_collectibles.find(i=>i.id===item.id).thumbnail,item.id,'tile-art');if(skill)art='<span class="tile-symbol" aria-label="Skill stop">⌨️</span>';if(bridge)art+='<span class="low-bridge" title="Hold SPACE to duck">DUCK</span>';if(enemy)art+=img(data.enemies.find(e=>e.id===enemy.id).thumbnail,'Obstacle: '+data.enemies.find(e=>e.id===enemy.id).name,'tile-art enemy-art');if(here)art+='<span class="player character-player">'+pic(a.selectedPlayerCharacterId)+'</span>';
 html+='<div class="cell '+(r.grid[y][x]?'wall':'road')+(warn?' hazard-warning':'')+'" style="--c:'+['#FF2D8D','#FF8A00','#FFD600','#6BCB24','#24A8F2','#A450E0'][(x+y)%6]+'">'+art+'</div>';
 }m.innerHTML=html;m.classList.toggle('ducking',duck);$('quest-items').textContent=r.items.length?'Collect: '+r.items.map(i=>(i.collected?'✓ ':'')+data.computer_collectibles.find(g=>g.id===i.id).name).join(', '):r.skill?'Visit the keyboard skill stop':'Follow the rainbow paths to the flag';fit();
 }
 function fit(){
 if(view!=='maze'||!r)return;document.documentElement.style.setProperty('--view-height',(window.visualViewport?.height||innerHeight)+'px');
 const m=$('adventure-maze'),box=document.querySelector('.scenic-board');if(!m||!box)return;const viewport=window.visualViewport?.height||innerHeight;
 const size=Math.max(1,Math.floor(Math.min((box.clientWidth-24)/r.w,(box.clientHeight-24)/r.h,(viewport-box.getBoundingClientRect().top-55)/r.h)));m.style.width=size*r.w+'px';m.style.height=size*r.h+'px';
 }
 function hit(){r.player={...r.checkpoint};status('Back to your safe checkpoint. You can try another path!');save();draw()}
 function move(key){
 if(view!=='maze'||!r||r.complete||$('adventure-dialog')?.open)return;const d=directions[key];if(!d)return;const pressed=document.querySelector('[data-direction="'+key+'"]');pressed?.classList.add('on');setTimeout(()=>pressed?.classList.remove('on'),180);
 const p={x:r.player.x+d[0],y:r.player.y+d[1]};if(r.grid[p.y]?.[p.x]!==0){status('A wall. Stop, look, and try another arrow.');return}
 if(r.barrier&&tile(p)===tile(r.barrier)&&!duck){status('Low bridge! Hold SPACE and press your arrow to duck under.');return}
 r.player=p;r.steps++;if(r.hazards.some(e=>tile(e.path[e.index])===tile(p))){hit();return}
 if(r.safe.includes(tile(p))&&r.steps%5===0)r.checkpoint={...p};
 for(const item of r.items)if(!item.collected&&tile(item)===tile(p)){item.collected=true;if(!a.collectedComputerGearIds.includes(item.id))a.collectedComputerGearIds.push(item.id);sound();status('You collected the '+data.computer_collectibles.find(i=>i.id===item.id).name+'!');}
 save();draw();
 if(r.skill&&!r.skill.done&&tile(r.skill)===tile(p)){challenge(r.skill.type);return}
 if(tile(p)===tile(r.goal)){if(r.items.some(i=>!i.collected)||r.skill&&!r.skill.done){status('Collect your equipment and finish the keyboard skill stop, then return to the flag.');return}finish()}
 }
 function clock(){
 clearInterval(interval);if(view!=='maze'||settings.difficulty==='gentle'||r.complete||$('adventure-dialog')?.open)return;
 interval=setInterval(()=>{if(closed||view!=='maze'||document.hidden||$('adventure-dialog')?.open)return;
 for(const e of r.hazards)if(e.path.length>1)e.warning=e.path[(e.index+1)%e.path.length];draw();clearTimeout(warning);warning=setTimeout(()=>{if(closed||view!=='maze'||$('adventure-dialog')?.open)return;for(const e of r.hazards){if(e.warning){e.index=(e.index+1)%e.path.length;delete e.warning}}if(r.hazards.some(e=>tile(e.path[e.index])===tile(r.player)))hit();else{save();draw()}},Math.min(800,settings.speed*.4));},settings.speed);
 }
 function challenge(kind){
 const win=()=>{r.skill.done=true;for(const id of def.skillBadgeIds)if(!a.earnedSkillBadgeIds.includes(id))a.earnedSkillBadgeIds.push(id);save();challengeKeys=null;closeModal();status('Skill challenge complete! Head to the flag.');sound();draw()};
 const back='<p id="skill-feedback" role="status"></p><button id="try-later">Back to the maze</button>';
 let body='';
 if(kind==='click')body='<p>Click the big star once.</p><button id="skill-target" class="skill-target">⭐</button>';
 if(kind==='double_click')body='<p>Click the star TWO times quickly: click-click! Take as many tries as you need.</p><button id="skill-target" class="skill-target">⭐</button>';
 if(kind==='typing')body='<p>Type <strong>cat</strong> in the box.</p><input id="skill-type" aria-label="Type cat" autocomplete="off" spellcheck="false"><button id="check-type">Check</button>';
 if(kind==='arrows')body='<p>Use your keyboard to follow these directions.</p><p id="skill-sequence">↑ → ↓ ←</p>';
 if(kind==='drag_and_drop')body='<p>Click and hold the keyboard. Drag it into the box, then let go.</p><div class="drag-space"><div id="drag-picture" tabindex="0" role="button" aria-label="Drag keyboard. Keyboard alternative: press Enter to pick up, Tab to box, Enter to drop.">'+img(data.computer_collectibles.find(i=>i.id==='keyboard').thumbnail,'Keyboard')+'</div><div id="drag-box" tabindex="0" role="button" aria-label="Keyboard drop box">Drop here</div></div>';
 modal('Computer skill stop',body+back,()=>{
 $('try-later').onclick=()=>{challengeKeys=null;closeModal();r.player={...r.checkpoint};save();draw()};
 if(kind==='click')$('skill-target').onclick=win;
 if(kind==='double_click'){let last=null;$('skill-target').onclick=()=>{const now=performance.now();if(last!==null&&now-last<=1300){win();last=null}else{last=now;$('skill-feedback').textContent='One click—click once more!'}};}
 if(kind==='typing'){const check=()=>{if($('skill-type').value.trim().toLowerCase()==='cat')win();else $('skill-feedback').textContent='Look at c a t. Try again!'};$('check-type').onclick=check;$('skill-type').onkeydown=e=>{if(e.key==='Enter')check()};$('skill-type').focus();}
 if(kind==='arrows'){let i=0;challengeKeys=k=>{if(k===['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'][i]){i++;if(i===4)win();else $('skill-sequence').textContent=['↑','→','↓','←'].map((x,j)=>j<i?'✓':x).join(' ')}else $('skill-feedback').textContent='Look at the next arrow. Try it again!'};}
 if(kind==='drag_and_drop'){
 const source=$('drag-picture'),box=$('drag-box');let held=false,pointer=null,ghost=null;
 const clean=()=>{ghost?.remove();ghost=null;source.classList.remove('picked-up')};
 source.onpointerdown=e=>{e.preventDefault();held=true;pointer=e.pointerId;source.setPointerCapture(pointer);source.classList.add('picked-up');ghost=source.querySelector('img').cloneNode();ghost.style.cssText='position:fixed;width:90px;height:90px;object-fit:contain;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)';$('adventure-dialog').append(ghost);ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'};
 source.onpointermove=e=>{if(held&&ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}};
 source.onpointerup=e=>{if(!held||e.pointerId!==pointer)return;held=false;const b=box.getBoundingClientRect(),inside=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom;clean();if(inside)win();else $('skill-feedback').textContent='Hold, move to the box, then let go. Try again!'};
 source.onpointercancel=()=>{held=false;clean()};
 source.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();held=true;source.classList.add('picked-up');box.focus()}};
 box.onkeydown=e=>{if(held&&(e.key==='Enter'||e.key===' ')){e.preventDefault();clean();win()}};
}
 });
 }
 function finish(){
 r.complete=true;const stars=completeLevel(a,r,def,config);save();sound();
 modal('You reached the flag!','<p class="reward-stars">+'+stars+' Rainbow Stars ⭐</p><p>You also earned 5 Arrow Amethysts for endless practice.</p><button id="level-next" class="primary">Hooray! →</button>',()=>{$('level-next').onclick=()=>{closeModal();afterLevel()}});
 // Keep the original Arrow Amethyst wallet and reward without resetting legacy saves.
 try{const old=JSON.parse(localStorage.getItem(key)||'{}');if(old.wallet){old.wallet.total+=5;old.wallet.earned+=5;old.wallet.finished+=1;localStorage.setItem(key,JSON.stringify(old))}}catch{}
 }
 function afterLevel(){
 if(def.rescueFriendOpportunity&&!a.rescuedAtLevelIds.includes(def.id)&&chars.some(c=>!a.friends[c.id])){rescue();return}
 if(def.number===12){const all=data.computer_collectibles.every(i=>a.collectedComputerGearIds.includes(i.id))&&data.skill_badges.every(i=>a.earnedSkillBadgeIds.includes(i.id));if(all){finale();return}computer();return}map();
 }
 function rescue(){
 view='rescue';shell('A friend is ready to come home!','<p>Choose one new friend to rescue.</p><div class="adventure-cards">'+chars.filter(c=>!a.friends[c.id]).map(c=>'<button data-rescue="'+c.id+'">'+img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong></button>').join('')+'</div>');
 document.querySelectorAll('[data-rescue]').forEach(b=>b.onclick=()=>{const id=b.dataset.rescue;if(rescueFriend(a,id,a.primaryRainbowLandId,def.id)){save();celebrate('You rescued '+esc(char(id).name)+'!',id,()=>place(id,()=>{if(def.number===12)computer();else map()}))}});
 }
 function teacher(){
 const content='<p>Settings apply on this browser. Skipping opens a level but does not award badges, stars, or friends.</p><label>Challenge <select id="set-difficulty"><option value="standard">Standard</option><option value="gentle">Gentle · no obstacles</option></select></label><label>Obstacle pace <select id="set-speed"><option value="1600">Slow</option><option value="2200">Slower</option><option value="3200">Slowest</option></select></label>'+[['hints','Show hints'],['sound','Celebration sound'],['reducedMotion','Reduce motion'],['touchArrows','Allow on-screen arrow buttons']].map(([id,label])=>'<label><input id="set-'+id+'" type="checkbox"> '+label+'</label>').join('')+'<label>Power-Up stars <input id="cost-power" type="number" min="1" max="20" value="'+config.progression.upgradeCost.power_up+'"></label><label>Super Power stars <input id="cost-super" type="number" min="1" max="30" value="'+config.progression.upgradeCost.super_power_additional+'"></label><button id="save-settings" class="primary">Save settings</button><button id="skip-level">Open next level · no rewards</button><button id="export-progress">Download progress CSV</button><button id="close-settings">Back</button>';
 modal('Teacher settings',content,()=>{$('set-difficulty').value=settings.difficulty;$('set-speed').value=settings.speed;for(const k of ['hints','sound','reducedMotion','touchArrows'])$('set-'+k).checked=settings[k];
 $('save-settings').onclick=()=>{settings.difficulty=$('set-difficulty').value;settings.speed=Number($('set-speed').value);for(const k of ['hints','sound','reducedMotion','touchArrows'])settings[k]=$('set-'+k).checked;settings.costs={power_up:Math.max(1,Math.min(20,Number($('cost-power').value)||2)),super_power_additional:Math.max(1,Math.min(30,Number($('cost-super').value)||4))};config.progression.upgradeCost={...settings.costs};try{localStorage.setItem('arrow-adventure-teacher-settings',JSON.stringify(settings))}catch{}save();closeModal();if(view==='maze')startLevel(def.number,true);else map()};
 $('skip-level').onclick=()=>{a.highestUnlockedLevel=Math.min(12,a.highestUnlockedLevel+1);save();closeModal();map()};
 $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{const rows=[['Number','Levels','Friends','Rainbow Stars','Equipment','Skill badges']];for(let n=1;n<=30;n++){try{const d=JSON.parse(localStorage.getItem('rainbow-road-number-v2:'+n)||'null')?.adventure;if(d)rows.push([n,d.completedLevelIds.length,Object.keys(d.friends).length,d.wallet.rainbowStars,d.collectedComputerGearIds.join(' / '),d.earnedSkillBadgeIds.join(' / ')])}catch{}}const csv=rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),link=document.createElement('a');link.href=url;link.download='arrow-adventure-progress.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 });
 }
 function keydown(e){
 if(closed)return;const target=e.target;if(target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement)return;
 if($('adventure-dialog')?.open){if(challengeKeys&&directions[e.key]){e.preventDefault();if(!e.repeat)challengeKeys(e.key)}return}
 if(view!=='maze')return;
 if(e.code==='Space'&&target.id!=='duck-button'){e.preventDefault();setDuck(true);return}
 if(directions[e.key]){e.preventDefault();if(!e.repeat)move(e.key)}
 }
 function keyup(e){if(e.code==='Space')setDuck(false)}
 function blur(){setDuck(false)}
 const observer='ResizeObserver'in window?new ResizeObserver(()=>requestAnimationFrame(fit)):null;observer?.observe($('app'));
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',blur);window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 if(settings.costs)config.progression.upgradeCost={...settings.costs};
 $('help').onclick=()=>{const t='Start at the star. Use your keyboard arrows. Press and release to move one space. Collect your computer equipment. Visit the keyboard skill stop. Hold the space bar to duck under a striped bridge. Finish at the checkered flag.';if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.85;speechSynthesis.speak(u)}else alert(t)};
 if(!a.selectedPlayerCharacterId)selectCharacter();else if(!a.primaryRainbowLandId)chooseLand();else map();
 return {cleanup};
}
