// Headless screenshot of a fight (arena, fighters, HUD) at a given frame.
//   node tools/fight-shot.mjs out.png <fighter> [--frames 240] [--s 2] [--arena id]
// --arena draws just that arena (no fighters, no HUD).
import { Fight } from '../src/fight/fightState.js';
import { Frame, W, H } from '../src/engine/renderer.js';
import { Arena } from '../src/engine/arena.js';
import { ARENAS } from '../data/arenas/index.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [out, id] = args;
const frame = new Frame();
if (opt('arena')) {
  const a = new Arena(ARENAS[opt('arena')]);
  for (let i = 0; i < +opt('frames', 60); i++) a.update();
  frame.clear(0xff000000); a.draw(frame);
} else {
  const inp = { pressed: () => false, held: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, update() {} };
  const f = new Fight({ fighter: FIGHTERS[id], audio: null, input: inp, opts: { rounds: 3 } });
  for (let i = 0; i < +opt('frames', 240); i++) f.update();
  f.render(frame);
}
writePNG(out, frame.buf, W, H, +opt('s', 2));
console.log(out);
