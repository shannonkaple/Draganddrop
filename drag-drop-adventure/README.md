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
