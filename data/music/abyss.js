// The lower Underworld's music (spec §18 A7, Phase D), all original. The same chord-and-motif generator as the rest of the descent
// (summit.js `theme` / `jingle`): darker again with every landing: minor keys, the heavy triangle bass, a choir lead in the gate's dark. Every
// channel is exactly 16 bars of 4/4 (tools/audio-audit.mjs checks).
//
//   hallFight       "The Hall Remembers"    U4  F# minor, 118 bpm, the lead echoed a beat late, as if the hall itself answered
//   furnaceFight    "Pour"                  U5  C minor, 138 bpm, an anvil kit on the heat
//   abyssFight      "Before the Door"       U6  B minor, 104 bpm, the choir in thirds over slow toms
//   vorgathI/II/III "King Below"            the boss: G minor, 84, 108 and 132 bpm, one motif getting away from itself
//   rivalAbyss      Dash's melody, lower again, under a choir (Dash, the King's Champion)
//   dealBreaks      the cutscene after Vorgath: the deal breaks and the Void takes Dash
//   <id>Entrance    the champions' walk-ins;   <id>Walkup   everyone else's three bars

import { theme, jingle } from './summit.js';
import { rivalFight, rivalShowdown } from './rival.js';

const HALL = ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'E', 'C#', 'D', 'E', 'F#m', 'A', 'D', 'E', 'F#m', 'C#'];
export const hallFight = theme('hallFight', 118, HALL,
  ['0:4 2:4 1:4 0:4', '2:4 r:8 3:8 2:4 1:4', '1:4 0:4 -1:4 0:4', '0:2 r:4 -1:4'],
  ['3:4 2:4 1:4 2:4', '3:4 4:4 3:4 2:4', '2:4 1:4 0:4 1:4', '0:2 r:2'],
  { duty: 1, echo: true, kit: 'march', bass: 'walk', v1: 12, fill: 4, vn: 10 });

const FURNACE = ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Bb', 'G', 'Ab', 'Bb', 'Cm', 'Eb', 'Ab', 'Bb', 'Cm', 'G'];
export const furnaceFight = theme('furnaceFight', 138, FURNACE,
  ['0:4 0:8 2:8 3:4 2:4', '2:4 2:8 3:8 4:4 3:4', '1:8 1:8 2:8 3:8 2:4 1:4', '0:4 -1:4 0:2'],
  ['3:8 3:8 4:8 3:8 2:4 1:4', '4:8 4:8 5:8 4:8 3:4 2:4', '5:4 4:4 3:4 2:4', '3:2 r:2'],
  { duty: 2, p2: 'choir', kit: 'anvil', bass: 'walk', v1: 12, v2: 8, fill: 2, vn: 12 });

const ABYSS = ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'A', 'F#', 'G', 'A', 'Bm', 'D', 'G', 'A', 'Bm', 'F#'];
export const abyssFight = theme('abyssFight', 104, ABYSS,
  ['0:2 2:2', '2:2 1:2', '1:4 0:4 -1:4 0:4', '0:2 r:2'],
  ['3:4 2:4 1:4 2:4', '3:2 4:2', '2:4 1:4 0:4 1:4', '0:1'],
  { duty: 1, p2: 'thirds', kit: 'tom', bass: 'long', v1: 12, v2: 8, fill: 4, vn: 11 });

// the boss: one G-minor motif, slow, then quicker, then at a run
const KING = ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'F', 'D', 'Eb', 'F', 'Gm', 'Bb', 'Eb', 'F', 'Gm', 'D'];
export const vorgathI = theme('vorgathI', 84, KING,
  ['0:2 2:2', '2:2 1:2', '1:2 0:2', '0:1'],
  ['3:2 2:2', '2:2 1:2', '1:2 2:2', '0:1'],
  { duty: 2, p2: 'choir', kit: 'choir', bass: 'long', v1: 12, v2: 9, fill: 8, vn: 9 });
export const vorgathII = theme('vorgathII', 108, KING,
  ['0:4 2:4 1:4 0:4', '2:4 r:8 3:8 2:4 1:4', '1:4 0:4 -1:4 0:4', '0:2 r:4 -1:4'],
  ['3:4 2:4 1:4 2:4', '3:4 4:4 3:4 2:4', '2:4 1:4 0:4 1:4', '0:2 r:2'],
  { duty: 2, p2: 'choir', kit: 'tom', bass: 'walk', v1: 12, v2: 9, fill: 4, vn: 11 });
export const vorgathIII = theme('vorgathIII', 132, KING,
  ['0:8 0:8 2:8 3:8 2:4 1:4', '2:8 2:8 3:8 4:8 3:4 2:4', '1:8 1:8 2:8 3:8 2:4 0:4', '0:8 1:8 2:4 r:4 -1:4'],
  ['4:8 3:8 4:8 5:8 4:4 3:4', '5:8 4:8 5:8 6:8 5:4 4:4', '3:8 4:8 5:8 4:8 3:4 2:4', '2:2 r:2'],
  { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 13, v2: 9, fill: 2, vn: 13 });

// Dash, the King's Champion: the rival's melody again, lower still, with the choir under it
export const rivalAbyss = {
  id: 'rivalAbyss',
  tempo: 152,
  channels: {
    p1: { duty: 2, env: { decay: 0.3, sustain: 0.6 }, vibrato: true, mml: rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(3, +d - 1)}`) },
    p2: { duty: 1, env: { decay: 0.4, sustain: 0.55 }, vibrato: true, mml: `v6 ${rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(2, +d - 2)}`)}` },
    tri: { ...rivalShowdown.channels.tri },
    noise: { ...rivalShowdown.channels.noise },
  },
};

