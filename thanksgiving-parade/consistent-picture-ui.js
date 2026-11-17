/* Single-image system. Each heading is an SVG picture, same silhouette, skyline,
   typography and dimensions; only its wording changes. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
function escape(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function picture(label){
 const lines=label==="PUT YOUR PARADE IN ORDER"?["PUT YOUR PARADE","IN ORDER"]:label==="WATCH MY PARADE"?["WATCH MY","PARADE"]:[label];
 const longest=Math.max(...lines.map(l=>l.length));
 const size=lines.length>1?30:longest>16?27:longest>11?34:46;
 const y=lines.length>1?[56,91]:[77];
 const texts=lines.map((str,i)=>'<text x="240" y="'+y[i]+'" text-anchor="middle" textLength="'+Math.min(410,Math.max(130,str.length*size*.58))+'" lengthAdjust="spacingAndGlyphs" paint-order="stroke" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" fill="#cf002b" font-size="'+size+'" font-weight="1000" font-family="Georgia,Times New Roman,serif">'+escape(str)+'</text>').join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="126" viewBox="0 0 480 126">'+
 '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c4f9ff"/><stop offset=".6" stop-color="#94ebff"/><stop offset="1" stop-color="#46c6ec"/></linearGradient></defs>'+
 '<path d="M28 103Q8 101 11 81Q4 62 25 53Q26 34 52 34Q65 13 91 26Q108 6 137 23Q164 2 193 16Q219 -2 242 16Q272 -1 294 17Q323 4 346 24Q375 10 389 30Q421 17 434 43Q463 40 466 65Q481 92 459 102Q253 126 28 103Z" fill="url(#sky)" stroke="white" stroke-width="5" stroke-linejoin="round"/>'+
 '<path d="M20 95Q240 120 461 95" stroke="#ffffff" stroke-width="4" fill="none"/>'+
 '<path d="M28 91Q240 113 454 91" stroke="#d6f8ff" stroke-width="2" fill="none"/>'+
 '<g fill="#47b8df" opacity=".53"><path d="M27 92V68h15V61h8v31h12V55h7V45h4V55h11v37h10V70h16v22h10V78h14v14zm330 0V77h12V61h7v31h10V55h7V44h4v11h9v37h11V68h16v24h14V78h7v14Z"/>'+
 '<path d="M41 77h5v5h-5zm19-10h5v6h-5zm18 4h5v5h-5zm305-4h5v6h-5zm19 3h5v5h-5zm18 7h5v5h-5z" fill="#bdf6ff"/></g>'+
 '<g fill="#fff"><ellipse cx="52" cy="52" rx="18" ry="8"/><circle cx="43" cy="48" r="8"/><circle cx="59" cy="46" r="10"/><ellipse cx="414" cy="51" rx="19" ry="7"/><circle cx="403" cy="48" r="9"/><circle cx="426" cy="46" r="9"/></g>'+
 texts+'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
const headings=[
 ['.step[data-tab="balloons"] img.step-game-art','BALLOONS'],
 ['.step[data-tab="floats"] img.step-game-art','FLOATS'],
 ['.step[data-tab="bands"] img.step-game-art','MUSIC'],
 ['.step[data-tab="decorate"] img.step-game-art','SCENES'],
 ['#stageHeading img','YOUR PARADE'],
 ['#paradeLineupPanel .heading-put-your-parade-in-order','PUT YOUR PARADE IN ORDER'],
 ['#bandGalleryTitle img','MARCHING BANDS'],
 ['#bandMusicPanel .band-music-heading img','MUSIC'],
 ['#decoratePanel img.heading-scenes','SCENES'],
 ['#playBtn img','WATCH MY PARADE']
];
for(const [selector,label] of headings){
 document.querySelectorAll(selector).forEach(el=>{
  el.src=picture(label);
  el.alt=label;
  el.setAttribute('decoding','async');
  el.classList.add('parade-uniform-graphic');
 });
}
const utilityButtons=[
 ['homeBtn','HOME'],['studioFullscreenBtn','FULL SCREEN'],['helpBtn','HELP'],
 ['changeStudentBtn','CHANGE STUDENT'],['savedParadesBtn','SAVE PARADES'],
 ['saveBtn','SAVE PARADE']
];
for(const [id,label] of utilityButtons){
 const el=$(id);if(!el)continue;
 el.classList.remove('unified-top-control','brand-picture-button');
 el.querySelectorAll('img').forEach(img=>img.remove());
 const existing=el.querySelector('.kaple-label');if(existing)existing.textContent=label;
 el.setAttribute('aria-label',label);
 el.classList.add('parade-uniform-utility');
}
for(const [selector,label] of [['#balloonGroupNav [data-balloon-group="real"]','ORIGINAL BALLOONS'],['#balloonGroupNav [data-balloon-group="new"]','NEW CHARACTERS']]){
 const button=document.querySelector(selector);if(button)button.classList.add('parade-uniform-subutility');
}
const paradeLabel=$('cinema')?.querySelector('.cinema-brand');
if(paradeLabel){
 paradeLabel.replaceChildren();
 const img=document.createElement('img');
 img.src=picture('YOUR PARADE');img.alt='YOUR PARADE';img.className='parade-movie-title parade-uniform-graphic';
 paradeLabel.append(img);
}
const movieLocation=$('movieLocation');
if(movieLocation)movieLocation.style.display='none';
const previewSign=$('stageSign');
if(previewSign)previewSign.style.display='none';
const surprise=$('shuffleBtn');if(surprise)surprise.style.display='none';
const cinema=$('cinema');
const footer=cinema?.querySelector('.cinema-bottom');
const buttons=cinema?.querySelector('.cinema-controls');
if(footer&&buttons)footer.insertBefore(buttons,footer.firstChild);
const cNames={
 soundBtn:'SOUND ON',playMovieBtn:'RESUME',pauseBtn:'PAUSE',fullscreenBtn:'FULL SCREEN',closeMovieBtn:'BACK TO STUDIO',replayBtn:'PLAY AGAIN'
};
for(const [id,name] of Object.entries(cNames)){
 const button=$(id);if(!button)continue;
 button.classList.remove('brand-picture-button','unified-image-button');
 button.querySelectorAll('img').forEach(img=>img.remove());
 const span=button.querySelector('span')||document.createElement('span');
 if(!span.parentElement)button.append(span);
 span.textContent=name;
 button.classList.add('parade-uniform-control');
 button.setAttribute('aria-label',name);
}
const end=$('movieCelebration');
if(end){
 const oldTitle=end.querySelector('h2');if(oldTitle)oldTitle.textContent='PLAY AGAIN?';
 const oldImage=end.querySelector('img');if(oldImage)oldImage.remove();
 const actions=end.querySelector('.end-parade-actions');
 if(actions){
  const back=document.createElement('button');back.type='button';back.id='movieEndBack';back.className='parade-uniform-control';back.textContent='BACK TO STUDIO';back.onclick=()=>window.PARADE_PLAYER?.close();
  const again=document.createElement('button');again.type='button';again.id='movieEndAgain';again.className='parade-uniform-control';again.textContent='PLAY AGAIN';again.onclick=()=>$('replayBtn')?.click();
  actions.append(back,again);
 }
}
document.documentElement.classList.add('parade-graphic-cleanup-ready');
})();