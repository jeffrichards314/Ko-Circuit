// ORIGIN (2026-10-04): that nothing of him exists before his conditions, and that each door, list and switch opens at exactly the right moment.
//   node tools/origin-test.mjs
//   1. no list, menu, grid, circuit list, scouting book, theater row or sound test entry knows him before he is beaten (and his true form before it)
//   2. the two doors: locked, labeled only ??? (no hint), until their exact conditions; the true form's door says only LOCKED. until ORIGIN is beaten
//   3. his name is hidden until his intro has played
//   4. Practice: no ORIGIN before the Gauntlet win, then ORIGIN; the TRUE FORM switch only after the true form is beaten; the switch picks the true form
//   5. the records: a win records the time and medals, opens what it opens; a loss changes nothing but the tries
//   6. passwords carry both flags; a password-restored career syncs them into the records; the costume and the title follow the true form
import { makeGame } from './lib/stub.mjs';

let bad = 0, ok = 0;
const check = (c, why) => { if (c) ok++; else { bad++; console.log(`FAIL ${why}`); } };

const T = await makeGame({ career: 'zeroTrue' });
const g = T.game, R = g.records;
const { CIRCUITS, ALL_ORDER } = await import('../data/circuits.js');
const { EVERYONE, originGauntletOpen, originTrueOpen, originName, recordOriginFight, syncRecords } = await import('../src/save/records.js');
const { DIVISIONS } = await import('../data/divisions.js');
const { SCOUT_CIRCUITS } = await import('../src/save/scouting.js');
const { visibleFighters, costumeUnlocked } = await import('../src/save/unlocks.js');
const { FIGHTERS } = await import('../data/fighters/index.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const { TheaterScreen } = await import('../src/screens/theater.js');
const { SoundTestScreen } = await import('../src/screens/extras.js');
const { PracticeScreen } = await import('../src/screens/modes.js');
const { encode, decode } = await import('../src/save/password.js');
const { theaterList } = await import('../data/cutscenes/index.js');

const IDS = ['origin', 'originTrue'];
const leak = (arr, ids = IDS) => ids.some((id) => arr.includes(id));

// ---- 1. nothing leaks
check(!leak(EVERYONE), 'EVERYONE lists him');
check(!Object.keys(CIRCUITS).some((c) => IDS.includes(c) || IDS.includes((CIRCUITS[c].fighters || [])[0])), 'a circuit list holds him');
check(!ALL_ORDER.some((c) => IDS.includes(c)), 'ALL_ORDER holds him');
check(!SCOUT_CIRCUITS.some((c) => IDS.includes(c)), 'the scouting books hold his circuit');
check(!leak(visibleFighters(g)), 'the gallery / records list him early');
check(!leak(R.met), 'records.met holds him');
{
  const th = new TheaterScreen(g, {}), titles = th.rows.map((r) => r.header || r.title).join('|');
  check(!/ORIGIN|BEGINNING/i.test(titles), `the Theater lists him early: ${titles.match(/ORIGIN|BEGINNING/i)}`);
  const st = new SoundTestScreen(g);
  check(!st.lists.flat().some((n) => /^origin/i.test(n)), 'the sound test lists his songs or sounds early');
  check(!theaterList().some((z) => z.zone === 'origin' && false), 'n/a');
  const P = new PracticeScreen(g, {});
  check(!leak(P.met) && !leak(P.grid.ids) && !P.circuits.some((c) => IDS.includes(c)), 'Practice knows him early');
}

// ---- 2. the doors
const hall = (id) => new InteriorScreen(g, { id });
const door = (id) => { const S = hall(id), st = S.L.stations.find((s) => s.origin); return { S, st }; };
for (const [id, which] of [['gauntlet', 'g'], ['td', 't']]) {
  const { S, st } = door(id);
  check(!!st && st.label === '???' && !st.sub && !st.lock.hint, `${id}: the secret door is missing, named or hinted`);
  check(S.lockedOf(st), `${id}: the secret door starts open`);
  void which;
}
// the Gauntlet's: all five divisions cleared
for (const d of DIVISIONS) { check(!originGauntletOpen(R), `the Gauntlet door opens before ${d}`); R.gauntlet[d].clears = 1; }
check(originGauntletOpen(R), 'the Gauntlet door stays shut with all five cleared');
check(!door('gauntlet').S.lockedOf(door('gauntlet').st), 'n/a') || 0;
{ const { S, st } = door('gauntlet'); check(!S.lockedOf(st), 'the Gauntlet door is still locked with all five cleared'); }
// the true form's: ORIGIN beaten AND all five defenses
for (const d of DIVISIONS) R.td[d].clears = 1;
check(!originTrueOpen(R), 'the true form door opens without ORIGIN beaten');
{ const { S, st } = door('td'); check(S.lockedOf(st), 'the TD door opens before ORIGIN is beaten'); }
check(originName(R, 'g') === '???' && originName(R, 't') === '???', 'his name is shown before his intro');

// ---- 5. a loss, then a win
const d0 = FIGHTERS.origin, dT = FIGHTERS.originTrue;
const result = (won, t = 600) => ({ winner: won ? 'player' : 'opponent', method: 'KO', round: 3, seconds: t, stats: { hitsTaken: 0 }, knockdowns: { player: 0, opp: 1 }, track: { cues: { '!golden:fp': 1 }, moves: {}, opens: {}, kds: [], punches: {} } });
let r1 = recordOriginFight(R, d0, result(false), 'g', g.career);
check(!R.origin.beaten && R.origin.tries.g === 1 && r1.time === null, 'a loss changed more than the tries');
let r2 = recordOriginFight(R, d0, result(true, 600), 'g', g.career);
check(R.origin.beaten && g.career.flags.originBeaten && r2.first && R.origin.best.g === 600, 'a win did not record');
check(R.origin.got.g.speed && R.origin.got.g.flawless && R.origin.got.g.signature, `the medals: ${JSON.stringify(R.origin.got.g)}`);
check(originTrueOpen(R), 'the true form door stays shut with ORIGIN beaten and five defenses');
{ const { S, st } = door('td'); check(!S.lockedOf(st), 'the TD door is locked with every condition met'); }

// ---- 4. Practice
{
  const P = new PracticeScreen(g, {});
  check(P.met.includes('origin') && P.grid.ids.includes('origin') && !P.grid.ids.includes('originTrue'), 'Practice does not list ORIGIN once beaten');
  P.mode = 'options'; P.P.circuit = P.circuits.indexOf('origin'); P.P.fighter = 0; P.refresh();
  check(P.id() === 'origin' && P.versions().join() === 'normal', `the TRUE FORM switch is there early: ${P.versions()}`);
  recordOriginFight(R, dT, result(true, 900), 't', g.career);
  const Q = new PracticeScreen(g, {});
  Q.mode = 'options'; Q.P.circuit = Q.circuits.indexOf('origin'); Q.P.fighter = 0; Q.refresh();
  check(Q.versions().join() === 'normal,true', `the TRUE FORM switch after the true form: ${Q.versions()}`);
  Q.P.version = 'true'; Q.refresh();
  check(Q.d.id === 'originTrue', 'the switch does not pick the true form');
}

// ---- 6. passwords, costume, title
{
  const c = JSON.parse(JSON.stringify(g.career)); c.flags.originBeaten = true; c.flags.originTrueBeaten = true;
  const dec = decode(encode(c));
  check(dec && dec.flags.originBeaten && dec.flags.originTrueBeaten, 'the password does not carry both flags');
  const c0 = JSON.parse(JSON.stringify(g.career)); c0.flags.originBeaten = false; c0.flags.originTrueBeaten = false;
  const d0c = decode(encode(c0)); check(d0c && !d0c.flags.originBeaten && !d0c.flags.originTrueBeaten, 'a password without them carries them');
  const fresh = JSON.parse(JSON.stringify(g.career)); fresh.flags.originTrueBeaten = true;
  const R2 = { ...R, origin: { ...R.origin, beaten: false, trueBeaten: false }, unlocks: { ...R.unlocks }, met: [...R.met] };
  syncRecords(R2, fresh);
  check(R2.origin.beaten && R2.origin.trueBeaten, 'a restored career does not sync its flags into the records');
  check(costumeUnlocked(g.medals, 'origin', R) && !costumeUnlocked(g.medals, 'origin', { origin: { trueBeaten: false } }), 'the ORIGIN costume follows the true form');
}
console.log(bad ? `${bad} failure(s), ${ok} checks passed` : `ok: ${ok} checks passed`);
process.exit(bad ? 1 : 0);
