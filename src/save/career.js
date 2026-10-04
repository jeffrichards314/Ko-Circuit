// Career progression (§5): circuit ladder, ranks, the 2-lives rule, unlocks,
// autosave to localStorage, and restore from a password.
//
//   circuit   the circuit being fought right now (main path or secret)
//   main      index into MAIN_PATH of the main circuit in progress
//   beaten    fighters beaten in the current circuit (= your rank position)
//   lives     2 per circuit (1 in the Underworld: circuits.js `lives`). Losing costs one and
//             you rematch; winning a fight of the ladder gives one back (never past the circuit's own); losing the last one sends you back to the start of the circuit
//             with a full set again.
//   lostHere  lost any fight in this circuit (secret unlocks need a clean run)
//   training  (Phase 7) minigame bests, perks won and equipped, and whether a
//             training session is waiting (one after every belt). Saved locally,
//             not in the password (like the name and record).
//   asc       (Ascension, §18) how many of the Ascension path's stages are cleared (ASC_PATH:
//             Pantheon I-VII, ...). The Pantheon opens for a career that has beaten ZERO
//             with the medal gate passed (flags.pantheonOpen once it has been entered).
//   freed     (Phase E) the Hollowed freed in the Void, a bitmask over HOLLOWED (data/circuits.js). Permanent: a lost fight
//             never un-frees one. Saved locally like the training camp (the password's `asc` count and the ladder position imply
//             the ones a restored career has cleared: `deriveFreed`).
//   rival     the rival fights won (§11b), a bitmask: bit n-1 = Dash Maddox n.
//             After the Minor, Major, World and Grand Prix titles `circuit` is
//             his fight ('rival1'..'rival4') until you beat him; he's fought
//             with that circuit's §9 values and the usual lives, and losing the
//             last life sends you back to the start of the circuit you just won.
//             A save from before the rival existed (no `rival`) gets the fights
//             it skipped as optional map nodes, except the final showdown, which
//             still stands between it and Jax.
//
// Secret circuits are entered from the map at the start of a main circuit, and
// you come back to the start of that same main circuit afterwards.

import { load, save } from './storage.js';
import { encode, decode } from './password.js';
import { CIRCUITS, MAIN_PATH, SECRET, RIVALS, ALL_RIVALS, RIVAL_AFTER, ASC_PATH, HOLLOWED, VOID, VOID_SKIP_FREED, isRival, isAsc, ascIndex, livesOf, zoneOf } from '../../data/circuits.js';
import { normalizeProfile, DEFAULT_PROFILE } from '../../data/customization.js';
import { PERKS, MAX_EQUIPPED } from '../../data/perks.js';
import { DRILL_IDS, DRILL_MEDALS } from '../../data/drills.js';

export const LIVES = 2;
// "Start of the circuit" for the bosses means the circuit before them (§5).
const RESET_TO = { dream: 'grandprix', zero: 'nightmare' };

export function newCareer(profile = DEFAULT_PROFILE) {
  return {
    v: 1,
    circuit: MAIN_PATH[0], main: 0, beaten: 0, lives: LIVES, lostHere: false,
    flags: {}, rival: 0, asc: 0, freed: 0,
    record: { w: 0, l: 0, ko: 0 },
    training: newTraining(),
    profile: normalizeProfile(profile),
  };
}

const newTraining = () => ({ best: {}, perks: [], equipped: [], pending: false });

// A training block from a save or a password, made sound: scores are clean numbers, the perks are real, each once, including every one
// a score has earned (silver wins a drill's first, gold its second), and no more than MAX_EQUIPPED are equipped, all of them perks you hold.
export function normalizeTraining(t) {
  const src = t && typeof t === 'object' ? t : {}, out = newTraining();
  for (const g of DRILL_IDS) {
    const v = Number(src.best && src.best[g]);
    if (Number.isFinite(v) && v > 0) out.best[g] = Math.floor(v);
  }
  const have = new Set(Array.isArray(src.perks) ? src.perks : []);
  for (const g of DRILL_IDS) {
    const m = DRILL_MEDALS[g].reduce((n, v, i) => ((out.best[g] || 0) >= v ? i + 1 : n), 0);
    PERKS.filter((p) => p.game === g).forEach((p, j) => { if (m >= j + 2) have.add(p.id); });
  }
  out.perks = PERKS.filter((p) => have.has(p.id)).map((p) => p.id);
  out.equipped = [...new Set(Array.isArray(src.equipped) ? src.equipped : [])].filter((id) => out.perks.includes(id)).slice(0, MAX_EQUIPPED);
  out.pending = !!src.pending;
  return out;
}

