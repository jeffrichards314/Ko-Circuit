// The Pantheon's upper music (spec §18 A7, Phase B), all original. The lower circuits (pantheon.js)
// were written bar by bar; these are built from a small generator so a whole climb of themes (P4-P7,
// Halcyon's three forms, the walk-ups and entrances) share one voice: bright, choir-like pulse leads that
// grow grander as you go up. A theme is a key, a 16-bar chord progression and two four-bar motifs; the
// lead follows the chords (each motif note is a chord tone, so it always fits what's under it), the second
// pulse is an arpeggio, a choir or an echo, the triangle plays the bass and the noise channel a kit.
// Every channel is exactly 16 bars of 4/4 (tools/audio-audit.mjs checks).
//
//   starFight      "Starlight"          P4  E major, 138 bpm, glittering arpeggios
//   forgeFight     "Under the Hammer"   P5  F major, 152 bpm, anvil kit
//   sanctumFight   "Hall of Mirrors"    P6  G major, 126 bpm, the melody echoed a beat late
//   summitFight    "The Last Stair"     P7  C major, 120 bpm, the choir in thirds
//   halcyonDawn / halcyonNoon / halcyonDusk    the three forms of the boss
//   barneyAscendedFight   the Rookie theme with a choir lead, at Pantheon speed
//   rivalDesperate        Dash's melody, one more time, a little frayed (Dash VI)
//   fallTheme             The Fall (cutscene): the gate of light, then the drop
//   <id>Entrance          the champions' walk-ins;   <id>Walkup   everyone else's three bars

import rookieFight from './rookie.js';
import { rivalShowdown, rivalFight } from './rival.js';

// --- a little theory -----------------------------------------------------------------------------
const NAMES = ['c', 'c+', 'd', 'd+', 'e', 'f', 'f+', 'g', 'g+', 'a', 'a+', 'b'];
const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const pcOf = (s) => (PC[s[0].toLowerCase()] + (s[1] === '#' ? 1 : s[1] === 'b' ? -1 : 0) + 12) % 12;
const hasAcc = (s) => s[1] === '#' || s[1] === 'b';
// 'F#m' -> { pc: 6, minor: true }
function chord(name) {
  const n = hasAcc(name) ? 2 : 1;
  return { pc: pcOf(name), minor: name.slice(n) === 'm' };
}
const tones = (ch) => [ch.pc, ch.pc + (ch.minor ? 3 : 4), ch.pc + 7];
const tok = (semi, len) => `o${Math.floor(semi / 12)} ${NAMES[((semi % 12) + 12) % 12]}${len}`;
// the value of a length token in beats (4 = a quarter = 1 beat); dotted lengths end with '.'
const beats = (len) => { const dot = String(len).endsWith('.'), n = parseInt(len, 10); return (4 / n) * (dot ? 1.5 : 1); };

// A motif bar: "0:8 1:8 2:8 3:8 2:4 1:4" = chord-tone indices (0 root, 1 third, 2 fifth, 3 the octave root,
// -1 the fifth below...) with note lengths; r:8 is a rest. Every bar must add up to 4 beats.
function bar(chordName, text, base = 5) {
  const ch = chord(chordName), t = tones(ch);
  let root = ch.pc + 12 * base;
  if (root > 12 * base + 6) root -= 12;
  const out = [];
  let total = 0;
  for (const w of text.trim().split(/\s+/)) {
    const [d, len] = w.split(':');
    total += beats(len);
    if (d === 'r') { out.push({ rest: true, len }); continue; }
    const i = +d, semi = root - ch.pc + t[((i % 3) + 3) % 3] + 12 * Math.floor(i / 3);
    out.push({ semi, len });
  }
  if (Math.abs(total - 4) > 1e-9) throw new Error(`music: bar "${text}" is ${total} beats`);
  return out;
}
const emit = (notes) => notes.map((n) => (n.rest ? `r${n.len}` : tok(n.semi, n.len))).join(' ');

