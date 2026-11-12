# My Thanksgiving Parade Studio

A standalone, Chromebook-friendly Thanksgiving parade design website for elementary students. Built without Replit.

## Classroom instructions

1. Read *Balloons Over Broadway* (Melissa Sweet), then introduce students to the parade.
2. Give each homeroom a distinct classroom code (for example JOHNSON, TOLER, or BASSO). All students in a homeroom use the same code, and each student uses their assigned number (1–99).
3. First grade: five parade pieces. Second grade: ten pieces.
4. Students select from 27 balloon/balloonicle illustrations and 9 floats/parade units from the teacher's original uploaded SVG collection, arrange their order, select a New York route scene, choose music and a banner color, then press **WATCH MY PARADE**.
5. The Save Parade button stores each classroom code + grade + student number combination online in Supabase, with a local browser backup when connectivity is unavailable.

## Classroom-specific links

You can preselect the class and grade using URL parameters after publishing, e.g. `?class=JOHNSON&grade=1` or `?class=TOLER&grade=2`. Students then need only type their student number.

## Files

- `index.html`: browser interface
- `style.css`: responsive styling
- `app.js`: game logic, scene transitions, music synthesis, and cloud saving
- `bundles/*.js`: optimized standalone illustrations and New York scene assets (no external CDN required)

The artwork is embedded in individual image data URLs at build time, and remains individually selectable and rendered on transparent backgrounds. The full original SVG art stays with the teacher's ZIP backup.

## Privacy

Projects do not collect names, emails, or student accounts. Only a teacher-selected classroom code, grade number, numbered seat/student ID, and parade selections are stored. The class code is an organizational label, **not** a password; do not use student real names, confidential identifiers, or personal information in the code or student number. This is a classroom creative activity, not a private student record system.

## Hosting

Static HTML/CSS/JS website. Can be hosted on GitHub Pages, Cloudflare Pages, or any static web host; no Node server is required. GitHub source is in `shannonkaple/Draganddrop/thanksgiving-parade`.

## Rights

Uses classroom-provided parade asset artwork and includes characters/trademarks belonging to their respective rights holders. It is an unofficial classroom learning project, not affiliated with or endorsed by Macy's or those rights holders. The original embedded images should not be redistributed commercially.