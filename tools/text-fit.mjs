// Text-fit audit (spec §1 "Text boxes"): renders every screen that shows words, with every string it can show (every
// fighter's card, quote, bio, medals, scouting report and corner hints; every cutscene line; the menus; the password;
// the longest player name and nickname), and flags any text that
//   - runs off the screen,
//   - spills out of the panel it starts in (right or bottom edge),
//   - overlaps other text drawn in the same frame,
//   - was cut short by a fixed box (drawBlock / drawLabel / drawTyped log it in font.PROBE.over).
// Paged boxes (the cutscene dialogue, the corner's hints) can't overflow; they are walked page by page all the same.
//   node tools/text-fit.mjs [--only intro,scenes,...] [--quick] [--v]
import { Frame, W, H } from '../src/engine/renderer.js';
import { PROBE } from '../src/engine/font.js';
import { makeGame } from './lib/stub.mjs';

globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };
const args = process.argv.slice(2);
const only = (args[args.indexOf('--only') + 1] || '').split(',').filter((x) => args.includes('--only') && x);
const quick = args.includes('--quick'), verbose = args.includes('--v');
const want = (k) => !only.length || only.includes(k);

const { FIGHTERS } = await import('../data/fighters/index.js');
const { EVERYONE } = await import('../src/save/records.js');
const { NICKNAMES } = await import('../data/customization.js');
const { textWidth } = await import('../src/engine/font.js');

// the widest player name the name entry takes (8 letters) and the widest nickname
const WIDE_NAME = 'WWWWWWWW';
const WIDE_NICK = NICKNAMES.reduce((b, n, i) => (textWidth(n, false) > textWidth(NICKNAMES[b], false) ? i : b), 0);
const setProfile = (g) => { g.career.profile.name = WIDE_NAME; g.career.profile.nick = WIDE_NICK; };

const problems = new Map(); // a key per distinct problem (the same overflow on 40 frames is one problem)
let frames = 0;
// (keyed by the problem: the first place it was seen is shown, with how many frames had it)
const flag = (suite, where, text) => { const k = `${suite} | ${text.replace(/ at -?\d+,-?\d+/, '')}`; if (!problems.has(k)) problems.set(k, { suite, where, text, n: 0 }); problems.get(k).n++; };

const F = new Frame();
// draw one frame of a screen with the probe on and check it
function check(suite, where, draw, { scroll = false } = {}) {
  PROBE.on = true; PROBE.texts = []; PROBE.boxes = []; PROBE.over = []; PROBE.seq = 0;
  F.clear(0xff000000);
  try { draw(F); } catch (e) { PROBE.on = false; flag(suite, where, `render threw: ${e.message}`); return; }
  PROBE.on = false;
  frames++;
  const B = PROBE.boxes.filter((b) => b.kind === 'panel');
  // a text a later panel covers is hidden under it: not on screen, not checked
  // (a room's sign is behind any panel drawn over it at all: the panel sits in front of the room)
  const under = (t, b) => b.seq > t.seq && (t.world ? t.x < b.x + b.w && t.x + t.w > b.x && t.y < b.y + b.h && t.y + t.h > b.y : t.x >= b.x && t.y >= b.y && t.x + t.w <= b.x + b.w && t.y + t.h <= b.y + b.h);
  const T = PROBE.texts.filter((t) => !B.some((b) => under(t, b)));
  for (const o of PROBE.over) flag(suite, where, `cut short (${o.where}): "${o.s}"`);
  for (const t of T) {
    // (a scrolling roll, the credits, slides its lines off the top and bottom on purpose: only the sides count there)
    if ((scroll || t.world) && (t.y + t.h <= 0 || t.y >= H || t.x + t.w <= 0 || t.x >= W)) continue;
    if (t.world) continue; // (a sign in a scrolling room: the camera clips it, like the room)
    if (t.x < 0 || t.x + t.w > W || (!scroll && (t.y < 0 || t.y + t.h > H))) flag(suite, where, `off screen at ${t.x},${t.y} (${t.w}px): "${t.s}"`);
    // the smallest panel its top-left corner sits in: it must hold the whole text
    let box = null;
    for (const b of B) if (t.x >= b.x && t.y >= b.y && t.x < b.x + b.w && t.y < b.y + b.h && (!box || b.w * b.h < box.w * box.h)) box = b;
    if (box && (t.x + t.w > box.x + box.w || t.y + t.h > box.y + box.h)) flag(suite, where, `spills out of its panel (${box.x},${box.y} ${box.w}x${box.h}) by ${Math.max(t.x + t.w - box.x - box.w, t.y + t.h - box.y - box.h)}px: "${t.s}"`);
  }
  // text on text (an outline or a shadow is the same string a pixel or two off: not an overlap)
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
    const a = T[i], b = T[j];
    if (a.s === b.s && Math.abs(a.x - b.x) <= 4 && Math.abs(a.y - b.y) <= 4) continue; // (a drop shadow, an outline)
    const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ix > 1 && iy > 1) flag(suite, where, `overlaps: "${a.s}" / "${b.s}"`);
  }
}

