# Thanksgiving Parade Builder — working status
Updated November 17, 2026. **Only the isolated `balloon-maker-development` branch is changed.** The published main branch/site is unchanged.

## User acceptance criteria (from screenshots and conversation)
- Exact polished balloon/parade art style shown in the supplied reference screenshots, not generic square placeholder images or SVG-generated artwork.
- Fit the **actual viewport on each school Chromebook** every visit; do not require the teacher to guess model or resolution.
- All controls, balloon designer tabs, saved balloons, floats, galleries, lineup, settings and play controls visible and accessible without vertical or horizontal page scrolling or clipped panels.
- Show **pages of choices** controlled by unmistakable previous/next arrow buttons, rather than scrolling the content under a fixed menu.
- Preserve functional student/teacher/number selection, grade 1 & 2 modes, saved creations, lineup ordering, music, street scenes, animated parade, keyboard/trackpad control, full screen.
- No false claim of completion until tested in a real browser.

## Work completed and verified
- [x] Replaced horizontal gallery and lineup scrolling with explicit arrow page changes; dynamic counts and disabled arrows at boundaries.
- [x] Added `chromebook-fit.js` to measure each browser's available visible width/height, recompute after resize/fullscreen/orientation change, and scale the studio proportionally.
- [x] Added `chromebook-fit.css`: fixed canvas height/width, stage and 5-slot lineup, balloon shelf and float shelf, no global page overflow.
- [x] Paginated balloon-maker body/eyes/hats/etc choice grid, category tabs, and My Created Balloons shelf with arrows.
- [x] Added GitHub Actions Playwright browser QA (`.github/workflows/parade-chromebook-qa.yml`) and saved screenshot artifacts.
- [x] Latest QA [run #44214682580](https://github.com/shannonkaple/Draganddrop/actions/runs/44214682580) passed: test viewports 1366×768, 1280×720, 1024×600, 1093×614, 800×480. Tests cover opening guest mode, primary panel bounds and document overflow, arrow clicks for balloons/floats, visible shelf bounds, maker options visible without scrolling, maker arrows and category arrow tabs.
- [x] JavaScript syntax checked, and screenshot reference recovered from file Library.

## Still open (do not call finished)
- [ ] Visually inspect test screenshots and compare the experience against the supplied screenshots in every stage, not just box bounds.
- [ ] Test actual classroom Chromebook(s), including browser toolbar height and different zoom levels. Use dimensions reported from their browser; do not assume the model.
- [ ] Test first/second-grade teacher+student login, save/restore from Supabase, creating/editing/deleting balloons, band/floats, moving 25 items, music, playback, and embedded mode.
- [ ] Verify no cutoffs in settings, entry screens, help, save dialogs, the maker while editing many options, and different window heights.
- [ ] Verify original raster image assets and no newly introduced SVG-generated artwork.
- [ ] Deploy to published `main` only after successful acceptance tests; do not overwrite students' current game prematurely.

## Handoff rule
Continue from the most recent actual pass/fail and keep unfinished items visible. Do not request already-provided screenshots again unless necessary. Never report development branch work as published.
