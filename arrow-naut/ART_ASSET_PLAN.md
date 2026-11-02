# ARROW-NAUT — Installed Artwork and Remaining Production

All new artwork should be clearly distinct from first-grade Arrow Adventure, with polished, playful **space STEM** art: crisp, brightly colored cartoon illustration, approachable second-grade style, consistent lighting and stroke style, no realistic or frightening imagery. Deliver original independently usable **PNG/JPEG assets**, not CSS/SVG stand-ins or cropped sprite sheets. Preserve aspect ratios without stretching.

## Visual artwork checklist (2026-11-02)
- [x] **1 illustrated 8-planet galaxy overview map**: `assets/galaxy-map.jpg`, 1672×941, original blank landing pads with dynamic HTML labels and locks.
- [x] **8 level-selection pages**, each displays its matching unique planet JPEG with eight dynamic level pins (`art-assets.mjs`). Separate 8-pad JPEG maps remain an optional visual refinement.
- [x] **8 original gameplay JPEGs**, each native 1672×941 with clear central workspace. All used on their actual playable activities with aspect-ratio 1672/941 and `object-fit:contain` (no cropping or stretching).
- [ ] **My Stuff planet swapping/store unlocking**: Robot Station JPEG is currently displayed in My Stuff; all eight JPEGs are installed for future user selection.
- [ ] **9 new playable character PNGs** in a cohesive space-explorer cartoon style. Unique stable IDs to be approved before code uses them.
- [ ] **8 new rescued space friend PNGs**, one per planet, both full-size reveal and small profile supported.
- [ ] **32 enemy PNGs** (4 distinct age-appropriate enemies per planet); enemy collisions belong in later mission versions after baseline navigation is tested.
- [ ] **12+ collectible PNGs** and **6+ star-shop-only decorating PNGs** (no rewards added automatically in teacher preview).
- [ ] Native optional extra-wide one-piece JPEG title for the initial screen **only**; all activity pages keep the compact rainbow controls, no hover/dropdown banners.
- [ ] QA: verify filenames, dimensions, transparency, no crop/stretch, children can distinguish interactive objects, approved visual previews and live Chromebook screenshots.

## Worlds and rescue friends
1. Candy Moon — Pip the Star Sprout
2. Rocket Launch — Momo Moon Mouse
3. Neon Ringed Planet — Beebo Bot
4. Crystal Ice — Glimmer Gecko
5. Robot Space Station — Bloop the Blob
6. Dino Asteroid — Frosty Ferret
7. Ocean Planet — Zuzu Comet Cub
8. Lava Planet — Nova Starling

**Save compatibility:** The eight original `id` values remain unchanged, even though the visible world themes were renamed to match the new panorama. This preserves completed levels and previously earned stars.

## Novel mechanics / acceptance
- Click INSIDE an object: object selection; border misses must not select.
- One selected object + keyboard arrows: no dragging/touch shortcut.
- Click corner handle: keyboard resizing with clear feedback; dimensions change, never crop artwork.
- Cargo Bay Fit: colored polyomino (L / T shaped) units aligned into reserved docks, no falling blocks.
- Separate, verified student saves; teacher roster read-only; 3 stars awarded on every successful completion/replay.