// 16 bars: the chord of each bar and the four-bar motifs (A, B) in the form A A B A'
function leadTokens(chords, A, B, form = 'AABA', base = 5) {
  const bars = [];
  const sets = { A, B };
  form.split('').forEach((f, pi) => sets[f === "'" ? 'A' : f].forEach((txt, bi) => bars.push(bar(chords[pi * 4 + bi], txt, base))));
  return bars;
}
const barsMml = (bars) => bars.map(emit).join(' | ') + ' |';

// an arpeggio / choir / bass under the chords
const arpMml = (chords, len = 16, oct = 4, pat = [0, 1, 2, 1]) => chords.map((c) => {
  const ch = chord(c), t = tones(ch);
  const seq = pat.map((i) => tok(12 * oct + ch.pc + (t[i] - ch.pc), len)).join(' ');
  return `${seq} ${seq} ${len === 16 ? `${seq} ${seq}` : ''}`.trim();
}).join(' | ') + ' |';
const choirMml = (chords, oct = 4, up = 1) => chords.map((c) => { const ch = chord(c), t = tones(ch); return `${tok(12 * oct + t[up], 2)} ${tok(12 * oct + t[(up + 1) % 3] + (up + 1 >= 3 ? 12 : 0), 2)}`; }).join(' | ') + ' |';
const bassMml = (chords, style = 'oct') => chords.map((c) => {
  const ch = chord(c), r = ch.pc + 24;
  if (style === 'long') return `${tok(r, 4)} ${tok(r, 4)} ${tok(r + 12, 4)} ${tok(r, 4)}`;
  if (style === 'walk') return `${tok(r, 8)} ${tok(r, 8)} ${tok(r + 7, 8)} ${tok(r + 7, 8)} ${tok(r + 12, 8)} ${tok(r + 7, 8)} ${tok(r, 4)}`;
  return `${[0, 1, 0, 1].map((k) => tok(r + 12 * k, 8)).join(' ')} ${[0, 1, 0, 1].map((k) => tok(r + 12 * k, 8)).join(' ')}`;
}).join(' | ') + ' |';

const KITS = {
  std: 'k8 h8 s8 h8 k8 k8 s8 h8',
  march: 'k8 h8 s8 h8 k8 h8 s8 h8',
  anvil: 'k8 x8 s8 r8 k8 x8 s8 h8',
  glass: 'h8 r8 s8 r8 h8 r8 s8 h8',
  choir: 'k4 r4 s4 r4',
  tom: 'k8 k8 s8 s8 k8 k8 s8 s8',
};
const FILL = 'k8 h8 s8 h8 s16 s16 s16 s16 s8 x8';
const kitMml = (kit, fillEvery = 4) => Array.from({ length: 16 }, (_, i) => ((i + 1) % fillEvery === 0 ? FILL : KITS[kit])).join(' | ') + ' |';

const P = (duty, decay = 0.3, sustain = 0.65, extra = {}) => ({ duty, env: { decay, sustain }, ...extra });

// Compose a looping fight theme
export function theme(id, tempo, chords, A, B, o = {}) {
  const lead = leadTokens(chords, A, B, o.form || 'AABA', o.base || 5);
  const p1 = { ...P(o.duty ?? 2, 0.3, 0.72, { vibrato: true }), mml: `v${o.v1 ?? 12} ${barsMml(lead)}` };
  const ch = { p1 };
  if (o.echo) {
    // the same lead a beat late and quieter: drop the last beat so the loop still lines up
    const shifted = lead.map((b) => b.slice());
    const last = shifted[shifted.length - 1];
    let cut = 1;
    while (cut > 1e-9) { const n = last[last.length - 1], b = beats(n.len); if (b <= cut + 1e-9) { last.pop(); cut -= b; } else throw new Error('echo: cannot trim'); }
    ch.p2 = { ...P(0, 0.2, 0.4), mml: `v${o.v2 ?? 6} r4 ${barsMml(shifted)}` };
  } else if (o.p2 === 'choir') ch.p2 = { ...P(1, 0.4, 0.6), mml: `v${o.v2 ?? 7} ${choirMml(chords, 4, 1)}` };
  else if (o.p2 === 'thirds') {
    // the lead a third above, in the choir's voice
    const up = lead.map((b) => b.map((n) => (n.rest ? n : { ...n, semi: n.semi + 4 })));
    ch.p2 = { ...P(1, 0.3, 0.6, { vibrato: true }), mml: `v${o.v2 ?? 8} ${barsMml(up)}` };
  } else ch.p2 = { ...P(o.duty2 ?? 0, 0.05, 0.3), mml: `v${o.v2 ?? 6} ${arpMml(chords, 16, o.arpOct || 4)}` };
  ch.tri = { env: { decay: 0.12, sustain: 0.6 }, mml: `v15 ${bassMml(chords, o.bass || 'oct')}` };
  ch.noise = { mml: `v${o.vn ?? 10} ${kitMml(o.kit || 'std', o.fill || 4)}` };
  return { id, tempo, channels: ch };
}

