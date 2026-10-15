# Lift Log: notes for Claude

Read this before changing anything. It is the single source of truth for how this app is built, tested and published, and for the owner's decisions so far.

## What this is

A personal strength-training tracker for one person (the owner of this repository). Push, pull and legs split with A and B versions of each: Push A, Pull A, Legs A, Push B, Pull B, Legs B, in that rotation. Abs are optional on push and pull days, never on legs days.

It is a single-page web app (a PWA) installed on the owner's iPhone 16 Pro Max Home Screen from https://taafe-lab.github.io/lift-log/ and it works fully offline. It is not in any app store. GitHub Pages serves the repository root from the `main` branch.

## How the owner wants changes handled

- Ask clarifying questions before building anything non-trivial.
- Make the change in `source/`, rebuild, run both test scripts, and show the owner screenshots of what changed (`source/tools/preview.py`, or targeted screenshots with `phone.py`).
- **Publish (commit and push to `main`) only after the owner says yes.**
- After publishing, tell the owner to open the app with signal and tap **Reload** when it says "A new version of the app is ready". For bigger changes, ask them to save a backup first (Settings, Save a backup).
- Tone: plain UK English, friendly and professional, lead with the single best recommendation, no jargon without explanation, push back when something is a bad idea. Weights are always in kg.

## Golden rules: never lose the owner's data

1. The owner's training data lives only on the phone, in `localStorage` under the key `liftlog.v1`, plus backup files they export. It is not in this repository. No change may wipe, reset or orphan it.
2. Never rename the storage key or change the saved-data shape without handling old data in `migrate()` (in `source/src/app.js`). Test the change by loading a saved state from the previous version (see `synth.py` for how to make one).
3. `source/src/program.js` only sets the defaults for a fresh install. The owner's live plan (exercises, sets, rest times, notes, options) is in saved data, and they edit it in the app's Edit mode. If a programme change must reach their phone from code, add a one-off migration (bump the state `v` and update the saved plan in `migrate()`), and tell them.
4. `index.html`, `sw.js`, `manifest.webmanifest` and the three icons at the repository root are build output. Never edit them by hand: change `source/` and run the build.
5. The repository is public (free GitHub Pages requires it). The starting numbers from the owner's notes are embedded in `index.html`; the owner knows. Never add personal details (name, email, location) to any file.

## Layout

```
index.html, sw.js, manifest.webmanifest, *.png   built app, served by GitHub Pages
README.md                                       owner-facing: install, backup, updates
CLAUDE.md                                       this file
source/src/app.js        all app logic: state, rendering, timer, backup, progress maths
source/src/app.css       styles, light and dark mode
source/src/anatomy.js    front/back muscle figure (SVG paths, left half mirrored)
source/src/program.js    default exercise library, workouts and muscles
source/src/baseline.json starting numbers (last sets, PBs, strength scores) parsed from the owner's notes
source/tools/build.py        builds the app into the repository root
source/tools/notes_data.py   the owner's original training notes, cleaned up
source/tools/parse_notes.py  turns notes_data.py into baseline.json
source/tools/phone.py        drives the app in an iPhone-sized Chromium (Playwright)
source/tools/test_flows.py   ~60 end-to-end checks of every main flow
source/tools/test_offline.py offline install and the update prompt
source/tools/synth.py        realistic fake history for testing progress screens
source/tools/preview.py      three-screen preview image to show the owner
```

## Commands

Run from the repository root:

```
python3 source/tools/build.py          # rebuild index.html, sw.js, manifest, icons
python3 source/tools/test_flows.py     # must print 61/61 (or more) checks passed and no console errors
python3 source/tools/test_offline.py   # must print ALL PASS
python3 source/tools/preview.py        # writes lift-log-preview.jpg to the screenshot folder it prints
```

Needs Python 3 with Pillow and Playwright (Chromium), plus ImageMagick (`montage`) for the preview. Screenshots go to `$TMPDIR/lift-log-shots` (override with `LIFTLOG_SHOTS`). For screenshots closer to the iPhone's rounded font, `npm pack @fontsource/nunito@5`, untar it and set `LIFTLOG_FONTS` to its `package/files` folder; otherwise the system font is used.

When adding a feature, add checks for it to `test_flows.py`. The tests block the service worker (it would serve cached files); `test_offline.py` covers it separately.

Publishing: commit (signed, as configured) and push to `main`. Pages redeploys in a minute or two. `sw.js` VERSION is a hash of the built files, so any app change makes phones show the update prompt; a push that leaves the built files byte-identical (docs or tools only) does not.

## How the app works

