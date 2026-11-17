# Ms. Kaple's ARROW-NAUT — Illustrated Game Assets

**Date:** 2026-11-02  
**Scope:** Second-grade `/arrow-naut/` ONLY. First-grade Arrow Lab and Drag & Drop files and student records are not modified.

## Included files

- `assets/sprites/` — **63 separate PNGs** with transparent exterior corners, grouped in `asset-manifest.csv` (9 selectable Arrow-Nauts, 8 rescue-friend portraits, 8 enemy portraits, 13 store/decor items and 25 clickable puzzle sprites). Each is an independent file; image content was extracted from original generated concept illustrations and placed on a rounded space-themed portrait badge. **These are production-use prototype badges, not separately generated full-body cutout art.**
- `assets/sprites-atlas.webp` — 2048 x 2048 compressed alpha-preserving WebP atlas for fast loading of those same 63 images by the game. A single atlas avoids 63 slow image requests on student Chromebooks.
- `sprite-atlas.mjs`, `sprite-assets.mjs` — names, stable IDs, planet mapping, crop-free atlas coordinates and shop/mission asset mapping.
- `sprite-art.css` — character picker, rescued-friend reveal, board pieces, shop, enemy icons, star shop and My Stuff styling.
- `asset-manifest.csv` — original PNG sizes and hashes for the independent assets.
- `sprites-final-preview.jpg` and `art-integrated-shop-1366x768.png` — artwork and UI reference previews.

## Implemented uses

- Students choose from 9 Arrow-Nauts using **Change Character**; the chosen ID is saved as an additional optional field on the existing separate second-grade student progress record. Existing scores, purchases, rescue flags, and mission IDs are preserved.
- First-time planet introductions and eighth-level friend rescue popups show a large illustrated friend portrait.
- Mission buttons have real clickable illustrated parts; arrow movement and click-a-handle resizing remain mandatory. **No cropping, dragging, or touchscreen shortcuts.**
- Obstacles in Rover Route use enemy or supply-crate art; movement/collision logic itself is unchanged.
- My Stuff and Shop show actual purchased or earned PNG artwork. All 13 Star Shop items require stars; **nothing is automatically granted in teacher mode**.
- Finishing each planet's fourth mission makes an illustrated trophy discoverable in My Stuff. This reward is derived from completed IDs; it does not change the saved progress schema.

## Remaining original-art work

- These are **badge-style prototype sprites** cut from a large original concept art illustration. They should be replaced with the user's approved *independently generated* PNG characters, friends, enemies, and decorations once produced. In particular, we have 8 enemy types, not yet 4 enemies per planet (32 requested in full).
- The 9 existing background JPEGs are already installed separately. They are not replaced by this sprite pack.
- Real GitHub Pages deployment, classroom devices, screen readers, and user art approval still require verification.
