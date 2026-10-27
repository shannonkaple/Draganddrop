"""Raster-only background builder for Trackpad Adventure.
Each world is ONE scene (not an eight-panel sprite sheet), cropped without
distortion to 16:9. All level circles are empty pixels painted INTO the JPEG.
Interaction, locks, focus, and rescue are HTML/CSS, never SVG artwork.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, ImageEnhance, ImageFilter
ROOT = Path(__file__).resolve().parents[1]
MAPS = ROOT / "trackpad-adventure" / "maps"
MAPS.mkdir(parents=True, exist_ok=True)
WORLD_SIZE = (1600, 900)
HOME_SIZE = (1600, 760)
# The same centers are used in game.mjs's HTML hotspots.
LEVELS = [(0.14,0.37),(0.37,0.37),(0.60,0.37),(0.83,0.37),
          (0.14,0.74),(0.37,0.74),(0.60,0.74),(0.83,0.74)]
# Existing illustrations from the Candy/Arrow adventure — first full panel
# of a source atlas, NEVER squeeze the entire atlas into one background.
WORLD_SOURCES = {
 "candy": ROOT / "arrow-lab/candy-stages/01-lollipop-lane.jpg",
 "pirate": ROOT / "arrow-lab/scenes/pirate.jpg",
 "arctic": ROOT / "arrow-lab/scenes/arctic.jpg",
 "castle": ROOT / "arrow-lab/scenes/castle.jpg",
 "space": ROOT / "arrow-lab/scenes/space.jpg",
 "jurassic": ROOT / "arrow-lab/scenes/jurassic.jpg",
 "ocean": ROOT / "arrow-lab/scenes/ocean.jpg",
 "lava": ROOT / "arrow-lab/scenes/lava.jpg",
}
COLORS = {
 "candy":(240,130,190),"pirate":(229,172,70),"arctic":(91,180,222),
 "castle":(176,117,211),"space":(128,113,227),"jurassic":(82,166,104),
 "ocean":(66,181,218),"lava":(223,112,78),
}
def source_scene(name):
 src=WORLD_SOURCES[name]
 if not src.is_file(): raise FileNotFoundError(src)
 scene=Image.open(src).convert("RGB")
 original=scene.size
 # Arrow Adventure scenes (except Candy stage) are 4x2 sprite atlases.
 if name!="candy":
  width,height=scene.size
  if width < 3200 or height < 900:
   raise ValueError(f"Expected full four-column scene atlas for {name}, got {original}")
  # Use the actual first illustrated panel at its native aspect.
  scene=scene.crop((0,0,width//4,height//2))
 # Maintain 16:9 proportions; ImageOps.fit crops edges rather than stretching.
 return ImageOps.fit(scene,WORLD_SIZE,method=Image.Resampling.LANCZOS,centering=(0.5,0.5)),original,scene.size
def add_blank_stops(image,locations,color,radius=61):
 base=image.convert("RGBA")
 overlay=Image.new("RGBA",base.size,(0,0,0,0))
 d=ImageDraw.Draw(overlay)
 w,h=base.size
 for fx,fy in locations:
  x,y=round(fx*w),round(fy*h)
  d.ellipse((x-radius+3,y-radius+7,x+radius+3,y+radius+7),fill=(27,40,73,90))
  d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(250,245,230,255),outline=(255,255,255,250),width=5)
  d.ellipse((x-radius+9,y-radius+9,x+radius-9,y+radius-9),fill=(255,250,238,255),outline=(*color,255),width=9)
  d.ellipse((x-radius+23,y-radius+23,x+radius-23,y+radius-23),fill=(255,252,241,255))
 return Image.alpha_composite(base,overlay).convert("RGB")
def write_jpg(image,destination):
 image.save(destination,quality=94,subsampling=0,optimize=True,progressive=True)
 print(f"{destination.name}: {image.size[0]}x{image.size[1]}, {destination.stat().st_size:,} bytes, 8 BLANK spots")
for world in WORLD_SOURCES:
 scene,whole,panel=source_scene(world)
 # Original imagery only; no title text, numbers, words, sprites or SVG shapes.
 # Sharpen lightly only AFTER preserving the original scene panel.
 scene=scene.filter(ImageFilter.UnsharpMask(radius=1.2,percent=112,threshold=3))
 image=add_blank_stops(scene,LEVELS,COLORS[world])
 write_jpg(image,MAPS/(world+".jpg"))
 print(f"  Source: {whole[0]}x{whole[1]}, selected SINGLE panel {panel[0]}x{panel[1]}")
# MAIN MAP: clean high-resolution island art, no text or numbers.
overview=Image.open(MAPS/"overview.jpg").convert("RGB")
main=ImageOps.fit(overview,HOME_SIZE,method=Image.Resampling.LANCZOS,centering=(0.5,0.48))
# Main map positions are normalized to this panoramic crop and to JS buttons.
HOME_STOPS=[(.13,.255),(.385,.235),(.63,.255),(.89,.255),
            (.10,.815),(.39,.815),(.635,.815),(.89,.815)]
main=add_blank_stops(main,HOME_STOPS,(240,198,85),radius=54)
write_jpg(main,MAPS/"overview-clean.jpg")