// the deal breaks (the cutscene after Vorgath): slow, low, and never quite settling
const DEAL = ['Gm', 'Eb', 'Cm', 'D', 'Gm', 'Eb', 'Cm', 'D', 'Eb', 'Cm', 'Gm', 'D', 'Eb', 'Cm', 'D', 'Gm'];
export const dealBreaks = theme('dealBreaks', 60, DEAL,
  ['1:2 0:2', '0:2 -1:2', '1:2 2:2', '1:1'],
  ['2:2 3:2', '3:2 2:2', '1:2 0:2', '0:1'],
  { duty: 2, p2: 'choir', kit: 'choir', bass: 'long', v1: 10, v2: 8, fill: 8, vn: 6 });

// --- entrances: the champions' walk-ins ------------------------------------------------------------------------
export const fkarverEntrance = jingle('fkarverEntrance', 88, ['F#m', 'D', 'E', 'C#'], ['0:4 2:4 4:4 2:4', '3:4 1:4 3:4 5:4', '1:4 3:4 5:4 3:4', '2:4 1:4 0:2'], { duty: 2, duty2: 1, vib: true, kit: 'march', v1: 12, vn: 10, bass: 'walk', arpLen: 8 });
export const crucibleEntrance = jingle('crucibleEntrance', 100, ['Cm', 'Ab', 'Bb', 'G'], ['0:4 0:8 2:8 3:4 2:4', '2:4 2:8 3:8 4:4 3:4', '3:4 3:8 4:8 5:4 4:4', '4:4 3:4 1:2'], { duty: 2, duty2: 2, vib: true, kit: 'anvil', v1: 12, vn: 11, bass: 'walk', arpLen: 8 });
export const heraldEntrance = jingle('heraldEntrance', 92, ['Bm', 'G', 'A', 'F#'], ['0:4 2:4 3:4 5:4', '2:4 4:4 5:4 7:4', '1:4 3:4 5:4 3:4', '4:4 3:4 1:2'], { duty: 2, duty2: 1, vib: true, kit: 'tom', v1: 12, vn: 10, bass: 'long', arpLen: 8 });
export const vorgathEntrance = jingle('vorgathEntrance', 76, ['Gm', 'Eb', 'F', 'D'], ['0:2 2:2', '2:2 4:2', '1:2 3:2', '0:1'], { duty: 2, duty2: 2, vib: true, kit: 'tom', v1: 13, vn: 11, bass: 'long', arpLen: 8 });

// --- walk-ups: three bars for each of the rest ------------------------------------------------------------------
const W3 = (id, tempo, chords, motif, o) => jingle(id + 'Walkup', tempo, chords, motif, o);
export const ABYSS_WALKUPS = [
  // the Hall of the Fallen
  W3('fbrody', 74, ['F#m', 'C#m', 'D'], ['0:2 2:2', '1:2 0:2', '0:1'], { duty: 2, duty2: 2, kit: 'tom', bass: 'long', v1: 12, vn: 10 }),
  W3('fmidnight', 112, ['Bm', 'G', 'A'], ['0:8 1:8 2:8 3:8 4:8 3:8 2:8 1:8', '3:8 2:8 1:8 0:8 1:8 2:8 3:8 4:8', '2:4 1:4 0:2'], { duty: 1, kit: null, v1: 10, vn: 6 }),
  W3('fvale', 132, ['F#m', 'D', 'E'], ['0:8 2:8 0:8 2:8 3:8 2:8 3:8 4:8', '2:8 3:8 2:8 3:8 4:8 3:8 4:8 5:8', '5:4 4:4 3:2'], { duty: 0, kit: 'std', v1: 10, vn: 7 }),
  // the Furnace
  W3('stoker', 84, ['Cm', 'Gm', 'Ab'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '1:2 0:2'], { duty: 2, duty2: 2, kit: 'anvil', v1: 12, vn: 12, bass: 'walk' }),
  W3('brand', 120, ['Cm', 'G', 'Cm'], ['0:4 2:4 3:4 2:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'], { duty: 1, duty2: 1, vib: true, kit: 'march', v1: 11 }),
  W3('slag', 78, ['Ab', 'Eb', 'Bb'], ['0:2 0:4 2:4', '2:2 2:4 3:4', '3:1'], { duty: 2, duty2: 2, kit: 'tom', bass: 'long', v1: 12, vn: 11 }),
  // the Abyss Gate
  W3('nox', 70, ['Bm', 'F#m', 'G'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '1:2 0:2'], { duty: 2, duty2: 2, kit: 'tom', v1: 12, vn: 12, bass: 'long' }),
  W3('umbra', 140, ['Bm', 'A', 'G'], ['3:8 r:8 3:8 r:8 3:8 r:8 4:8 r:8', '4:8 r:8 4:8 r:8 5:8 r:8 4:8 r:8', '3:4 2:4 1:2'], { duty: 0, kit: 'glass', v1: 10 }),
  W3('lament', 96, ['Bm', 'G', 'F#'], ['0:2 2:2', '2:2 1:2', '0:1'], { duty: 1, duty2: 1, vib: true, kit: 'choir', v1: 11, bass: 'long' }),
  W3('grasp', 72, ['G', 'D', 'Bm'], ['0:2 0:4 2:4', '2:2 2:4 3:4', '3:1'], { duty: 2, duty2: 2, kit: 'tom', bass: 'long', v1: 12, vn: 11 }),
];