// run a screen for n frames, pressing `press` on the listed frames, checking the frames in `at` (or every `every`)
function drive(T, S, { frames: n = 60, press = [], every = 0, at = [], suite, where, until, scroll = false }) {
  for (let t = 0; t <= n; t++) {
    T.step(t);
    if (t > 0) S.update();
    if (at.includes(t) || (every && t % every === 0)) check(suite, typeof where === 'function' ? where(t) : where, (f) => S.render(f), { scroll });
    if (until && until(t)) break;
  }
}
const pressList = (T, list) => list.forEach(([a, t]) => T.press(a, t));

const ids = Object.keys(FIGHTERS).filter((id) => !FIGHTERS[id].remixOf);
const fighters = quick ? ids.filter((_, i) => i % 6 === 0) : ids;

// ------------------------------------------------------------------------------------------- the intro card
if (want('intro')) {
  const { IntroScreen } = await import('../src/screens/intro.js');
  for (const id of fighters) {
    const T = await makeGame({ career: 'zeroTrue' }); setProfile(T.game);
    const S = new IntroScreen(T.game, { fighter: id });
    check('intro', id, (f) => S.render(f));
  }
}

// ------------------------------------------------------------------------------------------- the results screen
if (want('results')) {
  const { ResultsScreen } = await import('../src/screens/results.js');
  // (every career stage's outcome box: a win's NEXT and password, a rematch, a reset, a title, the Void's retry)
  const CAREERS = ['new', 'zero', 'p7', 'u4', 'vorgath', 'v1', 'zeroTrue'];
  const runs = [];
  fighters.forEach((id, i) => { for (const winner of ['player', 'opp']) runs.push([id, winner, CAREERS[i % CAREERS.length]]); });
  for (const c of CAREERS) for (const winner of ['player', 'opp']) runs.push(['zeroTrue', winner, c], ['barney2', winner, c]);
  for (const [id, winner, career] of runs) {
    const T = await makeGame({ career }); setProfile(T.game);
    const r = { opponent: id, winner, method: winner === 'player' ? 'TKO' : 'KO', round: 3, time: '2:59', points: 123456, stats: { landed: 999, thrown: 999, counters: 99, starsEarned: 9 }, knockdowns: { opp: 3, player: 3 } };
    let S;
    try { S = new ResultsScreen(T.game, r); } catch (e) { flag('results', id, `build threw: ${e.message}`); continue; }
    for (const t of [0, 40]) { S.t = t; check('results', `${id} ${winner} (${career})`, (f) => S.render(f)); }
  }
}

// ------------------------------------------------------------------------------------------- the ring announcer, the HUD, SCOUTED!
if (want('fight')) {
  const { Fight } = await import('../src/fight/fightState.js');
  const inp = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, update() {} };
  for (const id of fighters) {
    const T = await makeGame({ career: 'zeroTrue' }); setProfile(T.game);
    let fight;
    try { fight = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, profile: T.game.profile, opts: { rounds: 3 } }); } catch (e) { flag('fight', id, `build threw: ${e.message}`); continue; }
    for (let t = 0; t < 420; t++) {
      fight.update();
      if (t % 30 === 0) check('fight', `${id} ${fight.phase}`, (f) => fight.render(f));
    }
    // the only in-fight pop-up: SCOUTED! with the find's name
    if (fight.know) {
      const { scoutEntries } = await import('../src/fight/knowledge.js');
      const E = scoutEntries(FIGHTERS[id]);
      for (const e of E) {
        fight.know.banners = [{ text: 'SCOUTED!', sub: e.name, col: 'green', t: 10, life: 100, y: 44 }];
        check('fight', `${id} SCOUTED! ${e.key}`, (f) => fight.render(f));
      }
      fight.know.banners = [];
    }
  }
}

