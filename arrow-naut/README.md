# Ms. Kaple's ARROW-NAUT Space Adventure — Second Grade

**Standalone prototype:** `https://shannonkaple.github.io/Draganddrop/arrow-naut/`

This is a **NEW second-grade arrow-key game**, separate from the existing first-grade `arrow-lab/` and `drag-drop-adventure/` games. Nothing in either existing game is changed or imported except a read-only fetch of the second-grade teacher roster.

## The skills
- Carefully click **inside** an object to select it, not the border.
- Use keyboard arrows to move one grid cell at a time.
- Click inside the object, then click, HOLD and DRAG its edge/corner handle with the trackpad to resize its frame.
- Fit nonrectangular cargo pieces into their dotted target shapes without dragging or overlapping.
- Combine selection, movement, resizing and problem-solving. **No cropping.**

## Structure
Eight planet themes × eight unique activity types = **64 levels** with a repeatable mission engine. The Launch Pad planet is the initial playground; other planets unlock after the previous planet's eight levels are completed. Nine original JPEG illustrations are integrated: one eight-planet map and eight game-level scenes; see `ART_ASSET_PLAN.md` for the art production handoff. Do not mistake prototype graphics for user-approved artwork.

## Student data and safety
New **isolated** localStorage namespace: `mskaple-arrownaut-v1:<class-id>:<student-number>`. Never read or modify old games' student records. Every completed mission awards **+3 stars, including replays**, while the level-completion list adds a level only once. After each saved move, the JSON is verified by reading it back. An unreadable existing student record must never be overwritten.

## Keyboard controls
- **Click inside**: select movement mode.
- **Click inside, then DRAG**: hold and drag any of eight visible edge/corner resize handles with the trackpad; release to save.
- **Arrow keys**: move selected object ONE grid square; never resize. No touchscreen support on Chromebooks; only the resize handles are dragged, not the puzzle objects; no crop/double-click-to-crop.
- **Speech**: speaker icon appended once to mission direction line.

## Testing
`node --test mechanics.test.mjs` — movement, trackpad stretching, collision, progress, and challenge-ramp tests (run again after deployment). Additional browser QA required at 1366×768 and 1280×720 plus fullscreen and progress reload. The first version is a playable prototype, not final original illustrated art. Do not claim final approval or production-quality acceptance before live tests.

## Original galaxy art (2026-11-02)

The illustrated 1672×941 JPEG map and eight original planet backgrounds live under `arrow-naut/assets/` and are used in the full-size home map, per-planet eight-level map, and actual arrow-key puzzle backgrounds. Browser renders them exactly once with `object-fit:contain` (no crop, no stretching). The map pads and level numbers are interactive DOM elements layered on top, not baked into the JPEG.

The **legacy planet IDs and student-save namespace are unchanged**: newly titled worlds keep their original `id` identifiers to protect previously completed missions and stars. Only visible names, icon labels, and imagery are updated. All other games in this repository are unchanged.

## 2026-11-02 usable sprite kit

The game now uses an original illustrated **63-sprite space-game atlas** for a saved 9-character chooser, eight illustrated rescued friends, eight space obstacles, 13 star-shop items, earned trophies, and selection/movement/resize objects. The independent PNG images and source-art previews are included in the companion asset ZIP; atlas manifest and sprite UI wiring live in `/arrow-naut/sprite-atlas.mjs`, `/arrow-naut/sprite-assets.mjs`, `/arrow-naut/sprite-art.css`.

No cropping lesson/tool, no gameplay dragging, and no touchscreen completion. New optional `playerId` on the v1 student record is backwards-compatible; finished mission IDs, stars, purchases, and rescue flags remain unchanged.

**Art quality:** Portraits are compact, transparent-corner picture badges extracted from original generated artwork for *prototype game use*. They are not approved individually generated transparent full-body assets; the 24 remaining enemy designs, full art production, real Pages/Chromebook QA, and final character approval remain open.

## 2026-11-02: real-world resizing and challenge ramp
Resizing now uses eight click-hold-drag trackpad handles. Keyboard arrows move only. Drag releases snap to the 12x7 puzzle grid, reject collisions/out-of-bounds, and verify student saves before awarding progress. Planet difficulty grows from 1 through 8: additional distractors, more obstacles on solvable routes, more equipment, and bigger resize targets. The original 64 level IDs and independent student save namespace stay stable.

A new 54-PNG illustrated space-equipment asset pack and preview are prepared separately for approval/integration. The game already includes original atlas graphics; they are emphasized over opaque CSS boxes. Do NOT claim the new PNG pack is deployed until its actual binaries are uploaded and browser-tested.
