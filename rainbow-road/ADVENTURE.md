# A-Mazing Arrow Adventure expansion

The original number-only login opens character selection, Rainbow Land selection and the twelve-level adventure. Endless arrow practice is available from the map. The original core maze module and original lesson pages remain unchanged.

Adventure records extend the existing `rainbow-road-number-v2:<number>` save under `adventure`. Existing maze and Arrow Amethyst wallet fields are preserved. Rainbow Stars fund independent character upgrades (2 then 4 stars by default); adventure completions also earn 5 legacy Arrow Amethysts. Friends are rescued on configured levels once per level and assigned to any land. Completed levels can be replayed for more stars and missed equipment or badges.

Progress and teacher settings are saved on the current browser only. Same-number students sharing a browser share the existing number slot. No class scheduling or cloud sync was introduced. CSV reports include only progress saved on that browser. Settings offer slower obstacles, gentle mode, hints, audio, reduced motion, optional screen arrows and upgrade costs. Skips open levels without granting rewards.

JSON is in `rainbow-road/data/`; assets are in `game-assets/`. The flattened supplied artwork was restored into the paths declared by the manifest. Asset URLs are resolved relative to the GitHub Pages project root.

Checks: 100 asset paths, character sprite dimensions, 720 generated safe mazes, all twelve levels completed in Chromium, all four skill badges, five equipment items, eight friends, independent upgrades, land moves, saved reload state, original wallet preservation and five display sizes. The existing endless-mode and JPEG slide export checks also run.
