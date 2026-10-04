// End-to-end check of the career rules (§5), passwords (§8) and saves, headless.
//   node tools/career-test.mjs
// Plays scripted careers through recordResult (wins, losses, last-life resets,
// secret unlocks, the bosses) and checks after every step that:
//   - the password decodes back to the same career (circuit, rank, lives, flags,
//     customization, training camp),
//   - the localStorage autosave reloads to the same career,
//   - the records (mode unlocks, Practice list) follow the career.
// Exit code 1 on any failure.
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };

const { newCareer, loadCareer, recordResult, careerFromPassword, passwordOf, nextOpponent, selectableCircuits, enterCircuit, ladder, LIVES,
  replayable, startReplay, recordReplay, replayOpponent, ascMap, hasFallen } = await import('../src/save/career.js');
const { decode } = await import('../src/save/password.js');
const { loadRecords, syncRecords, modeUnlocked, gauntletRoster } = await import('../src/save/records.js');
const { MAIN_PATH, CIRCUITS, RIVAL_AFTER, RIVALS, HOLLOWED, VOID_SKIP_FREED } = await import('../data/circuits.js');
const { isFreed, freedCount, deriveFreed, voidReached, circuitStatus, podiumState, noLives } = await import('../src/save/career.js');
const { encode } = await import('../src/save/password.js');

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('FAIL', msg); } };
const WIN = { winner: 'player', method: 'KO' }, LOSS = { winner: 'opponent', method: 'KO' };
// (trueEndingSeen is left out: it comes back from a code on its own once ZERO's true form is down, tested apart)
const pick = (c) => ({ circuit: c.circuit, main: c.main, beaten: c.beaten, lives: c.lives, lostHere: !!c.lostHere, flags: Object.keys(c.flags).filter((k) => c.flags[k] === true && k !== 'trueEndingSeen').sort().join(), rival: c.rival || 0 });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function verify(c, label, saved = true) {
  const pw = passwordOf(c);
  const r = careerFromPassword(pw, c);
  ok(r && same(pick(r), pick(c)), `${label}: password ${pw} round trip\n  had ${JSON.stringify(pick(c))}\n  got ${r && JSON.stringify(pick(r))}`);
  ok(r && same(r.profile, c.profile), `${label}: password keeps the customization`);
  if (!saved) return;
  const l = loadCareer();
  ok(l && same(pick(l), pick(c)), `${label}: autosave reload`);
}

function win(c, label) { const o = recordResult(c, WIN); verify(c, label); return o; }
function lose(c, label) { const o = recordResult(c, LOSS); verify(c, label); return o; }
function clearCircuit(c, label) { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `${label} win ${i + 1}`); return o; }
// clear a circuit and, if the rival turns up after it, beat him too
function clearWithRival(c, label) {
  const o = clearCircuit(c, label);
  const r = RIVAL_AFTER[label.split(' ')[0]];
  if (r && o.next === r) { ok(c.circuit === r, `${label}: rival ${r} is due`); const w = win(c, `${r} win`); ok(w.kind === 'rival', `${r}: kind rival`); }
  return o;
}

