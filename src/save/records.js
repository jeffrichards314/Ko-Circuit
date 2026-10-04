// Mode records (§6), saved to localStorage next to the career (never in the
// password: the modes have no passwords).
//   unlocks   modes stay open once earned, even if you start a new career:
//             jax (Jax beaten), zero (the first ZERO: opens the Classic division of both modes), pantheon / underworld / void (that
//             zone's division: Halcyon, Vorgath, ZERO's true form beaten), full (the true ending seen: the Combined division)
//   met       every opponent you've faced (Practice lists them)
//   tdChamps  each remixed champion's own best KO time and medals (his podium in the Title Defense hall)
//   td        Title Defense, one entry per division (classic / pantheon / underworld / void / combined): most defenses in a run, full
//             clears, best clear time, the medals earned, recent runs
//   gauntlet  one entry per division: best streak (+ its time), best time for a full run, recent runs and who ended them
//   run       a Title Defense or Gauntlet run in progress (resumable)
import { load, save } from './storage.js';
import { CIRCUITS, CIRCUIT_ORDER, ALL_ORDER, ASC_PATH, MAIN_PATH, SECRET, RIVALS, ALL_RIVALS, RIVAL_AFTER, ascIndex } from '../../data/circuits.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { TD_LISTS, tdDivisionOf } from '../../data/fighters/titleDefense.js';
import { DIVISIONS, DIVISION_NAMES, DIVISION_UNLOCK, DIVISION_LOCK, GAUNTLET_TEXT } from '../../data/divisions.js';
import { tdChampMedals, medalsFor, speedTarget } from '../../data/medals.js';

// Title Defense: 2 lives for the whole defense, and three medals per division:
//   BRONZE  defend the title (clear the defense)          SILVER  ...without losing a single fight (both lives intact)
//   GOLD    ...under the division's par time (TD_PAR, game seconds of fighting: 1.4x the perfect-play bot's clear time, rounded; tools/mode-calibrate.mjs)
export const TD_LIVES = 2;
export const TD_PAR = { classic: 3990, pantheon: 2850, underworld: 2625, void: 4655, combined: 14355 };
export function tdMedalsFor(tier, { lives, seconds }) {
  const silver = lives >= TD_LIVES;
  return { bronze: true, silver, gold: silver && seconds <= (TD_PAR[tier] || Infinity) };
}
export const GAUNTLETS = DIVISIONS;
const blankGauntlet = () => ({ bestStreak: 0, bestStreakTime: null, bestTime: null, clears: 0, runs: [] });
const blankTd = () => ({ best: 0, clears: 0, bestTime: null, medals: { bronze: false, silver: false, gold: false }, runs: [] });
// ORIGIN (2026-10-04, the secret final boss: spec §18 A15): his own record, kept apart from every list. `beaten` (the Gauntlet's ORIGIN) opens Practice and the true form's
// door (with the five Title Defense divisions), `trueBeaten` (Title Defense's ORIGIN TRUE FORM) the TRUE FORM switch in Practice, the costume and the title.
//   seen    the cinematic intro of each has played (his name is shown only after: until then the doors say ???), the victory scenes
//   best    the best KO time (game seconds) of each; got  the three medals of each (speed, flawless, signature); tries  how many times each was fought
export const blankOrigin = () => ({
  beaten: false, trueBeaten: false,
  seen: { intro: false, introTrue: false, victory: false, victoryTrue: false, hint: false },
  best: { g: null, t: null }, got: { g: { speed: false, flawless: false, signature: false }, t: { speed: false, flawless: false, signature: false } }, tries: { g: 0, t: 0 },
});
const mergeOrigin = (o) => {
  const b = blankOrigin(), x = o || {};
  return { ...b, ...x, seen: { ...b.seen, ...(x.seen || {}) }, best: { ...b.best, ...(x.best || {}) }, tries: { ...b.tries, ...(x.tries || {}) }, got: { g: { ...b.got.g, ...((x.got || {}).g || {}) }, t: { ...b.got.t, ...((x.got || {}).t || {}) } } };
};

