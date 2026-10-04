// Supers and their golden moments (spec §4; data/fighters/super.js), through the real fight code:
//   node tools/golden-test.mjs [ids...] [--td]
// For every super of every opponent (each pick of a super that has several), the super is started and:
//   1. armor: a plain jab into it (not its golden moment) clanks: no damage, no stun, the super goes on
//   2. a wrong punch on the golden frames (the other height, a jab where a star is needed) clanks too
//   3. the perfect-play bot lands its golden moment: a fighter goes down (health to zero); one of the six big bosses is left
//      wide open (a long stun, his health never emptied by it) and the rest of the super never comes
//   4. a golden moment found for the first time fills in its scouting entry
// Exit code 1 on a failure.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { PT } from '../src/fight/player.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { TD_LISTS, remixed } from '../data/fighters/titleDefense.js';
import { supersOf, superKey, chainsOf, hitOf, keptSuper } from '../data/fighters/super.js';
import { scoutStore } from '../src/save/scouting.js';

const args = process.argv.slice(2);
const TD = args.includes('--td');
const ids = args.filter((a) => !a.startsWith('--'));
const list = ids.length ? ids : TD ? TD_LISTS.combined : Object.keys(FIGHTERS);
const get = (id) => (TD ? remixed(id) : FIGHTERS[id]);
let bad = 0, ok = 0;
const fail = (id, why) => { bad++; console.log(`FAIL ${id}: ${why}`); };

const NOINPUT = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false };
function freshFight(d, scout = {}) {
  const f = new Fight({ fighter: d, audio: null, input: NOINPUT, opts: { invincible: true, infiniteHearts: true, scouting: scoutStore(scout) } });
  f.setPhase('fight'); f.opp.resume(1); f.player.stars = 3;
  // (a golden moment behind a switch, Jax's breather: switch it on)
  for (const S of supersOf(d)) if (S.flag && f.opp.know) f.opp.know.flags[S.flag] = true;
  return f;
}
// start super S (pick `first`) right now
function start(f, S, first) {
  const O = f.opp;
  O.forced = []; O.superPlan = [];
  if (S.armorOpen) {
    const step = d0(f).patterns.flatMap((p) => p.steps).find((s) => s.open && (s.id === S.armorOpen || s.anim === S.armorOpen));
    O.startOpen(step);
    // (the flex's armor runs to the end of the punch it powers up)
    return;
  }
  if (S.inline || keptSuper(S)) {
    const chain = chainsOf(S).find((c) => c[0] === first);
    O.beginMove(chain[0], { forced: true }); O.forced.push(...chain.slice(1));
    return;
  }
  // (the Monk's super is the answer to a Star Punch: no step back, no taunt)
  const still = O.modifiers.find((m) => m.cfg.type === 'stillwater');
  if (still) { O.seqTurn = O.seqSupers.indexOf(O.seqSupers.find((x) => superKey(x) === superKey(S))); O.superPlan = [0]; still.def.answerSuper(O); return; }
  O.startSuper(O.seqSupers.find((x) => superKey(x) === superKey(S)));
  if (S.moves) { O.superId = first; } // (a super with several picks: test this one)
}
const d0 = (f) => f.d;

for (const id of list) {
  const d = get(id);
  if (!d) { fail(id, 'no such fighter'); continue; }
  for (const S of supersOf(d)) {
    const picks = S.armorOpen ? [null] : chainsOf(S).map((c) => c[0]);
    for (const first of picks) {
      const tag = `${id} ${superKey(S)}${picks.length > 1 ? '/' + first : ''}`;
      // 1. a jab into the armor clanks
      {
        const f = freshFight(d), O = f.opp;
        start(f, S, first);
        let tried = false;
        for (let i = 0; i < 400 && !tried; i++) {
          f.update();
          if (O.armor && !['backstep', 'advance'].includes(O.state) && !(O.state === 'taunt' && O.superFar) && !O.goldenHere({ side: 'L', high: true, star: false }) && !O.goldenHere({ side: 'R', high: false, star: false })) {
            const h = O.health, r = O.onPlayerPunch({ side: 'L', high: true, star: false });
            tried = true;
            if (!(r.result === 'blocked' && r.clank) || O.health !== h || O.state === 'hit' || O.state === 'stunned') fail(tag, `a jab into the armor was not clanked off (${r.result}${r.clank ? ' clank' : ''}, state ${O.state})`);
          }
        }
        if (!tried) fail(tag, 'the super never showed its armor');
      }
      // 2. the wrong punch on the golden frames clanks (when the golden moment needs a particular punch)
      {
        const H = hitOf(S, d);
        if (H.star || H.height || H.side) {
          const f = freshFight(d), O = f.opp;
          start(f, S, first);
          const wrong = H.star ? { side: 'R', high: true, star: false } : { side: H.side === 'L' ? 'R' : 'L', high: H.height ? H.height !== 'high' : true, star: false };
          for (let i = 0; i < 600; i++) {
            f.update();
            if (O.cueHit() && O.kdCue(0) && O.armor) {
              const r = O.onPlayerPunch(wrong);
              if (r.golden) fail(tag, `the wrong punch (${JSON.stringify(wrong)}) landed the golden moment`);
              break;
            }
          }
        }
      }
      // 3 + 4. the bot lands it
      {
        const scout = {}, f = freshFight(d, scout), O = f.opp, bot = new PerfectBot(f, { attack: true });
        f.input = bot;
        let got = null;
        const orig = O.onPlayerPunch.bind(O);
        O.onPlayerPunch = (p) => { const r = orig(p); if (r.golden) got = got || { r, health: O.health, state: O.state, phase: f.phase }; return r; };
        start(f, S, first);
        for (let i = 0; i < 3200 && !got; i++) { bot.think(); f.update(); if (f.phase !== 'fight' && f.phase !== 'oppDown') break; }
        if (!got) { fail(tag, 'the bot could not land the golden moment'); continue; }
        if (d.goldenStun) {
          if (!(O.stun > 0 || O.state === 'hit' || O.state === 'stunned')) fail(tag, 'a boss golden moment left him unstunned');
          if (got.health < 1) fail(tag, 'a boss golden moment emptied his health');
          if (O.forced.length) fail(tag, 'the rest of the super still comes after the golden moment');
        } else if (!(got.health === 0 || f.phase === 'oppDown' || f.phase === 'phaseShift')) fail(tag, `no knockdown (health ${got.health}, phase ${f.phase})`);
        const key = d.scoutId || d.id;
        if (!(scout[key] || []).includes('s:' + superKey(S))) fail(tag, 'the scouting report did not fill in the golden moment');
        ok++;
      }
    }
  }
}
void PT;
console.log(bad ? `${bad} failure(s), ${ok} golden moments landed` : `ok: ${ok} golden moments landed, armor and wrong punches clank`);
process.exit(bad ? 1 : 0);