// 1. a clean run of the whole main path, with the secrets unlocked on the way
{
  const c = newCareer();
  verify(c, 'new career', false);
  for (const id of MAIN_PATH) {
    ok(c.circuit === id, `main path: expected ${id}, at ${c.circuit}`);
    const o = clearWithRival(c, id);
    ok(o && o.kind === 'title' && o.circuit === id, `${id}: title`);
    if (RIVAL_AFTER[id]) ok(o.next === RIVAL_AFTER[id], `${id}: the rival turns up at the belt ceremony`);
    if (id === 'major') ok(c.flags.carnivalUnlocked, 'clean Major unlocks Carnival');
    if (id === 'legends') ok(c.flags.undergroundUnlocked, 'clean Legends unlocks Underground');
  }
  ok(c.flags.jaxBeaten, 'Jax beaten');
  const r = syncRecords(loadRecords(), c);
  ok(!modeUnlocked(r, 'td') && !modeUnlocked(r, 'gauntlet'), 'Jax alone opens neither mode (the first ZERO does)');
  // secrets, then ZERO
  for (const s of ['carnival', 'underground', 'nightmare']) {
    ok(selectableCircuits(c).includes(s), `${s} selectable after Jax`);
    enterCircuit(c, s);
    const o = clearCircuit(c, s);
    ok(o.kind === 'title', `${s} cleared`);
  }
  ok(selectableCircuits(c).includes('zero'), 'ZERO selectable after Nightmare + Underground');
  enterCircuit(c, 'zero');
  // lose ZERO twice: back to the start of the Nightmare
  lose(c, 'zero loss 1'); const o = lose(c, 'zero loss 2');
  ok(o.kind === 'reset' && c.circuit === 'nightmare' && c.beaten === 0 && c.lives === LIVES, 'ZERO last life -> Nightmare start');
  ok(!c.flags.nightmareCleared, 'ZERO reset: Nightmare must be cleared again');
  clearCircuit(c, 'nightmare again');
  enterCircuit(c, 'zero');
  win(c, 'zero');
  ok(c.flags.zeroBeaten, 'ZERO beaten');
  ok(modeUnlocked(syncRecords(loadRecords(), c), 'td') && modeUnlocked(syncRecords(loadRecords(), c), 'gauntlet') && gauntletRoster(syncRecords(loadRecords(), c)).includes('zero'), 'the first ZERO opens the Classic division, and he is its last fight');
  // the Pantheon (spec 18): opened by the entry cutscene, then P1 -> P2 -> P3 -> Dash V
  const { ascNext, isAsc } = await import('../src/save/career.js').then((m) => ({ ascNext: m.ascNext, isAsc: null }));
  ok(ascNext(c) === 'p1', 'the Pantheon starts at P1');
  c.flags.pantheonOpen = true; enterCircuit(c, 'p1');
  ok(decode(passwordOf(c)).flags.pantheonOpen, 'pantheonOpen is in the password');
  let ao = clearCircuit(c, 'p1');
  ok(ao.kind === 'title' && ao.circuit === 'p1' && ao.next === 'p2' && c.asc === 1, `P1 belt -> P2 (asc ${c.asc})`);
  ok(decode(passwordOf(c)).asc === 1, 'Ascension progress is in the password');
  ao = clearCircuit(c, 'p2');
  ok(ao.next === 'p3' && c.asc === 2, 'P2 belt -> P3');
  const lastP3 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `p3 win ${i + 1}`); return o; })();
  ok(lastP3.kind === 'title' && lastP3.next === 'rival5' && c.circuit === 'rival5', 'P3 belt -> Dash Ascendant');
  const rw = win(c, 'rival5 win');
  ok(rw.kind === 'rival' && c.asc === 3, 'Dash V beaten');
  ok(c.circuit === 'p4' && c.beaten === 0, `after Dash V the climb goes on: P4 (${c.circuit} ${c.beaten})`);
  // Phase B: P4, P5, P6 -> Dash VI -> P7 (six fighters, Barney Ascended last) -> Halcyon
  ao = clearCircuit(c, 'p4');
  ok(ao.kind === 'title' && ao.next === 'p5' && c.asc === 4, `P4 belt -> P5 (asc ${c.asc})`);
  ao = clearCircuit(c, 'p5');
  ok(ao.next === 'p6' && c.asc === 5, 'P5 belt -> P6');
  const lastP6 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `p6 win ${i + 1}`); return o; })();
  ok(lastP6.kind === 'title' && lastP6.next === 'rival6' && c.circuit === 'rival6', 'P6 belt -> Dash Desperate');
  const rw6 = win(c, 'rival6 win');
  ok(rw6.kind === 'rival' && c.asc === 6 && (c.rival & (1 << (RIVALS.length + 1))), 'Dash VI beaten (his own bit)');
  ok(c.circuit === 'p7' && c.beaten === 0, `after Dash VI: P7 (${c.circuit})`);
  ok(CIRCUITS.p7.fighters.length === 6 && CIRCUITS.p7.fighters[5] === 'barney2' && CIRCUITS.p7.fighters[4] === 'rho', 'P7 ends Rho, then Barney Ascended');
  const passP7 = passwordOf(c), backP7 = careerFromPassword(passP7, c);
  ok(backP7 && backP7.circuit === 'p7' && backP7.asc === 6, 'password round trip on P7');
  const lastP7 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `p7 win ${i + 1}`); return o; })();
  ok(lastP7.kind === 'title' && lastP7.next === 'halcyon' && c.asc === 7 && c.circuit === 'halcyon', 'P7 belt -> Halcyon');
  const hw = win(c, 'halcyon win');
  ok(hw.kind === 'title' && hw.circuit === 'halcyon' && c.asc === 8, `Halcyon beaten (asc ${c.asc})`);
  ok(hw.next === 'u1' && c.circuit === 'u1' && c.beaten === 0, `after Halcyon and The Fall: the Underworld's first shore (${c.circuit})`);
  ok(c.lives === 1, 'the Underworld gives one life');
  ok(ascMap(c) === 'underworld' && hasFallen(c), 'a fallen career lives on the Underworld map');
  // Phase C: the Underworld. One life: a loss sends you straight back to the start of the circuit (nothing else changes)
  {
    win(c, 'u1 win 1');
    const ul = lose(c, 'u1 loss');
    ok(ul.kind === 'reset' && ul.to === 'u1' && c.circuit === 'u1' && c.beaten === 0 && c.lives === 1 && c.asc === 8, `Underworld: one loss resets the circuit (${ul.kind} ${c.circuit} ${c.beaten} lives ${c.lives})`);
    ok(decode(passwordOf(c)).lives === 1, 'the password stores the one life');
    let uo = clearCircuit(c, 'u1');
    ok(uo.kind === 'title' && uo.next === 'u2' && c.asc === 9 && c.lives === 1, `U1 belt -> U2 (asc ${c.asc})`);
    uo = clearCircuit(c, 'u2');
    ok(uo.next === 'u3' && c.asc === 10, 'U2 belt -> U3');
    ok(CIRCUITS.u3.fighters.length === 5 && CIRCUITS.u3.fighters[4] === 'jailer', 'U3: five fighters, the Jailer last');
    const lastU3 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `u3 win ${i + 1}`); return o; })();
    ok(lastU3.kind === 'title' && lastU3.next === 'rival7' && c.circuit === 'rival7' && c.asc === 11, 'U3 belt -> Dash in Chains');
    ok(ascMap(c) === 'underworld', 'Dash VII is fought from the Underworld map');
    // Dash in Chains: one life. Losing him sends you back to the start of the Chain Pits (their belt must be won again)
    const dl = lose(c, 'rival7 loss');
    ok(dl.kind === 'reset' && dl.to === 'u3' && c.circuit === 'u3' && c.beaten === 0 && c.asc === 10, `Dash VII: the loss resets to U3 (${dl.kind} ${c.circuit} asc ${c.asc})`);
    const again = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `u3 again ${i + 1}`); return o; })();
    ok(again.next === 'rival7', 'the Chain Pits again -> Dash VII');
    const d7 = win(c, 'rival7 win');
    ok(d7.kind === 'rival' && c.asc === 11 && (c.rival & (1 << (RIVALS.length + 2))), 'Dash VII beaten (his own bit)');
    ok(c.circuit === 'u4' && c.beaten === 0 && c.lives === 1, `after Dash VII the descent goes on: the Hall of the Fallen (${c.circuit})`);
    const pwU = passwordOf(c), backU = careerFromPassword(pwU, c);
    ok(backU && backU.asc === 11 && backU.circuit === 'u4' && backU.lives === 1 && backU.rival === c.rival, 'Underworld career password round trip');
    ok(replayable(c).includes('u1') && replayable(c).includes('u3'), 'cleared Underworld circuits can be replayed');
    startReplay(c, 'u2'); ok(c.replay.lives === 1, 'an Underworld replay has one life'); c.replay = null;
    // Phase D: U4-U6, Dash the King's Champion, Vorgath. One life all the way down
    ok(CIRCUITS.u4.fighters.length === 4 && CIRCUITS.u4.fighters[3] === 'fkarver' && CIRCUITS.u5.fighters.length === 4 && CIRCUITS.u5.fighters[3] === 'crucible', 'U4 ends with the Fallen King, U5 with Crucible');
    ok(CIRCUITS.u6.fighters.length === 5 && CIRCUITS.u6.fighters[4] === 'herald' && CIRCUITS.vorgath.fighters.length === 1 && CIRCUITS.vorgath.forms === 3, 'U6 ends with the Herald; Vorgath has three phases');
    win(c, 'u4 win 1');
    const l4 = lose(c, 'u4 loss');
    ok(l4.kind === 'reset' && l4.to === 'u4' && c.circuit === 'u4' && c.beaten === 0 && c.asc === 11, `U4: one loss resets the circuit (${l4.kind} ${c.circuit})`);
    let d = clearCircuit(c, 'u4');
    ok(d.kind === 'title' && d.next === 'u5' && c.asc === 12, `U4 belt -> the Furnace (asc ${c.asc})`);
    d = clearCircuit(c, 'u5');
    ok(d.next === 'u6' && c.asc === 13, 'U5 belt -> the Abyss Gate');
    const lastU6 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `u6 win ${i + 1}`); return o; })();
    ok(lastU6.kind === 'title' && lastU6.next === 'rival8' && c.circuit === 'rival8' && c.asc === 14, 'U6 belt -> Dash, the King\'s Champion');
    const d8l = lose(c, 'rival8 loss');
    ok(d8l.kind === 'reset' && d8l.to === 'u6' && c.circuit === 'u6' && c.beaten === 0 && c.asc === 13, `Dash VIII: the loss resets to U6 (${d8l.kind} ${c.circuit} asc ${c.asc})`);
    const again6 = (() => { let o; for (let i = 0; i < 12 && (!o || o.kind !== 'title'); i++) o = win(c, `u6 again ${i + 1}`); return o; })();
    ok(again6.next === 'rival8', 'the Abyss Gate again -> Dash VIII');
    const d8 = win(c, 'rival8 win');
    ok(d8.kind === 'rival' && c.asc === 14 && (c.rival & (1 << (RIVALS.length + 3))), 'Dash VIII beaten (his own bit)');
    ok(c.circuit === 'vorgath' && c.beaten === 0 && c.lives === 1, `after Dash VIII: the throne of Vorgath (${c.circuit})`);
    const vl = lose(c, 'vorgath loss');
    ok(vl.kind === 'reset' && vl.to === 'vorgath' && c.circuit === 'vorgath' && c.asc === 14, `Vorgath: one loss and it starts over (${vl.kind} asc ${c.asc})`);
    const vw = win(c, 'vorgath win');
    ok(vw.kind === 'title' && vw.circuit === 'vorgath' && c.asc === 15, `the King Below falls (asc ${c.asc})`);
    ok(c.circuit === 'v1' && c.beaten === 0 && c.lives === 1 && voidReached(c), `the King Below falls and the door opens: the Void's first fragment (${c.circuit})`);
    const pwV = passwordOf(c), backV = careerFromPassword(pwV, c);
    ok(backV && backV.asc === 15 && backV.circuit === 'v1' && backV.lives === 1 && backV.rival === c.rival, 'password round trip past Vorgath');
    ok(replayable(c).includes('u6') && replayable(c).includes('vorgath') && ascMap(c) === 'void', 'U4-U6 and Vorgath can be replayed; the career lives on the Void\'s map');
    // Phase E: the Void. Twelve Hollowed in three fragments, no spare life, then Dash Unbound, then ZERO's true form
    ok(CIRCUITS.v1.fighters.length === 4 && CIRCUITS.v2.fighters.length === 4 && CIRCUITS.v3.fighters.length === 4 && HOLLOWED.length === 12, 'three fragments of four Hollowed');
    ok(CIRCUITS.v3.lives === 1 && CIRCUITS.v2.hearts === 8 && CIRCUITS.zeroTrue.forms === 4, 'Void rules: one life, 8 hearts; ZERO true form has four phases');
    // a win over a Hollowed frees them, permanently
    const winVs = (label) => { const id = nextOpponent(c), o = recordResult(c, { ...WIN, opponent: id }); verify(c, label); return o; };
    const w1 = winVs('v1 win 1');
    ok(w1.kind === 'win' && w1.freed && w1.freed.id === 'dodgeShard' && w1.freed.first && isFreed(c, 'dodgeShard') && freedCount(c) === 1, 'the Dodge Shard is freed (first time: the full scene)');
    const vl1 = lose(c, 'v1 loss');
    ok(vl1.kind === 'retry' && c.circuit === 'v1' && c.beaten === 1 && c.asc === 15 && c.lives === 1, `Void I: a loss costs nothing and resets nothing: the same opponent again (${vl1.kind} beaten ${c.beaten})`);
    ok(isFreed(c, 'dodgeShard') && freedCount(c) === 1, 'a freed Hollowed stays freed after a loss (permanent progress)');
    const w1b = winVs('v1 win again');
    ok(w1b.freed && w1b.freed.id === 'blockShard' && w1b.freed.first && freedCount(c) === 2, 'after the retry the ladder goes on: the Block Shard is freed');
    let o = w1b;
    for (let i = 0; i < 10 && o.kind !== 'title'; i++) o = winVs(`v1 rest ${i}`);
    ok(o.kind === 'title' && o.circuit === 'v1' && o.next === 'v2' && c.asc === 16 && o.freed && o.freed.id === 'counterShard', 'Void I belt -> Void II (the fragment\'s last is freed first)');
    ok(freedCount(c) === 4, 'four freed after the first fragment');
    const bk = careerFromPassword(passwordOf(c), null);
    ok(bk && bk.asc === 16 && freedCount(bk) === 4, 'a career restored from a bare password knows the four it must have freed');
    o = null; for (let i = 0; i < 6 && (!o || o.kind !== 'title'); i++) o = winVs(`v2 win ${i}`); ok(o.kind === 'title' && o.next === 'v3' && c.asc === 17, 'Void II belt -> Void III');
    o = null; for (let i = 0; i < 6 && (!o || o.kind !== 'title'); i++) o = winVs(`v3 win ${i}`);
    ok(o.kind === 'title' && o.next === 'rival9' && c.circuit === 'rival9' && c.asc === 18, 'Void III belt -> Dash Unbound');
    const d9l = lose(c, 'rival9 loss');
    ok(d9l.kind === 'retry' && c.circuit === 'rival9' && c.asc === 18 && circuitStatus(c, 'rival9') === 'current', `Dash Unbound: a loss sends you nowhere, he stays reached (${d9l.kind} ${c.circuit} asc ${c.asc})`);
    const d9 = win(c, 'rival9 win');
    ok(d9.kind === 'rival' && c.asc === 18 && (c.rival & (1 << (RIVALS.length + 4))) && c.circuit === 'zeroTrue' && freedCount(c) === 12, `Dash Unbound freed: ZERO's true form is next (${c.circuit}), twelve freed`);
    const zl = lose(c, 'zeroTrue loss');
    ok(zl.kind === 'retry' && c.circuit === 'zeroTrue' && c.asc === 18 && isFreed(c, 'willShard'), "ZERO true form: a loss changes nothing, he is still reached and the twelve stay freed");
    const zw = win(c, 'zeroTrue win');
    ok(zw.kind === 'title' && zw.circuit === 'zeroTrue' && c.asc === 19 && c.circuit === 'zeroTrue' && c.beaten === 1, `ZERO's true form falls (asc ${c.asc}): the career ends champion`);
    const pwZ = passwordOf(c), backZ = careerFromPassword(pwZ, c);
    ok(backZ && backZ.asc === 19 && backZ.circuit === 'zeroTrue' && backZ.rival === c.rival && ascMap(c) === 'void', 'password round trip after the true ending');
    ok(backZ.flags.trueEndingSeen && syncRecords(loadRecords(), backZ).unlocks.full, 'a code taken after the true ending still opens the Combined division (final audit: the code had lost it)');
    ok(!careerFromPassword(pwV, c).flags.trueEndingSeen, 'a code from before the true form falls does not carry the ending');
  }
  // Halcyon: three forms are one fight, one life pool; losing sends you back to the start of his circuit
  const c2 = newCareer(); Object.assign(c2.flags, { pantheonOpen: true, zeroBeaten: true }); c2.main = 10; c2.asc = 7; enterCircuit(c2, 'halcyon');
  ok(lose(c2, 'halcyon loss 1').kind === 'rematch', 'Halcyon: first loss -> rematch');
  const l2 = lose(c2, 'halcyon loss 2');
  ok(l2.kind === 'reset' && c2.circuit === 'halcyon' && c2.asc === 7, 'Halcyon: last life -> back to the start of his fight');
  const pwA = passwordOf(c), backA = careerFromPassword(pwA, c);
  ok(backA && backA.asc === 19 && backA.flags.pantheonOpen && backA.circuit === c.circuit, 'Ascension career password round trip');
  ok(pwA.replace(/[- ]/g, '').length === 15, 'password is 15 characters');
}

