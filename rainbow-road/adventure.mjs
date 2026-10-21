import {decorations,worldCosts} from '../trackpad-adventure/economy.mjs?v=20261021-class24';

import {directions,tile,route,buildLevel,migrateAdventure,upgradeFriend,completeLevel,rescueFriend} from './adventure-core.mjs?v=20261021-class24';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=new URL('../',import.meta.url),asset=p=>new URL(p.replace(/^\//,''),root).href;
const img=(p,name,cls='')=>'<img class="'+cls+'" src="'+asset(p)+'" alt="'+esc(name)+'" draggable="false">';
const readJSON=async n=>{const r=await fetch(new URL('./data/'+n+'.json',import.meta.url));if(!r.ok)throw Error('Could not load '+n);return r.json()};
let dataPromise;
export async function openAdventure({number,storageKey,teacherName,goPractice,onLogout}){
 const names=['characters','rainbow_lands','levels','game_config','enemies','computer_collectibles','skill_badges'];
 const values=await(dataPromise??=Promise.all(names.map(readJSON)));const data=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
 const chars=data.characters,lands=data.rainbow_lands,levels=data.levels.map(l=>({...l,primarySkill:'arrows'})),config=data.game_config,key=storageKey;
 let stored;try{stored=JSON.parse(localStorage.getItem(key)||'{}')}catch{stored={}}
 let a=migrateAdventure(stored.adventure,stored.wallet,chars,lands),r=null,def=null,duck=false,heldSpace=false,interval=null,warning=null,closed=false,view='map',pendingFriend=null,challengeKeys=null,report='Look, choose, press and release, check.',saved=true;
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
 $('who').classList.remove('hidden');$('who').textContent='Change student';$('who').onclick=()=>{save();cleanup();onLogout()};
 const ready=!!a.selectedPlayerCharacterId&&!!a.primaryRainbowLandId;
 const nav=ready?'<div class="actions"><button data-nav="map">▶ Play</button><button data-nav="stuff">⭐ Shop & friends</button></div>':'<span class="setup-steps">'+(!a.selectedPlayerCharacterId?'<strong>1. Pick a player</strong> · 2. Pick a home':'✓ Player · <strong>2. Pick a home</strong>')+' · 3. Play</span>';
 $('app').innerHTML='<nav class="adventure-nav"><strong>'+esc(teacherName)+' · #'+number+' <span class="star-wallet">⭐ '+a.wallet.rainbowStars+'</span></strong>'+nav+'</nav><h1 class="adventure-title">'+title+'</h1>'+content+(saved?'':'<p role="alert">Progress could not save on this browser.</p>');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
 }
 function navigate(where){if(r)save();if(where==='map')map();if(where==='stuff')stuff();if(where==='friends')friends();if(where==='lands')homeMap();if(where==='computer')computer()}
 function selectCharacter(changing=false){
 view='select';shell('Pick your player','<p>Who will you be? Click one picture. Rescue friends to unlock more players.</p>'+(changing?'<button id="cancel-player">← Back</button>':'')+'<div class="adventure-cards">'+(changing?chars.filter(c=>a.friends[c.id]):chars).map(c=>'<button data-hero="'+c.id+'">'+img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong></button>').join('')+'</div>');
 document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{a.selectedPlayerCharacterId=b.dataset.hero;a.friends[b.dataset.hero]??={isRescued:true,upgradeStage:'starter',homeLandId:a.primaryRainbowLandId||lands[0].id};a.unlockedCharacterIds=Object.keys(a.friends);save();changing?map():chooseLand()});if(changing)$('cancel-player').onclick=map;
 }
 function chooseLand(){
 view='select';shell('Pick your home','<p>Choose your training camp. Finish mazes to earn stars and buy a home for your friends.</p>'+landCards());
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{a.primaryRainbowLandId=b.dataset.land;a.friends[a.selectedPlayerCharacterId].homeLandId=b.dataset.land;save();map()});
 }
 function landCards(){return '<div class="adventure-cards land-cards">'+lands.map(l=>'<button data-land="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong><span>'+(view==='select'?'Training camp':owned(l.id)?'Owned ✓':'Buy · ⭐ '+worldCosts[lands.indexOf(l)])+'</span></button>').join('')+'</div>'}
 function map(){
 view='map';
 const unfinished=levels.find(l=>!a.completedLevelIds.includes(l.id)&&l.number<=a.highestUnlockedLevel);
 const current=a.activeRun&&!a.activeRun.complete&&a.activeRun.id?levels.find(l=>l.id===a.activeRun.id):null;
 const next=current||unfinished||levels[11],resume=current?.number===next.number;
 shell('Ready to play?','<section class="next-adventure"><div class="hero-summary">'+pic(a.selectedPlayerCharacterId)+'<div><h2>'+esc(char(a.selectedPlayerCharacterId).name)+'</h2><p>This is your player.</p><button id="change-player">Change character</button></div></div><div class="next-preview">'+img(next.backgroundImage,next.title)+'<div><span class="step-label">MAZE '+next.number+'</span><h2>'+esc(next.title)+'</h2><p>Earn stars. Rescue friends. Build your world!</p><p data-speech="Start at the star. Collect the pictures. Finish at the flag. Click Play when you are ready.">⭐ Start → collect → 🏁 finish</p><button id="continue-adventure" class="primary big-next">'+(resume?'▶ Keep playing':'▶ Play maze '+next.number)+'</button></div></div></section><p><button id="map-shop">⭐ Star Shop · '+a.wallet.rainbowStars+' stars</button></p><div class="simple-progress"><span>🏁 '+a.completedLevelIds.length+' of 12 mazes</span><span>🐾 '+Object.keys(a.friends).length+' of 8 friends</span></div><details id="other-mazes"><summary>Choose another maze</summary><div class="level-cards">'+levels.map(l=>'<button data-level="'+l.number+'" '+(l.number>a.highestUnlockedLevel?'disabled':'')+'>'+img(l.backgroundImage,l.title)+'<strong>'+l.number+'. '+esc(l.title)+'</strong><span>'+(a.completedLevelIds.includes(l.id)?'✓ Play again':l.number>a.highestUnlockedLevel?'🔒 Not yet':'Play')+'</span></button>').join('')+'</div></details><details id="practice-options"><summary>More arrow practice</summary><p><button id="endless">Play endless mazes</button></p></details>');
 $('map-shop').onclick=starShop;$('change-player').onclick=()=>selectCharacter(true);$('continue-adventure').onclick=()=>startLevel(next.number);
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.level)));
 $('endless').onclick=()=>{save();cleanup();goPractice()};
 }
 function stuff(){
 view='stuff';shell('My Stuff','<p>Pick what you want to see.</p><div class="stuff-cards"><button data-stuff data-nav="friends">'+pic(a.selectedPlayerCharacterId)+'<strong>🐾 My Friends</strong><span>'+Object.keys(a.friends).length+' of 8 found · Grow your friends</span></button><button data-stuff data-nav="lands">'+img(land(a.primaryRainbowLandId).cardPreview,'My Home')+'<strong>🏡 My Home</strong><span>Buy worlds and drag your decorations</span></button><button data-stuff data-nav="computer">'+img(data.computer_collectibles[0].image,'My Computer')+'<strong>💻 My Computer</strong><span>Equipment and skill badges</span></button></div><p><button id="star-shop" class="primary">⭐ Star Shop · '+a.wallet.rainbowStars+' stars</button> <button id="switch-player">Change character</button></p><button id="back-to-play" class="primary big-next">▶ Back to play</button><details class="teacher-corner"><summary>For the teacher</summary><button id="teacher-settings">Teacher settings</button><p class="small">Settings and progress saved on this browser.</p></details>');
 $('star-shop').onclick=starShop;$('switch-player').onclick=()=>selectCharacter(true);$('back-to-play').onclick=map;$('teacher-settings').onclick=teacher;
 }
 function owned(id){return a.ownedWorldIds.includes(id)}
 function buyHome(id){const i=lands.findIndex(l=>l.id===id);if(i<0)return false;if(owned(id))return true;if(a.wallet.rainbowStars<worldCosts[i])return false;a.wallet.rainbowStars-=worldCosts[i];a.ownedWorldIds.push(id);save();return true}
 function shopArt(d){return d.art?img('trackpad-adventure/decorations/'+d.art+'.webp',d.name,'shop-decoration'):'<span class="shop-emoji">'+d.emoji+'</span>'}
 function starShop(){
 view='shop';const id=a.primaryRainbowLandId;
 shell('Star Shop','<p>Finish arrow mazes to earn stars. Buy a world, then decorate it!</p><p><button id="shop-home">🏡 My world</button> <button id="shop-player">Change character</button></p><h2>Buy a world</h2><div class="adventure-cards land-cards">'+lands.map((l,i)=>'<button data-buy-land="'+l.id+'" '+(!owned(l.id)&&a.wallet.rainbowStars<worldCosts[i]?'disabled':'')+'>'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong><span>'+(owned(l.id)?'Visit world ✓':'Buy · ⭐ '+worldCosts[i])+'</span></button>').join('')+'</div><h2>Decorate '+esc(land(id).name)+'</h2><p>Buy an item. Then CLICK AND HOLD, DRAG, and DROP it in your world.</p>'+(!owned(id)?'<p class="notice">Buy this world before buying its decorations.</p>':'')+'<div class="adventure-cards decoration-cards">'+decorations.map(d=>{const has=(a.decorations[id]||[]).includes(d.id);return '<button data-buy-decor="'+d.id+'" '+(has||!owned(id)||a.wallet.rainbowStars<d.cost?'disabled':'')+'>'+shopArt(d)+'<strong>'+esc(d.name)+'</strong><span>'+(has?'Owned ✓':'Buy · ⭐ '+d.cost)+'</span></button>'}).join('')+'</div><p><button id="shop-upgrades">🌟 Character power-ups</button></p>');
 $('shop-home').onclick=()=>owned(id)?visit(id):homeMap();$('shop-player').onclick=()=>selectCharacter(true);$('shop-upgrades').onclick=friends;
 document.querySelectorAll('[data-buy-land]').forEach(b=>b.onclick=()=>{if(buyHome(b.dataset.buyLand)){a.primaryRainbowLandId=b.dataset.buyLand;save();visit(b.dataset.buyLand)}});
 document.querySelectorAll('[data-buy-decor]').forEach(b=>b.onclick=()=>{const d=decorations.find(d=>d.id===b.dataset.buyDecor);if(!d||!owned(id)||a.wallet.rainbowStars<d.cost||(a.decorations[id]||[]).includes(d.id))return;a.wallet.rainbowStars-=d.cost;(a.decorations[id]??=[]).push(d.id);save();celebrate('Your '+esc(d.name)+' is ready!',null,()=>visit(id))});
 }
 function homeMap(){view='lands';shell('Visit a home','<p>Choose an owned world, or buy a new one with your stars.</p>'+landCards()+'<button id="home-shop">⭐ Star Shop</button>');document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{if(buyHome(b.dataset.land)){a.primaryRainbowLandId=b.dataset.land;save();visit(b.dataset.land)}else{a.primaryRainbowLandId=b.dataset.land;save();starShop()}});$('home-shop').onclick=starShop}
 function visit(id){
 if(!owned(id)){starShop();return}view='land';const l=land(id),residents=Object.keys(a.friends).filter(c=>a.friends[c].homeLandId===id),props=a.decorations[id]||[];
 const position=(key,i)=>a.positions[id]?.[key]||{x:14+(i%5)*18,y:28+(Math.floor(i/5)%3)*24};
 shell(esc(l.name),'<p>CLICK AND HOLD a friend or item. DRAG it. DROP to put it down. Your layout saves.</p><p><button id="world-star-shop">⭐ Star Shop · '+a.wallet.rainbowStars+' stars</button></p><div id="arrow-world" class="land-scene free-world" style="background-image:url('+asset(l.homeBackground)+')">'+residents.map((c,i)=>{const p=position(c,i);return '<div class="world-object world-friend" data-world-object="'+c+'" role="img" aria-label="Drag '+esc(char(c).name)+'" style="left:'+p.x+'%;top:'+p.y+'%">'+pic(c)+'<span>'+esc(char(c).name)+'</span></div>'}).join('')+props.map((d,i)=>{const item=decorations.find(x=>x.id===d),p=position('decor:'+d,i+residents.length);return '<div class="world-object world-prop" data-world-object="decor:'+d+'" role="img" aria-label="Drag '+esc(item.name)+'" style="left:'+p.x+'%;top:'+p.y+'%">'+shopArt(item)+'</div>'}).join('')+'</div><p id="world-report" role="status">Drag your friends and decorations to their new places.</p><button id="make-home">Make this my main home</button> <button id="visit-friends">Move or upgrade friends</button>');
 $('world-star-shop').onclick=starShop;$('make-home').onclick=()=>{a.primaryRainbowLandId=id;save();$('make-home').textContent='✓ My main home'};$('visit-friends').onclick=friends;
 const scene=$('arrow-world');let drag=null;
 scene.onpointerdown=e=>{const el=e.target.closest('[data-world-object]');if(!el)return;e.preventDefault();if(e.pointerType!=='mouse'){$('world-report').textContent='Use your trackpad to click and hold, drag, and drop.';return}if(e.button!==0||drag)return;const r=el.getBoundingClientRect();drag={el,key:el.dataset.worldObject,pointer:e.pointerId,dx:e.clientX-r.left-r.width/2,dy:e.clientY-r.top-r.height/2,left:el.style.left,top:el.style.top};el.setPointerCapture(e.pointerId);el.classList.add('moving')};
 scene.onpointermove=e=>{if(!drag||drag.pointer!==e.pointerId)return;e.preventDefault();const r=scene.getBoundingClientRect();drag.x=Math.max(10,Math.min(90,(e.clientX-drag.dx-r.left)/r.width*100));drag.y=Math.max(18,Math.min(85,(e.clientY-drag.dy-r.top)/r.height*100));drag.el.style.left=drag.x+'%';drag.el.style.top=drag.y+'%'};
 scene.onpointerup=e=>{if(!drag||drag.pointer!==e.pointerId)return;if(drag.x!==undefined){(a.positions[id]??={})[drag.key]={x:drag.x,y:drag.y};save();$('world-report').textContent='Great drop! Your new place is saved.'}drag.el.classList.remove('moving');drag=null};
 scene.onpointercancel=scene.onlostpointercapture=()=>{if(drag){drag.el.style.left=drag.left;drag.el.style.top=drag.top;drag.el.classList.remove('moving');drag=null}};
 }
 function friends(){
 view='friends';const costs=config.progression.upgradeCost;
 shell('My Friends','<p>Use your stars to help a friend grow. You have '+a.wallet.rainbowStars+' stars.</p><div class="adventure-cards friend-cards">'+[char(a.selectedPlayerCharacterId),...chars.filter(c=>c.id!==a.selectedPlayerCharacterId)].map(c=>{const f=a.friends[c.id];if(!f)return '<div class="locked-friend">'+img(c.levels[0].thumbnail,c.name)+'<strong>'+esc(c.name)+'</strong><p>Waiting to be rescued</p></div>';const cost=f.upgradeStage==='starter'?costs.power_up:costs.super_power_additional;return '<article>'+pic(c.id)+'<h3>'+esc(c.name)+(c.id===a.selectedPlayerCharacterId?' · My player':'')+'</h3><p>'+currentStage(c.id)+' · '+esc(look(c.id).name)+'</p><p>'+esc(land(f.homeLandId).name)+'</p><button data-upgrade="'+c.id+'" '+(f.upgradeStage==='super_power'||a.wallet.rainbowStars<cost?'disabled':'')+'>'+(f.upgradeStage==='super_power'?'★ Fully grown!':a.wallet.rainbowStars<cost?'Need '+(cost-a.wallet.rainbowStars)+' more stars':'🌟 Grow · '+cost+' stars')+'</button><button data-move="'+c.id+'">🏡 Choose home</button></article>'}).join('')+'</div>');
 document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(upgradeFriend(a,b.dataset.upgrade,costs)){save();celebrate(currentStage(b.dataset.upgrade)+' unlocked!',b.dataset.upgrade,friends)}});
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>place(b.dataset.move,()=>friends()));
 }
 function place(id,after){
 pendingFriend=id;view='place';shell('Where will '+esc(char(id).name)+' live?','<p>Choose an owned home, or buy one with your stars.</p><div class="placing-friend">'+pic(id)+'</div>'+landCards());
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{if(!buyHome(b.dataset.land)){b.textContent='Earn more stars to buy this world';return}a.friends[id].homeLandId=b.dataset.land;save();pendingFriend=null;after()});
 }
 function computer(){
 view='computer';const cards=(items,owned)=>items.map(i=>'<article class="'+(owned.includes(i.id)?'earned-item':'waiting-item')+'">'+img(i.image,i.name)+'<strong>'+esc(i.name)+'</strong><p>'+(owned.includes(i.id)?'✓ Collected':'Keep exploring')+'</p></article>').join('');
 const all=data.computer_collectibles.every(i=>a.collectedComputerGearIds.includes(i.id))&&data.skill_badges.every(i=>a.earnedSkillBadgeIds.includes(i.id));
 shell('My Rainbow Computer','<h2>My computer equipment</h2><div class="adventure-cards">'+cards(data.computer_collectibles,a.collectedComputerGearIds)+'</div><h2>My computer skills</h2><div class="adventure-cards">'+cards(data.skill_badges,a.earnedSkillBadgeIds)+'</div>'+(all&&a.completedLevelIds.includes('level_12')?'<button id="build-computer" class="primary">Build my Rainbow Computer! 🌈</button>':'<p>Collect all five items and four skill badges, then finish level 12. Replay any level to collect something you missed.</p>'));
 if($('build-computer'))$('build-computer').onclick=finale;
 }
 function finale(){view='finale';sound();shell('You Built Your Rainbow Computer!','<div class="computer-build celebrate '+(settings.reducedMotion?'still':'')+'">'+data.computer_collectibles.map(i=>img(i.image,i.name)).join('')+'</div><p>You used your arrow keys, explored, and kept trying!</p><button id="more-adventures" class="primary">Keep adventuring →</button>');a.computerBuilt=true;save();$('more-adventures').onclick=map;}
 function startLevel(n,restart=false){
 clearClock();def=levels[n-1];if(!def||n>a.highestUnlockedLevel)return;
 const old=a.activeRun,valid=old&&old.id===def.id&&!old.complete&&old.w===def.mazeGrid.width&&old.h===def.mazeGrid.height&&Array.isArray(old.grid)&&old.grid.length===old.h&&Array.isArray(old.items)&&Array.isArray(old.hazards)&&old.grid[old.player?.y]?.[old.player?.x]===0;
 report='Start at the star. Use your arrow keys.';r=valid&&!restart?old:buildLevel(def,crypto.getRandomValues(new Uint32Array(1))[0],settings.difficulty==='gentle');a.activeRun=r;save();maze();
 if(r.barrier&&!r.duckLearned)modal('A new move: DUCK!','<p>Hold the <strong>SPACE bar</strong> while you press an arrow to move under a striped low bridge. Let go to stand up.</p><p>The DOWN arrow still moves down. You can also hold the big Duck button.</p><button id="duck-ready" class="primary">I’m ready to try!</button>',()=>{$('duck-ready').onclick=()=>{r.duckLearned=true;save();closeModal()}});
 }
 function maze(){
 view='maze';shell(esc(def.title),'<div class="quest-strip"><span>MAZE '+def.number+'</span><span id="quest-items"></span></div><div class="play-layout adventure-layout"><section><div class="board-wrap scenic-board" style="background-image:url('+asset(def.backgroundImage)+')"><div id="adventure-maze" class="maze" tabindex="0" aria-label="Use your keyboard arrows. Start at the star. Collect the items and reach the checkered flag."></div></div><p id="adventure-status" class="caption" role="status">'+esc(report)+'</p></section><aside class="side"><section class="panel"><h3>Use your arrow keys</h3><div class="keypad"><button class="key up" data-direction="ArrowUp">↑</button><button class="key left" data-direction="ArrowLeft">←</button><button class="key down" data-direction="ArrowDown">↓</button><button class="key right" data-direction="ArrowRight">→</button></div><p>Press. Let go. Look.</p><button id="duck-button" class="primary" aria-pressed="false" '+(!r.barrier?'hidden':'')+'>Hold SPACE to duck</button><p class="small">'+(r.hazards.length?'Go around the silly obstacles.':'Start at the star. Finish at the flag.')+'</p></section><section class="panel help-panel"><button id="maze-shop">⭐ Star Shop</button><h3>Your next step</h3><p id="next-task"></p><button id="hint-route">💡 Help me</button><details class="maze-tools"><summary>More help</summary><button id="restart-level">Start this maze over</button><button id="adventure-full">Full screen</button></details></section></aside></div>');
 document.body.classList.add('playing');
 $('maze-shop').onclick=()=>{save();starShop()};$('restart-level').onclick=()=>startLevel(def.number,true);$('hint-route').onclick=()=>{if(!settings.hints){status('Your teacher has turned hints off. Stop, look, and try one arrow.');return}const target=r.items.find(i=>!i.collected)||(!r.skill?.done&&r.skill)||r.goal;const keys=route(r.grid,r.player,target);status(keys?.length?'Try '+keys[0].slice(5).toUpperCase()+' next.':'You are at your next stop.');};
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
 let art='';if(x===1&&y===1)art='<span class="tile-symbol">⭐</span>';if(tile(r.goal)===id)art='<span class="tile-symbol">🏁</span>';if(item)art=img(data.computer_collectibles.find(i=>i.id===item.id).thumbnail,item.id,'tile-art');if(skill){const badge=data.skill_badges.find(b=>b.id===r.skill.type)||data.computer_collectibles.find(g=>g.id==='trackpad');art=img(badge.thumbnail,'Skill stop','tile-art skill-tile')}if(bridge)art+='<span class="low-bridge" title="Hold SPACE to duck">DUCK</span>';if(enemy)art+=img(data.enemies.find(e=>e.id===enemy.id).thumbnail,'Obstacle: '+data.enemies.find(e=>e.id===enemy.id).name,'tile-art enemy-art');if(here)art+='<span class="player character-player">'+pic(a.selectedPlayerCharacterId)+'</span>';
 html+='<div class="cell '+(r.grid[y][x]?'wall':'road')+(warn?' hazard-warning':'')+'" style="--c:'+['#FF2D8D','#FF8A00','#FFD600','#6BCB24','#24A8F2','#A450E0'][(x+y)%6]+'">'+art+'</div>';
 }m.innerHTML=html;m.classList.toggle('ducking',duck);const tasks=r.items.map(i=>({image:data.computer_collectibles.find(g=>g.id===i.id).thumbnail,name:data.computer_collectibles.find(g=>g.id===i.id).name,done:i.collected}));
 if(r.skill)tasks.push({image:(data.skill_badges.find(b=>b.id===r.skill.type)||data.computer_collectibles.find(g=>g.id==='trackpad')).thumbnail,name:'Skill stop',done:r.skill.done});
 $('quest-items').innerHTML=tasks.map(t=>'<span class="quest-picture '+(t.done?'task-done':'')+'">'+img(t.image,t.name)+'<span>'+(t.done?'✓':'Find')+'</span></span>').join('')+'<span class="quest-finish">→ 🏁</span>';
 const nextItem=r.items.find(i=>!i.collected);$('next-task').textContent=nextItem?'Find the '+data.computer_collectibles.find(g=>g.id===nextItem.id).name+'.':r.skill&&!r.skill.done?'Find the arrow stop. Follow the arrows.':'Go to the checkered flag!';
 fit();
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
 function challenge(kind){kind='arrows';
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
 modal('You reached the flag!','<p class="reward-stars">+'+stars+' Rainbow Stars ⭐</p><p>You finished maze '+def.number+'!</p><button id="level-next" class="primary big-next">'+(def.rescueFriendOpportunity&&!a.rescuedAtLevelIds.includes(def.id)&&chars.some(c=>!a.friends[c.id])?'🐾 Rescue a friend':def.number===12?'💻 See my computer':'▶ Next')+'</button>',()=>{$('level-next').onclick=()=>{closeModal();afterLevel()}});
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
 $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{const rows=[['Homeroom','Number','Levels','Friends','Rainbow Stars','Equipment','Skill badges']];for(let t=1;t<=18;t++)for(let n=1;n<=24;n++){try{const raw=JSON.parse(localStorage.getItem('rainbow-road-class-v3:class-'+String(t).padStart(2,'0')+':'+n)||'null'),d=raw?.adventure;if(d)rows.push([raw.teacherName||('Class '+t),n,d.completedLevelIds.length,Object.keys(d.friends).length,d.wallet.rainbowStars,d.collectedComputerGearIds.join(' / '),d.earnedSkillBadgeIds.join(' / ')])}catch{}}const csv=rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),link=document.createElement('a');link.href=url;link.download='arrow-adventure-progress.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 });
 }
 function keydown(e){
 if(closed)return;if(e.code==='Space'&&heldSpace&&$('adventure-dialog')?.open){e.preventDefault();return}const target=e.target;if(target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement)return;
 if($('adventure-dialog')?.open){if(challengeKeys&&directions[e.key]){e.preventDefault();if(!e.repeat)challengeKeys(e.key)}return}
 if(view!=='maze')return;
 if(e.code==='Space'&&target.id!=='duck-button'){e.preventDefault();heldSpace=true;setDuck(true);return}
 if(directions[e.key]){e.preventDefault();if(!e.repeat)move(e.key)}
 }
 function keyup(e){if(e.code==='Space'){if(heldSpace)e.preventDefault();heldSpace=false;setDuck(false)}}
 function blur(){heldSpace=false;setDuck(false)}
 const observer='ResizeObserver'in window?new ResizeObserver(()=>requestAnimationFrame(fit)):null;observer?.observe($('app'));
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',blur);window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 if(settings.costs)config.progression.upgradeCost={...settings.costs};
 $('help').onclick=()=>{const t='Start at the star. Use your keyboard arrows. Press and release to move one space. Collect your computer equipment. Follow the arrows at each arrow stop. Hold the space bar to duck under a striped bridge. Finish at the checkered flag.';if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.85;speechSynthesis.speak(u)}else alert(t)};
 if(!a.selectedPlayerCharacterId)selectCharacter();else if(!a.primaryRainbowLandId)chooseLand();else map();
 return {cleanup};
}