export function loadCareer() {
  const c = load('career', null);
  if (!c || !c.circuit) return null;
  c.profile = normalizeProfile(c.profile);
  c.flags = c.flags || {};
  c.record = c.record || { w: 0, l: 0, ko: 0 };
  c.training = normalizeTraining(c.training);
  return normalizeRival(c);
}

// --- the Void's Hollowed (Phase E) --------------------------------------------------
export const HOLLOWED_SET = new Set(HOLLOWED);
export const freedBit = (id) => 1 << HOLLOWED.indexOf(id);
export const isFreed = (c, id) => HOLLOWED.includes(id) && !!((c.freed || 0) & freedBit(id));
export const freedCount = (c) => HOLLOWED.filter((id) => isFreed(c, id)).length;
// The Hollowed a career must have freed to be where it is: every fragment behind it, and the ladder so far in this one.
export function deriveFreed(c) {
  let m = 0;
  const asc = c.asc || 0;
  for (const v of VOID) if (ascIndex(v) < asc) for (const id of CIRCUITS[v].fighters) m |= freedBit(id);
  if (VOID.includes(c.circuit)) CIRCUITS[c.circuit].fighters.slice(0, c.beaten).forEach((id) => { m |= freedBit(id); });
  return m;
}
export const rivalBit = (id) => 1 << (ALL_RIVALS.indexOf(id));
export const rivalWon = (c, id) => !!((c.rival || 0) & rivalBit(id));
// Due: he's the fight in progress after a belt. `detour` marks an optional one
// (an old save's unfinished business, picked from the map).
export const rivalDue = (c, id) => c.circuit === id && !c.detour;
// (the Ascension's Dash fights are never optional: they come right after their circuit's belt)
export const rivalOptional = (c, id) => RIVALS.includes(id) && !rivalWon(c, id) && MAIN_PATH.indexOf(CIRCUITS[id].after) + 1 <= c.main && !rivalDue(c, id);
// Old saves and passwords have no rival progress: the final showdown still comes before Jax.
export function normalizeRival(c) {
  if (c.rival == null) c.rival = 0;
  if (c.asc == null) c.asc = 0;
  c.freed = (c.freed || 0) | deriveFreed(c);
  if (RIVALS.includes(c.circuit) && MAIN_PATH.indexOf(CIRCUITS[c.circuit].after) + 1 < c.main) c.detour = true;
  // the Pantheon's Dash encounter is due after its circuit's belt (a password can leave you on the wrong side of it)
  for (const r of ALL_RIVALS) if (isAsc(r) && c.circuit === (CIRCUITS[r].after) && c.beaten >= CIRCUITS[c.circuit].fighters.length && !rivalWon(c, r)) enterCircuit(c, r, true);
  if (c.circuit === 'dream' && !c.flags.jaxBeaten && !rivalWon(c, 'rival4')) enterCircuit(c, 'rival4', true);
  return c;
}

export function saveCareer(c) { save('career', c); }
export const passwordOf = (c) => encode(c);

