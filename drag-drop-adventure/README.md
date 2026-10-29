# Drag & Drop Adventure

A separate game at `/drag-drop-adventure/`, reusing Arrow Adventure’s rainbow maps, original artwork, eight worlds, Star Shop, friends, and collections. Existing games are unchanged.

Students click and hold the primary mouse/trackpad button, move an object at least 18 pixels, and release inside its matching target. Click-only, touchscreen, secondary-button, cancelled, and outside-target attempts do not earn progress. The browser verifies held-pointer dragging, not the physical number of fingers used. Instructions explicitly teach one-finger click-and-hold.

There are 64 activities (eight per world), with 4–11 successful drops per activity. Each successful drop saves immediately. Completing an activity awards the original star rewards, unlocks the next activity, and contributes to world rescues. Replaying a completed activity does not award duplicate stars.

The Second Grade class selector reads `teachers-grade2.json`, copied exactly from the existing `trackpad-adventure/teachers.json` roster and offers student numbers 1–24. Progress is browser-local under `drag-drop-adventure-v1:<teacher ID>:<number>`. It does not import or overwrite Arrow Adventure or the existing trackpad game. Teacher settings use a separate key.

Artwork, configuration, CSS, and reward helpers remain shared read-only repository resources. This folder belongs in the existing repository; it is not a standalone repository export.

Run `node drag-drop-adventure/test-drag.mjs` for input acceptance checks. Serve the repository root over HTTP to play.

## Bad-guy blockers
The first activity introduces dragging without blockers. Activity 2 has one stationary enemy, 3 has one moving enemy, 4 has two stationary enemies, 5 mixes a moving and stationary enemy, 6 has two moving enemies, 7 has two stationary enemies, and 8 has two moving enemies. Existing original transparent sprites display at 112 pixels (100 on narrow screens) without background boxes. Each world uses its original enemy roster, world map, and available activity scene art from Arrow Adventure. Only the current drag resets on contact. Collision checks both held-pointer movement and enemies moving across a stationary held token. Reduced-motion settings keep enemies stationary. Animation and event listeners stop when leaving an activity.

The full-width header is `assets/drag-drop-header-wide.jpg`, generated with the built-in image tool using Ms. Kaple and Rigby as character references. Prompt: a vivid panoramic rainbow-world banner with the exact title “MS. KAPLE’S DRAG & DROP ADVENTURE!”, original character identities, glossy cartoon art, and a mouse/cupcake drag-and-drop cue. The recomposed 2146 × 268 JPEG is a shallow panorama with a single-line game title and fills the viewport width at its natural aspect ratio.

## Character ownership and switching (October 28, 2026)

The first character a student selects is FREE. Subsequent changes to a different playable character cost 5 earned Rainbow Stars **every time**, even when returning to an owned character. A new character is permanently unlocked by its first paid switch. Students cannot activate locked characters or switch when they lack sufficient stars. Every charge requires confirmation; the current character is never charged.

Previously selected/unlocked characters remain in their assigned worlds. MY STUFF includes only owned player characters as movable residents; moving a character between owned worlds is free, and does not switch which character the student plays. Existing stars, completed activities, purchases, characters, room placements and rescued world friends are preserved. All purchases use in-game stars, never real money.

## Easier character placement in MY STUFF

A horizontal **MY CHARACTERS** ribbon sits directly beneath the scene. It displays ONLY unlocked/owned playable characters and their current home. Click **Move** for a resident or **Place Here** to move an owned character from another owned world. Then click the destination in the large picture; the position saves immediately. Students can also click a character directly in the scene, click a destination, or use the older mouse-drag interaction. Moving or arranging an already-owned character is FREE; the 5-star fee applies ONLY to changing the playable character. Character homes, world ownership, existing positions, coins, stars, collectibles, and story progress persist after reloading.

### Teacher controls and responsive directions

Use **Teacher** in the banner toolbar. On a new browser, set a password (at least eight characters); later visits require it. Passwords are salted and derived with PBKDF2, not saved as plaintext. This is a local classroom UI lock, not server authentication. **Lock & exit teacher mode** ends the in-memory teacher session.

Teacher preview starts with fresh, temporary data, all 64 levels open, all characters/worlds available, and preview spending stars. Its save function does not write student progress. The teacher level picker opens any activity directly. Student accounts still use their original unlock rules and storage keys.

Movement mode, movement speed, reduced motion, celebration sound, and upgrade prices apply to all classes using this browser. Export/import settings to copy the setup to other devices; this static GitHub Pages game does not synchronize settings between devices. Settings exports contain no password or student progress.

Home, Stars/Star Shop, and My Stuff now live in the banner toolbar. Every activity uses the shared responsive instructions layout: text wraps, guide artwork shrinks to leave room for directions, and narrow screens put instructions above the game. Extremely small or zoomed layouts can scroll instead of clipping directions. The banner artwork/dimensions are unchanged.
