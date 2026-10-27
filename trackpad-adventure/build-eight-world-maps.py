from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from pathlib import Path
import math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"trackpad-adventure/maps";OUT.mkdir(exist_ok=True,parents=True)
W,H=1600,900
# These precise centers are shared by all eight JPEGs and all 64 live HTML buttons.
STOPS=[(0.14,0.37),(0.37,0.37),(0.60,0.37),(0.83,0.37),(0.14,0.74),(0.37,0.74),(0.60,0.74),(0.83,0.74)]
THEMES=[
 ("candy",(255,151,204),(255,236,161),"Candy Bunny","🐰"),
 ("pirate",(249,189,82),(255,230,168),"Pirate Parrot","🦜"),
 ("arctic",(114,207,244),(233,251,255),"Arctic Seal","🦭"),
 ("castle",(220,143,226),(255,224,206),"Castle Griffin","🦅"),
 ("space",(130,127,237),(214,226,255),"Space Alien","👽"),
 ("jurassic",(111,207,112),(217,248,158),"Baby Dino","🦖"),
 ("ocean",(72,195,234),(189,249,241),"Ocean Dolphin","🐬"),
 ("lava",(254,132,91),(255,217,119),"Lava Lizard","🦎")]
try:
 BOLD=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",43)
 SMALL=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",30)
 TITLE=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",71)
except OSError: BOLD=SMALL=TITLE=ImageFont.load_default()
def circle(draw,c,r,fill,outline=None,width=1):
 x,y=c; draw.ellipse((x-r,y-r,x+r,y+r),fill=fill,outline=outline,width=width)
def textcenter(d,xy,text,font,fill,stroke_width=0,stroke_fill=None):
 bb=d.textbbox((0,0),text,font=font,stroke_width=stroke_width)
 d.text((xy[0]-(bb[2]-bb[0])/2,xy[1]-(bb[3]-bb[1])/2-3),text,font=font,fill=fill,stroke_width=stroke_width,stroke_fill=stroke_fill)
for idx,(world,color,light,friend,emoji) in enumerate(THEMES):
 base=ROOT/"arrow-lab/scenes"/(world+".jpg")
 if not base.exists() or base.stat().st_size<4000:
  base=ROOT/"arrow-lab/map-background-hd.jpg"
 photo=Image.open(base).convert("RGB").resize((W,H),Image.Resampling.LANCZOS)
 # Colored vignette ties Arrow Adventure's existing scenery into the unified eight-stop interface.
 overlay=Image.new("RGBA",(W,H),(0,0,0,0));o=ImageDraw.Draw(overlay)
 o.rounded_rectangle((10,10,W-10,H-10),radius=28,outline=(255,255,255,240),width=8)
 o.rounded_rectangle((420,30,1180,135),radius=37,fill=(255,255,255,222),outline=(*color,255),width=8)
 textcenter(o,(800,81),world.upper()+" WORLD",TITLE,(42,47,91,255))
 # Continuous pale path, so the activity spots actually look connected.
 centers=[(int(x*W),int(y*H)) for x,y in STOPS]
 linepoints=centers[:4]+[(1510,520),(1470,620)]+list(reversed(centers[4:]))
 o.line(linepoints, fill=(60,48,96,175),width=83,joint="curve")
 o.line(linepoints, fill=(255,255,252,255),width=70,joint="curve")
 o.line(linepoints, fill=(*color,225),width=53,joint="curve")
 # The gold ring, white interior, and circle centers are EXACTLY the same in every world.
 for n,(x,y) in enumerate(centers,1):
  circle(o,(x+3,y+9),70,(35,36,63,112))
  circle(o,(x,y),68,(255,252,245,255),(57,47,81,255),7)
  circle(o,(x,y),59,(*light,255),(*color,255),12)
  circle(o,(x,y),45,(255,252,233,255),(255,255,255,255),4)
  textcenter(o,(x,y),str(n),BOLD,(50,51,92,255))
  if n==8:
   o.rounded_rectangle((x-115,y+72,x+115,y+122),radius=22,fill=(255,243,172,255),outline=(255,255,255,255),width=4)
   textcenter(o,(x,y+96),"RESCUE FRIEND",SMALL,(80,49,91,255))
 o.rounded_rectangle((31,775,410,861),radius=31,fill=(255,255,255,226),outline=(*color,255),width=5)
 textcenter(o,(215,814),"8 LEVELS · 1 FRIEND",SMALL,(61,52,93,255))
 img=Image.alpha_composite(photo.convert("RGBA"),overlay).convert("RGB")
 path=OUT/(world+".jpg");img.save(path,quality=90,optimize=True,progressive=True)
 print(path, path.stat().st_size,"8 identical stops; rescue at #8")
# Main map: derive directly from the existing matching high-resolution Arrow art and add legibility.
src=OUT/"overview.jpg"
main=Image.open(src).convert("RGB").resize((W,H),Image.Resampling.LANCZOS)
d=ImageDraw.Draw(main)
places=[(0.13,0.31),(0.385,0.29),(0.63,0.31),(0.89,0.31),(0.10,0.79),(0.39,0.79),(0.635,0.79),(0.89,0.79)]
for i,(x,y) in enumerate(places):
 px,py=int(x*W),int(y*H)
 circle(d,(px,py),79,(255,255,255),(45,54,95),8)
 circle(d,(px,py),70,THEMES[i][2],THEMES[i][1],11)
 textcenter(d,(px,py),str(i+1),TITLE,(36,44,85))
main.save(OUT/"overview-clean.jpg",quality=92,optimize=True,progressive=True)
print("Main matching home map created")
