// Headless contact sheet of the two mode arenas (spec §2b): the championship hall and the endurance arena, in every division.
//   node tools/arena-sheet.mjs out.png [--mode td|g] [--wins 0,12,40] [--frames 90] [--s 2] [--fighter gus]
// td: one tile per division. g: one row per division, one tile per win count (the crowd grows, the tally fills).
// --fighter draws the fight itself (both fighters, the HUD) over the arena; without it the empty arena.
import { Frame, W, H } from '../src/engine/renderer.js';
import { Arena } from '../src/engine/arena.js';
import { tdArena, gauntletArena, ARENA_STYLES } from '../data/arenas/modes.js';
import { writePNG } from './png.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0], mode = opt('mode', 'td'), frames = +opt('frames', 90), scale = +opt('s', 2);
const wins = opt('wins', '0,12,40').split(',').map(Number), of = +opt('of', 50);
const tiles = mode === 'td' ? ARENA_STYLES.map((d) => [tdArena(d)]) : ARENA_STYLES.map((d) => wins.map((w) => gauntletArena(d, w, of)));
const cols = Math.max(...tiles.map((r) => r.length)), rows = tiles.length;
const sheet = new Uint32Array(W * cols * H * rows);
tiles.forEach((row, r) => row.forEach((def, c) => {
  const a = new Arena(def); for (let i = 0; i < frames; i++) a.update();
  if (frames > 40) a.reaction('star');
  const f = new Frame(); f.clear(0xff000000); a.draw(f);
  for (let y = 0; y < H; y++) sheet.set(f.buf.subarray(y * W, y * W + W), (r * H + y) * W * cols + c * W);
}));
writePNG(out, sheet, W * cols, H * rows, scale);
console.log(out);
