/* Original standalone Balloon Designer face collection.
   Drawn as vector details at each character's own face anchors rather than
   reusing mismatched raster eye/mouth stickers. */
'use strict';
(()=>{
 const C=window.PARADE_CATALOG;
 if(!C)return;
 const featureSet={
 eyes:['Soft Brown','Soft Blue','Happy Eyes','Sleepy Eyes','Curious Eyes','Sweet Lashes','Little Wink','Tiny Sparkle'],
 noses:['Tiny Button','Soft Brown','Little Pink','Little Black'],
 mouths:['Little Smile','Happy Grin','Sweet Smile','Tiny O','Silly Smile','Calm Smile']
 };
 // Small original custom-drawn thumbnails, not the old unaligned sticker art.
 const icon=(kind,n)=>{
   const color=kind==='eyes'?'#38435b':kind==='noses'?'#a97970':'#9b5865';
   const inner=kind==='eyes'
    ?'<ellipse cx="30" cy="32" rx="10" ry="12" fill="#fff"/><ellipse cx="62" cy="32" rx="10" ry="12" fill="#fff"/><ellipse cx="32" cy="34" rx="6" ry="8" fill="'+color+'"/><ellipse cx="63" cy="34" rx="6" ry="8" fill="'+color+'"/><circle cx="29" cy="30" r="2.8" fill="#fff"/><circle cx="60" cy="30" r="2.8" fill="#fff"/>'
    :kind==='noses'?'<ellipse cx="47" cy="34" rx="11" ry="8" fill="'+color+'"/><ellipse cx="43" cy="31" rx="4" ry="2" fill="#fff" opacity=".6"/>'
    :'<path d="M25 28 Q48 52 70 28" fill="none" stroke="'+color+'" stroke-width="5" stroke-linecap="round"/>';
   return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64"><rect width="96" height="64" rx="14" fill="#fff7ee"/>'+inner+'</svg>');
 };
 for(const [kind,names] of Object.entries(featureSet)){
   C.parts[kind]=names.map((name,i)=>({id:i+1,name,path:icon(kind,i)}));
 }
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
 function line(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);if(pts.length===3)ctx.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);else for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke()}
 function sample(ctx,x,y){try{const d=ctx.getImageData(Math.round(x*1.5),Math.round(y*1.5),1,1).data;return d[3]>175?[d[0],d[1],d[2]]:null}catch{return null}}
 function tone(ctx,x,y){
  const candidates=[[x-48,y+14],[x-35,y+28],[x+33,y+24],[x-46,y-5]];
  for(const p of candidates){let c=sample(ctx,...p);if(c&&Math.max(...c)-Math.min(...c)<110)return c;}
  return [207,157,133];
 }
 function patch(ctx,x,y,w,h,rgb){
  ctx.save();ctx.translate(x,y);ctx.scale(w,h);
  const grad=ctx.createRadialGradient(0,0,.03,0,0,1);
  const [r,g,b]=rgb;
  grad.addColorStop(0,'rgba('+r+','+g+','+b+',1)');
  grad.addColorStop(.68,'rgba('+r+','+g+','+b+',.99)');
  grad.addColorStop(.86,'rgba('+r+','+g+','+b+',.92)');
  grad.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
  ellipse(ctx,0,0,1,1,grad);ctx.restore();
 }
 function eyes(ctx,opt,[x,y]){
  const blue=opt===2;
  const iris=blue?'#568caa':'#493b40';
  const positions=[[-18,0],[14,0]];
  for(let i=0;i<2;i++){
    let [dx,dy]=positions[i],cx=x+dx,cy=y+dy;
    if(opt===3){line(ctx,[[cx-7,cy],[cx,cy+5],[cx+7,cy]],'#6e4e48',2.8);continue}
    if(opt===7&&i===1){line(ctx,[[cx-7,cy],[cx,cy+3],[cx+7,cy]],'#60474a',2.5);continue}
    let radius=opt===5?7.7:opt===4?6.3:7.1;
    const white=ctx.createLinearGradient(cx-5,cy-7,cx+5,cy+8);
    white.addColorStop(0,'#ffffff');white.addColorStop(1,'#e5dcd7');
    ellipse(ctx,cx,cy,radius,radius*1.1,white);
    ellipse(ctx,cx+1.7,cy+.6,radius*.61,radius*.79,iris);
    ellipse(ctx,cx+2.5,cy+1,radius*.31,radius*.53,'#232b34');
    ellipse(ctx,cx-.1,cy-2.8,2.1,2.3,'#ffffff');
    if(opt===6){line(ctx,[[cx-6,cy-5],[cx-9,cy-8]],'#62434b',1.7);line(ctx,[[cx+4,cy-6],[cx+6,cy-9]],'#62434b',1.6)}
    if(opt===8){ellipse(ctx,cx+4.5,cy-4,1.5,1.5,'#ffffff')}
  }
 }
 function noses(ctx,opt,[x,y]){
  const shades=['#99736a','#8b6256','#c3878b','#65505a'];
  const g=ctx.createLinearGradient(x-5,y-4,x+6,y+5);
  g.addColorStop(0,'#fff8e9');g.addColorStop(.25,shades[opt-1]||shades[0]);g.addColorStop(1,'#604953');
  ellipse(ctx,x,y,6.1,4.9,g);ellipse(ctx,x-2,y-1.5,2.1,1.1,'#ffffff77');
 }
 function mouth(ctx,opt,[x,y]){
  const ink='#71434c';
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  if(opt===4){ellipse(ctx,x,y+1,3.8,5.3,'#743d4a');ellipse(ctx,x-1,y-1,1.4,1.2,'#e39a9b')}
  else if(opt===2||opt===5){ellipse(ctx,x,y+2,9.3,5.2,'#7e4350');ellipse(ctx,x,y+.1,7.8,1.7,'#fff9eb');if(opt===5)ellipse(ctx,x+1,y+5,3.4,1.4,'#e98a9c')}
  else if(opt===3){line(ctx,[[x-7,y],[x,y+3],[x+7,y]],ink,2.2);ellipse(ctx,x+8,y,1.2,1.1,ink)}
  else if(opt===6){line(ctx,[[x-5,y],[x,y+1],[x+5,y]],ink,1.8)}
  else line(ctx,[[x-7,y-1],[x,y+5],[x+8,y-1]],ink,2.5);
  ctx.restore();
 }
 function paint(ctx,design,base){
  const o=design.options||{},fit=base.fit;
  // Keep the original face intact when the user chooses Original Face.
  if(o.eyes>0&&fit.eyes){
    const [x,y,w,h]=fit.eyes;
    const col=tone(ctx,x,y);patch(ctx,x,y,Math.max(45,w*.67),Math.max(29,h*.7),col);
    eyes(ctx,clamp(o.eyes,1,8),[x,y]);
  }
  if(o.noses>0&&fit.noses){
    const [x,y]=fit.noses;
    const col=tone(ctx,x,y);patch(ctx,x,y,22,14,col);
    noses(ctx,clamp(o.noses,1,4),[x,y]);
  }
  if(o.mouths>0&&fit.mouths){
    const [x,y]=fit.mouths;
    const col=tone(ctx,x,y);patch(ctx,x,y,35,19,col);
    mouth(ctx,clamp(o.mouths,1,6),[x,y]);
  }
 }
 window.PARADE_FACE_ART={paint};
})();