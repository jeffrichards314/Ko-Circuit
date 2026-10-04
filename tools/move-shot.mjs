// Headless screenshot of one moment of a move: the fight is run to the bell, the opponent is frozen
// in his stance, the move is started and the frame `--at` frames into it is drawn (windup, active...).
//   node tools/move-shot.mjs out.png <fighter> <move> [--at 14] [--round 1] [--s 2] [--sheet 0,8,16,24]
// --sheet draws several moments side by side (a contact sheet of the move: the tell as it develops).
import { Fight } from '../src/fight/fightState.js';
import { Frame, W, H } from '../src/engine/renderer.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [out, id, move] = args;
const ats = opt('sheet') ? opt('sheet').split(',').map(Number) : [+opt('at', 14)];
const s = +opt('s', 2), cols = Math.min(ats.length, +opt('cols', 3));
const rows = Math.ceil(ats.length / cols);
const big = new Uint32Array(W * cols * H * rows);
ats.forEach((at, n) => {
  const inp = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, update() {} };
  const f = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, opts: { rounds: 3, infiniteHealth: true, infiniteHearts: true, startRound: +opt('round', 1) } });
  for (let i = 0; i < 400 && f.phase !== 'fight'; i++) f.update();
  for (let i = 0; i < 4; i++) f.update();
  const O = f.opp;
  O.state = 'idle'; O.wait = 99999; O.forced = []; O.superPlan = [];
  if (opt('super')) { O.superId = move; O.beginMove(move + '*', { forced: true }); } else O.beginMove(move, { forced: true });
  for (let i = 0; i < at; i++) { O.wait = 99999 * (O.state === 'idle'); f.update(); }
  const fr = new Frame();
  f.render(fr);
  const cx = (n % cols) * W, cy = Math.floor(n / cols) * H;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) big[(cy + y) * W * cols + cx + x] = fr.buf[y * W + x];
});
writePNG(out, big, W * cols, H * rows, s);
console.log(out);