// a short jingle (walk-up: 3 bars, entrance: 4): chords, one motif bar each, a bass and a beat
export function jingle(id, tempo, chords, motif, o = {}) {
  const lead = chords.map((c, i) => bar(c, motif[i % motif.length], o.base || 5));
  const ch = {
    p1: { ...P(o.duty ?? 1, 0.3, 0.65, o.vib ? { vibrato: true } : {}), mml: `v${o.v1 ?? 11} ${barsMml(lead)}` },
    p2: { ...P(o.duty2 ?? 0, 0.06, 0.3), mml: `v${o.v2 ?? 6} ${arpMml(chords, o.arpLen || 16, o.arpOct || 4)}` },
    tri: { mml: `v15 ${bassMml(chords, o.bass || 'oct')}` },
  };
  if (o.kit !== null) ch.noise = { mml: `v${o.vn ?? 8} ${chords.map(() => KITS[o.kit || 'march']).join(' | ')} |` };
  return { id, tempo, loop: false, channels: ch };
}

// --- the four fight themes -----------------------------------------------------------------------
const STAR = ['E', 'B', 'C#m', 'A', 'E', 'B', 'A', 'B', 'C#m', 'A', 'E', 'B', 'A', 'B', 'E', 'B'];
export const starFight = theme('starFight', 138, STAR,
  ['0:4 1:8 2:8 3:4 2:4', '2:8 3:8 4:8 5:8 4:4 3:4', '1:8 2:8 3:8 2:8 1:4 0:4', '0:8 1:8 2:4 1:8 0:8 -1:4'],
  ['3:4 4:8 3:8 2:4 1:4', '4:4 5:8 4:8 3:4 2:4', '5:4 4:8 3:8 4:8 5:8 6:4', '3:2 2:4 r:4'],
  { duty: 2, kit: 'std', arpOct: 5 });

const FORGE = ['F', 'C', 'Dm', 'A#', 'F', 'C', 'A#', 'C', 'Dm', 'A#', 'F', 'C', 'A#', 'C', 'F', 'C'];
export const forgeFight = theme('forgeFight', 152, FORGE,
  ['0:4 0:8 1:8 2:4 3:4', '2:4 2:8 3:8 4:4 3:4', '1:8 1:8 2:8 3:8 4:4 3:4', '2:8 1:8 0:4 -1:4 0:4'],
  ['3:8 3:8 4:8 3:8 2:4 1:4', '4:8 4:8 5:8 4:8 3:4 2:4', '5:4 4:4 3:4 2:4', '3:4 2:4 1:4 0:4'],
  { duty: 2, kit: 'anvil', bass: 'walk', p2: 'choir', fill: 2, vn: 12 });

const SANCTUM = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'D'];
export const sanctumFight = theme('sanctumFight', 126, SANCTUM,
  ['0:8 2:8 3:8 2:8 1:4 0:4', '2:8 4:8 5:8 4:8 3:4 2:4', '1:8 3:8 4:8 3:8 2:4 1:4', '0:8 1:8 2:4 3:4 r:4'],
  ['5:4 4:8 3:8 2:4 3:4', '4:4 3:8 2:8 1:4 2:4', '3:8 4:8 5:8 4:8 3:4 2:4', '1:2 0:4 r:4'],
  { duty: 1, echo: true, kit: 'glass', bass: 'long', v1: 11 });

