# Arrow Lab — development playground

Preview URL: https://shannonkaple.github.io/Draganddrop/arrow-lab/

This preview is a **separate folder on the existing GitHub Pages site**, not a new GitHub repository. Its HTML, main app module, adventure module, CSS, identity module, and viewport module are independent copies for testing and editing. The classroom game remains at `/rainbow-road.html` and is not changed by edits within `/arrow-lab/`.

The preview deliberately uses localStorage save keys `arrow-lab-class-v1:` and teacher settings key `arrow-lab-teacher-settings` to prevent contamination of classroom saves. It does not import legacy student progress. It reads shared static artwork, configuration JSON, and unchanged game-engine modules from the original repository, so do not rename those shared files without updating the preview.

The first preview home screen uses a CSS rainbow-gradient background and an 8-node clickable map with dynamic lock/completion state. The original game still has 12 levels; later levels remain reachable via Play Next and More Options → All 12 Mazes.

Do not use this URL with students for production tracking. Use the original game URL for classroom play.

## Map v2 and duck instruction behavior

The Arrow Lab home has a rainbow-gradient backdrop and eight illustrated, clickable maze islands using the existing level artworks. Locked levels are disabled; completed levels display earned stars, and the next available level is highlighted. Home, Star Shop, and My Collections link to existing features. Teacher options and all 12 levels remain in the More menu.

The duck/SPACE instruction modal stores `duckTutorialSeen` in the Arrow Lab student's adventure save after the student selects 'I'm ready to try!' and should not repeat on subsequent maze runs for that student in this browser. Other students can still receive their own first-time instruction. This code does not alter production saves.