// Password restore keeps the locally saved name and record (they're not encoded).
export function careerFromPassword(code, current) {
  const d = decode(code);
  if (!d) return null;
  const c = newCareer({ ...(current ? current.profile : DEFAULT_PROFILE), ...d.profile });
  Object.assign(c, { circuit: d.circuit, main: d.main, beaten: d.beaten, lives: d.lives, lostHere: d.lostHere, flags: d.flags });
  if (current) c.record = { ...current.record };
  // an old 10-character code has no training camp: keep the local one
  if (d.training) c.training = normalizeTraining(d.training);
  else if (current) c.training = { ...current.training, pending: false };
  c.rival = d.rival;
  c.asc = d.asc || 0;
  // ZERO's true form is down (the last Ascension stage): the true ending plays at once and opens the Combined division (records.js syncRecords reads
  // flags.trueEndingSeen). A code is shown after that very win, so it carries the ending with it (the Theater has the scene)
  if (c.asc >= ASC_PATH.length) c.flags.trueEndingSeen = true;
  if (current) c.freed = current.freed || 0; // (the freed Hollowed are local: kept, and topped up from the code's own progress)
  c.lives = Math.min(c.lives, livesOf(c.circuit)); // (a password stores 1 or 2: the Underworld only has one)
  return normalizeRival(c);
}

export const ladder = (c) => CIRCUITS[c.circuit].fighters;
export const nextOpponent = (c) => ladder(c)[c.beaten] || null;
export const isSecret = (id) => id in SECRET;
// The next circuit on the Ascension path that exists in this build (null past the last one)
export const ascNext = (c) => { const id = ASC_PATH[c.asc || 0]; return id && CIRCUITS[id] && CIRCUITS[id].fighters.length ? id : null; };
// The circuit the career is on right now belongs to the Ascension (a circuit or a Dash fight)
export const inAscension = (c) => isAsc(c.circuit);
// ...and which map it lives on: the Pantheon's staircase, or (after The Fall) the Underworld's descent
export const ascMap = (c) => (zoneOf(c.circuit) === 'void' || (c.asc || 0) > ASC_PATH.indexOf('vorgath') ? 'void'
  : zoneOf(c.circuit) === 'underworld' || (c.asc || 0) > ASC_PATH.indexOf('halcyon') ? 'underworld' : 'pantheon');
// The door below the throne: the King is down (the deal broke) and the Void may be entered
export const voidReached = (c) => (c.asc || 0) > ASC_PATH.indexOf('vorgath');
// Has The Fall happened to this career? (Halcyon is beaten: the way back up is closed)
export const hasFallen = (c) => (c.asc || 0) > ASC_PATH.indexOf('halcyon');

// The Void has no lives (spec §18 A3, A13): nothing in it ever resets
export const noLives = (id) => zoneOf(id) === 'void';

// Where a circuit stands for this career: 'cleared' | 'current' | 'open' | 'locked' (the world map's marker states; the podium halls' gate).
export function circuitStatus(c, id) {
  const f = c.flags;
  if (isRival(id)) return rivalWon(c, id) ? 'cleared' : rivalDue(c, id) ? 'current' : rivalOptional(c, id) ? 'open' : 'locked';
  if (isAsc(id)) {
    const i = ascIndex(id), a = c.asc || 0;
    if (i < a) return 'cleared';
    if (i === a) return c.circuit === id ? (c.beaten >= ladder(c).length ? 'cleared' : 'current') : (c.flags.zeroBeaten && c.flags.pantheonOpen ? 'open' : 'locked');
    return 'locked';
  }
  if (id === c.circuit && c.beaten < ladder(c).length) return 'current';
  const i = MAIN_PATH.indexOf(id);
  if (i >= 0 && !isSecret(id)) return i < c.main ? 'cleared' : i === c.main ? 'current' : 'locked';
  const cleared = { carnival: f.carnivalCleared, underground: f.undergroundCleared, nightmare: f.nightmareCleared, zero: f.zeroBeaten }[id];
  if (cleared) return 'cleared';
  return selectableCircuits(c).includes(id) || { carnival: f.carnivalUnlocked, underground: f.undergroundUnlocked, nightmare: f.jaxBeaten }[id] ? 'open' : 'locked';
}

