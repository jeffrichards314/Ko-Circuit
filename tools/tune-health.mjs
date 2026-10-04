// Health tuning helper (final audit): for each fighter, tries `health` factors on top of what TWEAKS has (data/difficulty.js) and prints how the human-model
// player (no golden moments, having learned him) fares: the share of fights that reach the championship rounds, the round it wins in, its win rate.
// It does not edit any file: copy the factor it recommends into TWEAKS.
//   node tools/tune-health.mjs id [id...] [--champ 0.2] [--fights 40] [--key health|damage|tdHealth] [--td] [--win 0.9] [--golden]
// --key damage tunes the fighter's damage instead (a fighter the player cannot beat often enough after learning him): the largest factor whose win rate is at least --win.
// Recommends the largest factor (closest to what is there) whose championship share is at most --champ and whose median win round is at least 2.
import { TWEAKS } from '../data/difficulty.js';
import { retune, FIGHTERS } from '../data/fighters/index.js';
import { play, Memory } from './lib/measure.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
const ids = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--') && !(args[i - 1] === '--key'));
const CHAMP = opt('--champ', 0.2), N = opt('--fights', 40), WIN = opt('--win', 0.9), KEY = args.includes('--key') ? args[args.indexOf('--key') + 1] : 'health', GOLDEN = args.includes('--golden'), TD = args.includes('--td');
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
for (const id of ids) {
  const had = TWEAKS[id] ? { ...TWEAKS[id] } : null, base = (had && had[KEY]) ?? 1;
  let pick = null;
  const rows = [];
  for (const k of [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4]) {
    TWEAKS[id] = { ...(had || {}), [KEY]: Math.round(base * k * 1000) / 1000 };
    retune();
    const mem = new Memory();
    for (let i = 0; i < 12; i++) play(id, { memory: mem, golden: GOLDEN, td: TD, maxFrames: 60000 });
    const R = []; for (let i = 0; i < N; i++) R.push(play(id, { memory: mem, golden: GOLDEN, td: TD, maxFrames: 60000 }));
    const W = R.filter((r) => r.win), champ = R.filter((r) => r.round > r.rounds).length / R.length, round = W.length ? med(W.map((r) => r.round)) : null;
    rows.push({ f: TWEAKS[id][KEY], champ, round, win: W.length / R.length });
    if (!pick && (KEY === 'damage' ? W.length / R.length >= WIN : champ <= CHAMP && round >= 2 && W.length / R.length >= 0.9)) pick = TWEAKS[id][KEY];
    if (pick) break;
  }
  if (had) TWEAKS[id] = had; else delete TWEAKS[id];
  console.log(`${id.padEnd(12)} now ${base}  ${rows.map((r) => `${r.f}: champ ${Math.round(r.champ * 100)}% r${r.round} win ${Math.round(r.win * 100)}%`).join(' | ')}  => ${pick ?? 'none'}`);
}