// records.ver 2 (2026-10-03): the five divisions. An older save keeps what still means the same thing:
//   Title Defense: the Classic defense's best defense (capped at the new length; its clears, times and medals were for the old 13
//                  fighters) and nothing else (the Ascension and Combined defenses were different lists)
//   Gauntlet: the old Main one becomes Classic, the Pantheon / Underworld / Void ones keep their names, the old Full one becomes
//             Combined. A streak is capped at the new length; a clear time is dropped wherever the list changed (Classic gained
//             the first ZERO, Pantheon and Underworld their Dash fights, Combined lost the first four Dash fights).
export const RECORDS_VERSION = 2;
export function loadRecords() {
  const r = load('records', null) || {};
  const td = {}, gauntlet = {};
  const old = r.ver !== RECORDS_VERSION;
  for (const d of DIVISIONS) {
    td[d] = { ...blankTd(), ...((r.td && r.td[d] && !old) ? r.td[d] : {}) };
    gauntlet[d] = { ...blankGauntlet(), ...((r.gauntlet && r.gauntlet[d] && !old) ? r.gauntlet[d] : {}) };
  }
  if (old) {
    const oldTd = r.td && (r.td.classic || (r.td.best !== undefined ? r.td : null));
    if (oldTd) td.classic.best = Math.min(oldTd.best || 0, TD_LISTS.classic.length);
    const oldG = r.gauntlet && !r.gauntlet.main && r.gauntlet.bestStreak !== undefined ? { main: r.gauntlet, full: r.gauntlet.full } : (r.gauntlet || {});
    const keep = (from, to, sameList) => { if (from) gauntlet[to] = migrateGauntlet(from, gauntletList(to).length, sameList); };
    keep(oldG.main, 'classic', false); keep(oldG.pantheon, 'pantheon', false); keep(oldG.underworld, 'underworld', false);
    keep(oldG.void, 'void', true); keep(oldG.full, 'combined', false);
  }
  const run = r.run ? normalizeRun(r.run) : null;
  return { ver: RECORDS_VERSION, unlocks: r.unlocks || {}, met: r.met || [], td, gauntlet, run, tdChamps: r.tdChamps || {}, tdMet: Array.isArray(r.tdMet) ? r.tdMet : [], origin: mergeOrigin(r.origin) };
}
function migrateGauntlet(o, len, sameList) {
  const cut = Math.min(o.bestStreak || 0, len);
  return { ...blankGauntlet(), bestStreak: cut, bestStreakTime: cut === o.bestStreak ? o.bestStreakTime ?? null : null, bestTime: sameList ? o.bestTime ?? null : null, clears: sameList ? o.clears || 0 : 0,
    runs: (o.runs || []).map((x) => ({ ...x, streak: Math.min(x.streak, len), of: len })) };
}
// A run in progress: the old names (a Gauntlet's `main` / `full`) become the new ones, and a run whose list is no longer the division's
// (the lists changed) cannot be resumed.
export function normalizeRun(run) {
  const same = (a, b) => a && b && a.length === b.length && a.every((id, i) => id === b[i]);
  if (run.mode === 'td') {
    const tier = run.tier || 'classic';
    return TD_LISTS[tier] && same(run.list, TD_LISTS[tier]) ? { ...run, tier } : null;
  }
  if (run.mode === 'gauntlet') {
    const zone = { main: 'classic', full: 'combined' }[run.zone || (run.full ? 'full' : 'main')] || run.zone || 'classic';
    const { full, ...rest } = run;
    void full;
    return GAUNTLET_LISTS[zone] && same(run.list, GAUNTLET_LISTS[zone]) ? { ...rest, zone } : null;
  }
  return run;
}
export const saveRecords = (r) => save('records', r);