// One fighter's podium in his circuit's hall: 'beaten' (beaten in this run of the circuit: the podium gives an instant rematch that never
// touches the ladder or the lives), 'next' (the next of the ladder: a career fight that costs a life when lost) or 'ahead' (not reached yet).
// A circuit that is open but not the one in progress has its first podium as `next`: fighting him enters it.
export function podiumState(c, id, index) {
  const st = circuitStatus(c, id);
  if (st === 'cleared') return 'beaten';
  if (id === c.circuit) return index < c.beaten ? 'beaten' : index === c.beaten ? 'next' : 'ahead';
  if (index === 0 && (st === 'open' || st === 'current') && selectableCircuits(c).includes(id)) return 'next';
  return 'ahead';
}

// Rank label: below #3 you're unranked; beat #3 and you take their spot.
export function rankLabel(c) {
  const n = ladder(c).length;
  if (c.beaten >= n) return 'CHAMPION';
  return c.beaten === 0 ? 'UNRANKED' : `RANKED #${n - c.beaten}`;
}

// Main-path and secret circuits you could pick on the map right now.
export function selectableCircuits(c) {
  // a rival fight that's due comes first: nothing else until he's beaten
  if (isRival(c.circuit) && rivalDue(c, c.circuit)) return [c.circuit];
  // on the Ascension: finish the ladder in progress (the staircase map's own list is ascNext)
  if (inAscension(c) && c.beaten > 0 && c.beaten < ladder(c).length) return [c.circuit];
  const out = [MAIN_PATH[Math.min(c.main, MAIN_PATH.length - 1)]];
  if (c.beaten > 0 && c.beaten < ladder(c).length && !isSecret(c.circuit)) return out; // finish the ladder first
  const f = c.flags;
  if (f.carnivalUnlocked && !f.carnivalCleared) out.push('carnival');
  if (f.undergroundUnlocked && !f.undergroundCleared) out.push('underground');
  if (f.jaxBeaten && !f.nightmareCleared) out.push('nightmare');
  if (f.nightmareCleared && f.undergroundCleared && !f.zeroBeaten) out.push('zero');
  for (const r of RIVALS) if (rivalOptional(c, r)) out.push(r); // unfinished business (old saves)
  // the Ascension: the next circuit on its path, once the sky is open (the map checks the medal gate)
  const a = ascNext(c);
  if (a && c.flags.zeroBeaten && c.flags.pantheonOpen) out.push(a);
  return out;
}

// A circuit is playable in this build only if its fighters exist.
export const hasFighters = (id) => CIRCUITS[id] && CIRCUITS[id].fighters.length > 0;

export function enterCircuit(c, id, due = false) {
  c.circuit = id; c.beaten = 0; c.lives = livesOf(id); c.lostHere = false;
  c.detour = isRival(id) && !due; // picked from the map (only an optional rival fight can be)
}

