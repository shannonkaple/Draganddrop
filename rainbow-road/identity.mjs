export const classKey=(teacherId,number)=>`rainbow-road-class-v3:${teacherId}:${number}`;
export const oldKey=number=>`rainbow-road-number-v2:${number}`;
const claimsKey='rainbow-road-legacy-claims-v1';
export function copyLegacy(storage,teacherId){let claims;try{claims=JSON.parse(storage.getItem(claimsKey))||{}}catch{claims={}}let count=0;for(let n=1;n<=24;n++){const value=storage.getItem(oldKey(n));if(!value||claims[n]||storage.getItem(classKey(teacherId,n)))continue;try{JSON.parse(value)}catch{continue}storage.setItem(classKey(teacherId,n),value);claims[n]=teacherId;count++}storage.setItem(claimsKey,JSON.stringify(claims));return count}