// ------------------------------------------------------------------------------------------- the corner between rounds
if (want('corner')) {
  const { Fight } = await import('../src/fight/fightState.js');
  const { BetweenRounds } = await import('../src/screens/betweenRounds.js');
  const { hintBank } = await import('../src/fight/cornerman.js');
  const { TextBox } = await import('../src/engine/textbox.js');
  const { HINT_BOX } = await import('../src/screens/betweenRounds.js');
  const inp = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, update() {} };
  for (const id of fighters) {
    const T = await makeGame({ career: 'zeroTrue' }); setProfile(T.game);
    const fight = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, profile: T.game.profile, opts: { rounds: 3 } });
    for (let t = 0; t < 30; t++) fight.update();
    const S = new BetweenRounds(fight);
    // every page of the hint the corner picked, then every line in his bank in the same box
    for (let p = 0; p < 6; p++) { check('corner', `${id} page ${p + 1}`, (f) => S.render(f)); if (!S.box.more) break; S.box.next(); }
    const bank = hintBank(fight.d) || {};
    const lines = [];
    const walk = (v) => { if (typeof v === 'string') lines.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
    walk(bank);
    for (const l of quick ? lines.slice(0, 4) : lines) {
      S.box = new TextBox(`"${l}"\n\n"${l}"`, { w: HINT_BOX.w, lines: HINT_BOX.lines }); // (the Tactician's two hints at once)
      for (let p = 0; p < 6; p++) { check('corner', `${id} hint`, (f) => S.render(f)); if (!S.box.more) break; S.box.next(); }
      if (S.box.pages.length > 3) flag('corner', id, `a hint pair takes ${S.box.pages.length} pages: "${l}"`);
    }
  }
}

// ------------------------------------------------------------------------------------------- gallery, medals, records, handbook
if (want('extras')) {
  const ex = await import('../src/screens/extras.js');
  const { HandbookScreen } = await import('../src/screens/handbook.js');
  const { scoutEntries } = await import('../src/fight/knowledge.js');
  const T = await makeGame({ career: 'zeroTrue', medals: 999 }); setProfile(T.game);
  const g = T.game;
  g.records.met = [...EVERYONE];
  for (const id of EVERYONE) { g.scouting[id] = scoutEntries(FIGHTERS[id]).map((e) => e.key); g.medals.got[id] = { speed: true, flawless: true, signature: true }; g.medals.best[id] = 99; g.handbook[id] = ['A HINT YOU HEARD IN THE CORNER, KEPT HERE FOR LATER.', 'AND ANOTHER ONE.']; }
  const n = quick ? 12 : EVERYONE.length;
  const G = new ex.GalleryScreen(g);
  for (let i = 0; i < Math.min(n, G.ids.length); i++) for (const page of [0, 1, 2, 3]) {
    G.sel = i; G.load(); G.page = page; G.zoom = false; G.scroll = 0;
    if (page >= G.pageCount()) continue;
    // every scroll position of the page, then the 4x view
    for (let k = 0; k < 40; k++) { G.scroll = k; check('gallery', `${G.ids[i]} page ${page} scroll ${k}`, (f) => G.render(f)); const max = page === 0 ? G.bioMax : page === 1 ? G.noteMax : G.scoutMax; if (k >= (max || 0)) break; }
    if (page === 0) { G.zoom = true; check('gallery', `${G.ids[i]} 4x`, (f) => G.render(f)); G.zoom = false; }
  }
  const M = new ex.MedalsScreen(g);
  M.tabs.forEach((tb, k) => { M.tab = k; for (let i = 0; i < tb.ids.length; i += quick ? 7 : 1) { M.sel = i; check('medals', `${tb.zone} ${tb.ids[i]}`, (f) => M.render(f)); } });
  for (const [name, C] of [['records', ex.RecordsScreen], ['soundtest', ex.SoundTestScreen], ['unlocks', ex.UnlocksScreen]]) {
    const S = new C(g);
    for (let i = 0; i < 80; i += quick ? 20 : 3) { S.sel = i; if (S.top != null && S.visible) S.top = Math.max(0, i - S.visible + 1); check(name, `sel ${i}`, (f) => S.render(f)); }
  }
  const HB = new HandbookScreen(g);
  for (let i = 0; i < n; i++) { HB.sel = i; HB.load && HB.load(); for (const page of [0, 1, 2]) { HB.page = page; check('handbook', `#${i} page ${page}`, (f) => HB.render(f)); } }
}

