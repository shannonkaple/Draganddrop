# COPY THIS ENTIRE BRIEF TO THE OTHER CHATGPT CODING/DESIGN AGENT

I am expanding **Ms. Kaple's A-Mazing Arrow Adventure**, a first-grade computer-skills maze game already developed and hosted through GitHub. Use this attached ZIP as the single source of truth for the new artwork, JSON files and design requirements. **Implement these changes in my existing game; do not create a totally separate app or break any existing features.**

## The goal
Build an exciting, bright, rainbow-colored adventure in which students use arrow keys to move through increasingly challenging MAZES, avoid and duck under silly bad guys/obstacles, practice computer skills, collect computer equipment and skill badges, rescue cute friends, upgrade their friends, and choose a beautiful **Rainbow Land** home to display their rescued friends. Keep gameplay playful and approachable for FIRST GRADERS. They should feel successful, not punished.

## 1. Choose a main character + collect friends
- Keep the existing 8 named characters and their exact IDs (see `data/characters.json`). These are the eight STARTER choices before the first maze.
- Each character has 3 artwork stages: Starter, Power-Up, Super Power. Sprites are included as transparent 512px & 256px PNGs.
- The chosen character is the player's game piece. In rescue levels, allow the player to select **one of the remaining characters as a friend** and collect/rescue them. Do not duplicate already rescued friends.
- Every rescued friend can be upgraded **independently** by spending earned Rainbow Stars. Use 2 stars for Power-Up, then 4 additional stars for Super Power by default; make adjustable in config.
- Show cute notifications, large friend cards, progress, and a collection screen. Never charge money or use loot boxes.

## 2. Rainbow Lands: homes for rescued friends (NEW IDEA)
- Offer 6 colorful lands, **all selectable from the start**, with image cards and names: Rainbow Meadow, Cloud Kingdom, Candy Cloud Castle, Rainbow Reef, Galaxy Gardens and Starshine Summit (`data/rainbow_lands.json`).
- Before or during early gameplay, ask each child to pick their PRIMARY Rainbow Land. It becomes the player's home base.
- After rescuing a friend, let the child **choose which Rainbow Land to place that friend in**. Display the saved friends in that world on top of its background artwork. Students can visit any land, view their friends, see which upgrade each has, upgrade them, or move a friend to another land. Display a simple 'My Rainbow Lands' map and 'My Friends' collection.
- Every land can host multiple friends. Don't make the child lose a friend when choosing another land or changing homes.
- Store land placement and upgrade state using the application's existing student/session storage or backend persistence. Preserve existing homeroom/class IDs.

## 3. Real mazes that get harder every level
- There are 12 example levels in `data/levels.json`; implement more later using this structure. **The colorful background images are scenic only, NOT collision maps**. Build an actual distinct, solvable maze for each level as an aligned grid/path system on top of its background. Clearly distinguish open paths, walls and enemies. Do not simply move a sprite along the road painted into the image.
- Difficulty should climb gently: Level 1 basic arrow-key maze and no bad guys; levels 2-3 more intersections and stationary blockers; levels 4-6 slow predictable moving enemies and an introduction to ducking; levels 7-9 longer routes, safer detours, more hazards; levels 10-12 combine those skills with optional bonus challenges and an exciting final maze.
- Enemies are **cute obstacles**, NOT battle enemies. There are eight transparent enemy PNGs (see `data/enemies.json`): Grumble Cloud, Wobble Slime, Cranky Crab, Prickly Pete cactus, Rumble Rock, Lava Blob, Whirly Wind and Chomper Plant.
- Use slow readable movement patterns, distinct collision areas, clear warnings, and alternate routes. A touched enemy returns the child to a nearby checkpoint with an encouraging message, not a 'game over'. No hearts/lives, gore, timers, flashing or stressful punishments.
- **Duck**: hold SPACE to crouch/duck under clearly labeled low obstacles, with an obvious visual duck pose/squash effect. DOWN must still move down. Provide a big optional on-screen Duck button too. Never require ducking under a hazard with no safe opportunity to learn the control first. The first lesson must explain this move when introduced.
- Provide rest checkpoints, restart level, teacher skip controls, and an always-visible mini instruction/skill icon.