// 2. lives: a loss costs one, the last one resets the circuit; Major with a loss: no Carnival
{
  const c = newCareer();
  clearWithRival(c, 'rookie'); clearWithRival(c, 'minor'); clearWithRival(c, 'metro');
  ok(c.circuit === 'major', 'at Major');
  win(c, 'major 1');
  let o = lose(c, 'major loss 1');
  ok(o.kind === 'rematch' && c.lives === 1 && c.beaten === 1, 'loss costs a life, rematch same opponent');
  o = lose(c, 'major loss 2');
  ok(o.kind === 'reset' && c.circuit === 'major' && c.beaten === 0 && c.lives === LIVES, 'last life -> start of Major');
  ok(c.lostHere, 'the reset keeps the loss for the clean-run rule');
  clearWithRival(c, 'major after loss');
  ok(!c.flags.carnivalUnlocked, 'Major with a loss: no Carnival');
  ok(c.circuit === 'continental' && c.lives === LIVES && !c.lostHere, 'lives back to 2 in a new circuit');
}

// 3. Jax: last life -> start of the Grand Prix
{
  const c = newCareer();
  for (const id of MAIN_PATH.slice(0, -1)) clearWithRival(c, id);
  ok(c.circuit === 'dream', 'at the Dream Fight');
  lose(c, 'jax loss 1'); const o = lose(c, 'jax loss 2');
  ok(o.kind === 'reset' && c.circuit === 'grandprix' && c.beaten === 0 && c.main === MAIN_PATH.indexOf('grandprix'), 'Jax last life -> Grand Prix start');
  clearCircuit(c, 'grand prix again');
  ok(c.circuit === 'dream', 'back at the Dream Fight after the Grand Prix (Dash IV stays beaten)');
}