// ------------------------------------------------------------------------------------------- menus and stations
if (want('menus')) {
  const reg = {
    title: ['title.js', 'TitleScreen'], options: ['options.js', 'OptionsScreen'], customize: ['customize.js', 'CustomizeScreen'], desk: ['desk.js', 'DeskScreen'],
    controls: ['controls.js', 'ControlsScreen'], theater: ['theater.js', 'TheaterScreen'], modeRecords: ['modeRecords.js', 'ModeRecordsScreen'], run: ['modes.js', 'RunScreen'],
    practice: ['modes.js', 'PracticeScreen'], perks: ['training.js', 'PerksScreen'], training: ['training.js', 'TrainingScreen'], handbook: ['handbook.js', 'HandbookScreen'], replay: ['replay.js', 'ReplayScreen'], saves: ['saves.js', 'SavesScreen'], password: ['passwordEntry.js', 'PasswordScreen'],
  };
  // (the save screen with two saves in it: the widest name and the longest place)
  { const St = await import('../src/save/storage.js'), { newCareer } = await import('../src/save/career.js'); const c = newCareer(); c.profile.name = WIDE_NAME; c.circuit = 'zeroTrue'; c.record = { w: 9999, l: 0, ko: 0 };
    for (const n of [1, 2]) { St.useSlot(n); St.save('career', c); } St.useSlot(1); }
  for (const [name, [file, cls]] of Object.entries(reg)) {
    const m = await import('../src/screens/' + file);
    const presets = name === 'training' ? [{}, { free: true }, { ferry: true }, { howto: true }] : name === 'run' ? [{}, { tier: 'gauntlet' }, { tier: 'td' }] : name === 'modeRecords' ? [{ page: 0 }, { page: 1 }, { page: 2 }, { page: 3 }] : name === 'saves' ? [{ mode: 'load' }, { mode: 'new' }, { mode: 'password' }] : [{}];
    for (const a of presets) {
      const T = await makeGame({ career: 'zeroTrue', medals: 999 }); setProfile(T.game);
      Object.assign(T.game.records.unlocks || {}, { jax: true, zero: true, full: true, td: true, gauntlet: true });
      if (name === 'controls') { const { DEFAULT_KEYS } = await import('../src/engine/input.js'); T.game.input.bindings = structuredClone(DEFAULT_KEYS); }
      let S;
      try { S = new m[cls](T.game, a); S.enter && S.enter(); } catch (e) { flag('menus', name, `build threw: ${e.message}`); continue; }
      // walk down the menu, and a page right
      const presses = []; for (let i = 0; i < 24; i++) presses.push(['down', 6 + i * 8]);
      if (name === 'desk') presses.push(['a', 4]); // (the password panel)
      if (name === 'training' && a.howto) { presses.length = 0; presses.push(['a', 4]); } // (a drill's how-to card)
      pressList(T, presses);
      try { drive(T, S, { frames: 200, every: 8, suite: 'menus', where: (t) => `${name}${a.tier ? ' ' + a.tier : ''}${a.page != null ? ' p' + a.page : ''} @${t}` }); } catch (e) { flag('menus', name, `threw: ${e.message}`); }
    }
  }
}

// ------------------------------------------------------------------------------------------- the talk screens (the Fall, the descent, the deal, the climb, the Void)
if (want('talk')) {
  const reg = { fall: ['fall.js', 'FallScreen'], descend: ['descend.js', 'DescendScreen'], ferry: ['descend.js', 'FerryScreen'], deal: ['deal.js', 'DealScreen'], ascend: ['ascend.js', 'AscendScreen'],
    voidDoor: ['void.js', 'VoidDoorScreen'], free: ['void.js', 'FreeScreen'], reforge: ['void.js', 'ReforgeScreen'], trueEnding: ['void.js', 'TrueEndingScreen'], ending: ['ending.js', 'EndingScreen'] };
  for (const [name, [file, cls]] of Object.entries(reg)) {
    const m = await import('../src/screens/' + file);
    const { FREED } = await import('../data/fighters/void/freed.js');
    const argsFor = name === 'ending' ? [{ kind: 'interim' }, { kind: 'final' }] : name === 'free' ? Object.keys(FREED).map((id) => ({ id })) : [{}];
    for (const a of argsFor) {
      const T = await makeGame({ career: 'zeroTrue' }); setProfile(T.game);
      let S;
      try { S = new m[cls](T.game, a); S.enter && S.enter(); } catch (e) { flag('talk', name, `build threw: ${e.message}`); continue; }
      for (let t = 20; t < 12000; t += 45) T.press('a', t);
      try { drive(T, S, { frames: quick ? 3000 : 12000, every: 15, suite: 'talk', where: name, until: () => T.game.next, scroll: name === 'ending' || name === 'trueEnding' }); } catch (e) { flag('talk', name, `threw: ${e.message}`); }
    }
  }
}

