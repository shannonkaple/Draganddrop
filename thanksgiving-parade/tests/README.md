# Parade Maker acceptance QA

Install Playwright and Chromium in a trusted test environment, then from the repository root run:

```sh
node thanksgiving-parade/tests/acceptance.cjs
```

The default test serves this checkout on loopback. To test a published version, set `PARADE_URL` to its canonical URL with a cache-busting query and `PARADE_TEST_ARTIFACTS` to a destination for output PNGs. `PARADE_TEST_FILTER` selects test names by case-insensitive regular expression. Optional `PARADE_CHROMIUM_EXECUTABLE`, `PARADE_CHROMIUM_ARGS_MODULE`, and `PARADE_BROWSER_PROXY` support an existing trusted environment.

Every Supabase request, including reads, is intercepted and handled in-memory with two synthetic identities. Other non-read requests are blocked and service workers are disabled. Never put real student data into this test. The iframe is a synthetic classroom host, not verification of the separately deployed STEM Classroom Screen.

Screens cover arrival, Balloons, Floats, Scenes, Bands/Music, and Movie at 1280×720, 1366×768, and 1024×600. The 1280px run also captures movie float and band frames. Inspect all screens individually against the owner slides to check graphics, typography, ropes, march poses, and road alignment. Run the real classroom link in a guest-only browser, and do not equate a local test with deployment. A failed verification exits nonzero.
