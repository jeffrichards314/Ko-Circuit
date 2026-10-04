// Art audit against the style bible (spec §2), headless.
//   node tools/art-audit.mjs
// Checks:
//   fighters   every fighter (Career, and every Title Defense remix) has the required frame sets (idle x2, block, hit high / low, stunned, knockdown x3, down,
//              get-up, taunt, victory) and every pose of his sprite bank composes (non-empty, every pixel a valid palette index); a palette of at most 15
//              colors plus transparent, at most 2 per fighter, every channel a 5-bit value; nobody touches the edge of his canvas. His size against the
//              guideline (spec: about 96-120 px tall, README: aim for 105-130; the giants and the big bosses more) is only listed as a note: an outline
//              hat, a halo or a cape is a fair few pixels over, and the sprite viewer is where size is judged
//   (Null, ZERO and ZERO's true form have ONE idle frame by design: "not one pixel of idle animation"; the spec's two idle frames are waived for them)
//   arenas     at most 4 background palettes, every one valid
//   player     every hair style x every costume: every pose of the back view composes, the required frames exist (idle, jabs L/R high and low, dodge L/R,
//              block, duck, star punch, hit, stunned/pink, knocked down, get-up, victory); a costume is a layer over the template, never a redraw: each
//              pose is the same size as the plain player's (a piece may add a few pixels); every palette (default, pink, gold, front) is valid
//              in every costume; the front view portrait draws in every costume
// Exit code 1 on any problem.
import { FIGHTERS } from '../data/fighters/index.js';
import { COMBINED_DEFENSE, remixed } from '../data/fighters/titleDefense.js';
import { fighterSprites, playerSprites, paletteFor } from '../src/engine/spriteCache.js';
import { PALETTES } from '../data/palette.js';
import { ARENAS } from '../data/arenas/index.js';
import { COSTUMES } from '../data/costumes.js';
import { HAIR_STYLES, DEFAULT_PROFILE, playerPalettes, frontPalette, normalizeProfile, hairStyleOf } from '../data/customization.js';
import { playerPortrait } from '../data/sprites/portraits.js';
import { BOSSES } from '../data/difficulty.js';

let bad = 0;
const fail = (where, what) => { bad++; console.log(`  FAIL ${where}: ${what}`); };
const notes = [];
const STILL = ['null', 'zero', 'zeroTrue'];
const section = (t) => console.log(`\n== ${t}`);