// ------------------------------------------------------------------------------------------- the world map and the interiors (bio boards, podium stations)
if (want('map')) {
  const { InteriorScreen } = await import('../src/screens/interior.js');
  const { WorldMapScreen } = await import('../src/screens/worldMap.js');
  const T0 = await makeGame({ career: 'zeroTrue' }); setProfile(T0.game);
  const M = new WorldMapScreen(T0.game, {}); M.enter && M.enter();
  drive(T0, M, { frames: 120, every: 20, suite: 'map', where: 'world' });
  const { INTERIOR_IDS } = await import('../data/interiors.js');
  for (const id of INTERIOR_IDS) for (const career of ['new', 'zeroTrue']) {
    const T = await makeGame({ career, medals: career === 'new' ? 0 : 999 }); setProfile(T.game);
    Object.assign(T.game.records.unlocks || {}, career === 'new' ? {} : { jax: true, zero: true, full: true });
    let S;
    try { S = new InteriorScreen(T.game, { id }); S.enter && S.enter(); } catch (e) { flag('interior', id, `build threw: ${e.message}`); continue; }
    // stand at every station (its board or label shows), then press A at it (a confirm box, a locked note)
    for (const st of S.L.stations) {
      for (let k = 0; k < 12; k++) {
        S.px = st.x; S.camX = S.clampCam(S.px - W / 2); S.goal = null;
        T.step(-1); if (k === 6) { T.press('a', 10000 + k); }
        try { S.update(); } catch (e) { flag('interior', `${id} ${st.id}`, `threw: ${e.message}`); break; }
        if (T.game.next) { T.game.next = null; break; }
        if (k === 2 || k === 11) check('interior', `${id} ${st.id} (${career})`, (f) => S.render(f));
      }
      S.confirm = null; S.note = null;
    }
  }
}

// ------------------------------------------------------------------------------------------- every cutscene, every line
if (want('scenes')) {
  const { SCENES } = await import('../data/cutscenes/index.js');
  const { CutsceneScreen } = await import('../src/screens/cutscene.js');
  const sids = Object.keys(SCENES).filter((id, i) => !quick || i % 8 === 0);
  for (const id of sids) {
    const T = await makeGame({ career: 'zeroTrue' }); setProfile(T.game);
    const g = T.game;
    const params = SCENES[id].params && SCENES[id].params.circuit ? { circuit: SCENES[id].params.circuit } : {};
    let S;
    try { S = new CutsceneScreen(g, { id, params, then: ['_end', {}], theater: true }); S.enter(); } catch (e) { flag('scenes', id, `build threw: ${e.message}`); continue; }
    let last = '';
    const LIMIT = SCENES[id].legacy ? 40000 : 9000;
    for (let t = 0; t < LIMIT && !g.next; t++) {
      T.step(t);
      if (t % 9 === 0) { T.press('a', t); T.step(t); }
      try { S.update(); } catch (e) { flag('scenes', id, `threw: ${e.message}`); break; }
      const sc = S.scene;
      if (!sc) { if (t % 60 === 0) check('scenes', `${id} @${t}`, (f) => S.render(f)); continue; }
      // a new page, caption or card: check it once it's all typed
      const tx = sc.text, box = tx && tx.box;
      const key = `${tx ? tx.txt + '#' + box.page + (box.typed ? '+' : '') : ''}|${sc.caption || ''}|${sc.card ? sc.card.title + sc.card.sub : ''}`;
      if (key !== last && (!box || box.typed)) { last = key; check('scenes', id, (f) => S.render(f)); }
    }
  }
}

// ------------------------------------------------------------------------------------------- report
const list = [...problems.values()];
const bySuite = {};
for (const p of list) (bySuite[p.suite] ||= []).push(p);
console.log(`text-fit: ${frames} frames checked`);
for (const [s, L] of Object.entries(bySuite)) {
  console.log(`\n${s}: ${L.length} problem(s)`);
  for (const p of L.slice(0, verbose ? 1e9 : 40)) console.log(`  ${p.where}: ${p.text}${p.n > 1 ? ` (x${p.n})` : ''}`);
  if (!verbose && L.length > 40) console.log(`  ... ${L.length - 40} more (--v)`);
}
console.log(list.length ? `\n${list.length} problem(s)` : '\ntext fits everywhere (0 problems)');
process.exit(list.length ? 1 : 0);
