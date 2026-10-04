// Alternate colours (§16): designs every fighter's unlockable alternate costume and writes data/altPalettes.js.
//   node tools/make-alts.mjs [--sheet out.png] [--ids a,b,c] [--only-sheet]
// A hue turn made rainbows (a green cap beside a purple vest). Instead every fighter gets a COLOUR SCHEME (tools/lib/altThemes.mjs: a handful of
// colours that were chosen to sit together, like Barney's Night Shift: slate shirt, brown work trousers, orange cap and gloves). The palette's costume
// FAMILIES (shirt = shirtHi/shirt/shirtSh/shirtDk, ...) are found, the biggest on the sprite get the scheme's main colours, the gloves its glove colour,
// metal / trim its trim colour, and each family keeps its own light-to-dark ramp. Skin, hair, eyes, mouth and the outline stay his own, except for a
// fighter who is not human (a robot, a ghost, a purple giant: his body IS his costume).
// FIX below: by-hand overrides {palette: {family: '#hex'}} and PICK {palette: 'THEME'} when the automatic pick is wrong.
import { writeFileSync } from 'node:fs';
import { FIGHTERS } from '../data/fighters/index.js';
import { PALETTES } from '../data/palette.js';
import { fighterSprites } from '../src/engine/spriteCache.js';
import { CIRCUITS } from '../data/circuits.js';
import { THEMES, POOLS, NOT_FOR_MAIN, PICK, FIX, hexTo5, toHsl, hslTo5 } from './lib/altThemes.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

const KEEP = /^(outline|skin|hair|white|mouth|eye|iris|teeth|beard|brow|stubble|lash|flesh|tooth|lip|ruddy|blood|tongue|pupil|scar)/i;
const TRIM = /(gold|metal|silver|brass|steel|chrome|buckle|belt|trim|gem|spark|bolt|glow|star|crest|jewel|stud|chain|bronze|copper|iron|laurel|halo|ring|crown|stripe|piping|lace|tape|band|sash|accent|rim|edge|hazard|rune|ember|flame|fire)/i;
const GLOVE = /^(glove|mitt|cuff)/i;
const famOf = (k) => k.replace(/(Hi|Sh|Dk|Lo|Dim|Light|Dark|2|3)$/, '') || k;

// which palette each fighter (the first one using it) wears, and the build sheets to weigh by
const byPal = new Map();
for (const [id, d] of Object.entries(FIGHTERS)) { if (!byPal.has(d.palette)) byPal.set(d.palette, id); }
const ids = opt('ids') ? new Set(opt('ids').split(',')) : null;

function analyse(palName, id) {
  const P = PALETTES[palName], d = FIGHTERS[id];
  const bank = fighterSprites(d.spriteLayers);
  const idxKey = {};
  P.A.keys.forEach((k, i) => (idxKey[i + 1] = ['A', k]));
  if (P.B) P.B.keys.forEach((k, i) => (idxKey[17 + i] = ['B', k]));
  const cnt = {};
  for (const pose of ['idle1', 'jabTell', 'hookTell']) {
    let s; try { s = bank.get(pose); } catch { continue; }
    for (const v of s.data) if (v && idxKey[v]) { const k = idxKey[v][1]; cnt[k] = (cnt[k] || 0) + 1; }
  }
  const spec = { ...P.A.spec, ...(P.B ? P.B.spec : {}) };
  const where = {}; for (const [, [w, k]] of Object.entries(idxKey)) where[k] = w;
  // families
  const fams = {};
  for (const k of Object.keys(spec)) { const f = famOf(k); (fams[f] = fams[f] || { name: f, keys: [], area: 0 }).keys.push(k); fams[f].area += cnt[k] || 0; }
  for (const f of Object.values(fams)) f.mid = f.keys.slice().sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0))[0];
  // not human: his skin is his costume
  const sk = spec.skin || spec.skinMid;
  let inhuman = false;
  if (sk) {
    const [h, s, l] = toHsl(sk);
    inhuman = !(h >= 4 && h <= 50 && s >= 0.22 && s <= 0.85 && l >= 0.22 && l <= 0.86);
  }
  return { P, spec, where, cnt, fams, inhuman };
}

function roleOf(f, inh) {
  if (GLOVE.test(f.name)) return 'glove';
  if (KEEP.test(f.name) && !(inh && /^skin/i.test(f.name))) return null;
  if (TRIM.test(f.name)) return 'trim';
  return 'main';
}

// the colours a fighter wears now, by role (for choosing a scheme far from them)
function wearing(a) {
  const mains = Object.values(a.fams).filter((f) => roleOf(f, a.inhuman) === 'main' && f.area >= 20).sort((x, y) => y.area - x.area);
  return mains.slice(0, 3).map((f) => ({ hsl: toHsl(a.spec[f.mid]), area: f.area }));
}
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const plan = new Map(); // palette -> analysis
for (const [palName, id] of byPal) { if (ids && !ids.has(id) && !ids.has(palName)) continue; try { plan.set(palName, { id, ...analyse(palName, id) }); } catch (e) { console.log('skip', palName, e.message); } }

