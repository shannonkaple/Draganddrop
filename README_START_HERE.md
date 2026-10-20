# Ms. Kaple's A-Mazing Arrow Adventure — COMPLETE DESIGN HANDOFF

**START HERE:** Open `PASTE_TO_OTHER_AGENT.md` and give that instruction plus this entire ZIP to the other coding/ChatGPT agent.

This ZIP contains the requested new game art, 12 rainbow backgrounds, 8 original characters with 3 upgrade stages each (48 PNGs), 8 individual bad guys (two sizes each), 5 computer collectibles, 4 skill badge illustrations, 6 selectable Rainbow Lands, and complete starter JSON configuration files.

## File structure
- `PASTE_TO_OTHER_AGENT.md`: complete instructions / acceptance checklist to give the other agent.
- `manifest.json`: inventory, asset path conventions, and implementation status.
- `data/characters.json`: characters, ID, names and 3 levels with correct web paths.
- `data/enemies.json`: bad guys, behavior suggestions and image paths.
- `data/computer_collectibles.json`: desktop, laptop, keyboard, trackpad, mouse.
- `data/skill_badges.json`: click, double click, typing, arrows.
- `data/rainbow_lands.json`: 6 friend homes with backgrounds/card previews.
- `data/backgrounds.json`: 12 scenic day/twilight wallpapers.
- `data/levels.json`: 12 levels and progressively harder design specs. These are configs, not generated maze grid arrays.
- `data/game_config.json`: controls, rewards, difficulty, safety and compatibility preferences.
- `data/example_student_save.json`: illustration of data needed to keep progress and Rainbow Land placement; NOT real student data.
- `public/game-assets/`: every actual image with paths matching JSON.

## Import
Copy `public/game-assets` to the existing app's `public/game-assets` folder. Copy `data/*.json` into the project; either import them from source (e.g. `src/data`) or serve them from `public/data` and adjust fetching accordingly. Keep each `/game-assets/...` URL unchanged or update all JSON paths consistently. **Only assets and specifications are included; this ZIP does not include finished maze code or a new playable app.**

## Land behavior
Students select a preferred Rainbow Land and may place each rescued friend into any land, view and upgrade them there, and relocate them whenever desired. All 6 homes are available. Friends persist and do not vanish if the main home changes.

## Built for first graders
- Arrow keys = walking. Space = duck under low obstacles. First explain the duck control when needed; DOWN remains a movement arrow.
- Bad guys mean a gentle return to checkpoint, not lives lost.
- Rewards come from practice and success; no purchases.
- Visually distinct maze walls must be drawn over artwork, because scenic road drawings aren't playable maze geometry.

### About graphics
PNG sprites have genuine transparent alpha and consistent dimensions for easy swapping. Backdrops are vivid WebP 1600x900 (16:9), sized for desktop, with 480x270 JPG previews of the six worlds.
