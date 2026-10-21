export const saveKey=(teacherId,number)=>`kaple-trackpad-adventure-v2:${teacherId}:${number}`;
export const legacyKey=number=>`kaple-trackpad-adventure-v1:${number}`;
const claimsKey='kaple-trackpad-legacy-claims-v1';
export function copyLegacy(storage,teacherId,max=24){let claims;try{claims=JSON.parse(storage.getItem(claimsKey))||{}}catch{claims={}}let copied=0;for(let n=1;n<=max;n++){const old=storage.getItem(legacyKey(n));if(!old||claims[n]||storage.getItem(saveKey(teacherId,n)))continue;try{JSON.parse(old)}catch{continue}storage.setItem(saveKey(teacherId,n),old);claims[n]=teacherId;copied++}storage.setItem(claimsKey,JSON.stringify(claims));return copied}
export function isClaimed(storage,number){try{return Boolean(JSON.parse(storage.getItem(claimsKey))?.[number])}catch{return false}}
