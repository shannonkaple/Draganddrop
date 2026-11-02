# Arrow-Naut Second Grade — Master Work Checklist (separate from original Arrow Lab issue #20)

## First playable version (2026-11-02)
- [x] Standalone `/arrow-naut/` game; preserve `/arrow-lab/` and `/drag-drop-adventure/` unchanged
- [x] Second-grade teacher roster loaded read-only; student number selection; independent, versioned save keys
- [x] Eight new space planet names and eight lesson types per planet (64 configurations)
- [x] Careful click INSIDE; keyboard arrow move, resize handle + arrow keys; Tetris-like fitting; no drag, touch completion or cropping
- [x] Browser speech synthesis on a single direction sentence; wide 12×7 puzzle field
- [x] +3 stars on every level win including replays, without duplicating completion credit; star shop and simple My Stuff inventory
- [x] One-time world-friend introduction; rescue at eight missions; save verification and corrupted-save protection
- [x] 12/12 isolated Node tests; local browser smoke at 1366×768 and 1280×720 for teacher/student, intro, click, reward, rover movement, no JS errors
- [ ] Verify newest **GitHub Pages deployment** and perform actual hosted-browser QA at 1366×768, 1280×720, fullscreen, trackpad, and reload
- [ ] Play-test all 64 levels in order with actual second graders, confirm every puzzle is solvable and instructions readable

## Original space art (not yet generated/approved)
- [ ] Approve an original cohesive visual style distinct from first-grade games
- [ ] Generate and approve 1 galaxy map + 8 original planet maps with eight correctly aligned clickable landmarks each
- [ ] Generate and approve 8+ spacious gameplay JPEG backgrounds, 8 My Stuff world backgrounds
- [ ] Generate 9 independent selectable player portraits and 8 rescued-friend portraits as PNGs
- [ ] Generate 32 distinct, child-friendly enemy PNGs: 4 per world, with clear game collision zones
- [ ] Generate themed earned collectibles and shop-only decoration PNGs (not CSS art or emoji in final)
- [ ] Integrate final art with native aspect, no resizing/cropping, no duplicate banner layers, test legibility at 1280×720
- [ ] Add world-specific moving enemy puzzle mechanics only after core click-and-arrow controls are stable
- [ ] Extend My Stuff to visually place, arrange, and remove purchased items and friends with saved positions

## Non-negotiable controls
- No cropping or double-click-to-crop anywhere.
- Students select **inside** an object with the trackpad, then use keyboard arrows.
- Resizing requires selecting an actual resize handle, then arrow keys. Original image aspect must be preserved once final artwork is added.
- Replays earn stars, but older completed levels, purchases, rescued friends, and student records never reset.
