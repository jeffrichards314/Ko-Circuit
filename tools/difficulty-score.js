// The difficulty score (spec §9 "the curve"): one number per fight, in story order, so the whole curve can be graphed and
// checked. Shared by tools/knowledge-audit.html (the graph), tools/knowledge-audit.mjs --difficulty and
// tools/difficulty-graph.mjs (the before/after SVG).
//
//   curve(FIGHTERS, CIRCUITS) -> { rows: [{ i, id, name, circuit, zone, role, levers, score }], flags: [text] }
//
// Each lever is 0..1 (1 = the hardest the scale allows), measured off the fighter as the fight will run him:
//   tell     his median opening tell, log scale (40f -> 0, 3f -> 1)
//   damage   his average real punch x damageMult (0 -> 0, 40 -> 1)
//   getUp    presses a second the get-up mash needs over knockdowns 1-3 (a near-impossible one counts as 20), / 20
//   pattern  pattern length (his longest pattern's moves, log, 80 -> 1), randomness (fixed .. adaptive) and pace (shorter idles)
//   supers   (spec §4) armored supers: supers per round (average of min and max, 4 -> 1) 60%, how many different supers he
//            has (1 -> 0, 4 -> 1) 10%, and how tight their golden moments are (8 frames -> 0, 2 -> 1) 30%
//   anti     anti-strategies (count, x their strictness), 4 -> 1
//   phases   a big boss's phases (data/difficulty.js BOUTS): 1 -> 0, 4 -> 1
// score = 100 x the weighted sum (WEIGHTS).
//
// Checks (flags): every circuit climbs from its first fighter to its champion; each circuit opens below the champion
// (or boss) before it; every champion and boss is a local peak; the champions climb through each zone and every zone's
// boss tops the zone before's; ZERO's true form is the global peak with a clear margin; no lever peaks before the Void.
import { STORY, ZONE, tellOf, damageOf, mashNeed, legacyNeed, WALL_NEED, roleOf, boutOf, GOLDEN } from '../data/difficulty.js';
import { chainsOf, supersOf, superKey } from '../data/fighters/super.js';

export const WEIGHTS = { tell: 0.33, damage: 0.19, getUp: 0.14, pattern: 0.11, supers: 0.1, anti: 0.07, phases: 0.06 };
export const LEVERS = Object.keys(WEIGHTS);
// Title Defense (spec §6): a remix with an exclusive attack gets one more lever on top of the others, how hard that attack is to deal with
// (attackHardness below, 0..1). A career fighter has none, so the career curve and its checks are exactly what they were.
export const TD_WEIGHT = 0.06;
const RAND = { fixed: 0, light: 1, wheel: 2, weighted: 3, weightedFakes: 4, shuffled: 5, adaptive: 6, boss: 6, all: 6 };
const clamp = (v) => Math.max(0, Math.min(1, v));

