# Skills Safari — First Grade Computer Skills Game
**Live game (after GitHub Pages deployment):** https://shannonkaple.github.io/Draganddrop/skills-safari/

A new standalone first-grade game structurally modeled on **Arrow-Nauts Jr.** with 8 safari regions × 8 activities = 64 total challenges. Each region practices one real computer skill, with the eighth challenge rescuing a safari friend and unlocking the next region.

**Current status:** Fully programmed playable prototype with **ten original individual transparent animal PNGs integrated** (toucan, monkey, parrot, zebra, elephant, giraffe, otter, lion, frog, butterfly), replacing those emoji in map pins, puzzles, rescues, and Friends. Original map and scenery backgrounds, and shop art remain pending; see [ART_ASSET_LIST.md](ART_ASSET_LIST.md). The site is not yet visually identical to Arrow-Nauts Jr. because its nine map JPGs and other art still need to be generated.

Features:
- First-grade roster from `rainbow-road/data/teachers.json`: Ricketts, Brice, Bell, Wyckoff, Lacroix, Williams, Hicks, Haney, Vannoy, Messer, Basso, Canatella, Boyle, Simon, Arceneaux, Sims, Juvenal, Rizzutto.
- Click-only student number selection 1–30; no word typing.
- 8 separate region maps with 8 clickable numbered challenges each. Later regions and stages unlock from completed work.
- Keyboard keys are checked directly, with no text entry field.
- Double-click levels require actual double-click; drag levels require a trackpad drag, not arrow keys.
- Stars awarded on first completion only: +1 per regular stage and +10 for stage 8. Rescued friends appear on the Friends panel.
- School Chromebook localStorage progress under independent `skills-safari-v1` keys; no sync across devices yet.
- Teacher Preview can open any map or stage without awarding stars or overwriting student saves.
- Voice read-aloud directions via the browser, for readers who need them.

**Safety/QA requirements before classroom launch:** Verify keyboard focus, double-click cadence, moving and drag interactions on a real Chromebook; check all 64 unique challenges, save-on-reload, locks, 8 rescue awards, and responsive map hotspots. No student full names are stored. Do not reuse the Arrow-Nauts Jr. storage prefix or mutate that game.

**Known omissions relative to Arrow-Nauts Jr.:** Most original safari scenery artwork, collectible Star Shop, My Stuff decoration placements, and cross-device cloud sync are not yet included. These should be added only as separate changes after gameplay and artwork are confirmed.


## Eight genuinely different mini-games per region (November 9 update)
**Same computer skill within a map; different mission objectives, visual feedback, difficulty, and rescue finale.**

| Region (skill) | Eight challenge titles |
|---|---|
| Toucan Treetops (single-click) | Safari Supply Search; Butterfly Catch; Banana Bonanza; Camouflage Finder; Firefly Flash; Safari Photo Hunt; Jungle Click Rush; Rescue the Toucan |
| Monkey Mischief (double-click) | Open Supply Crates; Balloon Pop; Treasure Chest Hunt; Unlock the Gates; Monkey Snack Time; Secret Jungle Nests; Double-Click Dash; Monkey Rescue Race |
| Parrot Letter Jungle (keyboard letters) | Parrot Letter Finder; Feather Flight; Jungle Sound Signals; Treasure Letter Code; Egg Rescue; Parrot Echo; Letter Sky Race; Rescue the Parrot |
| Zebra Number Plains (keyboard numbers) | Zebra Number Finder; Count the Coconuts; Waterhole Counting; Number Treasure Lock; Fruit Basket Numbers; Zebra Stripe Signals; Number Sprint; Rescue the Zebra |
| Elephant Arrow Trails (keyboard arrows) | Drive to Camp; Banana Pickup; Safari Photo Tour; Rocky River Crossing; Waterhole Explorer; Elephant Supply Trail; Arrow-Key Safari Race; Rescue the Elephant |
| Giraffe Lookout (click-select then arrow-move) | Giraffe Finds Home; Lost Zebra Search; Safari Animal Taxi; Switching Safari Stops; Golden Checkpoint Chase; Habitat Shuffle; Lookout Delivery Race; Rescue the Giraffe |
| Otter River Delivery (trackpad click-hold-drag) | Banana Basket; River Fish Rescue; Otter Picnic; Safari Supply Sort; Floating River Raft; Jungle Picnic Pickup; River Delivery Dash; Rescue the Otter |
| Lion Scroll Savannah (two-finger trackpad scroll) | Find the Hidden Lion; River Animal Search; Fruit Trail Finder; Ranger Clue Hunt; Up and Down Safari; Ranger Supply Search; Scroll Scavenger Sprint; Rescue the Lion |

**Interaction invariants**
- Single-click missions never accept double-click as a separate required mechanic; double-click maps use actual \`dblclick\` events rather than counting one click.
- Letter/number maps listen to real keyboard keys and display the specific clue; no textbox or word typing is required.
- Elephant maps use selected-jeep keyboard arrows, rock collision, collectible checkpoints and optional generous countdowns. All eight checkpoint routes were statically checked for reachability.
- Giraffe maps require explicit pointer selection then keyboard arrow motion; they do not allow drag-to-complete.
- Otter maps require actual pointer drag-and-release, with one shared basket, separate outline targets, or gently moving raft targets; keyboard arrows do not complete these missions.
- Lion maps require scrolling a real scrollable pane to locate successive visible clues; some missions require scrolling back upward.
- The eighth mission of every region rescues its friend and unlocks the next map; saved progress keys remain unchanged.
- Timed missions are retryable. Quitting or retrying cannot erase previously earned stars.

**Current QA**: All 64 mission specifications are present, JavaScript parses successfully, each scroll target lies in its list, all 8 arrow-key checkpoint routes are reachable, and all teacher/font references remain. This is static/code-level QA, **not** a guarantee of hands-on testing for every Chromebook gesture or all 64 live levels.

