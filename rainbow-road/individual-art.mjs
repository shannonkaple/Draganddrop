/*
 * Twenty original, separately rendered 512×512 JPEG illustrations.
 * No sprite sheet, no crops, and no borrowed portions of other characters.
 * Each artwork is rasterized on its OWN canvas and exported as image/jpeg.
 */
const cache=new Map();
const palette={
  axolotl:['#ffc3e4','#ff6cb0'],fox:['#ffc45d','#ff812d'],panda:['#ffffff','#e5e9ff'],
  pig:['#ffb5d7','#fa7dbb'],turtle:['#9bec68','#38bd70'],koala:['#dde3f4','#afb8cf'],
  bunny:['#e6c7ff','#bf80f7'],dragon:['#7deee5','#19b5c8'],otter:['#d3a06f','#986240'],
  bot:['#ffe772','#ffae20']
};
function ellipse(c,x,y,rx,ry,fill,stroke='#52618c',sw=5){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();
 if(sw){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}
}
function rect(c,x,y,w,h,rad,fill,stroke='#52618c',sw=5){
 c.beginPath();c.roundRect(x,y,w,h,rad);c.fillStyle=fill;c.fill();
 if(sw){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}
}
function poly(c,pts,fill,stroke='#52618c',sw=5){
 c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.closePath();
 c.fillStyle=fill;c.fill();if(sw){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}
}
function line(c,pts,color='#52618c',width=8){
 c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);
 c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.stroke()
}
function gloss(c,x,y,r,a,b){
 const g=c.createRadialGradient(x-r*.3,y-r*.4,r*.06,x,y,r*1.3);
 g.addColorStop(0,a);g.addColorStop(.66,b);g.addColorStop(1,b);return g;
}
function star(c,x,y,r=25,color='#ffd548'){
 const pts=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,d=k%2?r*.5:r;pts.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}
 poly(c,pts,color,'#df9617',3);ellipse(c,x-r*.19,y-r*.23,r*.16,r*.11,'#fff9', '#fff9',0);
}
function eye(c,x,y,scale=1){
 ellipse(c,x,y,17*scale,23*scale,'#19284b','#27365a',2);
 ellipse(c,x-5*scale,y-9*scale,6*scale,8*scale,'white','white',0);
 ellipse(c,x+6*scale,y+10*scale,3*scale,4*scale,'#88b8dc','#88b8dc',0);
}
function rainbowTrim(c,x,y){
 star(c,x,y,14);ellipse(c,x+23,y-34,5,7,'#ffffff','#ffffff',0);
}
function animal(c,id){
 const type=id.split('_').at(-1),v=palette[type]||palette.axolotl;
 const light=v[0],dark=v[1],fur=gloss(c,245,175,205,light,dark);
 const outline='#566389';
 c.save();c.shadowColor='#5672a050';c.shadowBlur=15;c.shadowOffsetY=8;
 // Species-specific tails, wings and shells behind the main body.
 if(type==='fox'){ellipse(c,356,343,82,47,gloss(c,336,308,84,'#fff8c5','#ff8b32'),outline,6);poly(c,[[396,304],[452,274],[417,358]],'#fff9e4',outline,5)}
 if(type==='otter')ellipse(c,369,350,88,32,'#9b694a',outline,6);
 if(type==='dragon'){poly(c,[[160,298],[94,235],[113,345]],'#7dd3ff',outline,5);poly(c,[[346,300],[421,239],[401,347]],'#79d6fa',outline,5)}
 if(type==='turtle')ellipse(c,250,336,124,117,gloss(c,230,280,155,'#9ee7ff','#1971c7'),outline,7);
 // Feet and rounded limbs.
 ellipse(c,205,408,48,29,gloss(c,188,392,56,light,dark),outline,5);
 ellipse(c,314,408,48,29,gloss(c,300,390,56,light,dark),outline,5);
 ellipse(c,161,321,34,63,gloss(c,143,287,65,light,dark),outline,5);
 ellipse(c,350,321,34,63,gloss(c,334,285,70,light,dark),outline,5);
 ellipse(c,256,340,98,104,gloss(c,219,295,135,light,dark),outline,6);
 ellipse(c,256,349,61,69,gloss(c,234,330,83,'#f8fcff','#d2e9f9'),outline,4);
 // Ears, fins, frills and horns before the face.
 if(type==='axolotl'){
  for(let s of [-1,1])for(let k=0;k<3;k++)ellipse(c,256+s*(108+k*19),165+k*23,17,32,'#ff5eae',outline,4);
 }
 if(type==='fox'){
  poly(c,[[156,165],[138,66],[212,111]],fur,outline,7);poly(c,[[303,111],[372,66],[350,165]],fur,outline,7);
  poly(c,[[153,130],[152,91],[189,119]],'#f983be','none',0);
  poly(c,[[329,120],[360,91],[355,131]],'#f983be','none',0);
 }
 if(type==='panda'){ellipse(c,156,137,44,47,'#323b58',outline,5);ellipse(c,356,137,44,47,'#323b58',outline,5);}
 if(type==='pig'){poly(c,[[148,172],[127,88],[209,139]],fur,outline,6);poly(c,[[312,139],[380,88],[361,172]],fur,outline,6)}
 if(type==='koala'){ellipse(c,137,151,62,66,'#b7becf',outline,6);ellipse(c,375,151,62,66,'#b7becf',outline,6);ellipse(c,136,152,42,45,'#ffd0de',outline,3);ellipse(c,376,152,42,45,'#ffd0de',outline,3);}
 if(type==='bunny'){ellipse(c,187,89,41,97,fur,outline,6);ellipse(c,321,89,41,97,fur,outline,6);ellipse(c,187,83,19,66,'#f4a4e9','#f4a4e9',0);ellipse(c,321,83,19,66,'#f4a4e9','#f4a4e9',0)}
 if(type==='dragon'){poly(c,[[187,141],[203,62],[236,121]],'#fff2a5',outline,5);poly(c,[[276,121],[306,62],[323,145]],'#fff2a5',outline,5);}
 if(type==='otter'){ellipse(c,155,158,39,42,fur,outline,5);ellipse(c,356,158,39,42,fur,outline,5);}
 if(type==='turtle'){ellipse(c,161,169,31,40,fur,outline,4);ellipse(c,349,169,31,40,fur,outline,4)}
 // Round, glossy face.
 ellipse(c,256,220,123,111,fur,outline,6);
 if(type==='panda'){ellipse(c,203,213,40,50,'#3f4566','#3f4566',0);ellipse(c,309,213,40,50,'#3f4566','#3f4566',0);}
 eye(c,208,219,type==='panda'?1.04:1.2);eye(c,306,219,type==='panda'?1.04:1.2);
 ellipse(c,174,267,23,12,'#ff9cbe77','#ff9cbe77',0);ellipse(c,337,267,23,12,'#ff9cbe77','#ff9cbe77',0);
 if(type==='pig'){ellipse(c,258,273,45,28,'#ff83af',outline,4);ellipse(c,243,276,7,9,'#c94f8c','#c94f8c',0);ellipse(c,273,276,7,9,'#c94f8c','#c94f8c',0)}
 else if(type==='koala'){ellipse(c,258,265,23,31,'#42435a',outline,2)}
 else {ellipse(c,257,261,12,9,'#373b60','#373b60',0);line(c,[[245,281],[255,288],[268,282]],'#6b4461',4)}
 ellipse(c,191,170,36,15,'#ffffff66','#ffffff66',0);
 // Distinct STEM accessories.
 if(type==='axolotl'){rect(c,201,324,110,62,17,'#2cc6f2',outline,4);star(c,255,354,26)}
 if(type==='fox'){rect(c,212,309,89,60,18,'#7ec4ff',outline,4);star(c,256,341,22)}
 if(type==='panda'){rect(c,176,168,161,35,14,'#81caff',outline,5);ellipse(c,204,187,24,19,'#fff9','#3378c2',5);ellipse(c,309,187,24,19,'#fff9','#3378c2',5);star(c,255,356,22)}
 if(type==='pig'){rect(c,272,313,80,69,12,'#49ccff',outline,5);star(c,309,339,19)}
 if(type==='turtle'){rect(c,202,326,113,69,24,'#ffd46b',outline,4);star(c,256,355,27)}
 if(type==='koala'){ellipse(c,291,136,28,17,'#ff69af',outline,4);ellipse(c,330,136,28,17,'#ff69af',outline,4);ellipse(c,310,137,11,12,'#ffe56c',outline,2);star(c,257,355,22)}
 if(type==='bunny'){ellipse(c,148,220,22,40,'#30a8ee',outline,5);ellipse(c,365,220,22,40,'#30a8ee',outline,5);line(c,[[148,176],[193,143],[320,143],[365,176]],'#2f88d5',12);star(c,256,355,23)}
 if(type==='dragon'){ellipse(c,256,345,40,48,'#ffe76a',outline,3);star(c,256,345,19)}
 if(type==='otter'){line(c,[[338,304],[385,374]],'#ffbb5e',13);ellipse(c,325,285,44,44,'#bcf1ff','#228dd2',11);star(c,254,347,22)}
 if(type==='bot'){rect(c,166,139,179,151,32,'#2b478c',outline,7);rect(c,185,163,140,98,26,'#213762','#77dafe',5);eye(c,225,209,1.25);eye(c,288,209,1.25);line(c,[[244,243],[273,243]],'#78efff',7);line(c,[[257,139],[257,107]],'#4f88d4',10);ellipse(c,257,99,15,15,'#ff658d',outline,3);star(c,254,347,23);}
 c.restore();
 rainbowTrim(c,425,120);rainbowTrim(c,94,382);
}
function object(c,id){
 const outline='#54658f',blue='#23a8f1',pink='#f95fa7',yellow='#ffdb51';
 c.save();c.shadowColor='#5e85c069';c.shadowBlur=13;c.shadowOffsetY=6;
 if(id==='microscope'){
  ellipse(c,259,397,143,25,'#3859b7',outline,6);rect(c,197,353,116,38,12,blue,outline,6);
  rect(c,247,180,46,170,18,'#e8f2ff',outline,6);
  line(c,[[197,137],[270,200],[303,245],[296,316]],blue,35);
  rect(c,150,111,103,55,17,'#647ff0',outline,6);ellipse(c,204,136,24,24,'#ebffff',outline,4);
  rect(c,187,294,131,20,10,yellow,outline,4);
 } else if(id==='flask'){
  poly(c,[[222,113],[290,113],[286,240],[366,356],[339,390],[173,390],[146,356],[226,240]],'#d4f7ff',outline,8);
  poly(c,[[166,322],[348,322],[365,355],[335,387],[175,387],[150,355]],'#c75dfa',outline,0);
  rect(c,214,95,83,23,10,blue,outline,4);ellipse(c,220,341,11,11,'#fff6','#fff6',0);ellipse(c,291,350,12,12,'#ffe7','#ffe7',0);star(c,254,353,23);
 }else if(id==='magnet'){
  c.lineWidth=64;c.strokeStyle='#f34159';c.lineCap='butt';c.beginPath();c.moveTo(165,134);c.lineTo(165,292);c.arc(256,291,91,Math.PI,0,true);c.lineTo(347,134);c.stroke();
  rect(c,134,127,63,62,9,'#ebf0ff',outline,5);rect(c,315,127,63,62,9,'#ebf0ff',outline,5);
  for(const [x,y] of [[390,230],[412,288],[124,350]])star(c,x,y,16);
 }else if(id==='solar_panel'){
  rect(c,92,174,328,174,12,'#275ad4',outline,8);
  for(let i=1;i<4;i++)line(c,[[92+82*i,180],[92+82*i,347]],'#c3f6ff',5);
  for(let i=1;i<3;i++)line(c,[[96,174+58*i],[417,174+58*i]],'#c3f6ff',5);
  line(c,[[256,351],[256,407]],'#718dc7',15);rect(c,200,400,116,20,10,yellow,outline,4);
 }else if(id==='wind_turbine'){
  line(c,[[257,217],[257,420]],'#459cdd',21);
  for(let j=0;j<3;j++){
   c.save();c.translate(257,214);c.rotate(j*Math.PI*2/3);poly(c,[[-20,-14],[18,-15],[36,-158],[3,-147]],'#d2f3ff',outline,5);c.restore()
  }ellipse(c,257,215,22,22,yellow,outline,5);ellipse(c,257,421,75,12,'#95de78',outline,5);
 }else if(id==='robot_arm'){
  rect(c,137,378,228,34,12,blue,outline,6);line(c,[[207,375],[214,276],[297,238],[313,170]],'#ffbb3e',35);
  for(const [x,y] of [[215,274],[297,238],[312,171]])ellipse(c,x,y,23,23,'#55cfff',outline,5);
  line(c,[[309,162],[267,118]],'#6987da',18);line(c,[[316,164],[370,133]],'#6987da',18);
  ellipse(c,265,118,14,14,yellow,outline,3);ellipse(c,370,133,14,14,yellow,outline,3);
 }else if(id==='telescope'){
  line(c,[[244,289],[162,415]],'#788fc7',17);line(c,[[246,289],[339,415]],'#788fc7',17);line(c,[[246,291],[252,415]],'#788fc7',17);
  c.save();c.translate(245,221);c.rotate(-.27);
  rect(c,-135,-47,274,93,23,'#3088e4',outline,7);rect(c,-136,-48,59,95,20,'#79d3f8',outline,6);rect(c,113,-58,51,114,17,yellow,outline,6);
  c.restore();ellipse(c,246,292,20,20,pink,outline,4);star(c,360,131,18);
 }else if(id==='dna'){
  for(let y=118;y<=397;y+=33){const t=(y-118)/279;const x1=256+80*Math.sin(t*Math.PI*3),x2=512-x1;line(c,[[x1,y],[x2,y]],['#ff8d43','#ff70b7','#65d5ff','#7dcc62'][Math.floor(t*4)%4],10)}
  const aa=[],bb=[];for(let j=0;j<=55;j++){const y=113+j*5.2,x=256+80*Math.sin((y-118)/279*Math.PI*3);aa.push([x,y]);bb.push([512-x,y])}
  line(c,aa,pink,18);line(c,bb,blue,18);star(c,396,114,15);
 }else if(id==='circuit_board'){
  rect(c,93,109,330,296,26,'#3bcf95',outline,8);
  for(let t=0;t<4;t++){line(c,[[125,150+t*68],[193,150+t*68],[218,174+t*51]],'#d7fe9c',10)}
  rect(c,211,188,102,116,18,'#344d9a','#e5fbff',7);
  for(let t=0;t<4;t++)ellipse(c,233+t*20,239,5,5,'#fbda52','#fbda52',0);
  for(let t=0;t<4;t++){ellipse(c,359,157+t*63,12,12,yellow,outline,3);ellipse(c,159,164+t*60,10,10,'#ff78ae',outline,3)}
  star(c,257,358,20);
 }else if(id==='printer_3d'){
  rect(c,120,97,272,302,22,'#e5f5ff',outline,8);rect(c,146,131,220,202,9,'#f2fdff',outline,4);
  rect(c,177,348,170,21,9,blue,outline,3);
  line(c,[[164,151],[348,151]],'#688be4',12);rect(c,220,136,80,44,10,yellow,outline,4);
  line(c,[[258,176],[258,226]],'#8892be',7);
  poly(c,[[204,276],[258,226],[315,274],[315,323],[204,323]],'#ff73af',outline,5);
  line(c,[[258,226],[258,278],[204,276]],'#ffb8da',5);
 }else return;
 c.restore();
 rainbowTrim(c,400,109);
}
export function artJPEG(path){
 if(cache.has(path))return cache.get(path);
 const parts=path.split(':'),type=parts[1],id=parts[2];
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const c=canvas.getContext('2d',{alpha:false});
 c.fillStyle='#ffffff';c.fillRect(0,0,512,512);
 const shadow=c.createRadialGradient(256,426,9,256,426,190);
 shadow.addColorStop(0,'#93b5da55');shadow.addColorStop(1,'#ffffff00');
 ellipse(c,256,429,175,29,shadow,'#ffffff00',0);
 if(type==='character')animal(c,id);
 else if(type==='item')object(c,id);
 else throw new Error('Unknown standalone art kind '+type);
 const data=canvas.toDataURL('image/jpeg',.93);
 cache.set(path,data);return data;
}
