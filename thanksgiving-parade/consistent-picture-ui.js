/* Single-image system. Each heading is an SVG picture, same silhouette, skyline,
   typography and dimensions; only its wording changes. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
function escape(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function picture(label){
 // A real image: one flat-bottom scalloped tab, with a festive slab-serif title.
 const lines=label==="PUT YOUR PARADE IN ORDER"?["PUT YOUR PARADE","IN ORDER"]:[label];
 const title=lines.map((line,i)=>{
   const len=line.length;
   const sz=lines.length>1?35:len>17?29:len>12?35:len>9?43:58;
   const y=lines.length>1?50+i*42:79;
   return '<text x="240" y="'+y+'" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="'+sz+'" letter-spacing="-.4" paint-order="stroke" stroke="#fff" stroke-width="6.5" stroke-linejoin="round" fill="#cc0025">'+escape(line)+'</text>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="480" height="126" viewBox="0 0 480 126">'+
 '<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#e8fcff"/><stop offset=".65" stop-color="#a5ebfc"/><stop offset="1" stop-color="#79d0ed"/></linearGradient></defs>'+
 '<path d="M14 119V73Q14 53 37 48Q47 20 74 33Q89 11 118 25Q145 5 169 21Q197 2 224 17Q252 0 280 20Q306 5 331 24Q361 9 383 33Q410 19 427 45Q463 48 466 75V119Z" fill="url(#bg)" stroke="white" stroke-width="5" stroke-linejoin="round"/>'+
 '<path d="M18 112H462" stroke="#fff" stroke-width="5"/>'+
 '<g fill="#48b7dd" opacity=".5"><path d="M19 113V87h13V74h7v39h13V90h10v23h12V66h5v-9h4v9h13v47h12V91h12v22h16V97h13v16zm320 0V92h12v21h10V67h4v-10h5v10h12v46h14V91h14v22h11V75h7v38h14V87h13v26Z"/></g>'+
 '<g fill="#fff"><ellipse cx="64" cy="51" rx="17" ry="8"/><circle cx="54" cy="48" r="9"/><circle cx="73" cy="46" r="10"/><ellipse cx="411" cy="49" rx="17" ry="8"/><circle cx="400" cy="46" r="9"/><circle cx="423" cy="47" r="8"/></g>'+title+'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
const headings=[
 ['.step[data-tab="balloons"] img.step-game-art','BALLOONS'],
 ['.step[data-tab="floats"] img.step-game-art','FLOATS'],
 ['.step[data-tab="bands"] img.step-game-art','MUSIC'],
 ['.step[data-tab="decorate"] img.step-game-art','SCENES'],
 ['#stageHeading img','MY PARADE'],
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
const primaryPlay=$('playBtn')?.querySelector('img');
if(primaryPlay){ primaryPlay.src='assets/ui/watch-parade-red-picture.svg';primaryPlay.alt='WATCH MY PARADE';}
const removedInstructions=document.querySelector('.lineup-instructions');if(removedInstructions)removedInstructions.remove();
const previewCaption=document.querySelector('#paradePreviewPanel .preview-caption');if(previewCaption)previewCaption.style.display='none';
const paradeLabel=$('cinema')?.querySelector('.cinema-brand');
if(paradeLabel){
 paradeLabel.replaceChildren();
 const img=document.createElement('img');
 img.src='assets/ui/tv-parade-title.svg';img.alt='YOUR PARADE';img.className='parade-movie-title parade-uniform-graphic';
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
 const oldTitle=end.querySelector('h2');if(oldTitle)oldTitle.textContent='PLAY AGAIN?';oldTitle.style.fontFamily="VAG,'Arial Rounded MT Bold',sans-serif";
 const oldImage=end.querySelector('img');if(oldImage)oldImage.remove();
 const actions=end.querySelector('.end-parade-actions');
 if(actions){
  const back=document.createElement('button');back.type='button';back.id='movieEndBack';back.className='parade-uniform-control';back.textContent='NO';back.onclick=()=>window.PARADE_PLAYER?.close();
  const again=document.createElement('button');again.type='button';again.id='movieEndAgain';again.className='parade-uniform-control';again.textContent='YES';again.onclick=()=>$('replayBtn')?.click();
  actions.append(back,again);
 }
}
document.documentElement.classList.add('parade-graphic-cleanup-ready');
})();