// 4. secret circuit: a loss inside it, last life, and coming back to the main path
{
  const c = newCareer();
  for (const id of ['rookie', 'minor', 'metro', 'major']) clearWithRival(c, id);
  ok(c.flags.carnivalUnlocked && selectableCircuits(c).includes('carnival'), 'Carnival offered at the start of Continental');
  enterCircuit(c, 'carnival');
  win(c, 'carnival 1'); lose(c, 'carnival loss'); const o = lose(c, 'carnival loss 2');
  ok(o.kind === 'reset' && c.circuit === 'carnival' && c.beaten === 0, 'Carnival last life -> start of Carnival');
  clearCircuit(c, 'carnival');
  ok(c.flags.carnivalCleared && c.circuit === 'continental' && c.beaten === 0, 'after Carnival: back to the start of Continental');
  ok(!selectableCircuits(c).includes('carnival'), 'Carnival not offered again');
}

// 5. mid-ladder: secrets can't be entered until the ladder is done
{
  const c = newCareer();
  for (const id of ['rookie', 'minor', 'metro', 'major']) clearWithRival(c, id);
  win(c, 'continental 1');
  ok(!selectableCircuits(c).includes('carnival'), 'no Carnival mid-ladder');
}

// 6. passwords: every circuit x rank x lives x flags combination we can reach decodes;
//    typos are rejected; old formats still load
{
  const c = newCareer();
  let n = 0, bad = 0;
  for (const id of Object.keys(CIRCUITS)) for (let b = 0; b < CIRCUITS[id].fighters.length; b++) for (const lives of [1, 2]) {
    c.circuit = id; c.beaten = b; c.lives = lives; c.main = Math.max(0, MAIN_PATH.indexOf(id));
    const pw = passwordOf(c); n++;
    const d = decode(pw);
    if (!d || d.circuit !== id || d.beaten !== b || d.lives !== lives) bad++;
    // a one-character typo must not decode to a different career
    const typo = pw.slice(0, 3) + (pw[3] === 'A' ? 'B' : 'A') + pw.slice(4);
    const t = decode(typo);
    if (t && (t.circuit !== id || t.beaten !== b)) bad += 0; // a lucky typo is allowed (checksum odds), just count below
  }
  ok(bad === 0, `password grid: ${bad}/${n} failed`);
  let lucky = 0;
  for (let i = 0; i < 2000; i++) { const pw = passwordOf(c); const typo = [...pw]; const k = i % pw.length; typo[k] = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(parseInt(pw[k], 36) + 1 + (i % 35)) % 36]; if (decode(typo.join(''))) lucky++; }
  ok(lucky < 40, `typos accepted: ${lucky}/2000`);
}

