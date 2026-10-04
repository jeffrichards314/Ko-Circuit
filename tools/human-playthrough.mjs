// The release audit's human-model playthrough (final audit, part 1): the human-model player (src/fight/humanBot.js) plays the whole game headless,
// in both profiles: "plain" (never goes for a golden moment) and "golden" (goes for them, with the same jitter).
//   node tools/human-playthrough.mjs [--part fighters|td|runs] [--fights N] [--jobs J] [--out dir] [ids...]
//
//   fighters  every Career fighter (and with --td, every Title Defense version): a cold win rate over fresh players, the attempts a learning player
//             needs for a first win, the win rate once it has learned him, the round it wins in and how (KO / TKO), the three medals it earns
//             (speed / flawless / signature; golden profile: goldens landed a fight), the golden moments' window widths.
//   runs      the five Title Defense divisions (2 lives) and the five Gauntlet divisions (one loss ends it, 50% health between fights, stars carry):
//             a player that learns every fighter first, then runs until it clears (attempts, medals, where the runs end).
// Writes JSON lines to <out>/<part>.jsonl (default reports/playthrough/), the report tool reads them.
import { fork } from 'node:child_process';
import { cpus } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIGHTERS } from '../data/fighters/index.js';
import { TD_LISTS } from '../data/fighters/titleDefense.js';
import { gauntletList, gauntletStage, GAUNTLETS, TD_PAR, TD_LIVES, tdMedalsFor } from '../src/save/records.js';
import { medalsFor, speedTarget, tdChampMedals } from '../data/medals.js';
import { play, Memory, fighterOf } from './lib/measure.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const VALUE = ['--part', '--fights', '--jobs', '--out', '--worker', '--attempts'];
const PART = opt('--part', 'fighters'), N = +opt('--fights', 24), OUT = opt('--out', 'reports/playthrough');
const ids = args.filter((a, i) => !a.startsWith('--') && !VALUE.includes(args[i - 1]));
const MAX_FRAMES = 4320 * 14;
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

// the widths of every golden moment a fighter has, in frames (kdWindow / recoveryKd of a move that carries a golden hit, or a super's own window)
function goldenWidths(d) {
  const w = [];
  for (const m of Object.values(d.moves)) {
    if (!m.goldenHit) continue;
    const r = m.kdWindow || m.recoveryKd;
    if (r) w.push(r[1] - r[0] + 1);
  }
  for (const S of d.superList || []) if (S.window && (S.golden === 'taunt' || S.golden === 'open')) w.push(S.window[1] - S.window[0] + 1);
  return w;
}

function oneFight(id, td, mem, golden, extra = {}) {
  const r = play(id, { td, golden, memory: mem, maxFrames: MAX_FRAMES, ...extra });
  return r;
}
function medalsOf(id, td, r) {
  if (!r.res) return { speed: false, flawless: false, signature: false };
  const d = fighterOf(id, td);
  return td ? tdChampMedals(d, r.res) : medalsFor(d, r.res, speedTarget);
}

// One profile against one fighter
function profile(id, td, golden) {
  // cold: players who have never seen him (a fresh memory each), first attempt only
  const COLD = 30;
  let coldWins = 0;
  for (let i = 0; i < COLD; i++) if (oneFight(id, td, new Memory(), golden).win) coldWins++;
  // learning: one player keeps fighting him until the first win (at most 40 tries), then until two wins in a row
  const mem = new Memory();
  let first = null, tries = 0, streak = 0;
  for (; tries < 65 && streak < 2; tries++) {
    const r = oneFight(id, td, mem, golden);
    if (r.win && first == null) first = tries + 1;
    streak = r.win ? streak + 1 : 0;
  }
  const M = [], medals = { speed: 0, flawless: 0, signature: 0 };
  let golds = 0;
  for (let i = 0; i < N; i++) {
    const r = oneFight(id, td, mem, golden);
    M.push(r);
    if (r.win) { const m = medalsOf(id, td, r); for (const k of Object.keys(medals)) if (m[k]) medals[k]++; golds += (r.res.track && r.res.track.cues['!golden']) || 0; }
  }
  const W = M.filter((r) => r.win);
  return {
    cold: coldWins / COLD, first, learnTries: tries, win: W.length / M.length,
    round: median(W.map((r) => r.round)), roundMax: W.length ? Math.max(...W.map((r) => r.round)) : null,
    champ: M.filter((r) => r.round > r.rounds).length / M.length,
    ko: W.filter((r) => r.method === 'KO').length / Math.max(1, W.length), tko: W.filter((r) => r.method === 'TKO').length / Math.max(1, W.length),
    seconds: median(W.map((r) => r.res.seconds)), hits: mean(M.map((r) => r.hitsTaken)),
    medals: { speed: medals.speed / N, flawless: medals.flawless / N, signature: medals.signature / N }, goldens: W.length ? golds / W.length : 0,
    losses: M.filter((r) => !r.win).map((r) => `${r.method || 'time'}@r${r.round}`).slice(0, 4),
  };
}