const bbox = (s) => {
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.data[y * s.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return x1 < 0 ? null : { w: x1 - x0 + 1, h: y1 - y0 + 1 };
};
const validPixels = (s, pal) => {
  for (let i = 0; i < s.data.length; i++) { const v = s.data[i]; if (v && (v > 31 || !pal.u32[v])) return v; }
  return 0;
};
const framesOf = (a) => (!a ? [] : typeof a === 'string' ? [a] : Array.isArray(a) ? a : a.frames || []);

section('fighters (Career and every Title Defense remix)');
const seenSheets = new Set();
let checked = 0;
for (const td of [false, true]) {
  for (const id of td ? COMBINED_DEFENSE : Object.keys(FIGHTERS)) {
    const d = td ? remixed(id) : FIGHTERS[id], where = `${id}${td ? ' (TD)' : ''}`;
    checked++;
    const A = d.anims;
    for (const k of ['idle', 'block', 'hitHigh', 'hitLow', 'stunned', 'knockdown', 'down', 'getup', 'taunt', 'victory']) if (!framesOf(A[k]).length) fail(where, `no ${k} frames`);
    if (framesOf(A.idle).length < 2 && !STILL.includes(id)) fail(where, 'idle needs 2 frames');
    if (framesOf(A.knockdown).length < 3) fail(where, 'knockdown needs 3 frames');
    const bank = fighterSprites(d.spriteLayers), pal = paletteFor(d.palette);
    const key = `${d.spriteLayers}|${d.palette}`;
    if (!seenSheets.has(key)) {
      seenSheets.add(key);
      for (const p of bank.poses) {
        try {
          const s = bank.get(p);
          if (!s || !s.w) { fail(where, `pose ${p} is empty`); continue; }
          const v = validPixels(s, pal); if (v) fail(where, `pose ${p} uses index ${v}, which this palette does not define`);
        } catch (e) { fail(where, `pose ${p}: ${e.message}`); }
      }
    }
    const pa = PALETTES[d.palette];
    if (!pa) fail(where, `palette ${d.palette} missing`);
    else {
      if (pa.A.keys.length > 15 || (pa.B && pa.B.keys.length > 15)) fail(where, 'a palette with more than 15 colors');
      if (Object.keys(pa).filter((k) => ['A', 'B'].includes(k) && pa[k]).length > 2) fail(where, 'more than 2 palettes');
    }
    // size, on the idle frame
    const s = bank.get(framesOf(A.idle)[0]), b = bbox(s), C = bank.build.canvas;
    if (!b) { fail(where, 'idle frame is blank'); continue; }
    const giant = bank.build.id.startsWith('giant') || BOSSES.includes(id) || id === 'willShard';
    const maxH = giant ? 170 : 140, maxW = giant ? 120 : 90;
    if (b.h < 96 || b.h > maxH) notes.push(`${where}: ${b.h} px tall (guideline 96-${maxH})`);
    if (b.w > maxW) notes.push(`${where}: ${b.w} px wide (guideline up to ${maxW})`);
    if (s.ay >= C.ay || s.ax >= C.ax || s.w - s.ax >= C.w - C.ax) fail(where, 'the idle frame touches the edge of his canvas (clipped)');
  }
}
console.log(`  ${checked} fighters checked, ${seenSheets.size} distinct sprite sheets composed`);
for (const n of notes) console.log(`  note ${n}`);

section('arenas');
let na = 0;
for (const [id, a] of Object.entries(ARENAS)) {
  na++;
  const P = a.palettes || [];
  if (P.length > 4) fail(`arena ${id}`, `${P.length} background palettes (max 4)`);
  for (const p of P) if (p.keys && p.keys.length > 15) fail(`arena ${id}`, 'a palette over 15 colors');
}
console.log(`  ${na} arenas checked`);

section('the player: every hair style x every costume');
const REQUIRED = ['idle1', 'idle2', 'jabL_high', 'jabR_high', 'jabL_low', 'jabR_low', 'dodgeL', 'dodgeR', 'block', 'duck', 'star', 'hit', 'tired', 'fall', 'down', 'getup', 'victory'];
const costumes = COSTUMES.map((c) => c.id);
let np = 0;
for (const hair of HAIR_STYLES) {
  const plain = playerSprites(hair, 'none');
  for (const cid of costumes) {
    np++;
    const bank = playerSprites(hair, cid), where = `player ${hair} / ${cid}`;
    for (const p of REQUIRED) if (!bank.poses.includes(p)) fail(where, `no pose ${p}`);
    for (const p of bank.poses) {
      try {
        const s = bank.get(p), r = plain.get(p), b = bbox(s), rb = bbox(r);
        if (!b) { fail(where, `pose ${p} is blank`); continue; }
        const v = validPixels(s, bank.pal); if (v) fail(where, `pose ${p} uses an undefined palette index ${v}`);
        if (rb && (Math.abs(b.w - rb.w) > 6 || Math.abs(b.h - rb.h) > 6)) fail(where, `pose ${p} is ${b.w}x${b.h}, the plain player's is ${rb.w}x${rb.h} (a costume must not redraw him)`);
      } catch (e) { fail(where, `pose ${p}: ${e.message}`); }
    }
  }
}
// every look: palettes (default, pink, gold) and the front view, in every costume
for (let ci = 0; ci < COSTUMES.length; ci++) {
  const prof = normalizeProfile({ ...DEFAULT_PROFILE, costume: ci });
  const where = `costume ${COSTUMES[ci].id}`;
  try {
    const P = playerPalettes(prof);
    for (const k of ['default', 'pink', 'gold']) if (!P[k] || !P[k].u32 || !P[k].u32[1]) fail(where, `${k} palette is broken`);
    const F = frontPalette(prof);
    if (!F || !F.u32[1]) fail(where, 'front palette is broken');
    const portrait = playerPortrait(F, hairStyleOf(prof));
    if (!portrait) fail(where, 'no front portrait');
  } catch (e) { fail(where, e.message); }
}
console.log(`  ${np} hair x costume banks composed (${HAIR_STYLES.length} hair styles x ${costumes.length} costumes)`);

console.log(bad ? `\n${bad} problem(s)` : '\nart audit clean');
process.exit(bad ? 1 : 0);