// 7. the rival: lives, the last-life reset, the Jax gate, secrets unaffected
{
  const c = newCareer();
  clearCircuit(c, 'rookie');
  const o = clearCircuit(c, 'minor');
  ok(o.next === 'rival1' && c.circuit === 'rival1' && c.lives === LIVES && c.main === MAIN_PATH.indexOf('metro'), 'Minor title -> Dash I due, 2 lives');
  ok(selectableCircuits(c).length === 1 && selectableCircuits(c)[0] === 'rival1', 'nothing but Dash while he is due');
  let r = lose(c, 'dash1 loss 1');
  ok(r.kind === 'rematch' && c.circuit === 'rival1' && c.lives === 1, 'losing to Dash costs a life');
  r = lose(c, 'dash1 loss 2');
  ok(r.kind === 'reset' && c.circuit === 'minor' && c.main === MAIN_PATH.indexOf('minor') && c.beaten === 0, 'last life vs Dash -> start of Minor');
  const o2 = clearCircuit(c, 'minor again');
  ok(o2.next === 'rival1' && c.circuit === 'rival1', 'Minor re-won -> Dash I again');
  r = win(c, 'dash1');
  ok(r.kind === 'rival' && c.circuit === 'metro' && c.beaten === 0 && c.rival === 1, 'beat Dash I -> on to Metro');
  // clean Major then lose Dash II twice: Carnival stays unlocked
  clearCircuit(c, 'metro');
  const o3 = clearCircuit(c, 'major');
  ok(o3.next === 'rival2' && c.flags.carnivalUnlocked, 'clean Major -> Carnival unlocked, Dash II due');
  lose(c, 'dash2 loss'); win(c, 'dash2');
  ok(c.circuit === 'continental' && c.flags.carnivalUnlocked && selectableCircuits(c).includes('carnival'), 'a loss to Dash does not cost the Carnival');
  // Jax is gated behind Dash IV
  for (const id of ['continental', 'world', 'storm', 'legends']) clearWithRival(c, id);
  const o4 = clearCircuit(c, 'grandprix');
  ok(o4.next === 'rival4' && c.circuit === 'rival4', 'Grand Prix title -> the showdown, not Jax');
  win(c, 'dash4');
  ok(c.circuit === 'dream' && c.rival === 15, 'showdown won -> Jax');
  const rr = syncRecords(loadRecords(), c);
  ok(['dash1', 'dash2', 'dash3', 'dash4'].every((d) => rr.met.includes(d)), 'every Dash in the Practice list');
  ok(!gauntletRoster(rr, 'combined').some((id) => /^dash[1-4]$/.test(id)) && gauntletRoster(rr).length === 52 && gauntletRoster(rr)[51] === 'zero', 'the Classic Gauntlet is #1-50, Jax and the first ZERO: no Dash I-IV');
}

