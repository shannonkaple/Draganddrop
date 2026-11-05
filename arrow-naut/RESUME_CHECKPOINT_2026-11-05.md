# Game Resizing Updates — recovery checkpoint (2026-11-05)

This is a durable handoff, **not** an assertion that pending browser QA or artwork integration passed. Do not treat this file as a substitute for implementation/testing.

## Already committed (verify current branch before changing)
- Second-grade Arrow-Naut: multi-object resize missions in later levels, with non-overlapping starting pieces, destination docks and obstacles (commit `d65d5aa765`).
- Later multi-resize missions use complete colored PNG tiles (commit `1d783f5a7`).
- Second-grade 64-mission click/move/resize/boss regression suite (commit `12abe9793`).
- Classroom-screen layout, rescue-friend art, and cache publication had commits earlier on November 5; browser/device acceptance is separate from committing.
- First-grade Arrow-Naut Junior continues to use clicking and moving only: **do not add resizing**.
- Existing Arrow-Naut/Junior My Stuff shop and boss-completion unlock logic had commits through `1c567591c9` as of the checkpoint. World backgrounds are earned after each world's eight levels plus boss, NOT purchased.

## First unfinished work from the interrupted chat
1. Integrate **all ten exact individually supplied transparent enemy PNG files** into both `/arrow-naut/` and `/arrow-naut-jr/`. Preserve original bytes and names, use varied actual enemies in gameplay, and avoid substitution, recreation, cropping, compression or spritesheet extraction. The prior chat reported ZIP+manifest opened, **but did not confirm all integrations committed or deployed**. Verify each binary/source SHA, manifest mapping, real file URL and usage before reporting complete.
2. Test enemy appearance/behavior, movement, collision/safe paths, and persistence without altering student saves.
3. Test both games at **1366 × 768** and **1280 × 720**, normal and fullscreen, and on reload. Verify no clipped scenes, misplaced docks or invisible PNGs.
4. Continue second-grade **Map Two**, separately from its existing 64-level Map One: new themed levels and backgrounds, new rescuable friends, and tasks for selecting, moving using arrow keys, trackpad drag/drop, and resizing. Prior chat mentioned candidate themes Aurora Garden and Clockwork Comet, 16 missions, but pointer/browser testing remained underway. Do not mark Map Two finished before verifying actual code and gameplay.
5. Continue every earlier outstanding request after the first committed/tested batch, without restarting or erasing approved original artwork. Respect that `/arrow-lab/` is a separate game with its own master checklist in issue #20.

## Safety / publication rules
- Read the latest main-branch head and inspect the changed file before editing: other coding sessions may commit concurrently.
- Commit small coherent verified batches promptly; never hold all progress locally awaiting the entire backlog.
- Do not mark a task complete based on a commit or a successful build alone; perform interactive browser and Pages deployment checks.
- Preserve existing saved students, stars, purchased items, rescued friends, unlocked worlds and in-progress challenges.
- No unapproved artwork replacements and no changes to unrelated games.

## November 5 classroom release — implementation checkpoint
- **Committed today**: Trackpad dragging of placed MY STUFF objects in both Arrow-Naut and Arrow-Naut Junior. Position saved as world-specific normalized percentages; saves must verify before being accepted. See commits `88ca50d` and `f1ec27d`; updated cache files later.
- **Committed today**: 64 optional post-rescue extra practice missions per grade (eight extra in each of eight worlds). Original 64 mission IDs, boss rescue gates, and existing student progress remain unchanged; first grade has click+arrow movement only, while second grade includes resize practice. This is a first playable bonus-lab expansion, **NOT yet the fully art-finished new-themed Map Two**. Both use known existing level templates and world illustrations until Art supplies approved originals.
- **Checked**: static JavaScript syntax for both modified curricula and apps; each has exactly 64 bonus mission definitions and its original 64-level enumeration; boss gating checks passed for the first world. Both published pages load with their teacher selection lists on GitHub Pages via browser-rendered fetch. **Live gameplay, mission solvability, scene dragging, normal/fullscreen Chromebook layout, and deployment SHA confirmation remain unverified.**
- **Current entry points**: `https://shannonkaple.github.io/Draganddrop/arrow-naut/` and `https://shannonkaple.github.io/Draganddrop/arrow-naut-jr/`.
- Continue artwork handoff, enemy PNG integration and actual browser QA without overwriting assets another Art agent is working on. Keep publishing small, tested commits.