export function getUpNeeds(d, C) {
  return [1, 2, 3].map((k) => Math.min(WALL_NEED, d.getUp ? mashNeed(d.getUp, k) : legacyNeed(C.mash, k)));
}
export function measure(d, C) {
  const tell = tellOf(d) ?? 20;
  const dmg = damageOf(d);
  const needs = getUpNeeds(d, C);
  const pats = d.patterns || [];
  const lens = pats.map((p) => p.steps.filter((s) => s.move).length);
  // (a fighter who only ever answers, the Monk, has no pattern of moves to learn: his `reactions` table, one answer per thing you do, is his pattern)
  if (d.reactions) lens.push(Object.keys(d.reactions).length);
  const avgLen = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 1, maxLen = Math.max(1, ...lens);
  const idles = pats.flatMap((p) => p.steps.filter((s) => s.idle >= 24).map((s) => s.idle));
  const avgIdle = idles.length ? idles.reduce((a, b) => a + b, 0) / idles.length : 60;
  const adapt = RAND[C.randomness] >= 6 ? (d.adapt ?? 0.5) : 0;
  const times = (d.super && d.super.times) || [1, 2];
  const antis = d.antiStrategies || [];
  const strict = d.difficulty ? d.difficulty.strict : 1;
  const nSup = (d.superList || (d.super ? [d.super] : [])).length;
  const goldW = d.difficulty ? d.difficulty.goldW : GOLDEN.width[0];
  const phases = boutOf(d) ? boutOf(d).phases : 1;
  const raw = { tell, dmg, needs, avgLen, maxLen, avgIdle, rand: C.randomness, adapt, supers: (times[0] + times[1]) / 2, nSup, goldW, phases, antis: antis.length, strict, wall: d.getUp ? d.getUp.wall : null };
  const levers = {
    tell: clamp(Math.log(40 / tell) / Math.log(40 / 3)),
    damage: clamp(dmg / 40),
    getUp: clamp(needs.reduce((a, b) => a + b, 0) / 3 / WALL_NEED),
    pattern: clamp(0.5 * Math.log(maxLen) / Math.log(80) + 0.2 * ((RAND[C.randomness] ?? 3) / 6) + 0.1 * adapt + 0.2 * clamp((90 - avgIdle) / 70)),
    supers: clamp(0.6 * (raw.supers / 4) + 0.1 * clamp((nSup - 1) / 3) + 0.3 * clamp((GOLDEN.width[0] - goldW) / (GOLDEN.width[0] - GOLDEN.width[1]))),
    anti: clamp((antis.length * strict) / 4),
    phases: clamp((phases - 1) / 3),
  };
  // (Title Defense: the exclusive attack, the hardest thing he throws)
  const X = (d.superList || []).find((S) => S.exclusive);
  const exclusive = X ? clamp(attackHardness(d, X).score / 100) : 0;
  raw.exclusive = exclusive;
  const score = 100 * LEVERS.reduce((s, k) => s + WEIGHTS[k] * levers[k], 0) + 100 * TD_WEIGHT * exclusive;
  return { raw, levers: X ? { ...levers, exclusive } : levers, score };
}

// every fight in story order: each circuit's ladder, first fighter to champion
export function storyFights(FIGHTERS, CIRCUITS) {
  const out = [];
  for (const cid of STORY) {
    const C = CIRCUITS[cid];
    if (!C) continue;
    for (const id of C.fighters) if (FIGHTERS[id]) out.push({ id, cid, C });
  }
  return out;
}