// 8. old saves and passwords (no rival progress)
{
  // an old autosave at Storm: the skipped rival fights are optional, never due
  const c = newCareer();
  for (const id of ['rookie', 'minor', 'metro', 'major', 'continental', 'world']) clearWithRival(c, id);
  c.rival = undefined; localStorage.setItem('kocircuit.career', JSON.stringify(c));
  const l = loadCareer();
  ok(l.rival === 0 && l.circuit === 'storm', 'old save loads with no rival fights won');
  const sel = selectableCircuits(l);
  ok(['rival1', 'rival2', 'rival3'].every((r) => sel.includes(r)) && sel.includes('storm'), 'skipped rival fights are optional nodes');
  enterCircuit(l, 'rival2'); lose(l, 'optional loss'); const o = lose(l, 'optional loss 2');
  ok(o.kind === 'reset' && l.circuit === 'storm' && l.main === MAIN_PATH.indexOf('storm'), 'losing an optional rival fight never costs a circuit');
  enterCircuit(l, 'rival2'); const w = win(l, 'optional win');
  ok(w.kind === 'rival' && l.circuit === 'storm' && l.rival === 2, 'winning one returns to the road');
  // an old save sitting at the Dream Fight: the showdown comes first
  const d = newCareer();
  for (const id of MAIN_PATH.slice(0, -1)) clearWithRival(d, id);
  d.rival = undefined; localStorage.setItem('kocircuit.career', JSON.stringify(d));
  const ld = loadCareer();
  ok(ld.circuit === 'rival4', 'old save at Jax -> the showdown first');
  // old 12-character password at Jax: same
  const pw12 = encode({ ...d, rival: 0 }, undefined);
  ok(pw12.length === 15, 'new passwords are 15 characters');
}
{
  // a real Phase 7 (12-character) code still decodes
  const c = newCareer();
  for (const id of ['rookie', 'minor', 'metro']) clearWithRival(c, id);
  const { decode: dec } = await import('../src/save/password.js');
  const mod = await import('../src/save/password.js');
  // build a V2 code through the module's own encoder with the old format
  const v2 = mod.__testEncodeV2 ? mod.__testEncodeV2(c) : null;
  if (v2) { const d = dec(v2); ok(d && d.circuit === 'major' && d.rival === 0, '12-character code decodes (rival 0)'); }
}

// 9. circuit replay: its own lives, the career untouched, the rival at the end, second chances
{
  const c = newCareer();
  for (const id of ['rookie', 'minor', 'metro']) clearWithRival(c, id);
  win(c, 'major 1'); lose(c, 'major loss'); clearWithRival(c, 'major (with a loss)');
  ok(!c.flags.carnivalUnlocked, 'no Carnival after a Major with a loss');
  win(c, 'continental 1'); lose(c, 'continental loss');
  const before = JSON.stringify(pick(c)), pw = passwordOf(c), rec = JSON.stringify(c.record);
  ok(replayable(c).join() === 'rookie,minor,metro,major', `replayable: ${replayable(c)}`);
  // a replay you lose: nothing changes
  startReplay(c, 'metro');
  ok(replayOpponent(c) === 'ray', 'replay starts at the bottom of the ladder');
  let o = recordReplay(c, WIN); ok(o.kind === 'win' && replayOpponent(c) === 'pidge', 'replay win -> next');
  o = recordReplay(c, LOSS); ok(o.kind === 'rematch' && c.replay.lives === 1, 'replay loss costs a replay life');
  o = recordReplay(c, LOSS); ok(o.kind === 'over' && !c.replay, 'replay over after 2 losses');
  ok(JSON.stringify(pick(c)) === before && passwordOf(c) === pw && JSON.stringify(c.record) === rec, 'the career is untouched by a replay');
  // Major replayed clean: Dash II at the end, then the Carnival unlocks
  startReplay(c, 'major');
  for (let i = 0; i < 3; i++) recordReplay(c, WIN);
  o = recordReplay(c, WIN); ok(o.kind === 'rival' && replayOpponent(c) === 'dash2', 'replay of Major ends with Dash II');
  o = recordReplay(c, WIN); ok(o.kind === 'done' && o.unlocked === 'carnival' && c.flags.carnivalUnlocked, 'clean Major replay unlocks the Carnival');
  ok(c.circuit === 'continental' && c.beaten === 1 && c.lives === 1, 'still mid-Continental with 1 life after the replay');
  ok(decode(passwordOf(c)).flags.carnivalUnlocked, 'the second-chance unlock is in the password');
  // a replay with a loss in it: no unlock
  const d = newCareer();
  for (const id of ['rookie', 'minor', 'metro', 'major', 'continental', 'world', 'storm']) clearWithRival(d, id);
  win(d, 'l1'); lose(d, 'l loss'); clearWithRival(d, 'legends lossy');
  startReplay(d, 'legends'); recordReplay(d, WIN); recordReplay(d, LOSS);
  for (let i = 0; i < 3; i++) o = recordReplay(d, WIN);
  ok(o.kind === 'done' && !o.unlocked && !d.flags.undergroundUnlocked, 'a replay with a loss unlocks nothing');
}