const SUMMIT = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'G'];
export const summitFight = theme('summitFight', 120, SUMMIT,
  ['0:4 2:4 3:4 2:4', '2:4 4:4 5:4 4:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'],
  ['3:4 4:4 5:2', '5:4 4:4 3:2', '4:4 5:4 6:4 5:4', '3:2 2:2'],
  { duty: 2, p2: 'thirds', kit: 'march', bass: 'long', v1: 12, v2: 9, fill: 4, vn: 11 });

// --- Halcyon: one boss, three forms, three themes ----------------------------------------------------
const DAWN = ['A', 'E', 'F#m', 'D', 'A', 'E', 'D', 'E', 'F#m', 'D', 'A', 'E', 'D', 'E', 'A', 'E'];
export const halcyonDawn = theme('halcyonDawn', 172, DAWN,
  ['0:8 1:8 2:8 3:8 2:8 1:8 2:8 3:8', '2:8 3:8 4:8 5:8 4:8 3:8 4:8 5:8', '1:8 2:8 3:8 4:8 3:8 2:8 3:8 4:8', '0:8 2:8 4:8 2:8 3:4 r:4'],
  ['5:8 4:8 3:8 4:8 5:8 6:8 5:8 4:8', '6:8 5:8 4:8 5:8 6:8 7:8 6:8 5:8', '3:8 4:8 5:8 6:8 7:4 6:4', '5:2 3:4 r:4'],
  { duty: 2, kit: 'std', arpOct: 5, v1: 12, fill: 4 });

const NOON = ['C#', 'G#', 'A#m', 'F#', 'C#', 'G#', 'F#', 'G#', 'A#m', 'F#', 'C#', 'G#', 'F#', 'G#', 'C#', 'G#'];
export const halcyonNoon = theme('halcyonNoon', 132, NOON,
  ['3:2 4:4 3:4', '5:2 4:4 3:4', '4:2 3:4 2:4', '3:1'],
  ['5:4 5:4 6:2', '7:4 6:4 5:2', '6:4 5:4 4:4 3:4', '5:1'],
  { duty: 1, kit: 'choir', p2: 'thirds', bass: 'long', v1: 12, v2: 9, fill: 8, vn: 8 });

const DUSK = ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'A', 'E', 'Bm', 'G', 'D', 'A', 'F#m', 'D', 'E', 'E'];
export const halcyonDusk = theme('halcyonDusk', 88, DUSK,
  ['3:2 2:4 1:4', '2:2 1:4 0:4', '1:2 2:4 3:4', '2:2 r:2'],
  ['5:2 4:4 3:4', '4:2 3:4 2:4', '3:2 4:4 5:4', '4:2 r:2'],
  { duty: 2, kit: 'tom', bass: 'long', p2: 'choir', v1: 12, v2: 8, fill: 4, vn: 12 });

// --- Barney Ascended: the Rookie theme, with a choir lead --------------------------------------------
const RK = rookieFight.channels;
export const barneyAscendedFight = {
  id: 'barneyAscendedFight',
  tempo: 168,
  channels: {
    // the same melody, now a slow-attack choir pulse, doubled an octave up in white-gold square
    p1: { duty: 1, env: { decay: 0.55, sustain: 0.8 }, vibrato: true, mml: RK.p1.mml.replace(/v11/, 'v11') },
    p2: { duty: 2, env: { decay: 0.35, sustain: 0.55 }, vibrato: true, mml: `v6 ${RK.p1.mml.replace(/o(\d)/g, (m, d) => `o${+d + 1}`)}` },
    tri: { ...RK.tri },
    noise: { ...RK.noise },
  },
};
void RK.p2;

