// Mode calibration (spec §6): the perfect-play bot runs every Title Defense tier and every Gauntlet as the game fights them, and the
// Title Defense par times (records.js TD_PAR, the GOLD medal's clock) are checked against its clear times: par must leave a good
// human real room (1.25x - 2.2x the bot's total); also that the bot wins every fight of every run.
//   node tools/mode-calibrate.mjs [--fights N]     (default 4; exit code 1 if a par is out of range or the bot loses a fight)
import { Fight } from '../src/fight/fightState.js';
import { PerfectBot } from '../src/fight/bot.js';
import { remixed, TD_LISTS } from '../data/fighters/titleDefense.js';
import { gauntletStage, gauntletList, GAUNTLETS, TD_PAR } from '../src/save/records.js';
import { FIGHTERS } from '../data/fighters/index.js';

const args = process.argv.slice(2);
const N = args.includes('--fights') ? +args[args.indexOf('--fights') + 1] : 4;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
let bad = 0;
function fights(d, opts = {}) {
  const out = []; let lost = 0;
  for (let k = 0; k < N; k++) {
    const f = new Fight({ fighter: d, audio: null, input: null, opts });
    const bot = new PerfectBot(f, { attack: true });
    let res = null; f.opts.onEnd = (r) => { res = r; };
    for (let i = 0; i < 400000 && !res; i++) { bot.think(); f.update(); }
    if (!res || res.winner !== 'player') lost++; else out.push(res.seconds);
  }
  return { sec: out.length ? med(out) : 999, lost };
}
// (ZERO's true form is a knockout-only fight against the clock: the bot loses about 1 in 250 of them on time, as it always has: one loss in N is allowed)
const allowed = (id, n) => (id === 'zeroTrue' ? n <= 1 : n === 0);
const clock = (s) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const per = {};
for (const id of TD_LISTS.combined) per[id] = fights(remixed(id));
console.log('TITLE DEFENSE (game seconds of fighting, the bot\'s median per fight)');
for (const [t, L] of Object.entries(TD_LISTS)) {
  const tot = L.reduce((a, id) => a + per[id].sec, 0), lost = L.filter((id) => !allowed(id, per[id].lost)).map((id) => `${id} x${per[id].lost}`);
  const ratio = TD_PAR[t] / tot;
  console.log(`  ${t.padEnd(10)} ${String(L.length).padStart(2)} fights  bot ${clock(tot)}  par ${clock(TD_PAR[t])}  (${ratio.toFixed(2)}x)${lost.length ? '  BOT LOST: ' + lost.join(', ') : ''}`);
  if (ratio < 1.25 || ratio > 2.2) { bad++; console.log(`    FAIL par out of range`); }
  if (lost.length) bad++;
}
console.log('GAUNTLETS (each fight from round 1, like the Career: the bot\'s clear time)');
const g = {};
for (const z of GAUNTLETS) {
  let tot = 0, lost = [];
  for (const id of gauntletList(z)) {
    if (!g[id]) { const d = FIGHTERS[id]; g[id] = fights(d, { stageLock: gauntletStage(d) }); }
    tot += g[id].sec; if (!allowed(id, g[id].lost)) lost.push(`${id} x${g[id].lost}`);
  }
  console.log(`  ${z.padEnd(10)} ${String(gauntletList(z).length).padStart(3)} fights  bot ${clock(tot)}${lost.length ? '  BOT LOST: ' + lost.join(', ') : ''}`);
  if (lost.length) bad++;
}
console.log(bad ? `${bad} problem(s)` : 'ok');
process.exit(bad ? 1 : 0);
