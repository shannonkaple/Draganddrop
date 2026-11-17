#!/usr/bin/env python3
"""Raster-only, reproducible artwork for Ms. Kaple's parade interface.
Produces physical, transparent PNG files; the live page loads only those images.
No browser-generated SVGs, CSS text illustrations, or font assets are published.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, random, os
ROOT=Path(__file__).resolve().parent
OUT=ROOT/"assets"/"ui"/"final-png-20261117"
OUT.mkdir(parents=True,exist_ok=True)
FONTS=[
 "/tmp/kaple-parade-Rye.ttf",
 "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
 "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf"
]
SANS=[
 "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
 "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
]
RED=(223,0,40,255); BLUE=(156,236,254,255); WHITE=(255,255,255,255)
def font(paths,size):
 for path in paths:
  if Path(path).is_file():
   try:return ImageFont.truetype(path,size)
   except:pass
 return ImageFont.load_default()
def textfit(draw,label,paths,start,maxwidth):
 size=start
 while size>20:
  f=font(paths,size)
  b=draw.textbbox((0,0),label,font=f,stroke_width=0)
  if b[2]-b[0]<=maxwidth:return f
  size-=2
 return font(paths,size)
def centerline(draw,label,y,fill,stroke,sw,f):
 bb=draw.textbbox((0,0),label,font=f,stroke_width=0)
 tw=bb[2]-bb[0]; x=(W-tw)/2-bb[0]
 draw.text((round(x),round(y-bb[1])),label,font=f,fill=fill,stroke_width=sw,stroke_fill=stroke)
def save(im,name):
 bb=im.getbbox()
 im.save(OUT/name,optimize=True,compress_level=9)
 print("PNG",name,im.size,(OUT/name).stat().st_size)
W,H=850,194
def tab(label,name):
 im=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
 # One shared flat-bottom cloud tab silhouette.
 cloud=[(42,83,106,142),(76,46,155,130),(143,36,221,116),(214,31,291,119),(292,37,367,115),
        (364,23,454,128),(446,39,530,114),(527,28,615,122),(602,44,687,119),
        (683,51,764,135),(744,88,809,153)]
 d.rounded_rectangle((29,69,821,183),radius=33,fill=(255,255,255,255))
 for bb in cloud:d.ellipse(bb,fill=WHITE)
 d.rectangle((30,101,820,186),fill=WHITE)
 d.rounded_rectangle((35,77,815,180),radius=27,fill=(174,240,255,255))
 for bb in cloud:
  b=(bb[0]+6,bb[1]+6,bb[2]-6,bb[3]-4)
  d.ellipse(b,fill=(174,240,255,255))
 d.rectangle((37,109,813,179),fill=(174,240,255,255))
 # Deco: clouds/NYC skyline built into PNG pixels, not webpage CSS.
 for cx,top,ww in [(69,119,18),(92,102,21),(116,133,17),(143,110,24),
                    (676,109,21),(700,95,18),(723,128,22),(750,109,19),(779,123,18)]:
  d.rectangle((cx,top,cx+ww,176),fill=(77,180,217,135))
  for wy in range(top+10,173,14):
   d.rectangle((cx+5,wy,cx+8,wy+5),fill=(231,251,255,180))
 d.ellipse((50,72,121,96),fill=WHITE)
 d.ellipse((721,66,793,92),fill=WHITE)
 d.rectangle((30,173,820,184),fill=WHITE)
 d.rectangle((36,169,814,174),fill=(116,205,236,255))
 lines=[label]
 if label=="PUT YOUR PARADE IN ORDER":lines=["PUT YOUR PARADE","IN ORDER"]
 if len(lines)==1:
  f=textfit(d,label,FONTS,80,730)
  centerline(d,label,91,RED,WHITE,6,f)
 else:
  f=textfit(d,lines[0],FONTS,58,720)
  centerline(d,lines[0],76,RED,WHITE,5,f)
  f=textfit(d,lines[1],FONTS,62,720)
  centerline(d,lines[1],123,RED,WHITE,5,f)
 save(im,name+".png")
# Every element shares this exact tab artwork; only the type changes.
for label,name in [
 ("BALLOONS","tab-balloons"),("FLOATS","tab-floats"),("MUSIC","tab-music"),
 ("SCENES","tab-scenes"),("MY PARADE","tab-my-parade"),
 ("YOUR PARADE","tab-your-parade"),("PUT YOUR PARADE IN ORDER","tab-lineup"),
 ("MARCHING BANDS","tab-marching-bands")]:
 tab(label,name)

# Same physical size, light, shading, white uppercase and border for all 8 utilities.
W,H=670,142
def red_button(label,name):
 im=Image.new("RGBA",(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
 d.rounded_rectangle((16,13,654,133),radius=31,fill=(156,0,27,255))
 d.rounded_rectangle((13,7,656,127),radius=30,fill=(230,3,41,255),outline=WHITE,width=7)
 d.rounded_rectangle((23,16,646,119),radius=23,outline=(255,124,141,195),width=3)
 d.arc((40,14,627,115),200,342,fill=(255,134,153,125),width=5)
 f=textfit(d,label,SANS,54,590)
 centerline(d,label,46,WHITE,(163,0,26,255),2,f)
 save(im,name+".png")
for label,name in [
 ("HOME","btn-home"),("FULL SCREEN","btn-full-screen"),("HELP","btn-help"),
 ("CHANGE STUDENT","btn-change-student"),("SAVE PARADES","btn-save-parades"),
 ("SAVE PARADE","btn-save-parade"),("ORIGINAL BALLOONS","btn-original-balloons"),
 ("NEW CHARACTERS","btn-new-characters"),("SOUND ON","btn-sound-on"),
 ("PAUSE","btn-pause"),("RESUME","btn-resume"),("BACK TO STUDIO","btn-back"),
 ("PLAY AGAIN","btn-replay"),("YES","btn-yes"),("NO","btn-no")]:
 red_button(label,name)

# Call-to-action uses the same raster graphic language, but stands out.
W,H=900,245
im=Image.new("RGBA",(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
d.rounded_rectangle((12,37,888,225),radius=36,fill=(136,0,25,210))
d.rounded_rectangle((12,29,888,217),radius=38,fill=(220,0,38,255),outline=WHITE,width=11)
d.rounded_rectangle((21,42,879,205),radius=31,outline=(255,90,117,255),width=4)
for x in [126,778]:
 d.polygon([(x,60),(x+9,75),(x+26,77),(x+12,89),(x+16,106),(x,98),(x-16,106),(x-11,89),(x-25,77),(x-9,75)],fill=(255,230,143,255),outline=WHITE)
d.ellipse((385,0,515,130),fill=WHITE)
d.ellipse((396,11,504,119),fill=(220,0,40,255))
d.polygon([(433,30),(433,102),(486,65)],fill=WHITE)
f=textfit(d,"WATCH MY PARADE",SANS,77,830)
centerline(d,"WATCH MY PARADE",127,WHITE,(142,0,29,255),3,f)
save(im,"btn-watch-my-parade.png")
# Playback title, not a font from browser; transparent raster strip.
W,H=1120,220
im=Image.new("RGBA",(W,H),(0,0,0,0));d=ImageDraw.Draw(im)
d.rounded_rectangle((17,47,1103,201),radius=70,fill=WHITE)
d.rounded_rectangle((26,57,1094,192),radius=61,fill=(171,239,255,255))
for i in range(24):
 x=38+i*46;y=150+(i%4)*9
 d.rectangle((x,y,x+22,185),fill=(78,186,220,130))
f=textfit(d,"YOUR PARADE",FONTS,124,1020)
centerline(d,"YOUR PARADE",68,RED,WHITE,9,f)
save(im,"tv-title-your-parade.png")

# Clean PNG header pieces, cut from the actual user-supplied parade collage
# currently embedded in the original header code, not substituted artwork.
import re,base64,io
source=(ROOT/"header-art-20261117.js").read_text(encoding="utf8")
match=re.search(r"data:image/webp;base64,([A-Za-z0-9+/=]+)",source)
if match:
 original=Image.open(io.BytesIO(base64.b64decode(match.group(1)))).convert("RGBA")
 # Preserve native proportions to prevent another blurry stretched banner.
 for name,area in [
  ("header-worm",(88,0,225,104)),
  ("header-bear",(304,0,440,104)),
  ("header-icecream",(960,0,1096,104)),
  ("header-left-city",(0,40,480,105)),
  ("header-right-city",(720,40,1200,105)),
  ("header-confetti",(0,0,1200,54))
 ]:
  image=original.crop(area)
  image.save(OUT/(name+".png"),optimize=True)
  print("PNG",name,image.size)
# Small blue arrow and red trash buttons are raster files too.
W,H=160,100
def action_button(kind,name):
 im=Image.new("RGBA",(W,H),(0,0,0,0))
 d=ImageDraw.Draw(im)
 colour=(39,139,197,255) if kind in ("left","right") else (229,0,42,255)
 d.rounded_rectangle((5,6,W-5,H-8),radius=23,fill=colour,outline=WHITE,width=7)
 if kind=="left":
  d.line([(104,48),(51,48)],fill=WHITE,width=10)
  d.line([(74,22),(46,48),(74,74)],fill=WHITE,width=10,joint="curve")
 elif kind=="right":
  d.line([(51,48),(107,48)],fill=WHITE,width=10)
  d.line([(84,22),(112,48),(84,74)],fill=WHITE,width=10,joint="curve")
 else:
  d.rectangle((60,30,100,76),fill=WHITE)
  d.rectangle((50,23,111,29),fill=WHITE)
  d.rectangle((70,17,90,22),fill=WHITE)
  for x in (72,88):d.line((x,42,x,65),fill=colour,width=4)
 save(im,name+".png")
for kind in ("left","right","trash"):action_button(kind,"btn-"+kind)
