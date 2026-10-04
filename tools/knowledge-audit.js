// Knowledge audit (knowledge spec K7): every fighter's exploits, anti-strategies and
// scripted moments, checked against the K4 design rules. Shared by
// tools/knowledge-audit.html (the page) and tools/knowledge-audit.mjs (headless).
//
//   audit(FIGHTERS, CIRCUITS) -> { rows: [{ id, name, circuit, role, exploits, antis, moments, issues }],
//                                  global: [issues], counts: { error, warn, note } }
//   issue: { level: 'error' | 'warn' | 'note', text }
//
// Rules checked:
//   counts      Rookie: 1 exploit, no anti-strategy (the champion: 1 mild one).
//               Minor-Major: 1-2 exploits, 1 anti-strategy.
//               Carnival, Continental and on: 2-3 exploits, 1-2 anti-strategies, 1+ scripted moment.
//               Champions (outside Rookie), bosses (Jax, ZERO) and Dash: 3+ / 2+ / 2+.
//               An entry marked override: 'K6' (a K6 example that breaks a count) is a note.
//   variety     no two fighters in a circuit share a primary (first) anti-strategy;
//               every anti-strategy type shows up somewhere
//   hints       every exploit has a hint (a known kind) and scouting text; every anti-strategy has scouting text
//   supers      (spec §4) at least one super; each with exactly one golden moment (a known place, a window on real frames,
//               a defined punch); a golden moment converted from an exploit (`from`) counts toward K4's exploits
//   corner      (spec §4) a hint bank (data/hints/): general lines; three tiers for every super, exploit, anti-strategy
//               and boss phase; every tier different
//   phases      the six big bosses (data/difficulty.js BOUTS): a scouting entry and hints for every phase
//   data        types are known; the moves, open steps and counters they name exist;
//               a dodge-bias move can be slipped both ways; an unblockable answer
//               still leaves a defense; scripted steps name real moves
//   timing      (K4.5) two fighters in a circuit with the very same exploit numbers
//   missing     fighters with no knowledge layer yet
import { EXPLOIT_TYPES, ANTI_TYPES, HINT_KINDS } from '../src/fight/knowledge.js';
import { STRATEGIES } from '../src/fight/behavior.js';
import { supersOf, superKey, chainsOf, goldenMoveOf, hitOf, keptSuper } from '../data/fighters/super.js';
import { hintBank } from '../src/fight/cornerman.js';
import { linesFor } from '../data/hints/index.js';
import { boutOf } from '../data/difficulty.js';

export const GOLDEN_PLACES = ['taunt', 'advance', 'windup', 'recovery', 'open'];

const TRIGGER_ON = ['punch', 'resolved', 'getUp', 'passive', 'blockStreak', 'custom'];

const LATE = ['carnival', 'continental', 'world', 'storm', 'legends', 'grandprix', 'underground', 'nightmare', 'dream', 'zero', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'v1', 'v2', 'v3', 'zeroTrue']; // (and the whole Ascension)
const MIDDLE = ['minor', 'metro', 'major'];
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export function roleOf(d) {
  if (d.tdBoss) return 'boss'; // (the Hollowed, fought as bosses in Title Defense)
  if (d.rival) return 'dash';
  if (d.circuit === 'dream' || d.circuit === 'zero' || d.circuit === 'halcyon' || d.circuit === 'vorgath' || d.circuit === 'zeroTrue' || d.id === 'jax' || d.id === 'zero') return 'boss';
  if (d.isChampion) return 'champion';
  return 'fighter';
}

// the K4 counts for a fighter: { ex: [min, max], anti: [min, max], mom: min, mild }
export function targetFor(d) {
  const role = roleOf(d);
  if (d.circuit === 'rookie') return role === 'champion' ? { ex: [1, 1], anti: [0, 1], mom: 0, mild: true } : { ex: [1, 1], anti: [0, 0], mom: 0 };
  if (role !== 'fighter') return { ex: [3, 99], anti: [2, 99], mom: 2 };
  if (MIDDLE.includes(d.circuit)) return { ex: [1, 2], anti: [1, 1], mom: 0 };
  if (LATE.includes(d.circuit)) return { ex: [2, 3], anti: [1, 2], mom: 1 };
  return { ex: [1, 99], anti: [0, 99], mom: 0 };
}

