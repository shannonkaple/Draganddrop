"""One-time check of public Canva media transformation link for user's uploaded map."""
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
from PIL import Image
from io import BytesIO
import requests, pathlib
ORIGINAL="https://media.canva.com/v2/image-resize/format:PNG/height:66/quality:100/uri:ifs%3A%2F%2FM%2F4c6cbceb-ac74-4d27-adce-3647dc097bb4/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAB7Xk5ggwE1IZ-oeLW-1BZ_CGDuiHM_U11q2GkcAMesd&exp=1793134454&osig=AAAAAAAAAAAAAAAAAAAAACv2GdLvxDvjFZeoZOMZr1EjiimXmO8P4yvJMQMLJa7n&signer=media-rpc&token=AAIAAU0AJDRjNmNiY2ViLWFjNzQtNGQyNy1hZGNlLTM2NDdkYzA5N2JiNAAAAAABoX8kZPCyts6iQmqBqxj0tdkRYVmJp3C4KilZdgoxeonSx2yFkw&x-canva-quality=thumbnail"
s=urlsplit(ORIGINAL)
u=s.path
variants={
 "thumb":ORIGINAL,
 "fullpath":urlunsplit((s.scheme,s.netloc,u.replace("height:66","height:682").replace("width:200","width:2048"),s.query,"")),
 "fullpath_no_csig":urlunsplit((s.scheme,s.netloc,u.replace("height:66","height:682").replace("width:200","width:2048"),urlencode([(k,v) for k,v in parse_qsl(s.query) if k not in ("csig","osig")]),"")),
 "fullpath_no_thumb":urlunsplit((s.scheme,s.netloc,u.replace("height:66","height:682").replace("width:200","width:2048"),s.query.replace("&x-canva-quality=thumbnail",""),"")),
 "original_ifx":"https://media.canva.com/v2/image-resize/format:PNG/height:682/quality:100/uri:ifs%3A%2F%2FM%2F4c6cbceb-ac74-4d27-adce-3647dc097bb4/watermark:F/width:2048",
 "gdrive_direct":"https://drive.google.com/uc?export=download&id=1Z20Y_eCTqTDBwlcedaFMqQZZM9x-asDy",
}
for k,url in variants.items():
 try:
  r=requests.get(url,timeout=18,headers={"User-Agent":"Mozilla/5.0","Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"})
  print(k,r.status_code, len(r.content),r.headers.get("content-type",""))
  if r.headers.get("content-type","").startswith("image/"):
   im=Image.open(BytesIO(r.content));print("IMAGE",k,im.size)
   if im.width>=1900 and im.height>=640:
    pathlib.Path("trackpad-adventure/maps/candy-original-upload.jpg").write_bytes(im.convert("RGB").tobytes()) if False else None
    im.convert("RGB").save("trackpad-adventure/maps/candy-original-upload.jpg",quality=94,subsampling=0,optimize=True)
    print("SAVED FULL RES ORIGINAL")
    break
 except Exception as e: print(k,type(e).__name__,str(e)[:160])