## 4. Collect computer equipment and earn skill badges
- There are 5 separate computer equipment collectibles: Desktop, Laptop, Keyboard, Trackpad, Mouse (`data/computer_collectibles.json`).
- There are 4 separate skill badge images: Click, Double Click, Typing, Arrow Keys (`data/skill_badges.json`). Use these for short on-the-spot challenges. For trackpads, do not try to falsely detect whether the student physically used a trackpad rather than a mouse; simply teach and assess the click/drag behavior that the browser can see.
- Place the required equipment in the level's reachable maze path. To finish that level, the child needs its required item(s), then reaches the exit.
- Skill challenges should be first-grade appropriate: click one large target, double-click a large target with generous timing, type a short familiar word or a few letters, use arrows to navigate, and optionally drag/drop one picture to a target.
- At the FINAL goal, after all five computer items and all four skill badges have been earned, present a joyful 'You Built Your Rainbow Computer!' assembly/celebration scene. No lost-progress trap: any missing item must be available by replaying its level, and all required collectibles should be reachable without unfair hazards.

## 5. Background changes every level
- Includes 12 widescreen level backgrounds in `public/game-assets/backgrounds`, one per sample level, based on 6 unique rainbow worlds (day and twilight variations). Use the EXACT image path in `data/levels.json`. Every consecutive level must switch backgrounds; do not stretch to wrong aspect ratios. Keep maze contrast readable on top. Use land card previews in `public/game-assets/land_previews`.

## 6. Controls, grades and existing integration
- Desktop arrow keys to walk; SPACE hold to duck; click, double-click, type, drag as mini challenges. Provide clear visual instructions and generous hit targets. Keep movement predictable; no twitch/reflex dependence. Support a touch/mobile accessibility fallback if applicable.
- Keep existing lessons, homeroom/class assignments and the teacher/admin progress/reporting that already work. DO NOT replace existing persistence or reset student data. Extend existing records with fields from `data/example_student_save.json` through a safe migration (new fields default safely).
- Maintain GitHub-hosted relative/public paths and use JSON data rather than hard-coding image names. All images are supplied and ready to import into `public/game-assets/`; the JSON files are in `data/`.
- Add a teacher settings screen to adjust difficulty, enemy movement speed, hinting, reward costs, audio and reduced motion. Student progress remains per child, not shared among a whole class.
- Save progress after every reward, friend rescue, upgrade, land move and level completion. Do not expose student personal information in URL parameters or leaderboard.

## REQUIRED SCREENS
Character Select -> Choose Rainbow Land -> Level Map -> Maze -> Level Complete/Rescue Friend -> Place Friend in Land -> Friend Collection & Upgrade -> Rainbow Lands Home Map -> Computer Collection & Badges -> Final Computer Build Celebration.

## ACCEPTANCE CHECKS
1. Every one of the 8 characters displays Starter, Power-Up and Super Power art, and every friend can upgrade separately.
2. Friend rescues unlock new *unique* characters, can be placed in any of 6 Rainbow Lands and remain saved after reload/login.
3. Twelve real solvable mazes with progressing challenge, switchable background per level, understandable enemies and duck mechanics.
4. Collectibles and badges are visible, correctly tracked, cannot be permanently missed, and lead to final computer build.
5. First-grade players can use arrow keys and SPACE without confusion, with hints, checkpoints and reassuring feedback.
6. Existing homeroom assignment and teacher reporting still work exactly as before.
7. No placeholder missing images; check every `/game-assets/...` URL resolves from the game's public folder.

## IMPLEMENTATION PRIORITY
First: copy and validate assets, keep old game working. Second: character/friend & Rainbow Lands collection persistence. Third: 12 maze levels, enemies and ducking. Fourth: computer collectibles, skill challenges and final celebration. Last: teacher settings, sound and polish. Explain any architecture conflicts before destructive changes. No need to recreate graphics—the pack already includes them.
