# Arrow-Naut Junior — Standalone Artwork and Shape-Matching QA (November 2, 2026)

## New Library artwork integrated into live game files

Ten original complete PNG illustrations were brought from the user's existing ChatGPT artwork Library and installed in this game's own assets directories. Their transparent boundaries were preserved; images were **scaled down without cropping** to improve Chromebook download/painting performance. Original full-size Library versions remain untouched.

**Space explorer selection / corner logo** (`assets/explorers/`):
- `space_panda.png`: Nova Panda Astronaut; also top-left header logo.
- `space_kitty.png`: Comet Kitty Astronaut.
- `star_bot.png`: Orbit Space Robot.

**New space objects and game art** (`assets/new-space-art/`):
- `meteor_slime.png`: moving maze enemy.
- `space_bat.png`: moving maze enemy.
- `crystal_moon.png`: purchasable My Stuff scene decoration.
- `star_chest.png`: purchasable My Stuff treasure chest.
- `star_beacon.png`: signal-activation puzzle PNG and shop decoration.
- `space_rover.png`: purchasable moon rover.
- `star_wand.png`: purchasable star wand.

The original `astro_ace.png` is retained as a fourth astronaut option and as a safe fallback for previously selected non-space characters. Non-space portrait options have been removed from the picker. The header contains no image of Ms. Kaple or her cat.

The earlier complete standalone `assets/puzzle/` PNGs, including `l_shaped_cargo.png` and `t_shaped_cargo.png`, and the `assets/move-find/` PNGs remain available and were preserved. **No contact-sheet slicing, SVG, emoji-based game art, cropping or stretched puzzle images.**

## First-grade gameplay

- Only **click with a Chromebook trackpad** to select, then **use arrow keys** to move.
- No dragging, rotating, resizing, touch movement, or laser weapons.
- Every moving non-maze puzzle requires **horizontal and vertical movement** by a checkpoint or offset destination.
- Cargo Scan & Deliver and Space Signal Relay use **fixed-size 2×3 L cargo** and **3×3 T cargo** and ghosted matching PNG silhouettes. They cannot overlap obstacles, other cargo, or leave the board.
- Students match the correct picture, dimensions and orientation by moving it into its destination, not manipulating its size.
- All 64 games are automatically solved in route-regression tests using actual keyboard-move mechanics; 26 current regression tests passed during implementation.
- Level IDs, completed levels, stars, redeemed items, rescue friends, and My Stuff arrangements remain untouched. An unfinished active game created before the new cargo geometry restarts **only that unfinished puzzle** to avoid invalid old positions.

## Browser/testing note

Code-level regression tests do not replace a hands-on Chromebook test for 1280×720 layout, tab-reload recovery, image fetching, space-themed picker, or actual keyboard key repeat.
