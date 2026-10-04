// Headless perfect-play check (§9: every attack avoidable, every opponent beatable).
//   node tools/perfect-play.mjs [ids...] [--fights N] [--attack-only | --defense-only]
// Runs each opponent through full fights with the perfect-play bot (src/fight/bot.js):
//   defense pass: the bot only defends for 3 full rounds. Any punch that lands is a failure.
//   attack pass:  the bot also counters/punishes; reports how the fight ends.
//   --sloppy      the defense pass also jabs into his guard now and then, and a
//                 snowball-style modifier gets its rush queued at every pattern
//                 start, so the punishing gimmicks (parry, ice counter, avalanche)
//                 fire and must be defended too.
//   --latency N   give the bot an N-frame reaction time (a human-ish handicap,
//                 for gauging difficulty; failures here are expected on the
//                 hardest fighters and don't set the exit code).
//   --learned     with --latency: the reaction time only applies to a combo's opener
//                 (a player who knows the fighter's fixed chains).
//   --td          fight the Title Defense remixes (ids default to the whole defense)
//   --rounds 1    one-round fights
//   --gauntlet    fight exactly as the Gauntlets do (screens/fight.js): one round each, the bosses with forms keep
//                 their rounds, no knockout-only rule in the one-round fights, the Will Shard in his fifth-round form
// Exit code 1 if any punch landed in the defense pass or any attack-pass fight was lost.
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { TITLE_DEFENSE, remixed } from '../data/fighters/titleDefense.js';
import { gauntletStage } from '../src/save/records.js';

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const nIdx = args.indexOf('--fights');
const N = nIdx >= 0 ? +args[nIdx + 1] : 4;
const lIdx = args.indexOf('--latency');
const LAT = lIdx >= 0 ? +args[lIdx + 1] : 0;
const rIdx = args.indexOf('--rounds');
const ROUNDS = rIdx >= 0 ? +args[rIdx + 1] : undefined; // (undefined: the fighter's own round count, the Will Shard's five)
const TD = flag('--td');
const GAUNTLET = flag('--gauntlet');
const ids = args.filter((a, i) => !a.startsWith('--') && !['--fights', '--latency', '--rounds'].includes(args[i - 1]));
const list = ids.length ? ids : TD ? TITLE_DEFENSE : Object.keys(FIGHTERS);
const fighter = (id) => (TD ? remixed(id) : FIGHTERS[id]);
let bad = 0;

function run(id, attack) {
  const f = new Fight({ fighter: fighter(id), audio: null, input: null, opts: GAUNTLET ? { stageLock: gauntletStage(fighter(id)) } : { rounds: ROUNDS } });
  const sloppy = !attack && flag('--sloppy');
  const bot = new PerfectBot(f, { attack, sloppy, latency: LAT, learned: flag('--learned') });
  if (sloppy) {
    const av = (FIGHTERS[id].special || []).find((m) => m.type === 'avalanche');
    if (av) { const pick = f.opp.pickPattern.bind(f.opp); f.opp.pickPattern = () => { pick(); f.opp.forced.push(...av.rush); }; }
  }
  const hits = [];
  const orig = f.opponentAttack.bind(f);
  f.opponentAttack = (m) => {
    const P = f.player;
    const before = `${P.state} t=${P.t}`;
    const r = orig(m);
    if (r === 'hit') hits.push(`R${f.round} ${m.id}${m.fake ? '(fake)' : ''} [${m.avoidBy.join('/') || '-'}] player was ${before}`);
    return r;
  };
  let supers = 0; // (how many of his supers started: a fight he is never allowed one in proves nothing about the golden chance)
  const superThrow = f.opp.superThrow.bind(f.opp); // (every super, the Monk's too, who answers a Star Punch with his and never starts one)
  f.opp.superThrow = () => { supers++; superThrow(); };
  let result = null;
  f.opts.onEnd = (r) => { result = r; };
  for (let i = 0; i < 200000 && !result; i++) { bot.think(); f.update(); }
  return { result, hits, log: bot.log, stats: f.stats, supers };
}

for (const id of list) {
  if (!FIGHTERS[id]) { console.log(`?? unknown fighter ${id}`); continue; }
  const lines = [];
  if (!flag('--attack-only')) {
    let hitN = 0, notes = new Map();
    for (let k = 0; k < N; k++) {
      const r = run(id, false);
      hitN += r.hits.length;
      for (const h of [...r.hits, ...r.log.map((l) => `R${l.round} ${l.move}: ${l.why}`)]) notes.set(h.replace(/t=\d+/, 't=_'), (notes.get(h.replace(/t=\d+/, 't=_')) || 0) + 1);
    }
    if (hitN) bad++;
    lines.push(`  defense: ${hitN ? `${hitN} HITS TAKEN` : 'untouched'} over ${N} full fights`);
    for (const [h, n] of [...notes].slice(0, 12)) lines.push(`    ${n}x ${h}`);
  }
  if (!flag('--defense-only')) {
    const res = [];
    let supersThrown = 0;
    for (let k = 0; k < N; k++) {
      const r = run(id, true);
      supersThrown += r.supers;
      if (!r.result || r.result.winner !== 'player') bad++;
      res.push(r.result ? `${r.result.winner === 'player' ? 'W' : 'L'} ${r.result.method} R${r.result.round} ${r.result.time} (hit ${r.stats.hitsTaken}, perfect ${r.stats.perfects}, stars ${r.stats.starsEarned})` : 'no result');
    }
    lines.push(`  attack:  ${res.join(' | ')}`);
    // the golden chance (super.js) must be landable: across the fights the bot should land it
    if (!LAT && N >= 3 && supersThrown > 0 && !res.some((x) => !/perfect 0,/.test(x))) { bad++; lines.push('  NO GOLDEN CHANCE LANDED (perfect 0 in every fight)'); }
  }
  console.log(`${FIGHTERS[id].name}${TD ? ' [TITLE DEFENSE]' : ''} (${id})\n${lines.join('\n')}`);
}
process.exit(bad && !LAT ? 1 : 0);
