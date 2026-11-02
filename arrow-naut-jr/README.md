# Ms. Kaple's ARROW-NAUT JUNIOR — First Grade

**Public game:** https://shannonkaple.github.io/Draganddrop/arrow-naut-jr/

This is a separate first-grade version of the second-grade Arrow-Naut Space Adventure. **The only puzzle controls are: (1) use the Chromebook trackpad to click/select and (2) use the keyboard arrow keys to move one cell at a time.** There is NO resize/dragging feature and NO weapon/laser button.

## First-grade classroom scope

- 8 illustrated planets and 8 missions per planet (64 total).
- Missions: Space Star Search (precision clicking), Starlight Trail (visit stars in order), Fuel Crystal Hunt (collect while navigating rocks), Cargo Scan & Deliver (each tool visits its scanner), Find the Secret Computer (select a target among decoys and activate signals), Unlock the Force Field (find a key to open the gate), Space Signal Relay (deliver three devices in a new order each world), and Rescue Maze.
- Every mission now has a distinct task and visible on-screen progress. The number of collectibles, placement of scan points, and relay ordering varies across worlds. All pieces stay fixed-size throughout. Students can press or hold keyboard arrows to move once their picture is selected.
- Rescue Maze: select the explorer with one trackpad click, then move with the keyboard arrows. Four moving bad guys patrol safe side branches, so the route cannot be permanently blocked.
- First-clear awards: regular mission = 1 star; rescue finale = 10 stars; completed replays = 0 additional stars.
- Completing eight stages rescues a friend and unlocks the next planet.
- Star Shop / My Stuff: buy original PNG decorations, choose one of eight full-screen JPEG world illustrations, click to place and remove owned items.
- All selected puzzle-piece images are **independent complete PNG files**, loaded from existing shared project artwork (not from a cropped sprite atlas). Render them with `object-fit: contain`. Backgrounds are whole JPEGs and are never cropped/stretched.
- First-grade roster read from `../rainbow-road/data/teachers.json`.
- Save namespace: `mskaple-arrownaut-junior-v1:${teacher}:${student}`; not shared with `arrow-lab/`, `arrow-naut/`, or other games.
- Student saves are verified on every write. Invalid stored saves are never silently overwritten.

## Implementation and QA

- `curriculum.mjs`: first-grade curriculum, maps and original complete PNG/JPEG image references.
- `engine.mjs`: trackpad selection, arrow-key movement, collision rules, missions, stars, saved progress.
- `app.mjs`: independent student UI and level interactions.
- `style.css`: full-game Chromebook layout, image aspect-ratio preservation.
- `engine.test.mjs`: Node test suite covering all eight challenge types, ordered pickups, force-field gates, relay progression, maze solvability, old saves and star rewards; run `node --test arrow-naut-jr/engine.test.mjs` at repository root.
- Existing students keep all cleared mission IDs, stars, purchases and rescued friends. An unfinished run saved before the new mission mechanic version automatically restarts **only that unfinished puzzle**, not the student's progress or wallet.

## Guardrails

- Do NOT add resizing handles, keyboard resizing, touch movement, dragging of puzzle items, or laser weapons to this first-grade version.
- Do NOT modify /arrow-naut/ second-grade mechanics or /arrow-lab/ original first-grade progress data.
- Never use sprite-atlas slicing/cropped art for these puzzle pieces. Future replacements should be complete standalone PNGs.
- Progress from this version is separate from every other game. Do not clear browser storage or reuse existing save keys.

Live browser QA on classroom Chromebooks should cover arrow-key focus and movement, Google Classroom access, first-grade teacher list, all 8 mazes, purchase and placement, and saving after page reload.
