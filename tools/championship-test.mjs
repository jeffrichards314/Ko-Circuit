// The championship rounds (spec §4 "Championship rounds", data/difficulty.js CHAMPIONSHIP): how every fighter plays out against the human-model player
// (src/fight/humanBot.js: reaction 200-280 ms, jitter, 3% wrong inputs, learns his patterns over attempts).
//   node tools/championship-test.mjs [ids...] [--fights N] [--away N] [--td] [--golden] [--jobs J] [--out file] [--json]
// For each fighter:
//   aggressive  the human-model player fights him (first until it has beaten him twice in a row, the way a person learns him, at most 25 tries, then
//               N measured fights keeping what it learned): the round it wins in (median, and the spread), how often the fight reaches the championship
//               rounds (past round 3), how often it wins at all
//   keep-away   dodges everything and pokes a jab every five seconds or so (A fights): the round it is knocked out in, and whether it ever wins
// Flags (exit code 1): an aggressive player before the Underworld who needs the championship rounds more than a quarter of the time (the
// fighter's health or openings are out of line, not the clock); a keep-away player who wins, or who is not out by round 7 in 80% of the fights, or one who never punches and is still up after round 9.
// Runs in J worker processes (default: every core but one); --json prints one line per fighter instead of the table.
import { fork } from 'node:child_process';
import { cpus } from 'node:os';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FIGHTERS } from '../data/fighters/index.js';
import { BOSSES, STORY, ZONE } from '../data/difficulty.js';
import { COMBINED_DEFENSE } from '../data/fighters/titleDefense.js';
import { play, Memory } from './lib/measure.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const VALUE = ['--fights', '--away', '--near', '--jobs', '--out', '--worker'];
const N = +opt('--fights', 10), AWAY = +opt('--away', 4), NEAR = +opt('--near', 0.07), TD = flag('--td'), GOLDEN = flag('--golden');
const ids = args.filter((a, i) => !a.startsWith('--') && !VALUE.includes(args[i - 1]));

const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const MAX_FRAMES = 4320 * 14;

function measure(id) {
  const base = { td: TD, golden: GOLDEN, maxFrames: MAX_FRAMES };
  const d = FIGHTERS[id];
  const mem = new Memory();
  let streak = 0, tries = 0;
  for (; tries < 25 && streak < 2; tries++) streak = play(id, { ...base, memory: mem }).win ? streak + 1 : 0;
  const A = [];
  for (let i = 0; i < N; i++) A.push(play(id, { ...base, memory: mem }));
  // the "nearly finished at the end of round 3" scenario: the player held back through the regular rounds, the opponent is left on NEAR of his health
  const Z = [];
  for (let i = 0; i < Math.max(4, N >> 1); i++) Z.push(play(id, { ...base, memory: mem, near: NEAR }));
  const K = [], U = [];
  for (let i = 0; i < AWAY; i++) K.push(play(id, { ...base, keepAway: true }));
  for (let i = 0; i < Math.max(2, AWAY >> 2); i++) U.push(play(id, { ...base, pure: true }));
  const wins = A.filter((r) => r.win), rounds = wins.map((r) => r.round);
  return {
    id, name: d.name, circuit: d.circuit, boss: BOSSES.includes(id), warm: tries,
    win: wins.length / A.length, med: median(rounds), max: rounds.length ? Math.max(...rounds) : null,
    champ: A.filter((r) => r.round > r.rounds).length / A.length, // (fights that reached the championship rounds, won or lost)
    champWins: wins.filter((r) => r.round > r.rounds).length / Math.max(1, wins.length),
    away: { wins: K.filter((r) => r.win).length, n: K.length, lostIn: median(K.filter((r) => !r.win && r.res).map((r) => r.round)), latest: Math.max(0, ...K.map((r) => (r.res ? r.round : 99))), by7: K.filter((r) => !r.win && r.res && r.round <= 7).length },
    near: { n: Z.filter((r) => r.round > r.rounds || r.win).length, all: Z.length, wins: Z.filter((r) => r.win).length, in45: Z.filter((r) => r.win && r.round - r.rounds <= 2).length, med: median(Z.filter((r) => r.win).map((r) => r.round)), nearMax: Z.length ? Math.max(...Z.filter((r) => r.win).map((r) => r.round), 0) : 0 },
    pure: { wins: U.filter((r) => r.win).length, n: U.length, out: median(U.filter((r) => !r.win && r.res).map((r) => r.round)), latest: Math.max(0, ...U.map((r) => (r.res ? r.round : 99))) },
    rounds: A[0] ? A[0].rounds : 3,
  };
}

