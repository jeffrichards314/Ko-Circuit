// Headless screenshots of a cutscene (spec §19): node tools/scene-shot.mjs out.png <sceneId> [--at 0,120,300] [--s 2] [--cols 3]
//   [--params '{"replay":true}'] [--career new|zero|p3|...] [--press a@200,start@30] [--hold start@10-60] [--theater] [--seen]
// Builds a CutsceneScreen over a silent game, runs it frame by frame (pressing A when a text box wants it with --auto),
// and writes the frames listed in --at as one PNG (a contact sheet when there are several).
import { Frame, W, H } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';
import { makeGame } from './lib/stub.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0], id = args[1];
const T = await makeGame({ career: opt('career', 'new'), seen: args.includes('--seen') ? { [id]: 1 } : {} });
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
for (const kv of (opt('press', '') || '').split(',').filter(Boolean)) { const [a, f] = kv.split('@'); T.press(a, +f); }
for (const kv of (opt('hold', '') || '').split(',').filter(Boolean)) { const [a, r] = kv.split('@'); const [f0, f1] = r.split('-'); T.hold(a, +f0, +f1); }
const S = new CutsceneScreen(T.game, { id, params: JSON.parse(opt('params', '{}')), theater: args.includes('--theater'), then: ['_end', {}] });
S.enter();
const at = opt('at', '0').split(',').map(Number), last = Math.max(...at), scale = +opt('s', 2);
const auto = args.includes('--auto');
const frames = [], f = new Frame();
let ended = -1;
for (let t = 0; t <= last; t++) {
  T.step(t);
  if (auto && S.scene.text && S.scene.text.t > 40 && t % 7 === 0) T.press('a', t), T.step(t);
  if (t > 0) S.update();
  if (T.game.next && ended < 0) ended = t;
  if (at.includes(t)) { f.clear(0xff000000); S.render(f); frames.push(Uint32Array.from(f.buf)); }
}
if (ended >= 0) console.log('scene ended at frame', ended, '->', T.game.next[0]);
if (frames.length === 1) writePNG(out, frames[0], W, H, scale);
else {
  const cols = Math.min(frames.length, +opt('cols', 3)), rows = Math.ceil(frames.length / cols), cw = W * scale + 4, ch = H * scale + 4;
  const sheet = new Uint32Array(cols * cw * rows * ch).fill(0xff202020);
  frames.forEach((fr, i) => { const ox = (i % cols) * cw + 2, oy = Math.floor(i / cols) * ch + 2; for (let y = 0; y < H * scale; y++) for (let x = 0; x < W * scale; x++) sheet[(oy + y) * cols * cw + ox + x] = fr[Math.floor(y / scale) * W + Math.floor(x / scale)]; });
  writePNG(out, sheet, cols * cw, rows * ch, 1);
}
console.log('wrote', out, frames.length, 'frame(s)');