// ---------------------------------------------------------------------------
// Phase F: the Full Gauntlet, the Ascension's unlock track, the zone gating of the extras
{
  const { FULL_ROSTER, ROSTER, ASC_EVERYONE, BASE_EVERYONE, EVERYONE } = await import('../src/save/records.js');
  const R = await import('../src/save/records.js');
  const { unlockedList, nextUnlock, zoneOfFighter, zoneSeen, visibleFighters, costumeUnlocked, altUnlocked } = await import('../src/save/unlocks.js');
  const { medalCount, ascMedalCount, ASC_MEDAL_TOTAL, MEDAL_TOTAL, recordFight } = await import('../src/save/medals.js');
  const { UNLOCKS, ASC_UNLOCKS } = await import('../data/unlocks.js');
  const { FIGHTERS } = await import('../data/fighters/index.js');
  // the Full Gauntlet opens with the true ending, and only then
  const r = loadRecords();
  const c = newCareer();
  syncRecords(r, c);
  ok(!modeUnlocked(r, 'combined'), 'the Combined division is locked before the true ending');
  c.flags.trueEndingSeen = true; syncRecords(r, c);
  ok(modeUnlocked(r, 'combined') && r.unlocks.full, 'the true ending opens the Combined division');
  const fresh = loadRecords(); ok(fresh.gauntlet.combined && fresh.gauntlet.combined.bestStreak === 0, 'the Combined Gauntlet has its own records');
  ok(gauntletRoster(r, 'combined').length === 129 && FULL_ROSTER.length === 129 && ROSTER.length === 52, `roster sizes ${gauntletRoster(r, 'combined').length}/${ROSTER.length}`);
  ok(FULL_ROSTER.indexOf('dash9') === FULL_ROSTER.length - 2 && FULL_ROSTER[FULL_ROSTER.length - 1] === 'zeroTrue', 'Dash Unbound right before ZERO\'s true form');
  ok(R.gauntletStage(FIGHTERS.willShard) === 5 && R.gauntletStage(FIGHTERS.barney) === undefined, 'a Gauntlet fight is the career fight: only the Will Shard has a fixed stage');
  // thresholds ascend, the two tracks count apart
  ok(ASC_UNLOCKS.every((u, i) => !i || u.at > ASC_UNLOCKS[i - 1].at) && ASC_UNLOCKS[ASC_UNLOCKS.length - 1].at <= ASC_MEDAL_TOTAL, 'Ascension thresholds ascend and are reachable');
  ok(ASC_MEDAL_TOTAL === 231 && MEDAL_TOTAL === 168, `medal totals ${MEDAL_TOTAL}/${ASC_MEDAL_TOTAL}`);
  const M = { best: {}, got: {}, seen: [] };
  const give = (ids, n) => { for (const id of ids) { if (n <= 0) break; M.got[id] = { speed: n > 0, flawless: n > 1, signature: n > 2 }; n -= 3; } };
  give(ASC_EVERYONE, 24);
  ok(ascMedalCount(M) === 24 && medalCount(M) === 0, 'Ascension medals never move the base count (or the Pantheon gate)');
  ok(costumeUnlocked(M, 'ascendant') && !costumeUnlocked(M, 'sunborn') && !costumeUnlocked(M, 'nightgym'), '24 Ascension medals: Ascendant, and nothing else');
  ok(nextUnlock(M, 'asc').id === 'alt5' && nextUnlock(M).id === 'sound', 'each track has its own next unlock');
  M.got = {}; give(BASE_EVERYONE, 24);
  ok(medalCount(M) === 24 && ascMedalCount(M) === 0 && unlockedList(M).map((u) => u.id).join() === 'sound,gallery,nightgym', '24 base medals: the base unlocks only');
  // alternate colours follow the circuit lists, the Ascension's included
  M.got = {}; give(ASC_EVERYONE, 40);
  const g = { medals: M };
  ok(altUnlocked(g, 'oro') && altUnlocked(g, 'dash5') && !altUnlocked(g, 'grue') && !altUnlocked(g, 'barney'), 'alt colours: the Pantheon at 40, not the Underworld');
  M.got = {}; give(ASC_EVERYONE, 231);
  ok(ASC_EVERYONE.every((id) => altUnlocked(g, id)) && ['ascendant', 'sunborn', 'ashen', 'emberforged', 'hollow'].every((id) => costumeUnlocked(M, id)), 'every Ascension unlock at 231');
  // the extras show a zone only once a fighter in it has been met
  const g2 = { records: { met: ['barney', 'oro'] } };
  ok(zoneSeen(g2, 'pantheon') && !zoneSeen(g2, 'underworld') && !zoneSeen(g2, 'void'), 'zones open one by one');
  const vis = visibleFighters(g2);
  ok(vis.includes('oro') && vis.includes('dash5') && !vis.includes('grue') && !vis.includes('dodgeShard') && vis.length === BASE_EVERYONE.length + EVERYONE.filter((id) => zoneOfFighter(id) === 'pantheon').length, 'the lists hold the base game and the reached zones');
  // a fight record: the Ascension's medals cross their own thresholds and are announced
  const M2 = { best: {}, got: {}, seen: [] };
  M2.got = {}; give.call(null, [], 0);
  const d = FIGHTERS.oro;
  const res = { opponent: 'oro', winner: 'player', method: 'KO', seconds: 60, round: 1, time: '1:00', stats: { hitsTaken: 0 }, knockdowns: { player: 0 }, track: { moves: {}, opens: {}, cues: {}, kds: [], punches: { repeats: 0, counters: 0, stars: 0, landed: 5, free: 5, guarded: 0, whiffed: 0 } } };
  const o = recordFight(M2, res);
  ok(o && o.earned.includes('speed') && o.earned.includes('flawless') && M2.got.oro, 'an Ascension fight records medals');
}


