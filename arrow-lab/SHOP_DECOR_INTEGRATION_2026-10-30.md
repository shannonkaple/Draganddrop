# Arrow Lab purchasable decorations — October 30, 2026

## Completed directly in GitHub
- `/arrow-lab/shop-purchasable-decorations.mjs`: 36 stable shop-only entries, nine each for Space, Jurassic, Lava and Ocean.
- `/arrow-lab/adventure.mjs`: adds new entries to the existing World Store/MY STUFF purchase and placement system ONLY when their exact PNG actually exists in deployed assets. Preserves prior IDs, student saves, purchases, characters, and existing 36 Candy/Pirate/Arctic/Castle shop items.
- `/arrow-lab/tests/shop-purchasable-decorations.test.mjs`: checks unique IDs, one world per item, file paths and safe omission of missing art.

## ART SOURCE READY (not yet committed to GitHub)
ChatGPT Library `/Arrow Adventure Artwork/Shop Decor 2026-10-30/Arrow_Lab_Space_Jurassic_Lava_27_Store_PNGs.zip` contains 27 independently generated original transparent 1254 x 1254 PNG files, 9 per world. Companion Library manifest: `SHOP_DECOR_MANIFEST.json`. Inside ZIP, files at `shop-decor/<world>/<filename>.png`. Upload UNCHANGED to GitHub `/arrow-lab/shop-decor/<world>/<filename>.png`. Do NOT crop, upscale, create SVG, substitute another image, or split a sheet.

## Ocean artwork blocker
Nine Ocean item names and stable IDs are registered in the new catalog but invisible/unpurchasable until original independent PNGs are actually uploaded to the paths in the catalog. Nine separate Canva generation jobs have been started, but the resulting original transparent PNG exports are NOT verified or present in the Library ZIP. Do not replace with combined contact sheets, existing ocean collectibles, generic emojis, or bad links. Do not imply these Ocean images are deployed.

## Immediate code-side finish
1. Download/upload the 27 PNGs from the exact Library ZIP to the target `/arrow-lab/shop-decor/` paths. Paths and filenames must match the catalog exactly; no renaming, scaling or image recomposition.
2. Verify all 27 assets return HTTP 200 image/png in GitHub Pages. The import + readiness gate automatically activates them in the store after publication.
3. Import the nine real exported Ocean PNGs when available at their catalog paths; do not enable otherwise.
4. Run `node arrow-lab/tests/shop-purchasable-decorations.test.mjs`, `node arrow-lab/tests/purchase-save-rollback.test.mjs`, `node arrow-lab/test-my-stuff-player.mjs`, and `node arrow-lab/test-scene-click-place.mjs`. Test purchases, placement, removal, saved positions after reload; confirm no old student saves reset.
5. Check 1366x768 / 1280x720 Chromebook. Update GitHub issue #20 with confirmed deployment status, not promises.

Note: Only modify `/arrow-lab/` game files. Original source files outside that directory are read-only, even though the current game imports existing shop assets from there.
