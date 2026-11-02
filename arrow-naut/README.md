# Ms. Kaple's ARROW-NAUT Space Adventure — Second Grade

**Standalone prototype:** `https://shannonkaple.github.io/Draganddrop/arrow-naut/`

This is a **NEW second-grade arrow-key game**, separate from the existing first-grade `arrow-lab/` and `drag-drop-adventure/` games. Nothing in either existing game is changed or imported except a read-only fetch of the second-grade teacher roster.

## The skills
- Carefully click **inside** an object to select it, not the border.
- Use keyboard arrows to move one grid cell at a time.
- Click the visible bottom-right handle, then use arrow keys to resize width/height.
- Fit nonrectangular cargo pieces into their dotted target shapes without dragging or overlapping.
- Combine selection, movement, resizing and problem-solving. **No cropping.**

## Structure
Eight planet themes × eight unique activity types = **64 levels** with a repeatable mission engine. The Launch Pad planet is the initial playground; other planets unlock after the previous planet's eight levels are completed. No final art is integrated yet, only temporary CSS/emoji prototype graphics; see `ART_ASSET_PLAN.md` for the art production handoff. Do not mistake prototype graphics for user-approved artwork.

## Student data and safety
New **isolated** localStorage namespace: `mskaple-arrownaut-v1:<class-id>:<student-number>`. Never read or modify old games' student records. Every completed mission awards **+3 stars, including replays**, while the level-completion list adds a level only once. After each saved move, the JSON is verified by reading it back. An unreadable existing student record must never be overwritten.

## Keyboard controls
- **Click inside**: select movement mode.
- **Click yellow ↘ handle**: select resize mode, arrow right/left controls width, arrow down/up controls height.
- **Arrow keys**: move or resize selected object. No touchscreen support on Chromebooks; no drag/drop, no crop/double-click-to-crop.
- **Speech**: speaker icon appended once to mission direction line.

## Testing
`node --test mechanics.test.mjs` — 12 foundational tests. Additional browser QA required at 1366×768 and 1280×720 plus fullscreen and progress reload. The first version is a playable prototype, not final original illustrated art. Do not claim final approval or production-quality acceptance before live tests.