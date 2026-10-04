// Contact sheet of the halls (spec §19 G4, G11): every interior rendered once, for art review.
//   node tools/interior-sheet.mjs out.png [--only id,id] [--cols 4] [--career zero] [--at 40] [--s 1] [--pick podium|exit]
import { makeGame } from './lib/stub.mjs';
import { Frame, W, H } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';
const args = process.argv.slice(2), out = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const { INTERIOR_IDS } = await import('../data/interiors.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const only = (opt('only', '') || '').split(',').filter(Boolean), ids = only.length ? only : INTERIOR_IDS;
const g = (await makeGame({ career: opt('career', 'zero') })).game; g.input.takeTaps = () => [];
g.records.unlocks.jax = true; g.records.unlocks.full = true; for (const u of ['zero', 'pantheon', 'underworld', 'void']) g.records.unlocks[u] = true;
const cols = +opt('cols', 4), rows = Math.ceil(ids.length / cols), G = 4, SW = cols * (W + G) - G, SH = rows * (H + G) - G;
const sheet = new Uint32Array(SW * SH).fill(0xff403030);
const f = new Frame();
ids.forEach((id, i) => {
  const S = new InteriorScreen(g, { id }); S.enter();
  const stations = S.L.stations, pick = opt('pick', 'podium') === 'exit' ? stations[0] : stations.find((s) => s.kind === 'podium') || stations[1] || stations[0];
  S.px = pick.x; for (let k = 0; k < +opt('at', 40); k++) S.update();
  f.clear(0xff000000); S.render(f);
  const ox = (i % cols) * (W + G), oy = Math.floor(i / cols) * (H + G);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sheet[(oy + y) * SW + ox + x] = f.buf[y * W + x];
});
writePNG(out, sheet, SW, SH, +opt('s', 1));
console.log(out, ids.length, 'halls');