// A remixed champion's own medals and best KO time (Title Defense podiums): records.tdChamps[id] = { best, got: { speed, flawless, signature } }.
// They are kept apart from the Career medals (§15): they never count toward an unlock.
export const tdChampOf = (r, id) => (r.tdChamps && r.tdChamps[id]) || { best: null, got: { speed: false, flawless: false, signature: false } };
export function recordTdFight(r, d, result) {
  const M = tdChampMedals(d, result), T = (r.tdChamps ||= {}), e = (T[d.id] ||= { best: null, got: { speed: false, flawless: false, signature: false } });
  const out = { time: null, newBest: false, earned: [], medals: M };
  if (result.winner === 'player' && (result.method === 'KO' || result.method === 'TKO')) { out.time = result.seconds; if (e.best == null || result.seconds < e.best) { e.best = result.seconds; out.newBest = true; } }
  for (const k of ['speed', 'flawless', 'signature']) if (M[k] && !e.got[k]) { e.got[k] = true; out.earned.push(k); }
  saveRecords(r);
  return out;
}

// The Gauntlets (spec §6), one per division. Each is a list of fighter ids in story order:
//   classic      #1-#50, Jax (who stands between the Underground's last fighter and the Nightmare's first) and the first ZERO
//   pantheon     #51-#81, Dash V and VI, Halcyon           underworld   #82-#107, Dash VII and VIII, Vorgath
//   void         #108-#119 (the twelve Hollowed), Dash Unbound and ZERO's true form
//   combined     every opponent of the four lists above, in story order
// Dash I-IV and the other Dash fights between circuits are not in any list: only the divisions' own (V-IX) are.
const fightersOf = (ids) => ids.flatMap((id) => CIRCUITS[id].fighters);
const withDash = (ids) => ids.flatMap((id) => [...CIRCUITS[id].fighters, ...(RIVAL_AFTER[id] ? CIRCUITS[RIVAL_AFTER[id]].fighters : [])]);
const CLASSIC_LIST = fightersOf(CIRCUIT_ORDER);
const PANTHEON_LIST = withDash(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon']);
const UNDERWORLD_LIST = withDash(['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'vorgath']);
const VOID_LIST = [...fightersOf(['v1', 'v2', 'v3']), 'dash9', 'zeroTrue'];
const GAUNTLET_LISTS = { classic: CLASSIC_LIST, pantheon: PANTHEON_LIST, underworld: UNDERWORLD_LIST, void: VOID_LIST, combined: [...CLASSIC_LIST, ...PANTHEON_LIST, ...UNDERWORLD_LIST, ...VOID_LIST] };
export const gauntletList = (zone) => GAUNTLET_LISTS[zone] || GAUNTLET_LISTS.classic;
export const ROSTER = GAUNTLET_LISTS.classic;
export const FULL_ROSTER = GAUNTLET_LISTS.combined;
export const GAUNTLET_INFO = Object.fromEntries(DIVISIONS.map((d) => [d, { name: `${DIVISION_NAMES[d]} GAUNTLET`, short: DIVISION_NAMES[d], open: DIVISION_UNLOCK[d], lock: DIVISION_LOCK[d], text: GAUNTLET_TEXT[d] }]));
// How a fighter fights in a Gauntlet run: exactly as in the career (rounds 1-3, then the championship rounds: spec §4), every fight from round 1
// on the standard clock. Only the player's health and stars carry over (run.health, run.stars).
// The Will Shard (#119, an endurance fight of five rounds that grow) fights in his FINAL form from the first bell: `gauntletStage` pins the
// fight's stage (the stand-in for a round) to his fifth, and he has the regular three rounds before the championship rounds.
export const gauntletStage = (d) => d.gauntletStage;
// Everyone, each rival fight right after the circuit whose title it follows
// (Practice, the Records screen, the medal grid, the gallery). The Ascension's fighters
// (#51+) and Dash's Ascension encounters come after the base game's.
const listOf = (order) => order.flatMap((id) => [...CIRCUITS[id].fighters, ...(RIVAL_AFTER[id] ? CIRCUITS[RIVAL_AFTER[id]].fighters : [])]);
export const BASE_EVERYONE = listOf(CIRCUIT_ORDER);
export const ASC_EVERYONE = listOf(ASC_PATH);
export const EVERYONE = [...BASE_EVERYONE, ...ASC_EVERYONE];
// Roster number (#1-#50, #51-#119 in the Ascension) of a fighter, or null (the rival, the bosses)
// (the bosses have no number: Jax, ZERO, Halcyon, Vorgath and ZERO's true form; the Void's Hollowed are #108-119)
const NUMBERED = ALL_ORDER.filter((id) => !['dream', 'zero', 'halcyon', 'vorgath', 'zeroTrue'].includes(id)).flatMap((id) => CIRCUITS[id].fighters);
export const rosterNumber = (id) => (NUMBERED.includes(id) ? NUMBERED.indexOf(id) + 1 : null);

// Fighters a career has already beaten or reached.
function careerFighters(c) {
  if (!c) return [];
  const out = [];
  const f = c.flags || {};
  const cleared = new Set(MAIN_PATH.slice(0, c.main));
  if (f.carnivalCleared) cleared.add('carnival');
  if (f.undergroundCleared) cleared.add('underground');
  if (f.nightmareCleared || f.zeroBeaten) cleared.add('nightmare');
  if (f.jaxBeaten) cleared.add('dream');
  if (f.zeroBeaten) cleared.add('zero');
  for (let i = 0; i < Math.min(c.asc || 0, ASC_PATH.length); i++) cleared.add(ASC_PATH[i]);
  for (const id of ALL_ORDER) {
    const L = CIRCUITS[id].fighters;
    if (cleared.has(id)) out.push(...L);
    else if (id === c.circuit) out.push(...L.slice(0, c.beaten + 1));
  }
  ALL_RIVALS.forEach((id, i) => { if ((c.rival || 0) & (1 << i) || c.circuit === id) out.push(...CIRCUITS[id].fighters); });
  return out;
}

// Bring the records up to date with a career (call after every career fight).
// Bring the records up to date with a career (call after every career fight).
export function syncRecords(r, career, extraMet = []) {
  if (career) {
    const asc = career.asc || 0;
    if (career.flags.jaxBeaten) r.unlocks.jax = true;
    if (career.flags.zeroBeaten) r.unlocks.zero = true;
    if (career.flags.trueEndingSeen) r.unlocks.full = true;
    // a zone is cleared once its boss has been beaten (the career's Ascension count has moved past him)
    if (asc > ascIndex('halcyon')) r.unlocks.pantheon = true;
    if (asc > ascIndex('vorgath')) r.unlocks.underworld = true;
    if (asc > ascIndex('zeroTrue') || career.flags.trueEndingSeen) r.unlocks.void = true;
    // (a password carries ORIGIN beaten and his true form beaten: the V5 flags)
    if (career.flags.originBeaten) r.origin.beaten = true;
    if (career.flags.originTrueBeaten) { r.origin.beaten = true; r.origin.trueBeaten = true; }
  }
  const met = new Set([...r.met, ...careerFighters(career), ...extraMet]);
  r.met = EVERYONE.filter((id) => met.has(id));
  return r;
}

// A division opens when its zone's last boss has been beaten (Classic: the first ZERO; Combined: the true ending), in both modes.
export const divisionUnlocked = (r, d) => !!r.unlocks[DIVISION_UNLOCK[d]];
export const tdUnlocked = divisionUnlocked;
export const gauntletUnlocked = divisionUnlocked;
// the halls open (and appear on the map) with the first ZERO: from then on at least the Classic division is there
export const modeUnlocked = (r, mode) => (mode === 'full' || mode === 'combined' ? !!r.unlocks.full : mode === 'practice' ? r.met.length > 0 : !!r.unlocks.zero);
// A champion's remix (Practice's TITLE DEFENSE switch, the gallery's REMIX REPORT) is open with the division it belongs to.
// PRACTICE'S TITLE DEFENSE VERSIONS (2026-10-03): a champion's remix is in Practice once you have REACHED it in a defense of a division: stood at his
// podium to fight him (records.tdMet holds "<division>:<id>"), or, for a save that predates the list, got that far in the best defense of the
// division / have cleared it / are in a run past him. The version is picked per division (Combined has the same remixes in the Combined hall's arena).
export const tdKey = (tier, id) => `${tier}:${id}`;
export function noteTdMet(r, tier, id) {
  const k = tdKey(tier, id), L = (r.tdMet ||= []);
  if (L.includes(k)) return false;
  L.push(k);
  return true;
}
export function tdReachedIn(r, tier, id) {
  const i = (TD_LISTS[tier] || []).indexOf(id);
  if (i < 0) return false;
  if ((r.tdMet || []).includes(tdKey(tier, id))) return true;
  const T = r.td && r.td[tier];
  if (T && (T.clears > 0 || (T.best > 0 && T.best >= i))) return true;
  return !!(r.run && r.run.mode === 'td' && r.run.tier === tier && r.run.idx >= i);
}
// the divisions a fighter's Title Defense version has been reached in (empty: he has none, or not yet)
export const tdVersions = (r, id) => DIVISIONS.filter((d) => tdReachedIn(r, d, id));
export const remixUnlocked = (r, id) => { const d = tdDivisionOf(id); return !!d && divisionUnlocked(r, d); };
// ---- ORIGIN: the two doors and what beating him opens. Nothing here is a list: he is in no division, no Practice grid, no gallery until he is beaten.
// The Gauntlet's door opens when all five Gauntlet divisions have been cleared; the true form's when ORIGIN has been beaten AND all five Title Defense divisions
// have been cleared.
export const originGauntletOpen = (r) => DIVISIONS.every((d) => (r.gauntlet[d] && r.gauntlet[d].clears > 0));
export const originTrueOpen = (r) => !!r.origin.beaten && DIVISIONS.every((d) => (r.td[d] && r.td[d].clears > 0));
export const originName = (r, which) => (r.origin.seen[which === 'g' ? 'intro' : 'introTrue'] ? 'ORIGIN' : '???'); // (his name is hidden until his intro has played)
// one fight against him finished: the best time, the medals (speed: a KO under the target; flawless: no hit and no knockdown; signature: the golden moment of the First
// Punch), what it opened. `d` is his data (ORIGIN's or his true form's). Returns { time, newBest, earned, medals, first } like the other record functions.
export function recordOriginFight(r, d, result, which, career = null) {
  const O = r.origin, key = which === 'g' ? 'g' : 't', won = result.winner === 'player' && (result.method === 'KO' || result.method === 'TKO');
  const M = originMedals(d, result), out = { time: null, newBest: false, earned: [], medals: M, first: false };
  O.tries[key]++;
  if (won) {
    out.time = result.seconds;
    if (O.best[key] == null || result.seconds < O.best[key]) { O.best[key] = result.seconds; out.newBest = true; }
    if (key === 'g' && !O.beaten) { O.beaten = true; out.first = true; } else if (key === 't' && !O.trueBeaten) { O.trueBeaten = true; O.beaten = true; out.first = true; }
    if (career) { career.flags.originBeaten = true; if (key === 't') career.flags.originTrueBeaten = true; }
  }
  for (const k of ['speed', 'flawless', 'signature']) if (M[k] && !O.got[key][k]) { O.got[key][k] = true; out.earned.push(k); }
  saveRecords(r);
  return out;
}
export const originMedals = (d, result) => medalsFor(d, result, speedTarget);
export const gauntletRoster = (r, zone = 'classic') => gauntletList(zone);
export const fighterName = (id) => (FIGHTERS[id] ? FIGHTERS[id].name : id);

// "1:02:07" / "12:07" from game seconds (24 frames each, the medals' unit): the game clock, like the clock in the ring
export function clockText(secs) {
  secs = Math.max(0, Math.round(secs || 0));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
