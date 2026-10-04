// The cornerman between rounds (spec §4 "Between rounds"): strategy hints unique to every opponent, in the voice of whoever is
// in your corner (your trainer: warm and old-school; the Ferryman in the Underworld and the Void: riddles; Dash before ZERO's
// true form: cocky but honest). Hints, never answers: each points toward an exploit, a danger or a golden moment without
// stating the mechanic. The hint banks are data (data/hints/), one per opponent:
//   general: [line, ...]                  his style, for a quiet round
//   super:   { <superKey>: [t1, t2, t3] } each super and its golden moment
//   exploit: { <exploitId>: [t1, t2, t3] }
//   anti:    { <antiId>: [t1, t2, t3] }     what shuts a playstyle down, nudging you to change it
//   phase:   { <n>: [t1, t2, t3] }          a big boss's phases
// t1 is the first attempt's line; t2 (after one loss to him) and t3 (two or more) are a little clearer, never the answer.
//
// What he talks about reacts to the round that just ended (Fight.roundLog), most pressing first:
//   1. a super caught you            -> that super
//   2. an anti-strategy punished you -> that one (change your approach)
//   3. a boss                        -> the phase you're in, or the next one once this one's health is running out
//   4. you did well                  -> something you haven't found yet (a golden moment, an exploit)
//   5. otherwise                     -> anything not found yet, then his general lines, then anything at all
// He never repeats the line he gave last (or the one before it, while there's another): src/save/cornerLog.js remembers.
// The Tactician gives one extra hint a round.
import { HINTS, linesFor } from '../../data/hints/index.js';
import { supersOf, superKey } from '../../data/fighters/super.js';
import { CHAMPIONSHIP } from '../../data/difficulty.js';

export const TIERS = 3;
const GOOD_ROUND = 25; // health lost in the round (of 100) under which the round "went well" (and no knockdown)

// his hint bank: a remix's own (its exploits and anti-strategies) over the original's (supers, phases, general lines)
export function hintBank(d) {
  const base = HINTS[d.hintId || d.id] || {};
  if (!d.remix) return base;
  const R = HINTS[`${d.id}.td`] || {};
  return { general: [...(R.general || []), ...(base.general || [])], super: { ...(base.super || {}), ...(R.super || {}) }, exploit: { ...(R.exploit || {}) }, anti: { ...(R.anti || {}) }, phase: { ...(base.phase || {}) } };
}
const pickTier = (lines, tier) => (Array.isArray(lines) ? lines[Math.min(tier, lines.length - 1)] : lines);

// The topics he could talk about now, most pressing first: [{ key, text }]
export function hintTopics(fight, log, { tier = 0 } = {}) {
  const d = fight.d, B = hintBank(d), id = d.scoutId || d.id, S = fight.opts.scouting;
  const found = (key) => !!(S && S.has(id, key));
  const out = [], push = (key, lines) => { if (lines && !out.some((t) => t.key === key)) { const text = pickTier(lines, tier); if (text) out.push({ key, text }); } };
  const sup = B.super || {}, ex = B.exploit || {}, an = B.anti || {}, ph = B.phase || {};
  // 1. the super that caught you (the one that caught you most)
  for (const [k] of Object.entries(log.superHits || {}).sort((a, b) => b[1] - a[1])) push('s:' + k, sup[k]);
  // 2. the anti-strategy that punished you
  for (const a of log.antis || []) push('a:' + (a.grudge || a.id), linesFor(an, a.grudge || a.id) || linesFor(an, a.id));
  // 3. a big boss: this phase, or the next one when this one is nearly done
  if (fight.bossPhases > 1) {
    const p = fight.bossPhase, low = fight.opp.health / fight.opp.maxHealth < 0.45;
    if (low && p < fight.bossPhases) push('p:' + (p + 1), ph[p + 1]);
    push('p:' + p, ph[p]);
  }
  // 4. a good round: what you haven't found yet (golden moments first)
  const good = (log.damage || 0) < GOOD_ROUND && !(log.downs > 0);
  const undiscovered = [
    ...supersOf(d).map((x) => ['s:' + superKey(x), sup[superKey(x)]]),
    ...(d.exploits || []).map((x) => ['x:' + x.id, linesFor(ex, x.id)]),
  ].filter(([k, L]) => L && !found(k));
  if (good) for (const [k, L] of undiscovered) push(k, L);
  // 5. anything not found yet, his style, then anything at all
  for (const [k, L] of undiscovered) push(k, L);
  (B.general || []).forEach((L, i) => push('g:' + i, L));
  for (const [k, L] of Object.entries(sup)) push('s:' + k, L);
  for (const x of d.exploits || []) push('x:' + x.id, linesFor(ex, x.id));
  for (const [k, L] of Object.entries(an)) push('a:' + k, L);
  return out;
}

// The hints for this corner break: 1 (2 with the Tactician), never the one he gave last time.
export function cornerHints(fight, log) {
  const d = fight.d, id = d.scoutId || d.id, C = fight.opts.corner;
  const tier = Math.min(TIERS - 1, C ? C.losses(id) : 0);
  const topics = hintTopics(fight, log, { tier });
  const recent = C ? C.recent(id) : [];
  const want = fight.trainer.id === 'tactician' ? 2 : 1;
  const out = [];
  // first pass: skip anything heard in the last two breaks; second: skip only the very last one; third: anything
  for (const skip of [recent.slice(-2), recent.slice(-1), []]) {
    for (const t of topics) {
      if (out.length >= want) break;
      if (skip.includes(t.key + '@' + tier) || out.some((o) => o.key === t.key)) continue;
      out.push(t);
    }
    if (out.length >= want) break;
  }
  if (C) for (const t of out) C.heard(id, t.key + '@' + tier);
  return out.map((t) => t.text);
}

// The cornerman's moment when the fight is about to go into the championship rounds (the first time) or into sudden death (the first time):
// in the voice of whoever is in the corner (spec §4 "Championship rounds"). null in every other break.
const CALLS = {
  champ: {
    default: 'No judges, champ. Nobody wins this on points. Somebody goes down. Make it him.',
    hype: 'No judges tonight, baby! Championship rounds! One of you is going down!',
    oldschool: 'Three rounds and nobody down. No judges now, kid: you and him until one drops. He heals less every round. Finish it.',
    tactician: 'Nobody is down, so there is no scorecard. It gets faster from here and he recovers less. No judges: win it soon.',
    ferryman: 'The sand has run and nobody has drowned. No judges here: the river does not count rounds. It waits.',
    dash: 'No judges, no clock to save you. We go until one of us drops. Do not make it you.',
  },
  sudden: {
    default: 'Next round is sudden death. First one down loses it all. Do not get hit.',
    hype: 'Sudden death, baby! First knockdown ends it! Stay up!',
    oldschool: 'Sudden death. One knockdown and it is over, for either of you. Do not get greedy.',
    tactician: 'From the next bell the first knockdown ends the fight. His too. Hit him clean, or stay away.',
    ferryman: 'The river narrows. The next one to fall is the last.',
    dash: 'Next one down ends it. Him or you. Move.',
  },
};
export function championshipCall(fight) {
  const next = fight.round + 1 - fight.rounds; // the round coming up, counted from the first championship round
  const kind = next === 1 ? 'champ' : next === CHAMPIONSHIP.suddenFrom ? 'sudden' : null;
  if (!kind) return null;
  const T = CALLS[kind];
  return T[fight.trainer.id] || T.default;
}