// --- Dash VI: the rival's melody, frayed -------------------------------------------------------------
export const rivalDesperate = {
  id: 'rivalDesperate',
  tempo: 170,
  channels: {
    p1: { duty: 0, env: { decay: 0.22, sustain: 0.6 }, vibrato: true, mml: rivalFight.channels.p1.mml.replace(/v12/, 'v12') },
    // the melody again an octave down, low and heavy: the echo of a man who can't shake his own tune
    p2: { duty: 2, env: { decay: 0.3, sustain: 0.5 }, mml: `v8 ${rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(2, +d - 1)}`)}` },
    tri: { ...rivalShowdown.channels.tri },
    noise: { ...rivalShowdown.channels.noise },
  },
};

// --- The Fall: the gate of light, then the drop ------------------------------------------------------
export const fallTheme = {
  id: 'fallTheme',
  tempo: 84,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.6, sustain: 0.7 }, vibrato: true,
      mml: `l4 v11
        o5 d2 f+2 | o5 a2 o6 d2 | o6 e2 d2 | o6 f+1 |
        o6 a2 g2 | o6 f+2 e2 | o6 d1 | r1 |
        o5 a2. g+4 | o5 g2. f+4 | o5 f2. e4 | o5 d+2. d4 |
        o4 c+2. c4 | o4 b2. a+4 | o4 a2 g+2 | o4 g1 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.6, sustain: 0.5 }, vibrato: true,
      mml: `l4 v7
        o4 a2 >d2< | o4 >d2 f+2< | o5 c+2 f+2 | o5 a1 |
        o5 f+2 e2 | o5 d2 c+2 | o5 f+1 | r1 |
        o4 f2. e4 | o4 e2. d+4 | o4 d2. c+4 | o4 c2. o3 b4 |
        o3 a2. g+4 | o3 g2. f+4 | o3 f2 e2 | o3 d+1 |`,
    },
    tri: { env: { decay: 0.4, sustain: 0.8 }, mml: `l2 v14 o2 d a | o2 d a | o2 e a | o2 d1 | o2 f+ e | o2 d a | o2 d1 | r1 | o2 f e | o2 e d+ | o2 d c+ | o2 c o1 b | o1 a g+ | o1 g f+ | o1 f e | o1 d+1 |` },
    noise: { mml: `v8 r1 | r1 | r1 | r1 | r1 | r1 | k4 r4 k4 r4 | r1 | k4 r4 s4 r4 | k4 r4 s4 r4 | k4 r4 s4 r4 | k4 r4 s4 s4 | k4 r4 s4 r4 | k4 r4 s4 r4 | k4 r4 s4 s4 | x1 |` },
  },
  loop: false,
};

// --- entrances: the champions' walk-ins --------------------------------------------------------------
export const nebulaEntrance = jingle('nebulaEntrance', 92, ['E', 'C#m', 'A', 'B'], ['0:4 2:4 4:4 2:4', '1:4 3:4 5:4 3:4', '0:4 2:4 3:4 2:4', '2:4 4:4 5:2'], { duty: 2, duty2: 1, vib: true, arpLen: 8, kit: 'glass', v1: 12 });
export const haleEntrance = jingle('haleEntrance', 108, ['F', 'C', 'A#', 'C'], ['0:4 0:8 2:8 3:4 2:4', '2:4 2:8 3:8 4:4 3:4', '3:4 3:8 4:8 5:4 4:4', '4:4 3:4 2:2'], { duty: 2, duty2: 2, vib: true, kit: 'anvil', v1: 12, vn: 11, bass: 'walk' });
export const prismEntrance = jingle('prismEntrance', 116, ['G', 'D', 'Em', 'C'], ['0:8 2:8 3:8 4:8 3:4 2:4', '2:8 4:8 5:8 6:8 5:4 4:4', '1:8 3:8 4:8 5:8 4:4 3:4', '3:8 2:8 1:8 0:8 2:2'], { duty: 1, duty2: 0, vib: true, kit: 'glass', v1: 12 });
export const rhoEntrance = jingle('rhoEntrance', 112, ['C', 'G', 'Am', 'F'], ['0:4 2:4 3:4 5:4', '2:4 4:4 5:4 7:4', '1:4 3:4 4:4 6:4', '2:4 3:4 5:2'], { duty: 2, duty2: 1, vib: true, kit: 'march', v1: 12, arpLen: 8 });
export const halcyonEntrance = jingle('halcyonEntrance', 96, ['A', 'E', 'F#m', 'D'], ['0:4 2:4 3:4 5:4', '2:4 4:4 5:4 7:4', '1:4 3:4 5:4 6:4', '3:4 5:4 7:2'], { duty: 2, duty2: 1, vib: true, kit: 'choir', v1: 13, vn: 9, arpLen: 8 });

