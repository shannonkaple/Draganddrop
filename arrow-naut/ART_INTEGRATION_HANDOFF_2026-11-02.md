# Arrow-Naut — illustrated gameplay art integration handoff (2026-11-02)

**Status:** 54 candidate individual PNGs have been created and packaged for the user. The new PNG bytes are **NOT** in GitHub and **NOT deployed**. Keep them distinct from the existing 63-sprite atlas, which is already present and used by the game.

User-facing pack in the active Arrow Game conversation:
- `Arrow_Naut_Illustrated_Space_Asset_Pack.zip`
- `Arrow_Naut_Illustrated_Asset_Preview.jpg`
- The ZIP contains `Arrow_Naut_Illustrated_Space_Assets/manifest.json`, all named transparent-background PNGs, source image sheet, README and visual preview.

## Requested teaching interaction
1. Click INSIDE an object to select it.
2. Arrow keys MOVE the selected puzzle object, one grid square at a time.
3. Click and HOLD one of eight visible edge/corner handles using the Chromebook trackpad, DRAG to resize the **frame/hitbox**, RELEASE to snap/save.
4. **Never** use arrow keys to resize. **Never** distort, stretch, or crop the rendered PNG itself. Keep the picture `object-fit: contain` within the selected frame.
5. Each planet gradually increases challenge through larger resize targets, additional distractors, obstacles and more parts, without impossible routes or changes to existing saved mission IDs.

## Proposed PNG-to-puzzle mapping after visual approval
| Gameplay role | Candidate file inside new ZIP |
| --- | --- |
| Rocket object | stretch-rocket.png |
| Space rover | moon-rover.png |
| Satellite solar panel | solar-satellite.png |
| Satellite body/dish | satellite-dish.png |
| Cargo station/object | cargo-crate.png |
| Emergency signal / antenna | telescope.png or energy-battery.png |
| Repair console | tool-kit.png |
| Sorting targets | sort-blue.png, sort-pink.png, sort-purple.png, sort-teal.png |
| Obstacles/enemies | enemy-drone.png, enemy-purple-blob.png, enemy-rock.png, enemy-eye-bot.png |
| Themed treasures | gold-star.png, purple-gem.png, green-crystals.png, gem-cluster.png |
| Map decoration | purple-arch.png, star-flag.png, space-dome.png |
| Arrow hints | up-arrow.png, down-arrow.png, left-arrow.png, right-arrow.png |
| Handle instructions | resize-helmet-corners.png, resize-rocket-small.png |

This mapping is a **plan**, not code already deployed. After approval, upload files into `/arrow-naut/assets/illustrated/` as actual PNG binaries and adapt the art rendering helper to load individual PNGs without breaking existing atlas artwork. Preserve original sprites and backgrounds, avoid using CSS/emoji drawings as substitute assets, and do not use any candidates with noticeable clipped edges without review.

## QA still required
- Test click INSIDE, pointer capture, click+hold+drag at all eight handles, drag reversal, invalid resize, exact goal fit, released save, and persisted reload.
- Test keyboard arrows move only, including active records previously saved with `mode:'resize'`.
- Test 1280×720 and 1366×768 Chromebook viewports, normal and fullscreen.
- Verify all 64 levels, player switching, student save safety and current GitHub Pages deployment.
- Do not check final artwork or browser acceptance until actual live checks pass.

Only `/arrow-naut/` should be edited for Arrow-Naut; do not change `/arrow-lab/` or `/drag-drop-adventure/`.
