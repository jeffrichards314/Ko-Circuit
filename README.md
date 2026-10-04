# KO Circuit

An original NES-style boxing game about **tells and counters**. Every opponent winds up before he punches; learn the tell, answer it at the right moment, and the
opening is yours. Climb the circuits from the Rookie ring to the Champions' Road, and beyond. It runs in any modern browser, on a computer, a phone or a tablet,
and installs to a home screen to play offline.

Everything is drawn and composed in code (sprites, music, effects); nothing in the game is taken from another game.

## How to play

- Watch the opponent. Each move starts with a **tell** (a lean, a raised glove, a sound). Dodge or block it, and the moment he finishes is your opening.
- Hit the **right spot at the right time**. Mashing loses; a punch that finds the opening always stuns.
- Fights are three rounds (then championship rounds if it is still level). Between rounds your cornerman gives you a hint about the opponent: read it.
- The game saves itself. The **desk** in your Home gym shows your **password**, and the title screen takes passwords back (a password makes a save of its own).
  There are three save slots.
- Away from the ring: walk the world map, enter gyms and halls, train, watch back old fights, open the trophy case. Everything is a place you walk to.

## Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Dodge left / right | Left / Right | D-pad | D-pad |
| Block | Down (tap; hold to keep blocking) | D-pad down | D-pad down |
| Duck | Down, Down | D-pad down, down | D-pad down, down |
| Right jab (body) / left jab (body) | X / Z | B / A | **A** / **B** |
| Head jabs | Up + X / Up + Z | D-pad up + B / A | D-pad up + **A** / **B** (two thumbs) |
| Star punch | Space | Y or X | **star** button |
| Start, skip a scene (hold) | Enter | Start | **START** (hold to skip) |
| Pause / back | P or Esc | Back | **PAUSE** (also the back button in menus) |

Menus use the same buttons: up and down choose, A or Start confirms, B or Pause goes back. Keys can be remapped at the desk (CONTROLS). **F2** cycles the CRT
filter on a computer; Options has it too.

### Touch screens

- The **pad appears on a touch device** and goes away when you use a keyboard or a gamepad (it comes back on your next touch). Options has TOUCH PAD: AUTO, ALWAYS ON, OFF.
- **Options also sets the pad's size, opacity, side (left-handed) and height.** These are saved for the whole game, not for one save.
- Hold **Up** with one thumb and tap **A** or **B** with the other for head punches; tap **Down** twice for a duck. Rolling a thumb from one button to another works.
- Menus, lists and screens of text: **tap** a row to choose it and tap it again to use it; **swipe** to scroll a long list or turn a page; tap anywhere to turn a text box.
- The **world map** and the **halls**: the D-pad walks; or tap a place and the runner walks there, and tap it again to go in.
- Name and password entry have an **on-screen keyboard**; the password screen has a PASTE key where the browser allows it.
- Hold the phone **sideways**. Upright, the game asks you to rotate it and waits.
- The game **pauses when you leave** it (another app, the lock button, a call); a fight shows its pause menu.

## Playing and installing

- Open the page. On a phone or tablet use the browser's menu: **Add to Home Screen** (iPhone and iPad: Share, then Add to Home Screen; Android: Install app).
  Once it has loaded one time it works **fully offline**.
- Saves are kept in the browser's local storage, on that device. Clearing the site's data erases them, so write down your password from the desk once in a while.
- The game updates itself: when you are online it checks for a new version, downloads it in the background and offers it ("NEW VERSION READY"; it applies at once from the title screen).

## Publishing it yourself (GitHub Pages)

The repository builds a clean copy of the game (**only the files the game needs**) and publishes that. Screenshots, specs, tools and notes are not published.
Everything below is typed into a terminal in this folder.

### The first time

1. **Make the repository on GitHub**: github.com, New repository, name it (say `ko-circuit`), **no** README or other files added. Copy its address.
2. **Check what will go up**: `git status` should say nothing to commit. If it lists changes, save them first (see "Every update" below).
3. **Connect and push** (use your own address):
   ```bash
   git remote add origin https://github.com/YOUR-NAME/ko-circuit.git
   git push -u origin main
   ```
4. **Turn on Pages**: the repository's Settings, then Pages, then Build and deployment, **Source: GitHub Actions**.
5. The push started the workflow in `.github/workflows/pages.yml`; watch it under the Actions tab. If it ran before you did step 4, open it and press Re-run.
   When it is green the game is at `https://YOUR-NAME.github.io/ko-circuit/`.

### Every update after that

```bash
node tools/build.mjs     # optional: builds deploy/ and checks it, so a mistake shows up here and not on the site
git add -A
git commit -m "what changed"
git push
```
The push is the whole release: the workflow rebuilds `deploy/` from what you pushed (so **anything not committed is not published**), and a few minutes later the site is new.
Players who have the game installed or open get it the next time they are online: it is downloaded in the background, applied at once from the title screen, or
offered as a "NEW VERSION READY" card if they are in the middle of something. Saves are never touched by an update.

Which version is live? `https://YOUR-NAME.github.io/ko-circuit/version.txt` shows the build's version; `node tools/build.mjs` prints the same one for your files.

Without GitHub Actions: `node tools/build.mjs` writes the public copy into `deploy/`; any static host can serve that folder as it is (every path is relative, so
it also works from a subfolder).

### Checking a build on your own machine

```bash
node tools/build.mjs            # writes deploy/ and checks it (no reference images, no tools, no absolute paths)
python3 -m http.server 8000 -d deploy
```
Open http://localhost:8000/ . The service worker (offline play, updates) only runs from a built copy, never from the dev server.

## Working on the game

```bash
python3 tools/serve.py 8420     # a static server that never caches; open http://localhost:8420/
```
Add `?dev` to the address to get `window.KO` (the game object) in the console (on localhost only; the published site never has it). The dev tools (sprite viewer, fight lab with the difficulty sliders, audits, the
test scripts) are in `tools/` and open from the dev server, for example http://localhost:8420/tools/fight-lab.html . They are **not part of the public build**.
The build notes, design history and test list are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

`node tools/touch-e2e.mjs` runs the touch tests (layouts at phone and tablet sizes, multi-touch, a whole flow played with fingers) and `node tools/pwa-e2e.mjs`
the install, offline and update tests; both need `playwright-core` (see the top of each file).

## Files

| Path | What |
|---|---|
| `index.html`, `src/`, `data/` | the game (plain ES modules, no build step to run it) |
| `manifest.webmanifest`, `sw.js`, `icons/`, `src/pwa.js` | install to the home screen, offline play, updates |
| `tools/build.mjs` | makes `deploy/`, the public copy |
| `tools/` | dev tools and tests (not published) |
| `.github/workflows/pages.yml` | publishes to GitHub Pages |