// --- walk-ups: three bars for each of the rest -------------------------------------------------------
const W3 = (id, tempo, chords, motif, o) => jingle(id + 'Walkup', tempo, chords, motif, o);
export const SUMMIT_WALKUPS = [
  // Starfield
  W3('polaris', 92, ['E', 'A', 'B'], ['3:4 2:4 1:4 0:4', '1:4 3:4 5:4 3:4', '2:4 3:4 4:2'], { duty: 0, arpLen: 8, kit: null, v1: 10 }),
  W3('kira', 176, ['C#m', 'A', 'B'], ['0:8 1:8 2:8 3:8 4:8 3:8 2:8 1:8', '3:8 2:8 1:8 2:8 3:8 4:8 5:8 4:8', '5:4 4:4 3:2'], { duty: 2, kit: 'std', v1: 11 }),
  W3('orbit', 104, ['G', 'D', 'Em'], ['0:4 2:4 3:4 2:4', '2:4 4:4 3:4 2:4', '1:4 3:4 2:2'], { duty: 1, kit: 'march', arpLen: 8 }),
  // Thunder Forge
  W3('anvil', 96, ['F', 'C', 'A#'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '3:4 2:4 0:2'], { duty: 2, duty2: 2, kit: 'anvil', v1: 12, bass: 'walk', vn: 12 }),
  W3('spark', 168, ['A', 'D', 'E'], ['0:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '3:8 r:8 5:8 r:8 4:8 r:8 3:8 r:8', '5:4 4:4 3:2'], { duty: 0, kit: 'std', v1: 11 }),
  W3('bellows', 84, ['D', 'A', 'G'], ['0:2 2:2', '2:2 3:2', '3:1'], { duty: 2, duty2: 2, kit: null, v1: 12, bass: 'long' }),
  // Mirror Sanctum
  W3('reflection', 120, ['A', 'E', 'F#m'], ['0:8 1:8 2:8 3:8 3:8 2:8 1:8 0:8', '2:8 3:8 4:8 5:8 5:8 4:8 3:8 2:8', '1:4 2:4 3:2'], { duty: 1, kit: 'glass', arpLen: 8 }),
  W3('glass', 140, ['E', 'B', 'C#m'], ['4:8 r:8 5:8 r:8 6:8 r:8 5:8 r:8', '5:8 r:8 6:8 r:8 7:8 r:8 6:8 r:8', '7:2 r:2'], { duty: 0, kit: null, v1: 10 }),
  W3('doubt', 100, ['D', 'Bm', 'A'], ['3:4 r:4 3:4 r:4', '2:4 r:4 2:4 r:4', '1:2 0:2'], { duty: 2, kit: 'choir', v1: 9 }),
  // the Summit
  W3('aldric', 108, ['C', 'F', 'G'], ['0:4 2:4 3:4 5:4', '3:4 5:4 6:4 8:4', '7:4 5:4 3:2'], { duty: 2, duty2: 1, vib: true, kit: 'march', v1: 12 }),
  W3('valkyr', 152, ['D', 'A', 'Bm'], ['3:8 2:8 1:8 0:8 -1:8 0:8 1:8 2:8', '2:8 1:8 0:8 -1:8 -2:8 -1:8 0:8 1:8', '0:4 1:4 2:2'], { duty: 2, kit: 'std', v1: 12 }),
  W3('scribe', 112, ['A', 'D', 'E'], ['0:8 r:8 1:8 r:8 2:8 r:8 3:8 r:8', '3:8 r:8 2:8 r:8 1:8 r:8 2:8 r:8', '3:2 r:2'], { duty: 0, kit: 'choir', v1: 10 }),
  W3('verity', 96, ['G', 'C', 'D'], ['0:4 2:4 4:4 2:4', '3:4 5:4 4:4 3:4', '2:4 1:4 0:2'], { duty: 1, duty2: 1, vib: true, kit: 'choir', v1: 11 }),
  W3('barney2', 132, ['G', 'C', 'D'], ['0:4 1:8 2:8 3:8 2:8 1:8 0:8', '3:4 4:8 3:8 2:8 1:8 2:8 3:8', '4:4 3:4 2:2'], { duty: 1, duty2: 2, vib: true, kit: 'march', v1: 12 }),
];
