/* Unified parade graphic system – single SVG master for every image heading/button. */
(function(){
 'use strict';
 const R='#e7002a',B='#9defff';
 function artwork(word,kind='heading',symbol=''){
  const control=kind==='control',w=control?300:460,h=control?68:112;
  const font=control?"'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif":"Georgia, 'Times New Roman', serif";
  const label=String(word).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const textSize=control?(word.length>13?26:31):(word.length>19?30:word.length>12?39:51);
  const x=control?(symbol?171:150):230;
  const deco=control?'':`
  <g fill="#6dc9e8" opacity=".75"><path d="M42 82v-17h14v-18h11v22h12V53h10v29zm310 0V62h12V44h10v23h11V53h16v29z"/><path d="M72 81v-10h12V57h8v24m282 0V67h11V49h8v32"/></g>
  <g fill="#fff"><circle cx="65" cy="34" r="11"/><circle cx="76" cy="30" r="15"/><circle cx="92" cy="37" r="10"/><circle cx="361" cy="31" r="10"/><circle cx="379" cy="29" r="13"/><circle cx="391" cy="37" r="9"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
   <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#faffff"/><stop offset="1" stop-color="#a9efff"/></linearGradient></defs>
   <path d="${control?'M15 5H285Q295 5 295 16V51Q295 63 283 63H17Q5 63 5 51V17Q5 5 15 5Z':'M32 87Q10 84 14 65Q12 46 35 44Q38 22 65 26Q77 5 102 19Q130 0 153 17Q175 3 201 18Q232 3 251 21Q275 7 296 27Q323 11 341 31Q366 17 382 36Q405 29 411 49Q440 49 443 67Q446 89 417 90Z'}" fill="${control?R:'url(#sky)'}" stroke="white" stroke-width="${control?6:5}"/>
   ${deco}
   <text x="${x}" y="${control?45:72}" text-anchor="middle" font-family="${font}" font-size="${textSize}" font-weight="900" letter-spacing="${control?-.3:1}" fill="${control?'white':'#b80022'}" stroke="${control?'#a80022':'white'}" stroke-width="${control?1:4}" paint-order="stroke" stroke-linejoin="round">${symbol?symbol+'  ':''}${label}</text>
   </svg>`;
 }
 const uri=(word,kind,icon)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(artwork(word,kind,icon));
 const cat={balloons:'BALLOONS',floats:'FLOATS',bands:'MUSIC',decorate:'SCENES'};
 const labels=[
  ['.step[data-tab="balloons"] .step-game-art','BALLOONS'],
  ['.step[data-tab="floats"] .step-game-art','FLOATS'],
  ['.step[data-tab="bands"] .step-game-art','MUSIC'],
  ['.step[data-tab="decorate"] .step-game-art','SCENES'],
  ['#stageHeading img','YOUR PARADE'],
  ['.heading-put-your-parade-in-order','PUT YOUR PARADE IN ORDER'],
  ['.heading-marching-bands','MARCHING BANDS'],
  ['.heading-music','MUSIC'],
  ['.heading-scenes','SCENES'],
  ['.game-play-art img','WATCH MY PARADE']
 ];
 for(const [sel,word] of labels){document.querySelectorAll(sel).forEach(el=>{
  el.src=uri(word);el.alt=word;
  el.style.cssText+=';display:block!important;object-fit:contain!important;background:transparent!important;';
 });}
 const controls=[
  ['soundBtn','SOUND ON','♫'],['playMovieBtn','RESUME','▶'],['pauseBtn','PAUSE','Ⅱ'],
  ['fullscreenBtn','FULL SCREEN','⛶'],['closeMovieBtn','BACK TO STUDIO','↩'],['replayBtn','REPLAY','↻']
 ];
 for(const [id,word,icon] of controls){
  const btn=document.getElementById(id);if(!btn)continue;
  const img=btn.querySelector('img');if(!img)continue;
  img.src=uri(word,'control',icon);img.alt=word;
  btn.classList.add('unified-image-button');
 }
 const topControls={
  homeBtn:['HOME','⌂'],studioFullscreenBtn:['FULL SCREEN','⛶'],helpBtn:['HELP','?'],
  changeStudentBtn:['CHANGE STUDENT','♙'],savedParadesBtn:['SAVED PARADES','▣'],saveBtn:['SAVE PARADE','✓']
 };
 for(const [id,[word,symbol]] of Object.entries(topControls)){
  const btn=document.getElementById(id);if(!btn)continue;
  btn.classList.add('unified-top-control');
  let img=btn.querySelector('img');if(!img){img=document.createElement('img');btn.prepend(img);}
  img.src=uri(word,'control',symbol);img.alt=word;
 }
 document.documentElement.classList.add('unified-art-ready');
})();