# Skills Safari — Art Production Checklist
**Game:** `/skills-safari/` (first grade)  
**Visual reference:** `/arrow-naut-jr/` — same style of illustrated 8-world map, 8 clickable numbered stops inside each world, full-screen Chromebook play area, star progress, and 8th-stage friend rescue.

The first playable build uses **temporary emoji and CSS backgrounds**, not final commissioned artwork. Do not call it art-complete yet. Replace placeholders with complete, separate image assets; no sprite-sheet cropping. Preserve each asset's aspect ratio (`object-fit: contain` for PNG pieces and friends; `object-fit: contain` for full-world map JPGs).

## 1. Essential map artwork (9 JPEGs)
- [ ] `assets/maps/safari-world-map.jpg` — **1 global map**, 1672 × 941, illustrated aerial safari landscape with eight distinct connected regions, room for eight clickable pins and a title.
- [ ] `assets/maps/01-toucan-treetops.jpg` — **Toucan Treetops**, lush canopy, ropes, treehouses, bridges.
- [ ] `assets/maps/02-monkey-mischief.jpg` — **Monkey Mischief**, bright jungle vines, playful platforms, banana tree.
- [ ] `assets/maps/03-parrot-letter-jungle.jpg` — **Parrot Letter Jungle**, colorful bird canopy and colorful natural shapes, **do not draw text/letters in the JPG**.
- [ ] `assets/maps/04-zebra-number-plains.jpg` — **Zebra Number Plains**, sunlit grassland, striped paths, acacias, **do not draw text/numbers in the JPG**.
- [ ] `assets/maps/05-elephant-arrow-trails.jpg` — **Elephant Arrow Trails**, safari roads, rocks, waterhole, landmark tents.
- [ ] `assets/maps/06-giraffe-lookout.jpg` — **Giraffe Lookout**, tall acacia trees, overlooks and bridges.
- [ ] `assets/maps/07-otter-river-delivery.jpg` — **Otter River Delivery**, calm river, riverbank, stones, lily pads.
- [ ] `assets/maps/08-lion-scroll-savannah.jpg` — **Lion Scroll Savannah**, wide golden grassland with a lookout and sun.
All eight world maps should have a **visually clean, clickable 8-stop route**. The application overlays numbered buttons, stars, locks, and the rescue stop itself. Do not bake those into the art.

## 2. Play-area backgrounds (8 JPGs)
One **1600 × 900 landscape** background per skill world, with the central 70% uncluttered so large picture pieces, keyboard letters, dotted outlines, and the grid never compete with scenery:
- [ ] `assets/scenes/01-click-forest.jpg`
- [ ] `assets/scenes/02-double-click-canopy.jpg`
- [ ] `assets/scenes/03-letter-jungle.jpg`
- [ ] `assets/scenes/04-number-plains.jpg`
- [ ] `assets/scenes/05-arrow-trail.jpg`
- [ ] `assets/scenes/06-select-move-lookout.jpg`
- [ ] `assets/scenes/07-drag-river.jpg`
- [ ] `assets/scenes/08-scroll-savannah.jpg`

## 3. Safari friend rescue portraits (8 independent transparent PNGs)
Each **1024 × 1024**, full-body, child-friendly, consistent art style, full character visible, soft outline, transparent background. Do not use cropped collage sprites.
- [ ] `assets/friends/toucan.png` — colorful toucan, rescued after map 1 stage 8.
- [ ] `assets/friends/monkey.png` — friendly monkey, rescued after map 2 stage 8.
- [ ] `assets/friends/parrot.png` — bright parrot, rescued after map 3 stage 8.
- [ ] `assets/friends/zebra.png` — friendly zebra, rescued after map 4 stage 8.
- [ ] `assets/friends/elephant.png` — baby elephant, rescued after map 5 stage 8.
- [ ] `assets/friends/giraffe.png` — baby giraffe, rescued after map 6 stage 8.
- [ ] `assets/friends/otter.png` — river otter, rescued after map 7 stage 8.
- [ ] `assets/friends/lion.png` — friendly lion cub, rescued after map 8 stage 8.

## 4. Player characters (optional initial polish, 4 PNGs)
- [ ] `assets/explorers/safari-fox.png`
- [ ] `assets/explorers/safari-panda.png`
- [ ] `assets/explorers/safari-bunny.png`
- [ ] `assets/explorers/safari-robot.png`
Each can wear a small tan safari hat, with distinctive colors and full transparent silhouette. Avoid weapons or hunting imagery.

## 5. Reusable puzzle pieces (12 PNGs + 1 logo)
Transparent PNGs, **512 × 512** or larger, isolated complete object:
- [ ] `assets/pieces/jeep.png` (keyboard arrow navigation)
- [ ] `assets/pieces/camp-tent.png` (arrow destination)
- [ ] `assets/pieces/rock.png` (maze obstacle)
- [ ] `assets/pieces/binoculars.png` (click/select targets)
- [ ] `assets/pieces/compass.png` (click/select targets)
- [ ] `assets/pieces/backpack.png` (drag-and-drop)
- [ ] `assets/pieces/banana.png` (drag-and-drop)
- [ ] `assets/pieces/fish.png` (drag-and-drop)
- [ ] `assets/pieces/leaf.png` (matching)
- [ ] `assets/pieces/safari-map.png` (matching)
- [ ] `assets/pieces/river-stone.png` (matching)
- [ ] `assets/pieces/golden-star.png` (level completion)
- [ ] `assets/skills-safari-logo.png` (transparent logo with jungle lettering, banner-friendly)

## 6. Reuse from Arrow-Nauts Jr.
- **Font files:** Existing licensed Homebody Club and VAG Rounded links hosted by your Taskscreen project. Do **not** duplicate or expose font-file downloads.
- **Structure:** same illustrated global world map, eight hotspots, a second region map with eight stages, and stage-eight friend rescue.
- **Teacher roster:** `../rainbow-road/data/teachers.json` (18 first-grade classes).
- **Save isolation:** Skills Safari has its own `skills-safari-v1:` browser storage keys. It must never alter Arrow-Nauts Jr. progress.

## Skill/map progression (64 challenges total)
| Map | Skill | Stages 1–7 | Stage 8 rescue |
|---|---|---|---|
| 1 Toucan Treetops | Single click | Pick correct pictures | Rescue Toucan with clicks |
| 2 Monkey Mischief | Double-click | Open animal picture cards | Rescue Monkey with double-click |
| 3 Parrot Letter Jungle | Keyboard letters | Find one to four letter keys | Rescue Parrot with letter keys |
| 4 Zebra Number Plains | Keyboard numbers | Find one to three number keys | Rescue Zebra with number keys |
| 5 Elephant Arrow Trails | Keyboard arrows | Steer jeep through progressively harder routes | Rescue Elephant by reaching camp |
| 6 Giraffe Lookout | Select and arrow-move | Select pieces then use arrow keys to reach matching outlines | Rescue Giraffe by finishing matches |
| 7 Otter River Delivery | Click/hold/drag/release | Move one to three pictures into targets (arrows disabled) | Rescue Otter by delivery |
| 8 Lion Scroll Savannah | Two-finger trackpad scroll | Scroll within a page and find hidden animals | Rescue Lion by scrolling and finding it |

**Art priority:** the nine map JPGs + eight rescue-friend PNGs are first. Then eight play-area backgrounds and reusable puzzle objects. Maintain the Jr. visual proportions (1672 × 941 world maps; responsive Chromebook fit), but use an original playful safari aesthetic, not a reskin that accidentally retains space labels or objects.
