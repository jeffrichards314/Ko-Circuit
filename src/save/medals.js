// Medals and record times (§15), saved to localStorage only
// (`kocircuit.medals`, never in a password):
//   best    fighter id -> best KO/TKO time (game seconds from round 1's bell)
//   got     fighter id -> { speed, flawless, signature } medals earned
//   seen    medal-count unlocks already announced (§16: the "NEW!" notice)
// Only Career fights (circuit replays and podium rematches included) are
// recorded: the results screen calls recordFight().
import { load, save } from './storage.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { MEDALS, medalsFor, speedTarget } from '../../data/medals.js';
import { BASE_EVERYONE, ASC_EVERYONE } from './records.js';
import { UNLOCKS, ASC_UNLOCKS } from '../../data/unlocks.js';

export function loadMedals() {
  const m = load('medals', null) || {};
  return { best: m.best || {}, got: m.got || {}, seen: m.seen || [] };
}
export const saveMedals = (m) => save('medals', m);

// Record a finished fight. Returns { time, newBest, earned: ['speed', ...] (new
// ones only), medals: { speed, flawless, signature } (this fight's) }.
export function recordFight(M, result) {
  const d = FIGHTERS[result.opponent];
  if (!d || result.remix) return null;
  const out = { time: null, newBest: false, earned: [], medals: medalsFor(d, result, speedTarget), unlocked: [] };
  const before = medalCount(M), ascBefore = ascMedalCount(M);
  if (result.winner === 'player' && (result.method === 'KO' || result.method === 'TKO')) {
    out.time = result.seconds;
    const was = M.best[d.id];
    if (was == null || result.seconds < was) { M.best[d.id] = result.seconds; out.newBest = true; }
  }
  const g = (M.got[d.id] ||= { speed: false, flawless: false, signature: false });
  for (const k of MEDALS) if (out.medals[k] && !g[k]) { g[k] = true; out.earned.push(k); }
  const after = medalCount(M), ascAfter = ascMedalCount(M);
  // medal thresholds crossed (§16; the Ascension's own track, spec A2)
  out.unlocked = [...UNLOCKS.filter((u) => before < u.at && after >= u.at), ...ASC_UNLOCKS.filter((u) => ascBefore < u.at && ascAfter >= u.at)];
  saveMedals(M);
  return out;
}

// The unlock thresholds (§16), the Pantheon gate (§15) and the medal grid's headline total count the
// base game's medals only (of 168); the Ascension's own are counted apart, so new content never
// moves an old threshold (Phase F: the Ascension's own thresholds are ASC_UNLOCKS in data/unlocks.js).
const countIn = (M, ids) => ids.reduce((a, id) => a + (M.got[id] ? MEDALS.filter((k) => M.got[id][k]).length : 0), 0);
export const medalCount = (M) => countIn(M, BASE_EVERYONE);
export const ascMedalCount = (M) => countIn(M, ASC_EVERYONE);
export const MEDAL_TOTAL = BASE_EVERYONE.length * MEDALS.length;
export const ASC_MEDAL_TOTAL = ASC_EVERYONE.length * MEDALS.length;
export const medalsOf = (M, id) => M.got[id] || { speed: false, flawless: false, signature: false };
