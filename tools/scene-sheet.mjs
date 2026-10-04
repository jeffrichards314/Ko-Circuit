// A contact sheet of one frame of many scenes (spec §19): node tools/scene-sheet.mjs out.png <prefix|id,id> [--at 70] [--cols 4] [--s 1]
import { Frame, W, H } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';
import { makeGame } from './lib/stub.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0], sel = args[1];
const T = await makeGame({ career: opt('career', 'zero') });
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
const { SCENES } = await import('../data/cutscenes/index.js');
const ids = sel.includes(',') || SCENES[sel] ? sel.split(',') : Object.keys(SCENES).filter((id) => id.startsWith(sel));
const at = +opt('at', 70), scale = +opt('s', 1), cols = +opt('cols', 4), auto = args.includes('--auto');
const frames = [], f = new Frame();
for (const id of ids) {
  const S = new CutsceneScreen(T.game, { id, then: ['_', {}], params: JSON.parse(opt('params', '{}')) });
  S.enter();
  for (let t = 1; t <= at; t++) { T.step(t); if (auto && S.scene.text && S.scene.text.t > 40 && t % 7 === 0) T.press('a', t), T.step(t); S.update(); }
  f.clear(0xff000000); S.render(f); frames.push(Uint32Array.from(f.buf));
}
const rows = Math.ceil(frames.length / cols), cw = W * scale + 4, ch = H * scale + 4;
const sheet = new Uint32Array(cols * cw * rows * ch).fill(0xff202020);
frames.forEach((fr, i) => { const ox = (i % cols) * cw + 2, oy = Math.floor(i / cols) * ch + 2; for (let y = 0; y < H * scale; y++) for (let x = 0; x < W * scale; x++) sheet[(oy + y) * cols * cw + ox + x] = fr[Math.floor(y / scale) * W + Math.floor(x / scale)]; });
writePNG(out, sheet, cols * cw, rows * ch, 1);
console.log(ids.length, 'scenes:', ids.join(' '));
