# Classroom playability audit — 2026-11-05

## Scope: **144 currently built and openable missions**

| Game | Original missions | Full completion checks | Notes |
|---|---:|---|---|
| Arrow-Naut (second grade) | 64 | 56 non-boss missions solved by actual select/arrow/resize logic, plus 8 boss routes | Boss routes tested at five enemy timing offsets each |
| Arrow-Naut Junior (first grade) | 64 | 56 non-boss missions solved by actual select/arrow logic, plus 8 boss routes | No trackpad resizing, as required |
| Arrow-Naut Map Two: The Lost Worlds | 16 | All 16 existing missions completed using actual select, arrow, drag and resize functions | Only Aurora Garden and Clockwork Comet are implemented; 6 remaining destinations are placeholders |

- **128/128** original mission IDs and board geometry passed checks for out-of-bounds objects, overlapping initial pieces, inaccessible goal locations and malformed pickups.
- **80** successful rescue-maze playthroughs across both grades and five enemy timings per maze; no forced enemy hits on the tested safe paths.
- **58** distinct PNG/JPEG source files referenced by currently playable missions and their UI art were present in the repository's complete file tree.
- Verified the two public published student homepages still render teacher selection and navigation.

## Blocker fixed

Second-grade moving hazards were spawning at `(5,0)`, on top of an existing decoy in the two-crystal Space Signal Search puzzles. On the first move, the enemy was forced into the player's path; route testing failed on `ice-3`, `jungle-6`, and `core-5`. Hazards now spawn at safe edge coordinates `(11,2)` and `(11,6)`, which were checked against *all 128* second-grade original+bonus mission object, obstacle, star and dock coordinates. The layout version was bumped for affected missions so stale in-progress hazards do not survive reopening; completed levels/stars remain untouched.

After the fix, both grade-level complete-route suites passed with deterministic enemy timing; randomized enemies can still legitimately catch the player and require a retry. Existing test suites were made reproducible rather than counting those intended random collisions as permanently unplayable levels.

## Automated regression going forward

- `arrow-naut/classroom-playability.test.mjs` checks ID uniqueness, geometry, image files, collision-free initial hazard placements, and that incomplete Map Two destinations remain disabled.
- `arrow-naut/solvability.test.mjs` simulates all 64 second-grade missions with controlled enemy timing.
- `arrow-naut-jr/routes.test.mjs` simulates all 64 first-grade missions with controlled enemy timing.
- `arrow-naut/map-two.test.mjs` simulates all 16 implemented Map Two missions.
- `.github/workflows/arrownaut-classroom-qa.yml` executes these tests on pushes to main for either game. Workflow run status still needs to be checked in GitHub Actions.

## Still not verified / not complete

- This is a source-based, real-logic automated audit, **not 144 interactive browser/Chromebook playthroughs**. Normal/fullscreen display, trackpad pointer capture and touch blocking should still be verified on real student devices, at 1366×768 and 1280×720.
- Random enemies may cause legitimate retries in moving-hazard levels. The deterministic solvability tests prove a successful route is possible; they do not guarantee that every randomized attempt wins.
- Map Two destinations 3–8 are **not built** and must remain inaccessible. The overall Map Two illustrated 1672×941 JPEG is also still pending (current view uses a fallback gradient). Never count these placeholders as complete or playable.
- Don't change student save keys or remove completed progress during future fixes.
