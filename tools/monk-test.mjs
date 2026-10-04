// The Monk's rules (#41), end to end through the real Fight, Player and OpponentAI code:
//   node tools/monk-test.mjs [--td]
//   1. he never attacks first: a player who does nothing is never attacked, and he meditates (health back, calm full)
//   2. every action gets its own answer (data/fighters/monk.js `reactions`): the four punches, a whiff at full calm, a landed
//      punch (once), a dodge each way, a block, a duck, a Star Punch (his answer, or the super once it's due)
//   3. defending an answer never provokes another; calm is spent by the answer it loads
//   4. the super: armored, one golden moment, a knockdown
//   5. the bait exploit: a block, then a head shot into the bowed head
// Exit code 1 on any failure.
import { Fight } from '../src/fight/fightState.js';
import { PT } from '../src/fight/player.js';
import { FIGHTERS } from '../data/fighters/index.js';

class Input {
  constructor() { this.now = new Set(); this.h = new Set(); }
  pressed(a) { return this.now.has(a); }
  held(a) { return this.now.has(a) || this.h.has(a); }
  released() { return false; }
  confirm() { return this.now.has('start') || this.now.has('a'); }
  back() { return false; }
  anyPressed(l = ['a', 'b', 'start', 'star']) { return l.some((a) => this.now.has(a)); }
  update() {}
}
let bad = 0, n = 0;
const check = (name, ok, why = '') => { n++; if (!ok) bad++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${why ? '  ' + why : ''}`); };

function start(opts = {}) {
  const inp = new Input();
  const f = new Fight({ fighter: FIGHTERS.monk, audio: null, input: inp, opts: { rounds: 3, infiniteHealth: true, infiniteHearts: true, oppNeverDown: true, ...opts } });
  const O = f.opp, P = f.player, W = O.mods.sw;
  const log = []; // every move he throws: { id, at }
  const bm = O.beginMove.bind(O);
  O.beginMove = (id, o) => { log.push({ id: id.replace(/\*$/, ''), super: id.endsWith('*'), at: f.clock }); bm(id, o); };
  const step = (k = 1) => { for (let i = 0; i < k; i++) { inp.now.clear(); f.update(); } };
  const tap = (...a) => { for (const x of a) inp.now.add(x); f.update(); inp.now.clear(); };
  for (let i = 0; i < 500 && f.phase !== 'fight'; i++) { if (f.phase === 'announce' && f.pt > 40) inp.now.add('start'); inp.now.has('start') ? tap() : step(); }
  step(8);
  // a quiet stance: nothing queued, the water settled
  const calm = () => { O.state = 'idle'; O.t = 0; O.wait = 99999; O.move = null; O.forced = []; O.stun = 0; W.q = null; W.settle = 0; W.landed = false; W.returned = false; W.hp = O.health; };
  const idle = () => { for (let i = 0; i < 80 && !(P.state === 'idle' && P.rebuff === 0); i++) step(); };
  return { f, inp, O, P, W, log, step, tap, calm, idle };
}
const jab = (c, side, high) => { c.idle(); if (high) c.inp.h.add('up'); else c.inp.h.delete('up'); c.tap(side === 'L' ? 'b' : 'a'); c.step(6); c.inp.h.delete('up'); };
// run until he starts a move (or 120 frames); returns it
function answer(c, frames = 140) { const n0 = c.log.length; for (let i = 0; i < frames && c.log.length === n0; i++) c.step(); return c.log[c.log.length - 1] && c.log.length > n0 ? c.log[c.log.length - 1] : null; }

console.log('THE MONK');
{
  console.log(' he never attacks first');
  const c = start();
  const hp0 = Math.round(c.O.maxHealth * 0.5);
  c.O.health = hp0; c.W.hp = hp0;
  c.step(60 * 20); // twenty seconds of a player doing nothing
  check('20 seconds of nothing: no attack', c.log.length === 0, `${c.log.length} moves`);
  check('...he meditates: health creeps back', c.O.health > hp0 + c.O.maxHealth * 0.02 && c.O.health < hp0 + c.O.maxHealth * 0.2, `${hp0} -> ${Math.round(c.O.health)}`);
  check('...and his calm is full', c.W.calm >= 0.999, `calm ${c.W.calm.toFixed(2)}`);
  const c2 = start();
  c2.step(60 * 60 * 3 - 20);
  check('a whole round of nothing: still no attack', c2.log.length === 0, `${c2.log.length} moves`);
}

console.log(' every action has its own answer');
const ANSWERS = [
  ['jab left, head', (c) => jab(c, 'L', true), 'palm'],
  ['jab right, head', (c) => jab(c, 'R', true), 'crane'],
  ['jab left, body', (c) => jab(c, 'L', false), 'lowPalm'],
  ['jab right, body', (c) => jab(c, 'R', false), 'tiger'],
  ['dodge left', (c) => { c.idle(); c.tap('left'); }, 'chaseL'],
  ['dodge right', (c) => { c.idle(); c.tap('right'); }, 'chaseR'],
  ['block', (c) => { c.idle(); c.inp.h.add('down'); c.tap('down'); c.step(3); c.inp.h.delete('down'); }, 'under'],
  ['duck (two taps down)', (c) => { c.idle(); c.tap('down'); c.step(3); c.tap('down'); c.step(2); }, 'rising'],
];
const seen = {};
for (const [name, act, want] of ANSWERS) {
  const c = start(); c.calm(); c.W.calm = 0;
  act(c);
  const a = answer(c);
  seen[want] = FIGHTERS.monk.moves[want];
  check(`${name} -> ${want}`, !!a && a.id === want, a ? `got ${a.id}` : 'no answer');
}
{
  // a punch at full calm whiffs (he sways out of it) and the air answers
  const c = start(); c.calm(); c.W.calm = 1;
  const landed0 = c.f.stats.landed;
  jab(c, 'L', true);
  const a = answer(c);
  check('a punch at full calm -> willow', !!a && a.id === 'willow', a ? `got ${a.id}` : 'no answer');
  check('...and it found only air', c.f.stats.landed === landed0 && c.W.swayT >= 0);
  check('...and the calm was spent in the answer', c.W.calm === 0, `calm ${c.W.calm}`);
}
{
  // a punch that lands on him: the water returns, once
  const c = start(); c.calm();
  c.O.health -= 12; // (what a landed punch does)
  const a = answer(c, 90);
  check('a landed punch -> water returns', !!a && a.id === 'ripple', a ? `got ${a.id}` : 'no answer');
  // he has thrown it; punishing the return must not bring it again
  c.step(200);
  c.O.state = 'idle'; c.O.t = 0; c.O.wait = 99999; c.O.move = null; c.O.stun = 0; c.W.q = null; c.W.settle = 0; c.W.landed = false; c.W.hp = c.O.health; // (his stance: the return stays spent)
  c.O.health -= 12;
  const b = answer(c, 90);
  check('...punishing the return does not bring it again', !b, b ? `got ${b.id}` : '');
  c.W.returned = true;
  jab(c, 'L', true); // back to his stillness
  check('...and a punch at his stillness lets the water return again', c.W.returned === false);
}
{
  // a Star Punch: the tide, or the super once it's due
  const c = start(); c.calm(); c.W.calm = 0; c.O.superPlan = [999];
  c.P.stars = 1; c.idle(); c.tap('star'); c.step(PT.STAR_IMPACT + 4);
  const a = answer(c, 120);
  check('a Star Punch (super not due) -> tidal palm', !!a && a.id === 'tidal' && !a.super, a ? `got ${a.id}${a.super ? ' (super)' : ''}` : 'no answer');
  const d = start(); d.calm(); d.W.calm = 0; d.O.superPlan = [0];
  d.P.stars = 1; d.idle(); d.tap('star'); d.step(PT.STAR_IMPACT + 4);
  const b = answer(d, 120);
  check('a Star Punch (super due) -> still water, armored', !!b && b.id === 'stillWater' && b.super && !!d.O.armor, b ? `got ${b.id}${b.super ? ' (super)' : ''}, armor ${!!d.O.armor}` : 'no answer');
  check('...and he never started a super by himself', d.log.filter((m) => m.super).length === 1);
}

console.log(' defending answers, and calm');
{
  // he answers a punch; the player slips it; nothing more comes by itself
  const c = start(); c.calm(); c.W.calm = 0;
  jab(c, 'L', true);
  const a = answer(c);
  check('answer comes', !!a && a.id === 'palm');
  // dodge it (frame-exact is not needed: dodge on the windup's last frames)
  for (let i = 0; i < 40 && !(c.O.state === 'windup' && c.O.move.windupFrames - c.O.moveT <= 4); i++) c.step();
  c.tap('left');
  c.step(120);
  check('slipping it provokes nothing: he is still', c.log.length === 1, `${c.log.length} moves`);
  check('...and he sits in recovery-then-stillness (no pattern)', ['idle', 'block'].includes(c.O.state));
}
{
  // calm is loaded by standing still and spent by the next answer: harder, quicker, shorter recovery
  const c = start(); c.calm(); c.W.calm = 0;
  jab(c, 'L', true); const plain = answer(c);
  const base = { dmg: c.O.move.damage, wind: c.O.move.windupFrames, rec: c.O.move.recoveryFrames };
  const d = start(); d.calm(); d.W.calm = 0.8;
  d.O.beginMove('palm'); // (his calm as it is now, spent)
  const m = d.O.move;
  check('calm makes the answer harder', m.damage > base.dmg, `${base.dmg} -> ${m.damage}`);
  check('...quicker, but never under 6 frames', m.windupFrames < base.wind && m.windupFrames >= 6, `${base.wind} -> ${m.windupFrames}`);
  check('...with a shorter recovery', m.recoveryFrames < base.rec, `${base.rec} -> ${m.recoveryFrames}`);
  check('...and it is spent', d.W.calm === 0);
  void plain;
}

console.log(' the super');
{
  // star -> super -> only the golden moment gets through: everything else clanks
  const c = start(); c.calm(); c.W.calm = 0; c.O.superPlan = [0];
  c.P.stars = 1; c.idle(); c.tap('star'); c.step(PT.STAR_IMPACT + 4);
  answer(c, 120);
  // an early punch (not the glint) clanks
  for (let i = 0; i < 60 && !(c.O.state === 'windup' && c.O.moveT === 3); i++) c.step();
  c.inp.h.add('up'); c.idle(); c.tap('b'); c.step(6); c.inp.h.delete('up');
  check('a punch outside the golden window clanks off his armor', c.O.armor !== null && c.f.stats.perfects === 0);
  check('...without hurting him', c.O.health >= c.O.maxHealth - 1);
}
{
  // the golden moment: a deliberate head shot on the glint is a knockdown
  const c = start({ oppNeverDown: false }); c.calm(); c.W.calm = 0; c.O.superPlan = [0];
  c.P.stars = 1; c.idle(); c.tap('star'); c.step(PT.STAR_IMPACT + 4);
  answer(c, 120);
  const w = c.O.move.kdWindow;
  let pressed = false;
  for (let i = 0; i < 80 && !pressed; i++) {
    if (c.O.state === 'windup' && c.O.moveT + PT.JAB_IMPACT === w[0] && c.P.state === 'idle') { c.inp.h.add('up'); c.tap('b'); c.inp.h.delete('up'); pressed = true; break; }
    c.step();
  }
  c.step(10);
  check('a head shot on the glint is a knockdown', c.f.stats.perfects === 1 && c.f.kdTotal.opp === 1, `perfects ${c.f.stats.perfects}, knockdowns ${c.f.kdTotal.opp}, window ${w}`);
}

console.log(' the bait');
{
  // hold your guard: he goes under the stone, bowing; a head shot into the bow stuns him for nine hits
  const c = start(); c.calm(); c.W.calm = 0;
  c.idle(); c.inp.h.add('down'); c.tap('down'); c.step(3); c.inp.h.delete('down');
  const a = answer(c);
  check('a raised guard -> under the stone', !!a && a.id === 'under');
  const T = FIGHTERS.monk.exploits.find((x) => x.id === 'bowedHead').trigger.frames;
  let hit = false;
  for (let i = 0; i < 60 && !hit; i++) {
    if (c.O.state === 'windup' && c.O.moveT + PT.JAB_IMPACT >= T[0] + 1 && c.O.moveT + PT.JAB_IMPACT <= T[1] && c.P.state === 'idle') { c.inp.h.add('up'); c.tap('b'); c.inp.h.delete('up'); hit = true; break; }
    c.step();
  }
  c.step(8);
  check('a head shot into the bow stuns him', hit && c.O.stun >= 90 && c.K !== null, `stun ${c.O.stun}`);
}
console.log(' out of hearts');
{
  const c = start(); c.calm(); c.W.calm = 0;
  c.P.hearts = 0; c.P.pink = true;
  c.idle(); c.tap('left'); // a slip while exhausted
  c.step(60);
  check('a slip while exhausted is not answered', c.log.length === 0, `${c.log.length} moves`);
  c.step(120);
  check('...and his stillness gives the hearts back', !c.P.pink && c.P.hearts >= 2, `hearts ${c.P.hearts}`);
}
console.log(`\n${n - bad}/${n} checks passed`);
process.exit(bad ? 1 : 0);
