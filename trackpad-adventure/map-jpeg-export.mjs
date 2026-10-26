// Export the EXACT illustrations used in-game as matching JPEGs.
const names=['overview','candy','pirate','arctic','castle','space','jurassic','ocean','lava'];
function crc32(data){let crc=0xffffffff;for(let i=0;i<data.length;i++){crc^=data[i];for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
function imageJpeg(id){return new Promise((resolve,reject)=>{const img=new Image();
 img.onload=()=>{try{const width=id==='overview'?1600:1200,height=id==='overview'?900:680;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
 canvas.toBlob(async blob=>{if(!blob)return reject(new Error('JPEG export failed'));try{resolve(new Uint8Array(await blob.arrayBuffer()))}catch(e){reject(e)}},'image/jpeg',.91)
 }catch(error){reject(error)}};
 img.onerror=()=>reject(new Error('Could not load '+id+' map illustration'));
 img.src='trackpad-adventure/maps/'+id+'.svg?v=20261026-illustrated';
})}
function writeZip(items){
 const encoder=new TextEncoder(),locals=[],centrals=[];let offset=0;
 const u16=(dv,o,v)=>dv.setUint16(o,v,true),u32=(dv,o,v)=>dv.setUint32(o,v>>>0,true);
 for(const item of items){
  const name=encoder.encode(item.name),data=item.data,crc=crc32(data);
  const h=new Uint8Array(30+name.length),v=new DataView(h.buffer);
  u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,0);u16(v,8,0);u16(v,10,0);u16(v,12,0);u32(v,14,crc);u32(v,18,data.length);u32(v,22,data.length);u16(v,26,name.length);u16(v,28,0);h.set(name,30);locals.push(h,data);
  const ch=new Uint8Array(46+name.length),cv=new DataView(ch.buffer);
  u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0);u16(cv,10,0);u16(cv,12,0);u16(cv,14,0);
  u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u16(cv,30,0);u16(cv,32,0);u16(cv,34,0);u16(cv,36,0);u32(cv,38,0);u32(cv,42,offset);ch.set(name,46);centrals.push(ch);
  offset+=h.length+data.length;
 }
 const size=centrals.reduce((sum,b)=>sum+b.length,0);
 const end=new Uint8Array(22),v=new DataView(end.buffer);u32(v,0,0x06054b50);u16(v,4,0);u16(v,6,0);u16(v,8,items.length);u16(v,10,items.length);u32(v,12,size);u32(v,16,offset);u16(v,20,0);
 return new Blob([...locals,...centrals,end],{type:'application/zip'});
}
export async function downloadWorldMapJpegs(button){
 if(button){button.disabled=true;button.textContent='Making 9 matching JPEGs…'}
 try{const result=[];for(const id of names){result.push({name:'trackpad-map-'+id+'.jpg',data:await imageJpeg(id)})}
 const url=URL.createObjectURL(writeZip(result)),a=document.createElement('a');
 a.href=url;a.download='trackpad-adventure-matching-jpeg-maps.zip';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),120000);
 }catch(e){alert('Could not export the map JPEGs: '+e.message)}
 finally{if(button){button.disabled=false;button.textContent='Download matching JPEG maps (.zip)'}}
}