function checkFighter(d) {
  const I = [], X = d.exploits || [], A = d.antiStrategies || [], M = d.scriptedMoments || [];
  const add = (level, text) => I.push({ level, text });
  const T = targetFor(d);
  const overrides = A.filter((a) => a.override);
  const nA = A.length - overrides.length;
  const range = (n, [lo, hi], what) => {
    if (n < lo) add('error', `${n} ${what} (K4 wants ${lo === hi ? lo : `${lo}-${hi === 99 ? `${lo}+` : hi}`})`);
    else if (n > hi) add('error', `${n} ${what} (K4 wants at most ${hi})`);
  };
  const converted = supersOf(d).filter((S) => S.from).length; // (an exploit turned into a super's golden moment is still one)
  range(X.length + converted, T.ex, converted ? `exploits (${converted} of them a golden moment)` : 'exploits');
  range(nA, T.anti, 'anti-strategies');
  if (M.length < T.mom) add('error', `${M.length} scripted moments (K4 wants ${T.mom}+)`);
  if (T.mild && A.some((a) => !a.mild)) add('error', 'the Rookie champion\'s anti-strategy must be mild');
  for (const a of overrides) add('note', `${a.name}: kept from K6's example (${a.override}) though K4 gives this fighter no anti-strategy`);

  const moves = d.moves || {};
  const has = (id) => !!moves[id];
  const openKeys = new Set([
    ...d.patterns.flatMap((p) => p.steps).filter((s) => s.open).flatMap((s) => [s.id, s.anim]),
    ...M.flatMap((s) => s.steps || []).filter((s) => s.open).flatMap((s) => [s.id, s.anim]),
    ...A.map((a) => a.step).filter(Boolean).flatMap((s) => [s.id, s.anim]),
  ].filter(Boolean));
  for (const x of X) {
    const n = x.name || x.id;
    if (!EXPLOIT_TYPES.includes(x.type)) add('error', `${n}: unknown exploit type "${x.type}"`);
    if (!x.hint || !x.hint.text) add('error', `${n}: no hint`);
    else if (!HINT_KINDS.includes(x.hint.kind)) add('error', `${n}: unknown hint kind "${x.hint.kind}"`);
    if (!x.scout) add('error', `${n}: no scouting-report text`);
    const tr = x.trigger || {};
    if (!TRIGGER_ON.includes(tr.on || 'punch')) add('error', `${n}: unknown trigger kind "${tr.on}"`);
    for (const id of asList(tr.move)) if (!has(id)) add('error', `${n}: trigger names a move he doesn't have (${id})`);
    if (tr.mark && !(d.stateTriggers || []).some((s) => s.do && s.do.mark === tr.mark.name)) add('error', `${n}: waits for the mark "${tr.mark.name}" that no state trigger sets`);
    if (tr.flag && !X.some((o) => o.effect && o.effect.flag === tr.flag) && !M.some((s) => s.flag === tr.flag) && !(d.modFlags || []).includes(tr.flag)) add('error', `${n}: needs the switch "${tr.flag}" that nothing sets`);
    if (x.probe) for (const id of [x.probe.begin, ...asList(x.probe.then), x.probe.at && x.probe.at.move]) if (!has(id)) add('error', `${n}: probe names a move he doesn't have (${id})`);
    if (tr.open && !openKeys.has(tr.open)) add('error', `${n}: trigger names an open step he never takes (${tr.open})`);
    const E = x.effect || {};
    for (const id of asList(E.cancelMoves)) if (!has(id)) add('error', `${n}: cancels a move he doesn't have (${id})`);
    for (const s of E.script || []) if (s.move && !has(s.move)) add('error', `${n}: scripts a move he doesn't have (${s.move})`);
    if (E.open && d.anims && !d.anims[E.open.anim || 'stunned']) add('error', `${n}: open step anim "${E.open.anim}" isn't one of his anims`);
  }
  for (const a of A) {
    const n = a.name || a.id;
    if (!ANTI_TYPES.includes(a.type)) add('error', `${n}: unknown anti-strategy type "${a.type}"`);
    if (!a.scout) add('error', `${n}: no scouting-report text`);
    for (const id of [...asList(a.counter), ...asList(a.moves), ...asList(a.into), ...asList(a.move)]) if (!has(id)) add('error', `${n}: names a move he doesn't have (${id})`);
    if (a.type === 'grudge' || a.type === 'adapt') {
      // each answer is a full anti-strategy of its own (a recorded strategy -> its answer)
      for (const key of STRATEGIES) if (!(a.answers || {})[key]) add('error', `${n}: no answer to the "${key}" strategy`);
      for (const [key, def] of Object.entries(a.answers || {})) {
        if (!STRATEGIES.includes(key)) add('error', `${n}: answers an unknown strategy "${key}"`);
        if (!ANTI_TYPES.includes(def.type) || def.type === 'grudge') add('error', `${n}: the answer to "${key}" has a bad type "${def.type}"`);
        for (const id of [...asList(def.counter), ...asList(def.moves), ...asList(def.into), ...asList(def.move)]) if (!has(id)) add('error', `${n}: the answer to "${key}" names a move he doesn't have (${id})`);
      }
    }
    if (a.type === 'dodgeBias') for (const id of asList(a.moves)) if (has(id) && !(moves[id].avoidBy.includes('dodgeL') && moves[id].avoidBy.includes('dodgeR'))) add('error', `${n}: ${id} can't be slipped both ways`);
    if (a.type === 'turtling' && a.response === 'unblockable') for (const id of asList(a.moves)) if (has(id) && moves[id].avoidBy.filter((v) => v !== 'block').length === 0) add('error', `${n}: ${id} would have no defense left`);
  }
  for (const s of d.stateTriggers || []) for (const st of (s.do && s.do.steps) || []) if (st.move && !has(st.move)) add('error', `${s.name || s.id}: a state trigger's step names a move he doesn't have (${st.move})`);
  checkSupers(d, add);
  checkCorner(d, add);
  for (const s of M) {
    if (!s.when || (s.when.left == null && s.when.health == null)) add('error', `${s.name}: no clock or health trigger`);
    for (const st of s.steps || []) if (st.move && !has(st.move)) add('error', `${s.name}: a step names a move he doesn't have (${st.move})`);
    if (s.patterns && !d.patterns.some((p) => p.script === s.patterns)) add('error', `${s.name}: no patterns with script "${s.patterns}"`);
  }
  return I;
}

