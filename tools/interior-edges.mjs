// Interior edge audit (spec §19 G4, 2026-10-03): every interior, with the player at the left edge of the room, the middle, the right edge and in front of
// every station, must show nothing cut off:
//   - words drawn on the screen (the prompt bar, the podium board, the confirm box) stay inside it, whole;
//   - a sign in the room (world text) that is near the player is not clipped by the screen edge;
//   - a podium's fighter, at its largest, is not cut by the room's edge, and the one you stand at is inside the screen;
//   - the podium board (a panel) is entirely on the screen.
//   node tools/interior-edges.mjs [--png out.png] [--only id,id]
import { makeGame } from './lib/stub.mjs';
import { Frame, W, H } from '../src/engine/renderer.js';
import { PROBE } from '../src/engine/font.js';
import { writePNG } from './png.mjs';
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const { INTERIOR_IDS } = await import('../data/interiors.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const { fighterSprites } = await import('../src/engine/spriteCache.js');
const only = (opt('only') || '').split(',').filter(Boolean), ids = only.length ? only : INTERIOR_IDS;
const g = (await makeGame({ career: 'zero' })).game; g.input.takeTaps = () => [];
g.records.unlocks.jax = true; g.records.unlocks.full = true; for (const u of ['zero', 'pantheon', 'underworld', 'void']) g.records.unlocks[u] = true;
const f = new Frame(), problems = [];
const bad = (id, where, m) => problems.push(`${id} @ ${where}: ${m}`);
const shots = [];
for (const id of ids) {
  const S = new InteriorScreen(g, { id }); S.enter();
  const st = S.L.stations, spots = [['left edge', 16], ['middle', S.width / 2], ['right edge', S.width - 16], ...st.filter((s) => s.kind !== 'decor').map((s) => [s.id, s.x])];
  // fighters inside the room
  for (const s of st) if (s.kind === 'podium') {
    const d = S.fighterOf(s); let sp; try { sp = fighterSprites(d.spriteLayers).get('idle1'); } catch { continue; }
    const k = Math.min(1, 88 / sp.h), w = sp.w * k;
    if (s.x - w / 2 < 0 || s.x + w / 2 > S.width) bad(id, s.id, `${d.name} (${Math.round(w)}px wide) is cut by the room edge (room ${S.width}px, he stands at ${s.x})`);
  }
  for (const [name, x] of spots) {
    S.px = Math.max(16, Math.min(S.width - 16, x)); S.goal = null; S.camX = S.clampCam(S.px - W / 2);
    for (let k = 0; k < 90; k++) S.update();
    PROBE.on = true; PROBE.texts = []; PROBE.boxes = []; PROBE.over = []; PROBE.seq = 0;
    f.clear(0xff000000); S.render(f); PROBE.on = false;
    for (const o of PROBE.over) bad(id, name, `cut short (${o.where}): "${o.s}"`);
    for (const t of PROBE.texts) {
      if (t.world) { if (Math.abs(t.x + t.w / 2 - (S.px - S.camX)) < 70 && (t.x < 0 || t.x + t.w > W) && t.x + t.w > 0 && t.x < W) bad(id, name, `a sign near you is clipped by the screen: "${t.s}" at ${t.x}`); continue; }
      if (t.x < 0 || t.x + t.w > W || t.y < 0 || t.y + t.h > H) bad(id, name, `text off screen at ${t.x},${t.y}: "${t.s}"`);
    }
    for (const b of PROBE.boxes) if (b.kind === 'panel' && (b.x < 0 || b.y < 0 || b.x + b.w > W || b.y + b.h > H)) bad(id, name, `a panel leaves the screen (${b.x},${b.y} ${b.w}x${b.h})`);
    if (['left edge', 'middle', 'right edge'].includes(name)) shots.push(Uint32Array.from(f.buf));
  }
}
if (opt('png')) {
  const cols = 3, G = 4, rows = Math.ceil(shots.length / cols), SW = cols * (W + G), SH = rows * (H + G), sheet = new Uint32Array(SW * SH).fill(0xff403030);
  shots.forEach((b, i) => { const ox = (i % cols) * (W + G), oy = Math.floor(i / cols) * (H + G); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sheet[(oy + y) * SW + ox + x] = b[y * W + x]; });
  writePNG(opt('png'), sheet, SW, SH, 1);
}
for (const p of problems) console.log('  FAIL ' + p);
console.log(problems.length ? `${problems.length} problems in ${ids.length} interiors` : `interior edge audit clean (${ids.length} interiors, 3 edges + every station)`);
process.exit(problems.length ? 1 : 0);
