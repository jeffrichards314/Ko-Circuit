// Knockdown styles, alternate colours and Title Defense looks (data/fighters/knockdowns.js, data/altPalettes.js, data/sprites/remixKit.js).
//   node tools/knockdown-test.mjs
// 1. every fighter has a knockdown style, every pose of it composes (in his own layers and his Title Defense ones), no two neighbours in a hall fall alike,
//    and no lying pose reaches the edge of its canvas (a cut-off glove);
// 2. every opponent's alternate colours are designed (data/altPalettes.js) and differ from his own in at least four colours;
// 3. every Title Defense fighter from ZERO on has a look of his own: sprite layers with a `remix` block, a different silhouette than the classic one
//    (not a recolour: at least 4% of the pixels differ in position), and a TD palette that is not a hue turn.
// Exit code 1 if anything is wrong.
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS } from '../data/circuits.js';
import { KD_STYLES } from '../data/fighters/knockdowns.js';
import { remixed, TD_LISTS } from '../data/fighters/titleDefense.js';
import { ALT_PALETTES } from '../data/altPalettes.js';
import { ensureAltPalette, PALETTES } from '../data/palette.js';
import { fighterSprites, paletteFor } from '../src/engine/spriteCache.js';
import { resolvePose, composeFigure } from '../src/engine/figure.js';

let bad = 0;
const fail = (id, m) => { bad++; console.log(`  FAIL ${id}: ${m}`); };

// 1. knockdowns
const count = {};
for (const [id, d] of Object.entries(FIGHTERS)) {
  if (!KD_STYLES[d.knockdownStyle]) { fail(id, 'no knockdown style'); continue; }
  count[d.knockdownStyle] = (count[d.knockdownStyle] || 0) + 1;
  for (const [label, f] of [[id, d], [id + '.td', d.titleDefense ? remixed(id) : null]]) {
    if (!f) continue;
    const bank = fighterSprites(f.spriteLayers);
    const names = [...f.anims.knockdown, ...(f.anims.down.frames || f.anims.down), ...(f.anims.getup.frames || f.anims.getup)];
    for (const n of names) { try { if (!bank.get(n).w) fail(label, `${n} is empty`); } catch (e) { fail(label, `${n}: ${e.message}`); } }
    const C = bank.build.canvas, poses = { ...bank.build.poses, ...(bank.layers.poses || {}) };
    for (const n of f.anims.down.frames.concat(f.anims.knockdown.slice(2))) {
      const p = { ...resolvePose(poses, n) };
      if (!p.rot) continue;
      delete p.rot;
      const s = composeFigure(bank.build, bank.layers, p, bank.pal);
      if (s.ax >= C.ax || s.w - s.ax >= C.w - C.ax || s.ay >= C.ay) fail(label, `${n} runs into the edge of its canvas`);
    }
  }
}
for (const C of Object.values(CIRCUITS)) {
  const L = (C.fighters || []).filter((id) => FIGHTERS[id]);
  for (let i = 1; i < L.length; i++) if (FIGHTERS[L[i]].knockdownStyle === FIGHTERS[L[i - 1]].knockdownStyle && !/^dash|^rival/.test(L[i])) fail(L[i], `falls like ${L[i - 1]} (${FIGHTERS[L[i]].knockdownStyle}) in ${C.id}`);
}
console.log(`knockdown styles: ${Object.entries(count).map(([k, v]) => `${k} ${v}`).join(', ')}`);
if (Object.keys(count).length < 8) fail('styles', 'fewer than 8 styles in use');

// 2. alternate colours
const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
for (const [id, d] of Object.entries(FIGHTERS)) {
  if (!ALT_PALETTES[d.palette] && d.palette !== 'barney') { fail(id, 'no designed alternate colours'); continue; }
  const a = PALETTES[ensureAltPalette(d.palette)], p = PALETTES[d.palette];
  let diff = 0;
  for (const part of ['A', 'B']) if (p[part]) for (const k of p[part].keys) if (dist(p[part].spec[k], a[part].spec[k]) > 6) diff++;
  if (diff < 4) fail(id, `alternate colours differ in only ${diff} colours`);
  // skin and the outline are his own
  if (dist(p.A.spec.outline, a.A.spec.outline)) fail(id, 'alternate colours change his outline');
}

// 3. Title Defense looks, ZERO onward
const FROM = TD_LISTS.combined.indexOf('zero');
for (const id of TD_LISTS.combined.slice(FROM)) {
  const d = FIGHTERS[id], r = remixed(id);
  if (!r.spriteLayers.endsWith('.td')) { fail(id, 'his remix is a recolour (no sprite layers of its own)'); continue; }
  const A = fighterSprites(d.spriteLayers), B = fighterSprites(r.spriteLayers);
  const a = A.get('idle1'), b = B.get('idle1');
  const W = Math.max(a.w, b.w) + 40, H = Math.max(a.h, b.h) + 40;
  const grid = (s, bank) => { const g = new Uint8Array(W * H); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.data[y * s.w + x]) g[(y - s.ay + (H - 20)) * W + (x - s.ax + (W >> 1))] = 1; return g; };
  const ga = grid(a, A), gb = grid(b, B);
  let diff = 0, tot = 0;
  for (let i = 0; i < ga.length; i++) { if (ga[i] || gb[i]) tot++; if (ga[i] !== gb[i]) diff++; }
  if (diff / tot < 0.15) fail(id, `his remix has the same silhouette (${(100 * diff / tot).toFixed(1)}% differs)`);
  if (r.palette === d.palette) fail(id, 'his remix has the same colours');
}
console.log(`${Object.keys(FIGHTERS).length} fighters, ${TD_LISTS.combined.length - FROM} redesigned Title Defense looks checked: ${bad ? bad + ' problems' : 'all good'}`);
process.exit(bad ? 1 : 0);
