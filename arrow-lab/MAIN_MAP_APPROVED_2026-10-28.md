# Approved eight-world panorama — Oct 28, 2026

**USER APPROVED:** This chat's exact uploaded image `download(1).png`. It is the main eight-world map to use; it supersedes prior unapproved eight-world map candidates, and it MUST NOT be regenerated or substituted.

**Required production repository file:** `arrow-lab/assets/arrow-adventure-eight-worlds-user-20261028.png`

- Native image dimensions: **2048 × 682**, PNG, RGBA, 3,354,278 bytes.
- SHA-256 of the original exact uploaded PNG: `193e346750870c18149855ae3dd4d5fc127a9ea51e7d8e393fb60cd4c919f44f`.
- Eight locations, left to right: **Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava**. No image text, stars, locks or numbers: dynamic DOM buttons provide those states.
- Platform XY centers (percent of native art, left/top): `[[7.5,57],[19.7,45.8],[32.3,59.7],[43.2,45.6],[56.1,60.8],[67.6,45.6],[81.1,60.9],[92.7,45.7]]`.
- `adventure.mjs` now points to the production path above, and `classroom-layout.css` draws and positions all eight buttons within the *same* native-ratio image frame. Never crop/warp it with `background-size: cover` or `100% 100%`.
- While the original PNG is not yet actually committed to GitHub, the image's `onerror` fallback shows `map-background.jpg` and restores its **older** eight hotspot percentages so students do not click invisible/misaligned map objects.
- The connected GitHub text-file and raw Git-object tools require UTF-8 text or an already encoded full image payload, and cannot currently receive the raw local conversation-image bytes directly. **Do not claim the new map is live until the exact image binary is uploaded to the path above and verified by Pages.** The PNG in the user's ChatGPT upload is intact; a direct GitHub browser/cloud-computer binary upload can finish the one outstanding artifact transfer.
- Once the PNG is uploaded, confirm `naturalWidth===2048`, `naturalHeight===682`, 8 clickable stops, locked-world modal, correct 1–8 world labeling, noncropping at Chromebook 1366×768, 1280×720 and 1024×768; test fullscreen in/out with open reward, instruction, skill, rescue and locked-world dialogs. Keep all saved student identifiers and worlds unchanged.

Only work under `arrow-lab/`; issue #20 is the master unfinished checklist.