- **Workouts and exercises.** Each workout has a list of exercise slots (ids like `pushA.inclinePress`). A slot can have options (for example Smith 30°, Machine, Dumbbells). Each option is a separate exercise key with its own PB, last time and progress. The last option used is remembered per slot. Some exercise keys are shared between slots (for example `vbarPushdown` in Push A and Push B), so they share a PB.
- **Exercise cards** show a muscle figure (tap for front and back with names), PB, last time's sets, set rows (kg, reps, tick), + Set, + Drop set, the rest time and a notes box. Notes belong to the slot and carry over.
- **Ticking a set** with empty inputs uses last time's numbers (shown as grey placeholders). `0` means bodyweight and shows as BW. Beating the PB shows a trophy on the row and a toast.
- **Sets.** + Set and + Drop set are always available. Removing a set or exercise is only possible in Edit mode, asks first and offers Undo. The set structure persists as the plan for next time. Drop sets never count toward totals, PBs or progress.
- **Rest timer.** Per-exercise rest (default 90 s). Starts when a set is ticked, except on the first exercise of a superset (wrist curls palms up and palms down in Pull B are a superset). +15 s, −15 s, Skip. Beeps via Web Audio while the app is open. Keeps the screen awake while it runs (a setting keeps it awake for the whole workout).
- **Abs** are a shared list shown, collapsible, at the end of Push and Pull workouts only. They never count in set totals.
- **Finish** asks first, saves ticked sets plus any rows with reps typed in, lists new PBs and offers Undo. A workout left unfinished for 8 hours is saved automatically.
- **Working sets** (home screen): sets ticked in the latest A and B session for Push, Pull and Legs, against the planned count. Excluded: exercises with `counts: false` (calves, shrugs, wrist curls), anything in the abs category, and drop sets. "By muscle" shows a heat-map figure; a set counts once for each main muscle group.
- **Progress tab.** Strength score per set = kg × (1 + reps / 30); for bodyweight sets it is the reps. The best score per exercise per month is compared with the baseline (the best of the latest sets in the owner's notes). The chart shows the average % change per category (counted exercises only) by month, with a legend, tap-for-values and a table view. Below: each lift with a sparkline and change vs the previous month, then recent workouts (tap for detail, delete with Undo).
- **Backup.** Settings, Save a backup shares a JSON file (save to iCloud Drive); Restore reads one, asks first, keeps the replaced data in `liftlog.v1.beforeRestore` and offers Undo. The home screen reminds when a backup is due (two or more workouts and none yet, or 14 days since the last one). Unreadable saved data is copied to `liftlog.v1.unreadable-<time>` instead of being overwritten.

## Saved data (`localStorage['liftlog.v1']`)

```
{ v: 1, created,
  plan: { workouts: { pushA: [slotId, ...], ... },
          slots: { slotId: { name, opts: [{ label, ex }], sets: ['w' | 'd', ...], rest, ss } },
          ex: { exKey: { name, cat: 'push'|'pull'|'legs'|'abs', p: [mainMuscles], s: [supportingMuscles], counts } },
          abs: [slotId, ...] },
  workouts: [{ id, name, cat, abs }],
  notes: { slotId: text },  sel: { slotId: optionIndex },
  history: [{ id, w: workoutId, start, end, items: [{ s: slotId, e: exKey, sets: [{ kg, reps, d?: 1 }] }] }],
  drafts: { workoutId: { start, upd, rows: { slotId: [{ kg, reps, done }] } } },
  settings: { rest, sound, awake },  backupAt,  timer: { end, dur, cat, doneAt? } | null }
```

Muscle ids: chestUpper, chestMid, frontDelts, sideDelts, rearDelts, biceps, triceps, forearms, traps, lats, upperBack, lowerBack, abs, obliques, glutes, abductors (outer hips), adductors (inner thighs), quads, hamstrings, calves.

## Design

- Category colours: Push `#F26B1D`, Pull `#2F6BFF`, Legs `#0FA968`, Abs `#9B4DEB`. PBs gold. Muscles red: main `#E5383B` (gradient), supporting light red. Progress chart lines on the navy band use `#E86A1E`, `#5A86FF`, `#12A86A` (checked for colour-blind separation).
- Font `ui-rounded` (SF Pro Rounded on iPhone). Light and dark mode follow the phone. Coloured bands sit under the status bar (`black-translucent`), so every screen's top must stay dark or coloured.
- Inputs are 19px or more so iOS doesn't zoom. Tap targets 44px or more.

## Programme decisions (15 Oct 2026)

- The full default programme is in `program.js`; starting numbers come from `notes_data.py`.
- Machine shrugs: 4 sets. "Overhead dumbbell press" is a triceps extension. The unlabelled 35 kg shoulder press lines were dumbbells. Wrist curls are two exercises done as a superset: palms up (40 kg) and palms down (17.5 kg). "Arm support" preacher curl is an arm blaster curl. Pull B leg raises at 7 kg were taken as more recent than Push B's 5 kg.
- Drop sets: after set 4 of seated dumbbell lateral raises and on the last set of the standing machine shoulder press (both Push B).
- Default option per slot is the first listed (for example Smith for Push A incline press).

## Known limits (iPhone web apps)

- The timer cannot alert when the phone is locked or another app is open. The beep may be muted by the silent switch.
- No Apple Health or Apple Watch access.
- The Home Screen app keeps its own storage, separate from Safari: the owner must always open it from the Home Screen icon.
- iOS can clear web app storage if the phone runs critically low on space, which is why backups matter.

## Changelog

- 15 Oct 2026: version 1.0 built and published. Source, tests and this file added to the repository.
