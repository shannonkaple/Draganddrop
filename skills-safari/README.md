# Skills Safari — First Grade Computer Skills Game
**Live game (after GitHub Pages deployment):** https://shannonkaple.github.io/Draganddrop/skills-safari/

A new standalone first-grade game structurally modeled on **Arrow-Nauts Jr.** with 8 safari regions × 8 activities = 64 total challenges. Each region practices one real computer skill, with the eighth challenge rescuing a safari friend and unlocking the next region.

**Current status:** Fully programmed first playable prototype. It uses safari-themed CSS backgrounds and temporary emoji pieces. The final artwork still needs to be created and integrated; see [ART_ASSET_LIST.md](ART_ASSET_LIST.md). The site is not yet visually identical to Arrow-Nauts Jr. because the 17 priority map/friend images are missing.

Features:
- First-grade roster from `rainbow-road/data/teachers.json`: Ricketts, Brice, Bell, Wyckoff, Lacroix, Williams, Hicks, Haney, Vannoy, Messer, Basso, Canatella, Boyle, Simon, Arceneaux, Sims, Juvenal, Rizzutto.
- Click-only student number selection 1–30; no word typing.
- 8 separate region maps with 8 clickable numbered challenges each. Later regions and stages unlock from completed work.
- Keyboard keys are checked directly, with no text entry field.
- Double-click levels require actual double-click; drag levels require a trackpad drag, not arrow keys.
- Stars awarded on first completion only: +1 per regular stage and +10 for stage 8. Rescued friends appear on the Friends panel.
- School Chromebook localStorage progress under independent `skills-safari-v1` keys; no sync across devices yet.
- Teacher Preview can open any map or stage without awarding stars or overwriting student saves.
- Voice read-aloud directions via the browser, for readers who need them.

**Safety/QA requirements before classroom launch:** Verify keyboard focus, double-click cadence, moving and drag interactions on a real Chromebook; check all 64 unique challenges, save-on-reload, locks, 8 rescue awards, and responsive map hotspots. No student full names are stored. Do not reuse the Arrow-Nauts Jr. storage prefix or mutate that game.

**Known omissions relative to Arrow-Nauts Jr.:** Full original safari art, collectible Star Shop, My Stuff decoration placements, and cross-device cloud sync are not yet included. These should be added only as separate changes after gameplay and artwork are confirmed.
