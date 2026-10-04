// Renders the bare world (terrain, scenery, paths, clouds) at chosen camera rows, for art review.
//   node tools/world-shot.mjs out.png [--rows 180,150,...] [--all] [--fog N] [--s 2]
//   --all reveals every realm and draws every path; without it only the start of the game is drawn.
import { Frame, W, H } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';
import { buildWorld } from '../src/world/terrain.js';
import { WorldPainter, VIEW_TOP, VIEW_BOT } from '../src/world/paint.js';
const args = process.argv.slice(2), out = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = (opt('rows', '180') + '').split(',').map(Number), cols = +opt('col', 0), all = args.includes('--all'), s = +opt('s', 2), fog = +opt('fog', 0), t = +opt('t', 0);
const Wd = buildWorld(), P = new WorldPainter(Wd);
if (all) { for (const R of Wd.realms) P.realmP[R.id] = 1; for (const e of Wd.edges) P.edgeFrac[e.key] = 1; } else { for (const e of Wd.edges) if (!e.needs) P.edgeFrac[e.key] = 1; }
P.fogY = fog * 16;
const frames = [], f = new Frame();
for (const r of rows) {
  f.clear(0xff000000);
  const cam = { x: Math.max(0, Math.min(Wd.px[0] - 256, cols * 16)), y: Math.max(0, Math.min(Wd.px[1] - (VIEW_BOT - VIEW_TOP), r * 16)) };
  P.terrain(f, cam, t); P.paths(f, cam, t);
  const items = P.sprites(cam, t).sort((a, b) => a.y - b.y); for (const it of items) it.draw(f);
  P.clouds(f, cam, t); P.effects(f, cam, t);
  frames.push(Uint32Array.from(f.buf));
}
const G = 4, n = frames.length, cw = Math.min(n, 3), rw = Math.ceil(n / cw), SW = cw * (W + G) - G, SH = rw * (H + G) - G, sheet = new Uint32Array(SW * SH).fill(0xff303040);
frames.forEach((fr, i) => { const ox = (i % cw) * (W + G), oy = Math.floor(i / cw) * (H + G); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sheet[(oy + y) * SW + ox + x] = fr[y * W + x]; });
writePNG(out, sheet, SW, SH, s);
console.log(out, Wd.px, 'nodes', Object.keys(Wd.nodes).length, 'edges', Wd.edges.length);