export function curve(FIGHTERS, CIRCUITS, { margin = 3 } = {}) {
  const rows = storyFights(FIGHTERS, CIRCUITS).map(({ id, cid, C }, i) => {
    const d = FIGHTERS[id], m = measure(d, C);
    const n = C.fighters.length, last = C.fighters[n - 1] === id;
    const role = roleOf(d, C);
    return { i, id, name: d.name + (d.rival ? ` ${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][d.rival]}` : ''), circuit: cid, zone: ZONE[cid], role, top: last && role !== 'fighter', ...m };
  });
  const flags = [];
  const flag = (r, text) => { flags.push({ id: r.id, text: `${r.name} (${r.circuit}, #${r.i + 1}): ${text}` }); r.flag = true; };
  const byCircuit = {};
  for (const r of rows) (byCircuit[r.circuit] ||= []).push(r);
  // circuits climb; each opens below the champion before it
  let prevTop = null;
  for (const cid of STORY) {
    const L = byCircuit[cid];
    if (!L) continue;
    for (let j = 1; j < L.length; j++) if (L[j].score < L[j - 1].score - 0.25) flag(L[j], `easier than ${L[j - 1].name} before him in his circuit (${L[j].score.toFixed(1)} < ${L[j - 1].score.toFixed(1)})`);
    if (prevTop && L.length > 1 && L[0].score >= prevTop.score) flag(L[0], `opens his circuit at ${L[0].score.toFixed(1)}, not below ${prevTop.name} (${prevTop.score.toFixed(1)}) before it`);
    prevTop = L[L.length - 1];
  }
  // champions and bosses are local peaks (above the fights either side)
  for (const r of rows) {
    if (!r.top) continue;
    const a = rows[r.i - 1], b = rows[r.i + 1];
    if (a && r.score <= a.score) flag(r, `${r.role} not above ${a.name} before him (${r.score.toFixed(1)} vs ${a.score.toFixed(1)})`);
    if (b && r.score <= b.score && b.top === false) flag(r, `${r.role} not above ${b.name} after him (${r.score.toFixed(1)} vs ${b.score.toFixed(1)})`);
  }
  // between bosses (a segment: the main road to Jax, Nightmare to ZERO, the Pantheon to Halcyon, ...): each circuit's
  // champion tops the one before, Dash tops the champion he follows, and every boss tops the boss before him
  let prevChamp = null, prevBoss = null, last = null;
  for (const r of rows) {
    if (r.role === 'champion' && !FIGHTERS[r.id].rival) {
      if (prevChamp && r.score <= prevChamp.score) flag(r, `champion not above the champion before him (${prevChamp.name} ${prevChamp.score.toFixed(1)})`);
      prevChamp = r;
    }
    if (FIGHTERS[r.id].rival && r.role === 'champion' && last && last.top && r.score <= last.score) flag(r, `not above ${last.name}, whose title he follows (${last.score.toFixed(1)})`);
    if (r.role === 'boss' || r.role === 'zeroTrue') {
      const seg = rows.slice(prevBoss ? prevBoss.i + 1 : 0, r.i);
      const top = seg.length ? seg.reduce((a, b) => (b.score > a.score ? b : a)) : null;
      if (top && r.score <= top.score) flag(r, `boss not above ${top.name} on the way to him (${top.score.toFixed(1)})`);
      if (prevBoss && r.score <= prevBoss.score) flag(r, `boss not above the boss before him (${prevBoss.name} ${prevBoss.score.toFixed(1)})`);
      prevBoss = r; prevChamp = null;
    }
    last = r;
  }
  // ZERO's true form: the global peak, clearly, and the top of every lever
  const zt = rows.find((r) => r.id === 'zeroTrue');
  if (zt) {
    const rest = rows.filter((r) => r !== zt);
    const next = rest.reduce((a, b) => (b.score > a.score ? b : a));
    if (zt.score < next.score + margin) flag(zt, `not clearly the global peak (${zt.score.toFixed(1)} vs ${next.name} ${next.score.toFixed(1)}, margin ${margin})`);
    for (const k of LEVERS) {
      const top = rest.reduce((a, b) => (b.levers[k] > a.levers[k] ? b : a));
      if (top.levers[k] >= zt.levers[k]) flag(zt, `${k} ${zt.levers[k].toFixed(2)} is matched by ${top.name} (${top.levers[k].toFixed(2)})`);
    }
  }
  // no lever reaches its maximum before the Void
  for (const k of LEVERS) {
    const max = Math.max(...rows.map((r) => r.levers[k]));
    const early = rows.find((r) => r.zone !== 'void' && r.levers[k] >= max - 1e-9);
    if (early) flag(early, `${k} already at the game's maximum (${max.toFixed(2)}) before the Void`);
  }
  return { rows, flags };
}

