from urllib.parse import urlsplit,urlunsplit
from PIL import Image,ImageEnhance
from io import BytesIO
from pathlib import Path
import requests
src="https://media.canva.com/v2/image-resize/format:PNG/height:112/quality:100/uri:ifs%3A%2F%2FM%2Fa88bd9d3-9bd5-45f9-ab4a-07783d4ef878/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAKaqqjkMleuJ7bQmqv1qq3qB3GKKNkAeANePvx5rYIec&exp=1793056839&osig=AAAAAAAAAAAAAAAAAAAAAOyztjSjdWt22teUO_M1NRURC-Cvs4AN5Wtsg4Z-vCZ_&signer=media-rpc&token=AAIAAU0AJGE4OGJkOWQzLTliZDUtNDVmOS1hYjRhLTA3NzgzZDRlZjg3OAAAAAABoXqEFVgMydtstSE6NPnSrw9sGTeWaHd0uXz0gezIPJWjyjwmQQ&x-canva-quality=thumbnail"
# The Canva URL only exposes artwork generated for the user's game. First try full resolution;
# if the signed transformation cannot resize, use the approved source thumbnail as fallback.
parts=urlsplit(src)
fullpath=parts.path.replace("height:112","height:941").replace("width:200","width:1672")
urls=[urlunsplit((parts.scheme,parts.netloc,fullpath,parts.query,parts.fragment)),src]
im=None
for idx,candidate in enumerate(urls):
 try:
  response=requests.get(candidate,timeout=22)
  print("candidate",idx,"HTTP",response.status_code,"bytes",len(response.content))
  response.raise_for_status()
  temp=Image.open(BytesIO(response.content))
  temp.load()
  print("image resolution",temp.size)
  im=temp
  if temp.width>=1000:break
 except Exception as error: print("candidate failed",str(error)[:200])
if im is None:raise SystemExit("Cannot retrieve generated game artwork from Canva CDN")
im=im.convert("RGB")
im=im.resize((1600,690),Image.Resampling.LANCZOS)
out=Path("trackpad-adventure/maps/overview.jpg")
im.save(out,quality=83,optimize=True,progressive=True)
print("wrote",out,round(out.stat().st_size/1024),"KB")
