# Thanksgiving Parade Studio

First- and second-grade students choose a grade, teacher, and student number. They can add official balloons or street floats, arrange the lineup with the arrow buttons, and choose a New York scene and instrumental track. The same lineup limit applies to both grades.

The workshop saves to **My Balloons**. A saved design enters the parade when a student selects **Add to Parade**. Students can reopen an editable design, replace or remove an individual piece, and delete a creation with confirmation.

## Published entry points

- [Parade Studio](https://shannonkaple.github.io/Draganddrop/thanksgiving-parade/)
- [Embedded mode](https://shannonkaple.github.io/Draganddrop/thanksgiving-parade/?embed=1)
- [STEM Classroom Screen](https://stem-classroom-screen.pages.dev/), under Canva → Thanksgiving Parade

## Assets and code

- `workshop-catalog.js` records the ten individual characters and their fitting coordinates, independently rendered accessory PNGs, artwork variants and coordinated costume sets.
- `workshop-legacy.js` keeps the original numbered forms and artwork available to existing saved recipes. Modern recipes use base IDs 401–410.
- `parade-player.js` uses the newer Storybook Parade scene and the four original NYC paintings, scene-specific street coordinates, animated balloon tethers and handlers, and a shared playback timeline.
- `assets/music/` contains 28.5-second classroom loops from the four uploaded scores, four original instrumental fallback loops, and the full uploaded audio in its original numbered segments.
- The site uses the original Homebody Club and VAG Rounded font files. Keep the applicable font web licenses with school deployment records.

## Student saves

The existing Supabase project stores lineup order, scene, song and editable recipes under the original grade, classroom and student number. The Chromebook also keeps a local draft and a high-resolution image of each custom balloon. If the local and online versions conflict, the app retains both and alerts the student. An online recipe can be rendered again when opened on another device.

Classroom and student numbers are pseudonymous selection labels. The existing cloud service does not authenticate the student selected on the entrance screen. Use classroom-assigned numbers and keep names and other personal information out of designs.
