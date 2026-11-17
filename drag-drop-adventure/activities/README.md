# Eight reusable activity engines

Scope: only `/drag-drop-adventure/`. The original Arrow game and shared artwork are read-only.

`engines.mjs` owns interaction rules, collision mathematics, completion and serializable state. `levels.mjs` creates one configuration for each of the 64 stable IDs (`lab_candy_1` through `lab_lava_8`). `runtime.mjs` owns pointer capture, trackpad/touch input, motion, image rendering and responsive layout. `activities.css` contains interface styling; it does not draw collectible art.

Activity order in every world: Maze Escape, Sorting Station, Pack It Up, Fix the Path, Pattern Power, Build the Scene, Put It in Order, Catch & Deliver. Pattern Power has five rounds: AB, AAB, ABB, ABC and ABBC. Levels are replayable without repeated completion rewards.

## Artwork handoff

The supplied `DragDrop_64_Level_Art_Handoff.zip` is a production specification: its README says all 64 new backgrounds and 508 new PNGs have **not** been rendered. Its four Castle images are review candidates, not approved replacements. No candidate or nonexistent image is silently published. Current gameplay uses existing approved PNG collectibles and JPEG scenery. Castle, Space, Jurassic and Lava still use existing computer-gear PNGs until their themed collectible packages arrive. These are existing assets, not newly generated final themed art.

`art-manifest.json` accepts overrides by stable level ID. Its `levels` object can contain all 64 entries. Each entry can replace `background`, `pieces`, `targets`, `walls`, `hazards`, `container`, and `rounds` independently. `id`, `world` and `engine` remain stable. Paths such as `./assets/candy/sort/background.jpg` resolve relative to the game page. The Art Agent's planned `assets/WORLD/ACTIVITY/` paths fit this scheme.

Geometry uses a 1000 × 600 logical board, scaled uniformly. Full background artwork uses `object-fit: contain`. Visible wall boundaries and dashed snap areas are interface overlays, not collectible art. Images never contain controls or collision geometry.

A piece has `{id,key,x,y,w,h,asset:{name,image}}`, with x/y at its center. A target has `{id,accept:[key],x,y,w,h,snap,capacity,asset,label}`, with x/y at its top-left; capacity 0 means reusable. An optional `hitbox:{x,y,w,h}` uses offsets relative to a target. Walls are `{x,y,w,h}`. Hazards add `{id,asset,motion}`. Targets and hazards accept `{axis:'x'|'y',range,period,phase}` motion. All collectible, target and enemy artwork must be PNG/JPEG. SVG, emoji and generated-shape collectible fallbacks are rejected.

Keep the numeric hitboxes and wall locations aligned to approved illustrations before approving a new art package. Do not mark an asset ready merely because a planned pathname exists.

## Saves and teacher preview

Existing level IDs, wallets, owned objects, rescues and completed-level lists remain intact. New runs use `dragVersion:2` and `activityState`. An unfinished v1 run retains its original snapshot and transfers proportional completed-drop credit, leaving at least one real task to finish. Finishing a replay does not award duplicate rewards.

Teacher code is 8714. Teacher preview has all worlds, levels, characters, rescued friends and shop decorations available, using temporary state only. It never writes a student save. Settings remain browser-wide; export/import moves them between devices.

`node activities/test-engines.mjs` checks all 64 configs, correct and incorrect placement, persistence, all pattern rounds, maze reachability, geometry, motion and raster-only assets. The integration QA additionally completed all 64 through the actual pointer handlers using a DOM test fixture and verified student-save isolation.