if (opt('--worker', null) != null) {
  process.on('message', (list) => { for (const id of list) process.send({ row: measure(id) }); process.send({ done: true }); });
} else {
  const list = ids.length ? ids : TD ? COMBINED_DEFENSE : Object.keys(FIGHTERS);
  const J = Math.max(1, +opt('--jobs', Math.max(1, cpus().length - 1)));
  const rows = [];
  let live = 0;
  const shards = Array.from({ length: J }, () => []);
  list.forEach((id, i) => shards[i % J].push(id));
  const self = fileURLToPath(import.meta.url);
  await new Promise((res) => {
    for (const sh of shards) {
      if (!sh.length) continue;
      live++;
      const w = fork(self, [...args, '--worker', '1'], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
      w.on('message', (m) => { if (m.row) { rows.push(m.row); if (flag('--json')) console.log(JSON.stringify(m.row)); } else if (m.done) { w.kill(); if (!--live) res(); } });
      w.send(sh);
    }
  });
  const order = (r) => { const i = STORY.indexOf(r.circuit); return i < 0 ? 999 : i; };
  rows.sort((a, b) => order(a) - order(b) || list.indexOf(a.id) - list.indexOf(b.id));
  const pct = (x) => `${Math.round(100 * x)}%`;
  const preUnderworld = (r) => { const z = ZONE[r.circuit]; return z === 'main' || z === 'championship' || z === 'pantheon'; };
  const out = [];
  const flags = [];
  out.push(`${TD ? 'Title Defense versions' : 'Career'}; ${N} aggressive fights (warmed up), ${AWAY} keep-away fights each; human-model player${GOLDEN ? ' (uses golden moments)' : ' (no golden moments)'}`);
  out.push('fighter       circuit      wins   round(med/max)  reach champ.   nearly-done: KO in round 4-5 / reached it   keep-away: wins  out in (median)  by r7  latest   pure (no punches): out in / latest');
  for (const r of rows) {
    const f = [];
    if (preUnderworld(r) && r.champ > 0.9) f.push("needs championship rounds more than 90% of the time");
    if (r.away.wins) f.push('keep-away WON');
    if (r.pure.wins) f.push('a player who never punches WON');
    if (r.pure.latest > 9) f.push(`a player who never punches is still up in round ${r.pure.latest > 90 ? '14+' : r.pure.latest}`);
    if (r.away.by7 < r.away.n * 0.8) f.push(`keep-away lost by round 7 only ${pct(r.away.by7 / r.away.n)} of the time`);
    if (r.near.n && r.near.in45 < r.near.n * 0.6) f.push(`nearly-finished: only ${r.near.in45}/${r.near.n} KO in round 4-5`);
    if (r.win < 0.5) f.push(`aggressive wins only ${pct(r.win)}`);
    out.push(`${r.id.padEnd(13)} ${String(r.circuit).padEnd(11)} ${pct(r.win).padStart(5)}   ${String(r.med ?? '-').padStart(4)} /${String(r.max ?? '-').padStart(3)}      ${pct(r.champ).padStart(5)}        ${String(r.near.in45).padStart(2)}/${String(r.near.n).padEnd(2)} (r${r.near.med ?? '-'})      ${r.away.wins}/${r.away.n}      ${String(r.away.lostIn ?? '-').padStart(4)}          ${pct(r.away.by7 / r.away.n).padStart(4)}   ${String(r.away.latest > 90 ? 'never' : r.away.latest).padEnd(6)}  ${String(r.pure.out ?? '-').padStart(3)} /${r.pure.latest > 90 ? ' never' : String(r.pure.latest).padStart(3)}${f.length ? '   !! ' + f.join('; ') : ''}`);
    if (f.length) flags.push(`${r.id}: ${f.join('; ')}`);
  }
  out.push('', flags.length ? `${flags.length} flagged:\n  ${flags.join('\n  ')}` : 'nothing flagged');
  const file = opt('--out', null);
  if (file) writeFileSync(file, out.join('\n') + '\n');
  if (!flag('--json')) console.log(out.join('\n'));
  process.exit(flags.length ? 1 : 0);
}
