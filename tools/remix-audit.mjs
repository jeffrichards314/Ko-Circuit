// Remix audit (spec §6, K4): the Title Defense remixes checked as their own fighters.
//   node tools/remix-audit.mjs [ids...] [--list]
// 1. the K4 audit (tools/knowledge-audit.js) over every remix: counts, hints / tips / scouting texts, the moves and steps they name exist,
//    variety inside a circuit, timing;
// 2. DIFFERENT FROM THE ORIGINAL: no remix exploit or anti-strategy shares an id, a name, or a mechanic with the original fight's (same type on
//    the same move(s), or the same anti-strategy type on the same moves), and the remix's primary anti-strategy type is not the original's;
// 3. every remix has its own scouting key, tips for its visible exploits, and a scripted moment that names real moves.
// Exit code 1 if anything is wrong.
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { remixed, TD_LISTS } from '../data/fighters/titleDefense.js';
import { audit, roleOf } from './knowledge-audit.js';
import { wrap, wrapPx, textWidth } from '../src/engine/font.js';

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const all = [...new Set([...TD_LISTS.combined])];
const list = ids.length ? ids : all;
const R = Object.fromEntries(list.map((id) => [id, remixed(id)]));
let bad = 0;
const fail = (id, m) => { bad++; console.log(`  FAIL ${id}: ${m}`); };
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

const A = audit(R, CIRCUITS);
for (const r of A.rows) for (const i of r.issues) if (i.level === 'error') fail(r.id, i.text);
for (const i of A.global) if (i.level === 'error' && !/no fighter uses/.test(i.text)) { bad++; console.log('  FAIL ' + i.text); }
for (const r of A.rows) if (args.includes('--list')) console.log(`${r.id.padEnd(10)} ${r.exploits.length}E ${r.antis.length}A ${r.moments.length}S  ${r.antis.map((a) => a.type).join('+')}`);

const moveKey = (t) => JSON.stringify(asList(t && t.move).slice().sort());
for (const id of list) {
  const d = FIGHTERS[id], r = R[id];
  if (!d.titleDefense) { fail(id, 'no remix block'); continue; }
  if (r.scoutId !== `${id}.td`) fail(id, 'no scouting key of its own');
  const oldX = d.exploits || [], oldA = d.antiStrategies || [], oldM = d.scriptedMoments || [];
  for (const x of r.exploits || []) {
    for (const o of oldX) {
      if (o.id === x.id) fail(id, `exploit id "${x.id}" is the original's`);
      if (o.name === x.name) fail(id, `exploit name "${x.name}" is the original's`);
      if (o.type === x.type && moveKey(o.trigger) === moveKey(x.trigger) && moveKey(x.trigger) !== '[]' && (o.trigger.on || 'punch') === (x.trigger.on || 'punch') && (o.trigger.result || '') === (x.trigger.result || '')) fail(id, `exploit "${x.name}" repeats "${o.name}" (same kind of trigger on the same move)`);
    }
    if ((x.trigger.on === 'getUp' || x.trigger.on === 'passive' || x.trigger.on === 'blockStreak') && oldX.some((o) => o.trigger.on === x.trigger.on)) fail(id, `exploit "${x.name}" is the same trigger (${x.trigger.on}) as one of the original's`);
  }
  for (const a of r.antiStrategies || []) {
    for (const o of oldA) {
      if (o.id === a.id) fail(id, `anti-strategy id "${a.id}" is the original's`);
      if (o.name === a.name) fail(id, `anti-strategy name "${a.name}" is the original's`);
      if (o.type === a.type && a.type !== 'grudge' && a.type !== 'adapt') fail(id, `anti-strategy "${a.name}" is the original's type (${a.type})`);
      if (o.type === a.type && (a.type === 'grudge' || a.type === 'adapt') && JSON.stringify(Object.values(o.answers || {}).map((v) => [v.type, v.counter, v.moves])) === JSON.stringify(Object.values(a.answers || {}).map((v) => [v.type, v.counter, v.moves]))) fail(id, `${a.type} "${a.name}" has the original's answers`);
    }
  }
  for (const s of r.scriptedMoments || []) for (const o of oldM) { if (o.id === s.id) fail(id, `moment id "${s.id}" is the original's`); if (o.name === s.name) fail(id, `moment name "${s.name}" is the original's`); }
  // the remix is a new puzzle: its first anti-strategy is of another type than the original's first
  const pa = oldA.find((a) => !a.override) || oldA[0], pb = (r.antiStrategies || [])[0];
  if (pa && pb && pa.type === pb.type && pa.type !== 'grudge' && pa.type !== 'adapt') fail(id, `primary anti-strategy ${pb.type} is the original's`);
  const role = roleOf(r);
  if (role === 'boss' || role === 'champion' || role === 'dash') {
    if (!(r.exploits || []).length) fail(id, 'no exploits');
  }
}
// 4. the texts fit the screens they are drawn on: the intro card's quote (16 characters, 6 lines), the nickname (two lines of 118 px), the
//    banners (30 characters), an entry's name in the scouting report (2 lines of 134 px)
for (const id of list) {
  const r = R[id];
  if (!r) continue;
  const q = wrap(`"${r.card.quote}"`, 16);
  if (q.length > 6) fail(id, `the intro quote runs to ${q.length} lines`);
  if (textWidth(`"${r.nickname}"`, false) > 236) fail(id, `the nickname "${r.nickname}" is too wide`);
  // (the corner's lines about the remix are hint banks now, data/hints/remixes*.js: tools/cornerman-test.mjs and tools/text-fit.mjs check them)
  for (const x of r.exploits || []) { if (wrapPx(x.name, 134).length > 2) fail(id, `exploit name too long: ${x.name}`); if (x.effect && x.effect.say && x.effect.say.length > 30) fail(id, `exploit banner too long: ${x.effect.say}`); if (wrapPx(x.scout, 142).length > 7) fail(id, `scouting text of ${x.name} runs to ${wrapPx(x.scout, 142).length} lines`); if (x.hint.text.length > 70) fail(id, `hint of ${x.name} is ${x.hint.text.length} characters`); }
  for (const a of r.antiStrategies || []) { if (wrapPx(a.name, 134).length > 2) fail(id, `anti-strategy name too long: ${a.name}`); if (a.say && a.say.length > 30) fail(id, `anti banner too long: ${a.say}`); if (wrapPx(a.scout, 142).length > 7) fail(id, `scouting text of ${a.name} runs to ${wrapPx(a.scout, 142).length} lines`); }
  for (const m of r.scriptedMoments || []) if ((m.say || m.name).length > 30) fail(id, `moment banner too long: ${m.say || m.name}`);
}
console.log(`${list.length} remixes audited: ${bad ? bad + ' problems' : 'all good'}`);
process.exit(bad ? 1 : 0);
