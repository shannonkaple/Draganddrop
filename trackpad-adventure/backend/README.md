# Trackpad Adventure — Centralized Class Results (Google Sheets)

**Status:** The school-account Google Sheet is created. The game is prepared to send data, but sending is **OFF** until the receiving web app is deployed and its URL is added to `trackpad-adventure/central-config.mjs`.

## Teacher's central workbook
[Open private Google Sheet](https://docs.google.com/spreadsheets/d/1vQLEDi8Jp_3ZCgLRrxDX5sN7MjUaBlc4lOPI20OtHzI/edit)

The workbook contains:
- **Students:** one up-to-date row per homeroom teacher + student number. Saved metrics are correct drag-and-drop actions, drag attempts, missed drops, click-only attempts, touches blocked, obstacle bumps, stars, friends and upgrades.
- **Rating History:** each 4-question student rating submission, with class, student number, and submission time.
- **Class Report:** enter/select the teacher in B4; view 1/2/3-star counts and student numbers for each objective plus individual student performance. Print this tab or save as PDF.
- **START HERE:** setup checklist.

## Required one-time teacher setup (school account)
1. Open the private Google Sheet in the authorized school Google account.
2. Select **Extensions → Apps Script**. Google creates a script *bound to this exact spreadsheet*.
3. Replace the contents of `Code.gs` with the code in [backend/Code.gs](./Code.gs).
4. Save the Apps Script project, then use the Run menu to run **initialize** once. Approve Google Sheets permissions when prompted.
5. **Before deployment**, ensure school/district IT approves collecting anonymous teacher + student number data in Sheets and approves the Web App access setting.
6. In Apps Script choose **Deploy → New deployment → Web app**.
   - **Execute as:** Me (sheet owner).
   - **Who has access:** Anyone, **only if school policy approves**. A domain-restricted deployment may require a different authenticated submission method; an ordinary public GitHub Pages game cannot automatically POST to a login-protected Apps Script endpoint using normal cross-origin requests.
   - Select **Deploy**. Approve authorization. Copy the Web App URL ending in **`/exec`**.
7. Open [central-config.mjs](../central-config.mjs) and replace the empty string in `centralWebAppUrl='' ` with the copied `/exec` URL (GitHub editor or share it with ChatGPT to make the edit).
8. Test from one student Chromebook with an otherwise unused teacher/student number. Pack an item and submit the 4-question **⭐ RATE**. Confirm **Students** receives that student's row and **Rating History** receives the rating. Only then roll out to the rest of the class.
9. On all Chromebook tabs, refresh with **Ctrl + Shift + R**.

## Important limitations and safety
- **No student names** are collected; class teacher and classroom number can still be considered student information under district rules.
- Keep the workbook **private**. The web app only accepts incoming posts; it does not provide a public GET endpoint to read students.
- A web app accepting unauthenticated public POSTs is not tamper-proof. If school policy prohibits public write endpoints, do **not** deploy it with Anyone access; ask district IT for a school-authenticated solution.
- With `fetch(..., mode:'no-cors')`, a successful browser request does **not** confirm that Apps Script actually recorded the data. Check the Sheet itself. The game still saves each child's progress locally; temporary offline packets retry while the game is opened and online.
- Existing progress on other devices cannot be automatically retrieved until those browsers visit the updated game. The new code sends their existing locally stored progress when a student signs in.
- Do not share the Apps Script owner's authorization grants or the private Google Sheet with students.
- Local 'Print Class Results' is device-only; **Class Report in Google Sheets** is the consolidated report once the backend is live.

## Privacy-conscious data schema
POST body (text/plain JSON):
```json
{"version":1,"kind":"rating","teacherId":"class-01","studentNumber":1,"eventId":"rating-...","clientTime":1793000000000,"stats":{"drops":10,"attempts":13,"misses":3,"clickOnly":0,"cancelled":0,"touchBlocked":0,"enemyBumps":1,"friends":1,"upgrades":0,"stars":8,"round":0,"stage":2},"latestRating":{"values":[3,2,2,3],"submittedAt":1793000000000,"id":"rating-class-01-1-..."}}
```
