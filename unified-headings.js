/* Polished illustrated image artwork, generated from one consistent brand master.
   Images are genuine SVG graphics rendered via <img>, not HTML text labels. */
(function(){
"use strict";
const base="assets/ui/kaple-2026-raster/brand-20261117/";
function art(label,mode="plaque"){
 const button=mode==="button", W=button?260:520,H=button?76:128;
 const fs=button?(label.length>14?22:label.length>10?25:31):(label.length>22?31:label.length>16?37:label.length>12?43:59);
 const esc=String(label).replace(/&/g,"&amp;").replace(/</g,"&lt;");
 const outline=button
 ? '<rect x="6" y="6" width="248" height="64" rx="18" fill="#df002c" stroke="#fff" stroke-width="5"/><rect x="10" y="9" width="240" height="55" rx="15" fill="none" stroke="#970020" stroke-width="2"/>'
 : '<path d="M43 102 C13 103 12 83 23 73 C10 53 30 38 48 42 C51 20 78 15 91 26 C106 9 127 8 148 19 C176 1 201 12 212 24 C245 5 270 8 290 20 C324 5 349 11 364 27 C389 8 422 18 428 38 C452 28 472 44 465 59 C500 60 505 91 478 103 Z" fill="#a3edff" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M28 80 C20 58 39 45 56 51 C63 32 88 30 104 43 C124 24 155 27 169 41 C203 25 234 27 249 38 C277 17 312 30 324 44 C351 26 378 38 384 51 C409 36 431 45 438 60 C460 50 480 69 473 82" fill="none" stroke="#e5ffff" stroke-width="3" opacity=".75"/>';
 const skyline=button?"":'<g fill="#53b9db" opacity=".67"><path d="M40 97V75H59V65H68V97H78V57H94V71H103V97H114V80H129V97H144V72H160V58H173V97H182V85H199V97H320V77H335V97H347V62H367V53H377V97H389V75H406V97H418V68H431V97H446V84H461V97Z"/><path d="M71 97V82h5v15m91 0V80h5v17m182 0V72h5v25m17 0V77h4v20" stroke="#2a95bf" stroke-width="1.5"/></g><g fill="#fff" opacity=".96"><ellipse cx="101" cy="49" rx="24" ry="12"/><ellipse cx="85" cy="55" rx="14" ry="11"/><ellipse cx="418" cy="46" rx="22" ry="12"/><ellipse cx="434" cy="51" rx="14" ry="10"/><ellipse cx="253" cy="33" rx="20" ry="7"/></g>';
 const stars=button?"":'<g fill="#fff"><path d="M54 61l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M451 63l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>';
 const ty=button?51:85, cx=W/2;
 const letter=button?0:1;
 const font=button?"'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif":"Georgia,'Times New Roman',serif";
 const fill=button?"#fff":"#cb0025";
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><defs><filter id="shadow" x="-15%" y="-20%" width="130%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/><feOffset dx="0" dy="2" result="d"/><feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+outline+skyline+stars+'<g filter="url(#shadow)"><text x="'+cx+'" y="'+ty+'" text-anchor="middle" font-family="'+font+'" font-weight="1000" font-size="'+fs+'" letter-spacing="'+letter+'" paint-order="stroke" stroke-linejoin="round" stroke="'+(button?"#a20022":"#fff")+'" stroke-width="'+(button?1.2:6)+'" fill="'+fill+'">'+esc+'</text></g></svg>';
}
const uri=(label,mode)=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(art(label,mode));
function applyImage(node,label,mode="plaque"){if(!node)return;node.src=uri(label,mode);node.alt=label;node.decoding="async";node.style.setProperty("background","transparent","important");node.classList.add("brand-illustrated-image");}
const artLabels=[
 ['.step[data-tab="balloons"] .step-game-art',"BALLOONS"],
 ['.step[data-tab="floats"] .step-game-art',"FLOATS"],
 ['.step[data-tab="bands"] .step-game-art',"MUSIC"],
 ['.step[data-tab="decorate"] .step-game-art',"SCENES"],
 ['#stageHeading img',"YOUR PARADE"],
 ['.heading-put-your-parade-in-order',"PUT YOUR PARADE IN ORDER"],
 ['.heading-marching-bands',"MARCHING BANDS"],
 ['.heading-music',"MUSIC"],
 ['.heading-scenes',"SCENES"],
 ['.game-play-art img',"WATCH MY PARADE"]
];
for(const [sel,label] of artLabels) document.querySelectorAll(sel).forEach(img=>applyImage(img,label));
const top=[
 ['homeBtn',"HOME"],['studioFullscreenBtn',"FULL SCREEN"],['helpBtn',"HELP"],
 ['changeStudentBtn',"CHANGE STUDENT"],['savedParadesBtn',"SAVED PARADES"],['saveBtn',"SAVE PARADE"]
];
for(const [id,label] of top){const btn=document.getElementById(id);if(!btn)continue;let img=btn.querySelector("img");if(!img){img=document.createElement("img");btn.insertBefore(img,btn.firstChild);}applyImage(img,label,"button");btn.classList.add("brand-picture-button");}
const player=[
 ['soundBtn',"SOUND ON"],['playMovieBtn',"RESUME"],['pauseBtn',"PAUSE"],['fullscreenBtn',"FULL SCREEN"],
 ['closeMovieBtn',"BACK TO STUDIO"],['replayBtn',"REPLAY"]
];
for(const [id,label] of player){const btn=document.getElementById(id);if(!btn)continue;let img=btn.querySelector("img");if(!img){img=document.createElement("img");btn.insertBefore(img,btn.firstChild);}applyImage(img,label,"button");btn.classList.add("brand-picture-button");}
const header=document.querySelector("header.topbar .kaple-brand"),scenery=header?.querySelector(".parade-header-scenery");
if(scenery){
 for(const [area,cls] of [['worm','left'],['bear','center'],['ice','right']]){
  const cp=scenery.cloneNode(false);cp.className='header-floating-piece header-'+area;cp.setAttribute('aria-hidden','true');
  cp.removeAttribute('id');header.appendChild(cp);
 }
 scenery.classList.add('fixed-skyline');
}
document.documentElement.classList.add("brand-image-ready");
})();