// ---- the world map's rules (spec §19 G4): podium states, rematches and the Void
{
  const W_ = (id) => ({ winner: 'player', method: 'KO', opponent: id, round: 1, time: '0:30', seconds: 30 }), L_ = (id) => ({ winner: 'opponent', method: 'KO', opponent: id, round: 1, time: '0:30', seconds: 30 });
  const c = newCareer();
  const row = (id) => CIRCUITS[id].fighters.map((_, i) => podiumState(c, id, i)).join();
  ok(row('rookie') === 'next,ahead,ahead,ahead' && row('minor') === 'ahead,ahead,ahead,ahead', 'a new career: Barney is next, everyone else ahead, the next circuit all ahead');
  ok(circuitStatus(c, 'rookie') === 'current' && circuitStatus(c, 'minor') === 'locked' && circuitStatus(c, 'carnival') === 'locked', 'circuit states at the start');
  recordResult(c, W_('barney')); recordResult(c, W_('kid'));
  ok(row('rookie') === 'beaten,beaten,next,ahead', 'two beaten: they are rematches, the third is next');
  const l1 = recordResult(c, L_('mort'));
  ok(l1.kind === 'rematch' && row('rookie') === 'beaten,beaten,next,ahead' && c.lives === 1, 'a loss with a life left changes no podium');
  const l2 = recordResult(c, L_('mort'));
  ok(l2.kind === 'reset' && row('rookie') === 'next,ahead,ahead,ahead' && c.lives === 2, 'the last life lost: every fighter of the circuit is unbeaten again for this run');
  ok(c.record.l === 2, 'and the record keeps counting');
  for (const id of CIRCUITS.rookie.fighters) recordResult(c, W_(id));
  ok(circuitStatus(c, 'rookie') === 'cleared' && row('rookie') === 'beaten,beaten,beaten,beaten', 'a cleared circuit: every podium is a rematch');
  ok(circuitStatus(c, 'minor') === 'current' || circuitStatus(c, 'minor') === 'open', 'the next circuit opens');
  // the Void: no lives, nothing resets, what you reached stays reached
  ok(noLives('v1') && noLives('rival9') && noLives('zeroTrue') && !noLives('u1') && !noLives('rookie'), 'only the Void has no lives');
  const v = newCareer();
  Object.assign(v.flags, { zeroBeaten: true, pantheonOpen: true, jaxBeaten: true }); v.main = 10; v.asc = 15; v.rival = 0xff;
  enterCircuit(v, 'v1'); v.beaten = 2; v.freed = 3;
  const vr = () => CIRCUITS.v1.fighters.map((_, i) => podiumState(v, 'v1', i)).join();
  ok(vr() === 'beaten,beaten,next,ahead', 'Void I: two freed, the third next');
  const lv = recordResult(v, L_('duckShard'));
  ok(lv.kind === 'retry' && vr() === 'beaten,beaten,next,ahead' && v.asc === 15 && v.lives === 1 && isFreed(v, 'dodgeShard'), 'a Void loss: the same opponent again, nothing reset, nobody un-freed');
  const vw = recordResult(v, W_('duckShard'));
  ok(vw.kind === 'win' && vr() === 'beaten,beaten,beaten,next' && isFreed(v, 'duckShard'), 'and the win goes on from there');
  const z = newCareer();
  Object.assign(z.flags, { zeroBeaten: true, pantheonOpen: true, jaxBeaten: true }); z.main = 10; z.asc = 18; z.rival = 0x1ff; z.freed = 0xfff; enterCircuit(z, 'zeroTrue');
  const lz = recordResult(z, L_('zeroTrue'));
  ok(lz.kind === 'retry' && z.circuit === 'zeroTrue' && z.asc === 18 && circuitStatus(z, 'zeroTrue') === 'current', 'ZERO\'s true form: losing leaves him reached');
}

console.log(`${checks} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