// scheme choice: far from what he wears (hue and lightness), not the same as the fighter before him in his hall, and the schemes shared out evenly
const use = {};
const picks = {};
const order = [];
for (const C of Object.values(CIRCUITS)) for (const id of C.fighters || []) if (FIGHTERS[id] && !order.includes(FIGHTERS[id].palette)) order.push(FIGHTERS[id].palette);
for (const p of byPal.keys()) if (!order.includes(p)) order.push(p);
const recent = [];
// the zone a palette belongs to (by his circuit)
const zoneOf = (palName) => {
  const d = FIGHTERS[byPal.get(palName)];
  const c = d && d.circuit;
  if (/^u\d$|^vorgath$/.test(c)) return 'underworld';
  if (/^v\d$|^zeroTrue$|^rival9$/.test(c)) return 'void';
  return null;
};
for (const palName of order) {
  const a = plan.get(palName);
  if (!a) continue;
  if (PICK[palName]) { picks[palName] = PICK[palName]; use[PICK[palName]] = (use[PICK[palName]] || 0) + 1; recent.push(PICK[palName]); continue; }
  const w = wearing(a);
  let best = null, bestScore = -1e9;
  const zone = zoneOf(palName);
  for (const [tn, T] of Object.entries(THEMES)) {
    if (zone ? !POOLS[zone].includes(tn) : NOT_FOR_MAIN.includes(tn)) continue;
    const t = [T.m1, T.m2, T.m3].map((h) => toHsl(hexTo5(h)));
    let sc = 0;
    w.forEach((x, i) => {
      const ti = t[Math.min(i, 2)], wgt = i === 0 ? 1 : 0.5;
      const sat = Math.min(x.hsl[1], ti[1]);
      sc += wgt * ((hueDist(x.hsl[0], ti[0]) / 180) * (0.4 + sat) + Math.abs(x.hsl[2] - ti[2]) * 0.9);
    });
    sc -= (use[tn] || 0) * 0.18;
    if (recent.slice(-4).includes(tn)) sc -= 2;
    if (sc > bestScore) { bestScore = sc; best = tn; }
  }
  picks[palName] = best; use[best] = (use[best] || 0) + 1; recent.push(best);
}

// recolour
const out = {};
function retone(c, mid, target) {
  const [hc, sc, lc] = toHsl(c), [, sm, lm] = toHsl(mid), [ht, st, lt] = toHsl(target);
  const L = Math.max(0.03, Math.min(0.97, lt + (lc - lm) * 1.05));
  const S = st <= 0.04 ? 0 : Math.max(0, Math.min(1, st * Math.max(0.55, Math.min(1.35, sc / Math.max(sm, 0.12)))));
  // darker steps drift a little toward blue, lighter ones toward yellow, as pixel artists do
  const drift = (lc - lm) * -14;
  return hslTo5((ht + (st <= 0.04 ? 0 : drift) + 360) % 360, S, L);
}
for (const [palName, a] of plan) {
  const T = THEMES[picks[palName]], fix = FIX[palName] || {};
  const mains = Object.values(a.fams).filter((f) => roleOf(f, a.inhuman) === 'main').sort((x, y) => y.area - x.area);
  const colour = {}; // family name -> hex
  let mi = 0;
  const mainCols = [T.m1, T.m2, T.m3, T.m4];
  for (const f of mains) {
    if (f.area < 14 && !a.inhuman) continue; // props and specks stay as they are
    if (f.area < 14) continue;
    colour[f.name] = mainCols[Math.min(mi, 3)]; mi++;
  }
  for (const f of Object.values(a.fams)) {
    const r = roleOf(f, a.inhuman);
    if (r === 'glove') colour[f.name] = T.glove;
    else if (r === 'trim' && f.area >= 8) colour[f.name] = T.trim;
  }
  Object.assign(colour, fix);
  const A = {}, B = {};
  for (const f of Object.values(a.fams)) {
    const hex = colour[f.name];
    if (!hex) continue;
    const target = hexTo5(hex), mid = a.spec[f.mid];
    for (const k of f.keys) {
      const n = retone(a.spec[k], mid, target);
      if (n.join() === a.spec[k].join()) continue;
      (a.where[k] === 'B' ? B : A)[k] = n;
    }
  }
  out[palName] = { theme: picks[palName], ...(Object.keys(A).length ? { A } : {}), ...(Object.keys(B).length ? { B } : {}) };
}

const fmt = (o) => Object.entries(o).map(([k, v]) => `${k}: [${v.join(', ')}]`).join(', ');
let src = `// GENERATED by tools/make-alts.mjs (schemes: tools/lib/altThemes.mjs). Every fighter's alternate costume (§16), by palette name: only the colours that
// change, [r, g, b] in 5 bits. Skin, hair, eyes and the outline are his own. Edit the tool's FIX / PICK tables and run it again rather than this file.
export const ALT_PALETTES = {
`;
for (const [k, v] of Object.entries(out)) {
  src += `  ${/^[a-z_][\w]*$/i.test(k) ? k : JSON.stringify(k)}: { theme: '${v.theme}'${v.A ? `, A: { ${fmt(v.A)} }` : ''}${v.B ? `, B: { ${fmt(v.B)} }` : ''} },\n`;
}
src += '};\n';
if (!ids) writeFileSync(new URL('../data/altPalettes.js', import.meta.url), src);
console.log(`${Object.keys(out).length} alternate costumes${ids ? ' (not written: --ids)' : ' written'}; schemes used: ${Object.entries(use).map(([k, v]) => `${k} ${v}`).join(', ')}`);