// Apply a fight result. Returns what happened, for the results screen:
//   { kind: 'win' | 'title' | 'rematch' | 'reset', password, circuit, belt, next }  ('win' also says whether it gave a life back: gained, lives)
export function recordResult(c, result) {
  const won = result.winner === 'player';
  const circuit = c.circuit;
  if (won) {
    c.record.w++;
    if (result.method === 'KO' || result.method === 'TKO') c.record.ko++;
    c.beaten++;
    // a win in the ladder gives a life back (up to the circuit's own: 2, or 1 in the Underworld). Podium rematches never come through here, so they give none.
    const gained = !noLives(circuit) && c.lives < livesOf(circuit) ? (c.lives++, true) : false;
    // a Hollowed freed (permanent): the first time gets its full cutscene
    const newly = HOLLOWED.includes(result.opponent) && !isFreed(c, result.opponent) ? result.opponent : null;
    if (HOLLOWED.includes(result.opponent)) c.freed = (c.freed || 0) | freedBit(result.opponent);
    const freed = HOLLOWED.includes(result.opponent) ? { id: result.opponent, first: !!newly } : null;
    if (isRival(circuit)) {
      c.rival |= rivalBit(circuit);
      const next = backToMain(c);
      saveCareer(c);
      return { kind: 'rival', circuit, next, password: passwordOf(c) };
    }
    if (c.beaten >= ladder(c).length) {
      const next = winTitle(c, circuit);
      saveCareer(c);
      return { kind: 'title', circuit, next, freed, password: passwordOf(c) };
    }
    saveCareer(c);
    return { kind: 'win', circuit, freed, gained, lives: c.lives, password: passwordOf(c) };
  }
  c.record.l++;
  c.lostHere = true;
  if (isRival(circuit)) c.rivalLost = (c.rivalLost || 0) | rivalBit(circuit); // his rematch lines from now on
  // the Void has no lives: a loss costs nothing and sends you nowhere, you refight the same opponent (freed Hollowed stay freed, the ladder
  // stays where it was, and Dash Unbound and ZERO's true form stay reached)
  if (noLives(circuit)) { saveCareer(c); return { kind: 'retry', circuit }; }
  c.lives--;
  if (c.lives > 0) { saveCareer(c); return { kind: 'rematch', circuit, lives: c.lives }; }
  // an optional rival fight (old saves) never costs you a circuit: back to the road
  if (isRival(circuit) && c.detour) {
    const to = backToMain(c);
    saveCareer(c);
    return { kind: 'reset', circuit, to, password: passwordOf(c) };
  }
  // last life: back to the start of the circuit (for the rival, the one you just won)
  const to = RESET_TO[circuit] || (isRival(circuit) && CIRCUITS[circuit].after) || circuit;
  if (to !== circuit && MAIN_PATH.includes(to)) c.main = MAIN_PATH.indexOf(to);
  if (isAsc(to) && ascIndex(to) >= 0) c.asc = Math.min(c.asc, ascIndex(to)); // the Ascension circuit must be won again
  enterCircuit(c, to);
  // (the Void, if the rule says so: the retry starts after the Hollowed you have already freed)
  if (VOID_SKIP_FREED && VOID.includes(to)) { const L = ladder(c); while (c.beaten < L.length - 1 && isFreed(c, L[c.beaten])) c.beaten++; }
  c.lostHere = to === circuit; // a restart doesn't wipe the loss (secret unlocks need a clean circuit)
  if (circuit === 'zero') c.flags.nightmareCleared = false; // back to the start of the Nightmare: clear it again to face ZERO
  saveCareer(c);
  return { kind: 'reset', circuit, to, password: passwordOf(c) };
}

// Belt won: unlocks, then move on along the path.
function winTitle(c, id) {
  const f = c.flags;
  const clean = !c.lostHere;
  if (isAsc(id)) return winAscension(c, id);
  if (id === 'major' && clean) f.carnivalUnlocked = true;
  if (id === 'legends' && clean) f.undergroundUnlocked = true;
  if (id === 'dream') f.jaxBeaten = true;
  if (id === 'carnival') f.carnivalCleared = true;
  if (id === 'underground') f.undergroundCleared = true;
  if (id === 'nightmare') f.nightmareCleared = true;
  if (id === 'zero') f.zeroBeaten = true;
  if (!isSecret(id)) c.main = Math.min(MAIN_PATH.length, c.main + 1);
  c.training.pending = true; // a training session on the road to the next circuit
  // the rival turns up at the belt ceremony (§11b)
  const rival = RIVAL_AFTER[id];
  if (rival && !rivalWon(c, rival)) { enterCircuit(c, rival, true); return rival; }
  return backToMain(c);
}

// An Ascension belt: the next stage of the path, Dash's fight first if one follows this circuit.
function winAscension(c, id) {
  c.asc = Math.max(c.asc || 0, ascIndex(id) + 1);
  c.training.pending = true;
  const rival = RIVAL_AFTER[id];
  if (rival && !rivalWon(c, rival)) { enterCircuit(c, rival, true); return rival; }
  return backToMain(c);
}

// On to the main circuit in progress (after a belt, a rival fight or a secret circuit).
// A career on the Ascension goes back to the Ascension's next circuit instead.
function backToMain(c) {
  if (c.flags.pantheonOpen && (c.asc || 0) > 0 && (c.main >= MAIN_PATH.length)) {
    const a = ascNext(c);
    if (a) { enterCircuit(c, a); return a; }
    const last = ASC_PATH[Math.min(c.asc, ASC_PATH.length) - 1];
    enterCircuit(c, last); c.beaten = ladder(c).length; return last; // the end of the built path: stay champ
  }
  const next = MAIN_PATH[Math.min(c.main, MAIN_PATH.length - 1)];
  enterCircuit(c, next);
  if (c.main >= MAIN_PATH.length) c.beaten = ladder(c).length; // all done: stay champ
  return next;
}

