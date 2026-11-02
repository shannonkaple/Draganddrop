# ARROW-NAUT — Original Art Production (Pending Approval)

All new artwork should be clearly distinct from first-grade Arrow Adventure, with polished, playful **space STEM** art: crisp, brightly colored cartoon illustration, approachable second-grade style, consistent lighting and stroke style, no realistic or frightening imagery. Deliver original independently usable **PNG/JPEG assets**, not CSS/SVG stand-ins or cropped sprite sheets. Preserve aspect ratios without stretching.

## Visual artwork checklist (NOT yet generated or approved)
- [ ] **1 wide 8-planet galaxy overview map**, with legible destinations and clear blank click targets.
- [ ] **8 individual planet maps** with eight clearly separated blank level locations and measured DOM hotspot coordinates (one per planet, never reuse unrelated landmarks).
- [ ] **8+ gameplay scene JPEGs** sized for a 12:7 or equivalent wide Chromebook play area, with central low-detail, high-contrast interactive safe zones (avoid forcing puzzle pieces on top of busy art). Unique planet color/landmark treatment.
- [ ] **8 My Stuff room/planet backgrounds** matching the same game-play proportions.
- [x] **9 selectable player PNG portraits** installed as provisional space-explorer badge sprites. Separate final full-body cutouts and user approval still pending.
- [x] **8 rescued space friend badge PNGs**, one per planet, included in large intro/reveal and My Stuff. Separately drawn final cutouts still pending approval.
- [ ] **32 independent enemy PNGs** (4 per planet): **8 initial illustrated enemy badges installed** as static obstacles; 24 additional originals and moving-enemy collision behavior remain to build.
- [x] **Illustrated collections/shop prototypes**: 13 separate shop PNG badges, 25 puzzle/collectible sprites, 8 milestones deriving collected objects from saved completed IDs; independent final cutout renders still pending approval.
- [ ] Native optional extra-wide one-piece JPEG title for the initial screen **only**; all activity pages keep the compact rainbow controls, no hover/dropdown banners.
- [ ] QA: verify filenames, dimensions, transparency, no crop/stretch, children can distinguish interactive objects, approved visual previews and live Chromebook screenshots.

## Worlds and rescue friends
1. Launch Pad — Pip the Star Sprout
2. Moon Crater — Momo Moon Mouse
3. Robot City — Beebo Bot
4. Crystal Caves — Glimmer Gecko
5. Goo Galaxy — Bloop the Blob
6. Ice Rings — Frosty Ferret
7. Meteor Jungle — Zuzu Comet Cub
8. Galaxy Core — Nova Starling

## Novel mechanics / acceptance
- Click INSIDE an object: object selection; border misses must not select.
- One selected object + keyboard arrows: no dragging/touch shortcut.
- Click corner handle: keyboard resizing with clear feedback; dimensions change, never crop artwork.
- Cargo Bay Fit: colored polyomino (L / T shaped) units aligned into reserved docks, no falling blocks.
- Separate, verified student saves; teacher roster read-only; 3 stars awarded on every successful completion/replay.

## 2026-11-02 sprite integration
- Added `/arrow-naut/assets/sprites-atlas.webp` and `/arrow-naut/sprite-atlas.mjs`, `/arrow-naut/sprite-assets.mjs`, `/arrow-naut/sprite-art.css`; 63 separate transparent-corner RGBA PNGs and exact per-image manifest available in download pack.
- Added `Change Character` (9 choices) without changing the student key or mission IDs; 8 world friend art reveals; illustrated space enemies, game pieces, 13 star shop choices, earned objects in My Stuff.
- All 20 Node regression checks and local Chromium smoke tests at 1366×768 and 1280×720 passed; real deployed Pages verification and art approval remain unchecked.
- Note: These are carefully framed, generated concept-sheet *badge sprites*, not individually generated final isolated transparent cutouts; user may wish to replace them with separately approved final portraits.
