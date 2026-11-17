/* Ms Kaple Parade Maker — final raster-only UI binding.
   All decorative graphics are true standalone PNG files, not HTML-generated
   SVG, canvas drawings, CSS shapes, or typed text approximations.
   Existing game interaction and saved data remain untouched. */
(()=>{
'use strict';
const root='assets/ui/final-png-20261117/';
const version='?v=20261117-png-icons-and-tabs-v2';
const $=id=>document.getElementById(id);
function img(path,alt='',cls=''){
 const el=document.createElement('img');
 el.src=root+path+'.png'+version;
 el.alt=alt;
 if(cls)el.className=cls;
 el.decoding='async';el.draggable=false;
 return el;
}
function installImage(selector,path,label){
 const el=document.querySelector(selector);
 if(!el)return;
 el.src=root+path+'.png';
 el.alt=label;
 el.removeAttribute('width');
 el.removeAttribute('height');
 el.classList.add('raster-image');
}
const tabs=[
 ['.step[data-tab="balloons"] img.step-game-art','tab-balloons','BALLOONS'],
 ['.step[data-tab="floats"] img.step-game-art','tab-floats','FLOATS'],
 ['.step[data-tab="bands"] img.step-game-art','tab-music','MUSIC'],
 ['.step[data-tab="decorate"] img.step-game-art','tab-scenes','SCENES'],
 ['#stageHeading img','tab-my-parade','MY PARADE'],
 ['#paradeLineupPanel .heading-put-your-parade-in-order','tab-lineup','PUT YOUR PARADE IN ORDER'],
 ['#bandGalleryTitle img','tab-marching-bands','MARCHING BANDS'],
 ['#bandMusicPanel .band-music-heading img','tab-music','MUSIC'],
 ['#decoratePanel img.heading-scenes','tab-scenes','SCENES'],
 ['#playBtn img','btn-watch-my-parade','WATCH MY PARADE']
];
tabs.forEach(([selector,file,label])=>installImage(selector,file,label));
function buttonGraphic(id,file,label,spareSpan=false){
 const el=$(id);if(!el)return;
 const legacy=el.querySelector('span');
 el.replaceChildren(img(file,label,'raster-button-image'));
 if(spareSpan){
  const span=document.createElement('span');span.className='sr-only';span.textContent=legacy?.textContent||label;
  el.appendChild(span);
 }
 el.setAttribute('aria-label',label);
 el.className='raster-control-button';
}
[
 ['homeBtn','btn-home','HOME'],['studioFullscreenBtn','btn-full-screen','FULL SCREEN'],
 ['helpBtn','btn-help','HELP'],['changeStudentBtn','btn-change-student','CHANGE STUDENT'],
 ['savedParadesBtn','btn-save-parades','SAVE PARADES'],['saveBtn','btn-save-parade','SAVE PARADE'],
 ['realBalloonTab','btn-original-balloons','ORIGINAL BALLOONS'],
 ['newBalloonTab','btn-new-characters','NEW CHARACTERS']
].forEach(([id,file,label])=>buttonGraphic(id,file,label));
const topButtons=['homeBtn','studioFullscreenBtn','helpBtn','changeStudentBtn','savedParadesBtn','saveBtn'];
topButtons.forEach(id=>$(id)?.classList.add('raster-top-button'));
['realBalloonTab','newBalloonTab'].forEach(id=>$(id)?.classList.add('raster-group-button'));
const ariaOnly=['#paradePreviewPanel .preview-caption','.lineup-instructions'];
for(const selector of ariaOnly){
 const el=document.querySelector(selector);
 if(el)el.style.display='none';
}
const surprise=$('shuffleBtn');if(surprise)surprise.style.display='none';
const previewSign=$('stageSign');if(previewSign)previewSign.style.display='none';
const location=$('movieLocation');if(location)location.style.display='none';
// Put the player's real controls UNDER the television, not on top of the animation.
const cinema=$('cinema'),footer=cinema?.querySelector('.cinema-bottom');
const controls=cinema?.querySelector('.cinema-controls');
if(footer&&controls)footer.insertBefore(controls,footer.firstChild);
const title=cinema?.querySelector('.cinema-brand');
if(title){
 title.replaceChildren(img('tv-title-your-parade','YOUR PARADE','raster-movie-title'));
}
[
 ['soundBtn','btn-sound-on','SOUND ON'],
 ['playMovieBtn','btn-resume','RESUME'],
 ['pauseBtn','btn-pause','PAUSE'],
 ['fullscreenBtn','btn-full-screen','FULL SCREEN'],
 ['closeMovieBtn','btn-back','BACK TO STUDIO'],
 ['replayBtn','btn-replay','PLAY AGAIN']
].forEach(([id,file,label])=>buttonGraphic(id,file,label,true));
// Keep the original player state machine, but show only two student choices.
const end=$('movieCelebration');
if(end){
 const title=end.querySelector('h2');
 if(title)title.textContent='PLAY AGAIN?';
 const oldPicture=end.querySelector('img');if(oldPicture)oldPicture.style.display='none';
 const actions=end.querySelector('.end-parade-actions');
 if(actions){
  const old=actions.querySelectorAll('#movieEndBack,#movieEndAgain,#movieEndYes,#movieEndNo');
  old.forEach(node=>node.remove());
  const yes=document.createElement('button');yes.id='movieEndYes';yes.type='button';yes.setAttribute('aria-label','Yes, replay my parade');
  yes.className='raster-control-button raster-answer-button';yes.appendChild(img('btn-yes','YES'));
  yes.onclick=()=>$('replayBtn')?.click();
  const no=document.createElement('button');no.id='movieEndNo';no.type='button';no.setAttribute('aria-label','No, return to parade maker');
  no.className='raster-control-button raster-answer-button';no.appendChild(img('btn-no','NO'));
  no.onclick=()=>window.PARADE_PLAYER?.close();
  actions.append(yes,no);
 }
}
for(const button of document.querySelectorAll('button.arrow-btn')){
 const direction=Number(button.dataset.direction);
 if(!Number.isFinite(direction)||direction===0)continue;
 button.replaceChildren(img(direction<0?'btn-left':'btn-right','','raster-button-image'));
 button.classList.add('raster-small-arrow');
}
// Remove legacy blurry header composite, vector skyline and emoji balloons.
const brand=document.querySelector('header.topbar .kaple-brand');
if(brand){
 brand.querySelectorAll('.float-balloon,.parade-header-scenery,.header-floating-piece').forEach(el=>el.remove());
 for(const [file,cls] of [
  ['header-confetti','raster-confetti']
 ]){
  brand.appendChild(img(file,'',cls));
 }
}
// Switch whole illustrated raster picture on selection; no text/shape drawn in the DOM.
const tabPaths={balloons:'tab-balloons',floats:'tab-floats',bands:'tab-music',decorate:'tab-scenes'};
for(const tab of document.querySelectorAll('.step[data-tab]')){
 const art=tab.querySelector('img.step-game-art');
 const base=tabPaths[tab.dataset.tab];
 if(!art||!base)continue;
 function sync(){
  const src=root+base+(tab.classList.contains('selected')?'-active':'')+'.png'+version;
  if(art.getAttribute('src')!==src)art.src=src;
 }
 sync();
 new MutationObserver(sync).observe(tab,{attributes:true,attributeFilter:['class']});
}
document.documentElement.classList.add('parade-raster-ready');
})();