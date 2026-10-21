// Sweep the entire dragged token through an expanded obstacle rectangle.
// This catches fast pointer jumps as well as overlap at a stationary pointer.
export function segmentHitsRect(x1,y1,x2,y2,rect,padX=0,padY=padX){
 let enter=0,leave=1;
 for(const [a,b,min,max] of [[x1,x2,rect.left-padX,rect.right+padX],[y1,y2,rect.top-padY,rect.bottom+padY]]){
  const delta=b-a;if(Math.abs(delta)<1e-9){if(a<min||a>max)return false;continue}
  let near=(min-a)/delta,far=(max-a)/delta;if(near>far)[near,far]=[far,near];enter=Math.max(enter,near);leave=Math.min(leave,far);if(enter>leave)return false;
 }
 return true;
}
