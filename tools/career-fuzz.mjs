// Soft-lock hunt (final audit): random careers from a new save to the true ending, through the real career rules (src/save/career.js).
//   node tools/career-fuzz.mjs [--runs 400] [--seed 1]
// Every run plays the way the world map lets you: fight the next opponent (win with a chance that differs from run to run, from 55% to 97%), and when the
// circuit's ladder is done pick any circuit `selectableCircuits` offers (secrets, ZERO, the Pantheon once the sky is open: the entry cutscene opens it).
// After every step, and at random in between (a password restored on the spot, the way a player picks a save back up), it checks:
//   - the password decodes to the same career (circuit, rank, lives, flags, rival progress, Ascension progress)
//   - there is always a way forward: a next opponent, or a circuit to pick, or the true ending
//   - lives, ranks and the Void's rules hold (a Void loss resets nothing; the Underworld has one life; the base game two)
//   - the mode unlocks follow the career, and the Combined division opens with the true ending, also after a restore
//   - the run reaches the true ending (asc 19) in every run that is given enough fights
import { webcrypto } from 'node:crypto';
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i] ?? null, get length() { return store.size; } };
void webcrypto;
const { newCareer, recordResult, careerFromPassword, passwordOf, nextOpponent, selectableCircuits, enterCircuit, ladder, ascNext, isFreed, noLives, circuitStatus, replayable, startReplay, recordReplay, replayOpponent } = await import('../src/save/career.js');
const { loadRecords, syncRecords, modeUnlocked } = await import('../src/save/records.js');
const { MAIN_PATH, ASC_PATH, livesOf, zoneOf, HOLLOWED } = await import('../data/circuits.js');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
const RUNS = opt('--runs', 400);
let seed = opt('--seed', 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = (c) => ({ circuit: c.circuit, main: c.main, beaten: c.beaten, lives: c.lives, lostHere: !!c.lostHere, flags: Object.keys(c.flags).filter((k) => c.flags[k] === true && k !== 'trueEndingSeen').sort().join(), rival: c.rival || 0, asc: c.asc || 0 });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let fails = 0, checks = 0;
const bad = [];
const ok = (cond, msg) => { checks++; if (!cond && bad.length < 12) bad.push(msg); if (!cond) fails++; };

let finished = 0, stuck = 0, restores = 0, maxSteps = 0, secrets = 0, replays = 0;
for (let run = 0; run < RUNS; run++) {
  let c = newCareer();
  const pw = 0.55 + rnd() * 0.42;
  let steps = 0, done = false;
  const tag = () => `run ${run} (win ${pw.toFixed(2)}) step ${steps} at ${c.circuit} #${c.beaten} lives ${c.lives} asc ${c.asc}`;
  while (steps++ < 6000 && !done) {
    const opp = nextOpponent(c);
    if (opp) {
      const won = rnd() < pw;
      const before = { circuit: c.circuit, beaten: c.beaten, lives: c.lives, asc: c.asc };
      const o = recordResult(c, { winner: won ? 'player' : 'opponent', method: 'KO', opponent: opp });
      ok(!!o && typeof o.kind === 'string', `${tag()}: no result`);
      if (!won && noLives(before.circuit)) ok(o.kind === 'retry' && c.circuit === before.circuit && c.beaten === before.beaten && c.asc === before.asc, `${tag()}: a Void loss changed something (${o.kind})`);
      if (!won && zoneOf(before.circuit) === 'underworld') ok(c.lives >= 1 && livesOf(before.circuit) === 2, `${tag()}: Underworld lives`);
      if (HOLLOWED.includes(opp) && won) ok(isFreed(c, opp), `${tag()}: ${opp} not freed after a win`);
    } else {
      // nobody left in this ladder: the map offers somewhere to go
      const open = () => selectableCircuits(c).filter((id) => ['current', 'open'].includes(circuitStatus(c, id))); // (the map marks a cleared circuit cleared: nobody walks into it for a title)
      let sel = open();
      const a = ascNext(c);
      if (a && c.flags.zeroBeaten && !c.flags.pantheonOpen) { c.flags.pantheonOpen = true; sel = open(); } // (the entry cutscene opens the sky; the medal gate is the map's, tested apart)
      // nothing open: a career that lost a fight in Major or Legends has no Carnival or Underground (and ZERO wants the Underground): the fight tapes'
      // second chance (spec §5: replay it with no fight lost) is the way back
      if (!sel.length && c.asc < ASC_PATH.length) {
        const again = [['major', 'carnivalUnlocked'], ['legends', 'undergroundUnlocked']].filter(([id, flag]) => !c.flags[flag] && replayable(c).includes(id));
        if (again.length) {
          const [id] = again[Math.floor(rnd() * again.length)], here = pick(c);
          startReplay(c, id);
          let guard = 0, o;
          while (c.replay && guard++ < 60) { const x = replayOpponent(c); o = recordReplay(c, { winner: rnd() < pw ? 'player' : 'opponent', method: 'KO', opponent: x }); }
          ok(c.circuit === here.circuit && c.beaten === here.beaten && c.lives === here.lives && c.asc === here.asc, `${tag()}: a replay moved the career (${JSON.stringify(here)} -> ${JSON.stringify(pick(c))})`);
          replays++; void o;
          continue;
        }
      }
      ok(sel.length > 0 || c.asc >= ASC_PATH.length, `${tag()}: SOFT LOCK: no next opponent and nowhere to go (flags ${Object.keys(c.flags).filter((k) => c.flags[k] === true)}; selectable ${selectableCircuits(c)}; statuses ${selectableCircuits(c).map((id) => id + ':' + circuitStatus(c, id))})`);
      if (!sel.length) { stuck++; break; }
      const to = sel[Math.floor(rnd() * sel.length)];
      if (['carnival', 'underground'].includes(to)) secrets++;
      enterCircuit(c, to, true);
    }
    ok(c.lives >= 1 && c.lives <= livesOf(c.circuit) && c.beaten >= 0 && c.beaten <= ladder(c).length, `${tag()}: lives ${c.lives} / rank ${c.beaten} out of range`);
    const code = passwordOf(c), back = careerFromPassword(code, c);
    ok(back && same(pick(back), pick(c)), `${tag()}: password ${code} did not round-trip\n  had ${JSON.stringify(pick(c))}\n  got ${back && JSON.stringify(pick(back))}`);
    const R = syncRecords(loadRecords(), c);
    ok(!c.flags.zeroBeaten || modeUnlocked(R, 'td'), `${tag()}: the first ZERO is down but Title Defense is shut`);
    if (rnd() < 0.04 && back) { c = back; restores++; c.flags.pantheonOpen = c.flags.pantheonOpen || c.asc > 0; } // (picked back up from a password; nothing else carried over)
    if (c.asc >= ASC_PATH.length) {
      // ZERO's true form is down: the end. A code taken now still opens the Combined division
      const r2 = syncRecords(loadRecords(), careerFromPassword(passwordOf(c), c));
      ok(r2.unlocks.full && r2.unlocks.void, `${tag()}: the true ending did not survive a password (Combined ${!!r2.unlocks.full})`);
      done = true;
    }
  }
  maxSteps = Math.max(maxSteps, steps);
  if (done) finished++; else ok(false, `run ${run} (win ${pw.toFixed(2)}) never reached the true ending (at ${c.circuit} asc ${c.asc} after ${steps} steps)`);
}
console.log(`${RUNS} careers: ${finished} reached the true ending (${secrets} secret circuits entered, ${restores} restores from a password, ${replays} second-chance replays, longest ${maxSteps} steps), ${stuck} stuck`);
for (const b of bad) console.log('  FAIL', b);
console.log(`${checks} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
