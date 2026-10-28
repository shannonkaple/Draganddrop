# Drag & Drop Adventure

A separate game at `/drag-drop-adventure/`, reusing Arrow Adventure’s rainbow maps, original artwork, eight worlds, Star Shop, friends, and collections. Existing games are unchanged.

Students click and hold the primary mouse/trackpad button, move an object at least 18 pixels, and release inside its matching target. Click-only, touchscreen, secondary-button, cancelled, and outside-target attempts do not earn progress. The browser verifies held-pointer dragging, not the physical number of fingers used. Instructions explicitly teach one-finger click-and-hold.

There are 64 activities (eight per world), with 4–11 successful drops per activity. Each successful drop saves immediately. Completing an activity awards the original star rewards, unlocks the next activity, and contributes to world rescues. Replaying a completed activity does not award duplicate stars.

The class selector reads the exact existing `trackpad-adventure/teachers.json` roster and offers student numbers 1–24. Progress is browser-local under `drag-drop-adventure-v1:<teacher ID>:<number>`. It does not import or overwrite Arrow Adventure or the existing trackpad game. Teacher settings use a separate key.

Artwork, configuration, CSS, and reward helpers remain shared read-only repository resources. This folder belongs in the existing repository; it is not a standalone repository export.

Run `node drag-drop-adventure/test-drag.mjs` for input acceptance checks. Serve the repository root over HTTP to play.

## Bad-guy blockers
Activity 1 in each world introduces the drag gesture without obstacles. Activities 2–8 place a stationary original enemy between the source and targets; world-specific enemies rotate after successful drops. Students can take a clear route above or below the striped body. Contact returns only the held object to its source and preserves finished drops/stars. Collision sweeps the full dragged token between pointer events and checks the release event, preventing fast drags from skipping through a blocker. The illustrated striped rectangle is the collision body. Resize, focus loss, cancellation, and navigation cancel the current drag safely.