function fighterJob(id, td) {
  const d = fighterOf(id, td);
  return { kind: 'fighter', id, td, name: d.name, circuit: d.circuit, widths: goldenWidths(d), target: speedTarget(d), plain: profile(id, td, false), golden: profile(id, td, true) };
}

// --- runs ---
function warm(id, td, mem, golden, gauntlet) {
  const d = FIGHTERS[id];
  let streak = 0;
  for (let i = 0; i < 40 && streak < 2; i++) {
    const r = play(id, { td, golden, memory: mem, maxFrames: MAX_FRAMES, ...(gauntlet ? { stageLock: gauntletStage(d) } : {}) });
    streak = r.win ? streak + 1 : 0;
  }
}
function runJob(mode, division, golden) {
  const td = mode === 'td';
  const list = td ? TD_LISTS[division] : gauntletList(division);
  const mems = {};
  for (const id of list) { mems[id] = new Memory(); warm(id, td, mems[id], golden, !td); }
  const CAP = +opt('--attempts', td ? 60 : 400), T0 = Date.now(), BUDGET = 8 * 60 * 1000;
  const attempts = [], ends = {};
  let clears = 0, firstClear = null, medalsGot = { bronze: 0, silver: 0, gold: 0 }, bestIdx = 0, secs = [], n = 0;
  for (; n < CAP && (Date.now() - T0 < BUDGET); n++) {
    let idx = 0, lives = TD_LIVES, seconds = 0, health = 100, stars = 0, cleared = false, endedBy = null;
    for (;;) {
      const id = list[idx], d = FIGHTERS[id];
      const r = td ? play(id, { td: true, golden, memory: mems[id], maxFrames: MAX_FRAMES })
        : play(id, { td: false, golden, memory: mems[id], maxFrames: MAX_FRAMES, stageLock: gauntletStage(d), startHealth: health, opts: { startStars: stars } });
      seconds += (r.res && r.res.seconds) || 0;
      if (r.win) {
        idx++;
        if (!td) { health = Math.min(100, r.health + 50); stars = (r.res && r.res.stars) || 0; }
        if (idx >= list.length) { cleared = true; break; }
      } else if (td) { if (--lives <= 0) { endedBy = id; break; } } else { endedBy = id; break; }
    }
    bestIdx = Math.max(bestIdx, idx);
    if (cleared) {
      clears++; if (firstClear == null) firstClear = n + 1;
      secs.push(seconds);
      if (td) { const m = tdMedalsFor(division, { lives, seconds }); for (const k of Object.keys(medalsGot)) if (m[k]) medalsGot[k]++; }
      if (clears >= (td ? 10 : 3)) { n++; break; }
    } else { ends[endedBy] = (ends[endedBy] || 0) + 1; }
  }
  return { kind: 'run', mode, division, golden, len: list.length, attempts: n, clears, firstClear, bestIdx, ends, seconds: median(secs), par: td ? TD_PAR[division] : null, medals: td ? medalsGot : null, capped: n >= CAP || Date.now() - T0 >= BUDGET };
}

// --- driver ---
if (opt('--worker', null) != null) {
  process.on('message', (jobs) => {
    for (const j of jobs) {
      const row = j.kind === 'run' ? runJob(j.mode, j.division, j.golden) : fighterJob(j.id, j.td);
      process.send({ row });
    }
    process.send({ done: true });
  });
} else {
  let jobs = [];
  if (PART === 'fighters') {
    const list = ids.length ? ids : Object.keys(FIGHTERS);
    for (const id of list) jobs.push({ kind: 'fighter', id, td: false });
    if (flag('--td')) for (const id of TD_LISTS.combined) jobs.push({ kind: 'fighter', id, td: true });
  } else if (PART === 'td') {
    for (const id of ids.length ? ids : TD_LISTS.combined) jobs.push({ kind: 'fighter', id, td: true });
  } else {
    for (const mode of ['td', 'g']) for (const division of GAUNTLETS) for (const golden of [false, true]) jobs.push({ kind: 'run', mode, division, golden });
    jobs.sort((a, b) => (b.division === 'combined') - (a.division === 'combined'));
  }
  const J = Math.max(1, +opt('--jobs', Math.max(1, cpus().length - 1)));
  const shards = Array.from({ length: J }, () => []);
  jobs.forEach((j, i) => shards[i % J].push(j));
  const rows = [];
  mkdirSync(OUT, { recursive: true });
  const self = fileURLToPath(import.meta.url);
  let live = 0;
  await new Promise((res) => {
    for (const sh of shards) {
      if (!sh.length) continue;
      live++;
      const w = fork(self, [...args, '--worker', '1'], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
      w.on('message', (m) => { if (m.row) { rows.push(m.row); process.stderr.write(`\r${rows.length}/${jobs.length} `); } else if (m.done) { w.kill(); if (!--live) res(); } });
      w.send(sh);
    }
  });
  const file = `${OUT}/${PART}${PART === 'fighters' && flag('--td') ? '+td' : ''}.jsonl`;
  writeFileSync(file, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`\nwrote ${rows.length} rows to ${file}`);
}