// Supers (spec §4): every opponent has at least one, each with exactly one golden moment on real frames and a defined punch.
function checkSupers(d, add) {
  const L = supersOf(d), moves = d.moves || {};
  if (!L.length) { add('error', 'no super'); return; }
  for (const S of L) {
    const k = superKey(S), n = S.name || k;
    if (!GOLDEN_PLACES.includes(S.golden)) { add('error', `super ${n}: no golden moment (golden: ${S.golden})`); continue; }
    if (!S.hit) add('error', `super ${n}: the golden moment's punch isn't defined (hit)`);
    if (S.armorOpen ? false : !chainsOf(S).length) add('error', `super ${n}: no moves`);
    for (const c of chainsOf(S)) for (const id of c) if (!moves[id]) add('error', `super ${n}: names a move he doesn't have (${id})`);
    // the one window: on the golden move (windup / advance / recovery), the taunt, or the opening a slipped super leaves
    for (const c of chainsOf(S)) {
      const g = goldenMoveOf(S, c[0]), m = moves[S.inline || keptSuper(S) || g !== c[0] ? g : c[0] + '*'] || moves[g]; // (a sequence super's golden move is its '*' copy)
      if (!m) continue;
      if ((S.golden === 'windup' || S.golden === 'advance') && !m.kdOnCue && !(m.kdWindow && m.kdWindow[1] < m.windupFrames)) add('error', `super ${n}: no golden window inside ${g}'s windup`);
      if (S.golden === 'recovery' && !(m.recoveryKd && m.recoveryKd[1] < m.recoveryFrames)) add('error', `super ${n}: no golden window inside ${g}'s recovery`);
      // exactly one: no second perfect hit on the same chain
      const others = c.filter((id) => id !== g && moves[id] && (moves[id].kdWindow || moves[id].recoveryKd) && moves[id].goldenHit);
      if (others.length) add('error', `super ${n}: more than one golden moment (${others.join(', ')})`);
    }
    if (S.golden === 'taunt' && !(S.window && S.window[1] < (S.taunt || 50))) add('error', `super ${n}: the taunt's golden window isn't inside the taunt`);
    if (S.golden === 'open' && !(S.window && S.open)) add('error', `super ${n}: an opening's golden moment needs its open anim and window`);
    void hitOf;
  }
}
// The cornerman's hint bank (spec §4; data/hints/)
function checkCorner(d, add) {
  const B = hintBank(d), tiers = (L, what) => {
    if (!L) { add('error', `corner: no hint for ${what}`); return; }
    if (!Array.isArray(L) || L.length < 3) add('error', `corner: ${what} needs three tiers (first try, after a loss, after two)`);
    else if (new Set(L).size < L.length) add('error', `corner: ${what}'s tiers repeat a line`);
  };
  if (!(B.general || []).length) add('error', 'corner: no general lines');
  for (const S of supersOf(d)) tiers((B.super || {})[superKey(S)], `super ${S.name || superKey(S)}`);
  for (const x of d.exploits || []) tiers(linesFor(B.exploit, x.id), `exploit ${x.name}`);
  for (const a of d.antiStrategies || []) tiers(linesFor(B.anti, a.id), `anti-strategy ${a.name}`);
  const bout = boutOf(d);
  if (bout) {
    if ((d.phases || []).length !== bout.phases) add('error', `phases: ${bout.phases} in his bout, ${(d.phases || []).length} scouting entries`);
    for (let p = 1; p <= bout.phases; p++) tiers((B.phase || {})[p], `phase ${p}`);
  }
}