// An SVG line graph of one or more curves (rows from curve()): story order on x, score on y, zone bands, bosses marked.
export function graphSVG(series, { width = 1400, height = 420, title = '' } = {}) {
  const base = series[0].rows, n = base.length, padL = 44, padR = 16, padT = 30, padB = 70;
  const X = (i) => padL + ((width - padL - padR) * i) / Math.max(1, n - 1);
  const Y = (v) => padT + (height - padT - padB) * (1 - v / 100);
  const ZC = { main: '#2a3550', championship: '#4a2a40', pantheon: '#4a4420', underworld: '#40281c', void: '#202028' };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="ui-monospace,Menlo,monospace" font-size="10">`;
  s += `<rect width="${width}" height="${height}" fill="#101218"/>`;
  // zone bands
  let a = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || base[i].zone !== base[a].zone) {
      s += `<rect x="${X(a) - 3}" y="${padT}" width="${X(i - 1) - X(a) + 6}" height="${height - padT - padB}" fill="${ZC[base[a].zone]}" opacity="0.55"/>`;
      s += `<text x="${(X(a) + X(i - 1)) / 2}" y="${padT - 8}" fill="#9aa0b4" text-anchor="middle">${base[a].zone.toUpperCase()}</text>`;
      a = i;
    }
  }
  for (let v = 0; v <= 100; v += 20) s += `<line x1="${padL}" x2="${width - padR}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2a2e3a"/><text x="${padL - 6}" y="${Y(v) + 3}" fill="#7a8196" text-anchor="end">${v}</text>`;
  // circuit labels on x
  let c = 0;
  for (let i = 1; i <= n; i++) if (i === n || base[i].circuit !== base[c].circuit) {
    const x = (X(c) + X(i - 1)) / 2;
    s += `<text transform="translate(${x},${height - padB + 10}) rotate(60)" fill="#7a8196">${base[c].circuit}</text>`;
    c = i;
  }
  for (const S of series) {
    s += `<polyline fill="none" stroke="${S.color}" stroke-width="${S.width || 1.6}" ${S.dash ? `stroke-dasharray="${S.dash}"` : ''} points="${S.rows.map((r, i) => `${X(i).toFixed(1)},${Y(r.score).toFixed(1)}`).join(' ')}"/>`;
    for (const r of S.rows) {
      if (r.top) s += `<circle cx="${X(r.i)}" cy="${Y(r.score)}" r="${r.role === 'boss' || r.role === 'zeroTrue' ? 4 : 2.5}" fill="${r.role === 'champion' ? S.color : '#fff'}" stroke="${S.color}"/>`;
      if (S.flags && r.flag) s += `<circle cx="${X(r.i)}" cy="${Y(r.score)}" r="6" fill="none" stroke="#ff4040" stroke-width="1.5"/>`;
      if (S.labels && (r.role === 'boss' || r.role === 'zeroTrue')) s += `<text x="${X(r.i)}" y="${Y(r.score) - 8}" fill="${S.color}" text-anchor="middle">${r.id}</text>`;
    }
  }
  let ly = padT + 4;
  for (const S of series) { s += `<line x1="${padL + 8}" x2="${padL + 30}" y1="${ly}" y2="${ly}" stroke="${S.color}" stroke-width="2" ${S.dash ? `stroke-dasharray="${S.dash}"` : ''}/><text x="${padL + 36}" y="${ly + 3}" fill="#c8ccd8">${S.label}</text>`; ly += 14; }
  if (title) s += `<text x="${width - padR}" y="${padT - 8}" fill="#f0c040" text-anchor="end">${title}</text>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------------------------------------------------------------------------
// How hard an ATTACK is to deal with (the Title Defense exclusive attacks must be harder than anything else their fighter throws, spec §6).
// An attack is a run of blows (a combo of his patterns, a super's chain). Each lever is 0..1:
//   length    the blows in a row (log, 8 -> 1)
//   cover     how many DIFFERENT defenses it takes to get through all of it (the fewest that answer every blow: 1 -> 0, 4 -> 1): a run of
//             blows one defense beats (a wall of blocks) is easy, one that wants a slip, a block, a duck and the other slip is not
//   switches  how often the next blow cannot be answered with the defense that beat the last one
//   tight     how little room there is between one blow's impact and the next (24 frames or more -> 0, 8 or less -> 1)
//   speed     how short the tells are (log, 30 frames -> 0, 3 frames -> 1)
//   severity  a one-hit knockdown at the end (half), and how hard the blows hit (half; 40 a blow -> 1)
// attack hardness = 100 x (0.20 length + 0.25 cover + 0.15 switches + 0.15 tight + 0.15 speed + 0.10 severity)
export const ATTACK_WEIGHTS = { length: 0.2, cover: 0.25, switches: 0.15, tight: 0.15, speed: 0.15, severity: 0.1 };
const DEFS = ['dodgeL', 'dodgeR', 'block', 'duck'];
export function minCover(blows) {
  if (!blows.length) return 0;
  for (let k = 1; k <= 4; k++) {
    const pick = (start, left, have) => (left === 0 ? blows.every((m) => m.avoidBy.some((a) => have.includes(a))) : DEFS.slice(start).some((a, i) => pick(start + i + 1, left - 1, [...have, a])));
    if (pick(0, k, [])) return k;
  }
  return 4;
}
export function attackHardness(d, S, moves = null) {
  const ms = (moves || chainsOf(S)[0].map((id, i) => d.moves[i === 0 && d.moves[id + '*'] ? id + '*' : id])).filter(Boolean);
  const blows = ms.filter((m) => !m.call && !m.feint && m.activeFrames > 0 && (m.avoidBy || []).length);
  const n = blows.length;
  if (!n) return { score: 0, hits: 0, cover: 0, levers: {} };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const inter = (a, b) => a.some((x) => b.includes(x));
  let sw = 0, tight = 0, gaps = 0;
  for (let i = 1; i < n; i++) {
    if (!inter(blows[i - 1].avoidBy, blows[i].avoidBy)) sw++;
    const gap = blows[i - 1].recoveryFrames + blows[i].windupFrames;
    tight += clamp01((24 - gap) / 16); gaps++;
  }
  const cover = minCover(blows);
  const mult = (d.stats && d.stats.damageMult) || 1;
  const levers = {
    length: clamp01(Math.log(1 + n) / Math.log(9)),
    cover: (cover - 1) / 3,
    switches: n > 1 ? sw / (n - 1) : 0,
    tight: gaps ? tight / gaps : 0,
    speed: blows.reduce((a, m) => a + clamp01(Math.log(30 / Math.max(3, m.windupFrames - (m.quiet || 0))) / Math.log(10)), 0) / n,
    severity: 0.5 * (blows[n - 1].knockdown ? 1 : 0) + 0.5 * clamp01((blows.reduce((a, m) => a + m.damage, 0) / n) * mult / 40),
  };
  const score = 100 * Object.keys(ATTACK_WEIGHTS).reduce((a, k) => a + ATTACK_WEIGHTS[k] * levers[k], 0);
  return { score, hits: n, cover, levers };
}
// every other attack a fighter throws: each combo of his patterns (blows with only short gaps between them) and each of his other supers' chains
export function otherAttacks(d, S0) {
  const out = [];
  const asMoves = (ids) => ids.map((id) => d.moves[id]).filter(Boolean);
  for (const p of d.patterns || []) {
    let run = [];
    const flush = () => { if (run.length) out.push({ label: `combo ${p.id} (${run.length})`, S: null, moves: asMoves(run) }); run = []; };
    for (const s of p.steps || []) { if (s.move) run.push(s.move); else if (s.idle !== undefined && s.idle < 24) { /* part of the combo */ } else flush(); }
    flush();
  }
  for (const S of supersOf(d)) {
    if (S === S0) continue;
    for (const c of chainsOf(S)) out.push({ label: `super ${superKey(S)}`, S, moves: asMoves(c.map((id, i) => (i === 0 && d.moves[id + '*'] ? id + '*' : id))) });
  }
  for (const M of d.scriptedMoments || []) { const ids = (M.steps || []).filter((s) => s.move).map((s) => s.move); if (ids.length) out.push({ label: `moment ${M.id}`, S: null, moves: asMoves(ids) }); }
  return out;
}