// --- Circuit replay (§5, Phase 9b) --------------------------------------------
// Replay any circuit you've cleared, from the bottom of its ladder, with 2 lives
// of its own. `career.replay` = { circuit, beaten, lives, lost, rival } (saved
// locally so a replay survives a reload; never in the password). Nothing about
// the career itself changes, except the second chance at a secret: a replay of
// Major / Legends with no fight lost unlocks Carnival / Underground.
// If the circuit's title was followed by a rival fight you've already won, the
// replay ends with that Dash (replay.rival = true once the ladder is done).
const SECOND_CHANCE = { major: 'carnivalUnlocked', legends: 'undergroundUnlocked' };

export function replayable(c) {
  const f = c.flags, out = [];
  for (let i = 0; i < Math.min(c.main, MAIN_PATH.length); i++) out.push(MAIN_PATH[i]);
  if (f.jaxBeaten && !out.includes('dream')) out.push('dream');
  if (f.carnivalCleared) out.push('carnival');
  if (f.undergroundCleared) out.push('underground');
  if (f.nightmareCleared || f.zeroBeaten) out.push('nightmare');
  if (f.zeroBeaten) out.push('zero');
  // cleared Ascension circuits (only the ones with fighters in this build)
  for (let i = 0; i < Math.min(c.asc || 0, ASC_PATH.length); i++) if (CIRCUITS[ASC_PATH[i]].fighters.length) out.push(ASC_PATH[i]);
  return out;
}

export function startReplay(c, id) {
  c.replay = { circuit: id, beaten: 0, lives: livesOf(id), lost: false, rival: false };
  saveCareer(c);
}
export function endReplay(c) { c.replay = null; saveCareer(c); }

// Who's next in the replay: the ladder, then (if you've beaten him) the rival.
export function replayOpponent(c) {
  const R = c.replay;
  if (!R) return null;
  if (R.rival) return CIRCUITS[RIVAL_AFTER[R.circuit]].fighters[0];
  return CIRCUITS[R.circuit].fighters[R.beaten] || null;
}

// Apply a replay fight's result. Returns { kind, circuit, ... }:
//   'win' (next up), 'rival' (the ladder's done: Dash is next), 'done' (reclaimed:
//   `unlocked` names a secret it unlocked), 'rematch' (lives left), 'over'.
export function recordReplay(c, result) {
  const R = c.replay, circuit = R.circuit;
  if (result.winner !== 'player') {
    R.lost = true; R.lives--;
    if (R.lives > 0) { saveCareer(c); return { kind: 'rematch', circuit, lives: R.lives }; }
    c.replay = null; saveCareer(c);
    return { kind: 'over', circuit };
  }
  if (!R.rival) R.beaten++;
  const gained = R.lives < livesOf(circuit) ? (R.lives++, true) : false; // (a replay's own lives come back with a win too)
  if (!R.rival && R.beaten < CIRCUITS[circuit].fighters.length) { saveCareer(c); return { kind: 'win', circuit, gained, lives: R.lives }; }
  const rival = RIVAL_AFTER[circuit];
  if (!R.rival && rival && rivalWon(c, rival)) { R.rival = true; saveCareer(c); return { kind: 'rival', circuit, rivalId: rival }; }
  // reclaimed
  let unlocked = null;
  const flag = SECOND_CHANCE[circuit];
  if (flag && !R.lost && !c.flags[flag]) { c.flags[flag] = true; unlocked = flag === 'carnivalUnlocked' ? 'carnival' : 'underground'; }
  c.replay = null; saveCareer(c);
  return { kind: 'done', circuit, unlocked, password: passwordOf(c) };
}