// the numbers that make an exploit's timing: K4.5 wants them to differ between fighters
const sig = (x) => JSON.stringify([x.trigger && x.trigger.frames, x.effect && x.effect.open && [x.effect.open.frames, x.effect.open.comboLimit], x.effect && [x.effect.stun, x.effect.hits]]);

export function audit(FIGHTERS, CIRCUITS) {
  const rows = [], global = [];
  const order = Object.values(CIRCUITS).flatMap((c) => c.fighters);
  const ids = [...new Set([...order, ...Object.keys(FIGHTERS)])].filter((id) => FIGHTERS[id]);
  for (const id of ids) {
    const d = FIGHTERS[id];
    const X = d.exploits || [], A = d.antiStrategies || [], M = d.scriptedMoments || [];
    const done = X.length || A.length || M.length || supersOf(d).some((S) => S.from); // (Barney's whole layer is his Bucket Slip, which became the golden moment of his super)
    rows.push({
      id, name: d.name + (d.rival ? ` ${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][d.rival]}` : ''), circuit: d.circuit, role: roleOf(d), done: !!done,
      exploits: X.map((x) => ({ id: x.id, name: x.name, type: x.type, hint: x.hint && x.hint.kind, hidden: !!(x.hint && x.hint.hidden) })),
      supers: supersOf(d).map((S) => ({ key: superKey(S), name: S.name || (d.moves[superKey(S)] || {}).name || superKey(S), golden: S.golden, hit: S.hit, inline: !!S.inline, from: S.from || null })),
      antis: A.map((a) => ({ id: a.id, name: a.name, type: a.type, mild: !!a.mild, override: a.override })),
      moments: M.map((s) => ({ id: s.id, name: s.name, when: (s.when.left != null ? `${Math.floor(s.when.left / 60)}:${String(s.when.left % 60).padStart(2, '0')} left${s.when.round ? ` in round ${s.when.round}` : ''}` : `< ${Math.round(s.when.health * 100)}% HP`) })),
      issues: done ? checkFighter(d) : [{ level: 'warn', text: 'no knowledge layer yet' }],
    });
  }
  // variety: primaries within a circuit
  for (const [cid, C] of Object.entries(CIRCUITS)) {
    const seen = {};
    for (const id of C.fighters) {
      const a = (FIGHTERS[id] && FIGHTERS[id].antiStrategies || []).find((e) => !e.override) || (FIGHTERS[id] && (FIGHTERS[id].antiStrategies || [])[0]);
      if (!a) continue;
      if (seen[a.type]) global.push({ level: 'error', text: `${C.name}: ${FIGHTERS[seen[a.type]].name} and ${FIGHTERS[id].name} share the primary anti-strategy ${a.type}` });
      else seen[a.type] = id;
    }
    // timing: the very same exploit numbers twice in a circuit
    const sigs = {};
    for (const id of C.fighters) for (const x of (FIGHTERS[id] && FIGHTERS[id].exploits) || []) {
      const s = sig(x);
      if (s === JSON.stringify([null, null, [null, null]]) || s.includes('[null,null,[null,null]]')) continue;
      if (sigs[s] && sigs[s] !== id) global.push({ level: 'warn', text: `${C.name}: ${FIGHTERS[sigs[s]].name} and ${FIGHTERS[id].name} have exploits with identical timing (${s})` });
      else sigs[s] = id;
    }
  }
  // coverage: every anti-strategy type somewhere
  const used = new Set(rows.flatMap((r) => r.antis.map((a) => a.type)));
  for (const t of ANTI_TYPES) if (!used.has(t)) global.push({ level: 'error', text: `no fighter uses the ${t} anti-strategy` });
  const all = [...global, ...rows.flatMap((r) => r.issues)];
  const counts = { error: 0, warn: 0, note: 0 };
  for (const i of all) counts[i.level]++;
  return { rows, global, counts, typeUse: Object.fromEntries(ANTI_TYPES.map((t) => [t, rows.filter((r) => r.antis.some((a) => a.type === t)).map((r) => r.id)])) };
}
