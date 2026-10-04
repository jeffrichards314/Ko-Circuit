// The Void's music (spec §18 A7, Phase E), all original, from the same chord-and-motif generator as the descent (summit.js `theme` / `jingle`):
// sparse and glitchy (rests, a glass kit, thin pulse leads over 16th-note arpeggios that never quite stay on the beat), and it comes apart more with
// each fragment. ZERO's true form combines the motifs of every zone: the Void's sparse lead, the Pantheon's choir in thirds, the Underworld's triangle
// bass. Every channel is exactly 16 bars of 4/4 (tools/audio-audit.mjs checks).
//
//   voidFight1/2/3       "Nothing Yet", "Static", "Unmade"    the three fragments
//   rhythmSlow/Mid/Fast/Rush   the Rhythm Shard's four tempos (84, 112, 148, 176): one melody, the music changes with the tempo
//   zeroTrueI-IV         the four phases (the tests, the champions, the forms, full speed)
//   rivalUnbound         Dash's melody, unmoored (Dash Unbound)
//   voidMap, voidDoor    the map, and the door below the throne
//   freedTheme           a Hollowed is freed;  reforgeTheme  The Reforging;  trueEndingTheme  the true ending and the credits
//   <id>Entrance / <id>Walkup    the champions' walk-ins and everyone else's three bars

import { theme, jingle } from './summit.js';
import { rivalFight, rivalShowdown } from './rival.js';

const V1 = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E', 'F', 'G', 'Am', 'C', 'F', 'G', 'Am', 'E'];
export const voidFight1 = theme('voidFight1', 104, V1,
  ['0:4 r:4 2:4 r:4', '2:4 r:8 3:8 2:4 r:4', '1:4 r:4 0:4 r:4', '0:2 r:4 -1:4'],
  ['3:4 r:4 2:4 r:4', '3:8 r:8 4:4 3:4 r:4', '2:4 r:4 1:4 r:4', '0:2 r:2'],
  { duty: 0, kit: 'glass', bass: 'long', v1: 11, v2: 6, fill: 8, vn: 8, arpOct: 5 });

const V2 = ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'B', 'C', 'D', 'Em', 'G', 'C', 'D', 'Em', 'B'];
export const voidFight2 = theme('voidFight2', 118, V2,
  ['0:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '2:8 r:8 3:8 r:8 4:8 r:8 3:8 r:8', '1:4 r:8 0:8 1:4 r:4', '0:4 r:4 -1:2'],
  ['4:8 r:8 3:8 r:8 2:4 r:4', '3:8 r:8 2:8 r:8 1:4 r:4', '2:8 3:8 r:8 2:8 1:4 r:4', '0:2 r:2'],
  { duty: 0, kit: 'choir', bass: 'walk', p2: 'thirds', v1: 11, v2: 7, fill: 8, vn: 8 });

const V3 = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'A', 'Bb', 'C', 'Dm', 'F', 'Bb', 'C', 'Dm', 'A'];
export const voidFight3 = theme('voidFight3', 132, V3,
  ['0:8 2:8 r:8 3:8 2:8 r:8 1:8 r:8', '2:8 3:8 r:8 4:8 3:8 r:8 2:8 r:8', '1:8 r:8 0:8 r:8 -1:8 r:8 0:8 r:8', '0:4 r:4 -1:4 r:4'],
  ['5:8 r:8 4:8 r:8 3:8 4:8 r:8 3:8', '4:8 r:8 3:8 r:8 2:8 3:8 r:8 2:8', '3:8 4:8 5:8 r:8 4:8 3:8 2:8 r:8', '2:2 r:2'],
  { duty: 0, echo: true, kit: 'tom', bass: 'walk', v1: 11, v2: 5, fill: 4, vn: 9 });

// the Rhythm Shard: one melody, four tempos
const RH = ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Eb', 'C', 'Db', 'Eb', 'Fm', 'Ab', 'Db', 'Eb', 'Fm', 'C'];
const rhythm = (id, bpm, kit) => theme(id, bpm, RH,
  ['0:4 2:4 3:4 2:4', '2:4 3:4 4:4 3:4', '1:4 2:4 3:4 2:4', '0:4 r:4 -1:2'],
  ['3:4 4:4 3:4 2:4', '4:4 5:4 4:4 3:4', '3:4 2:4 1:4 2:4', '0:2 r:2'],
  { duty: 1, kit, bass: 'oct', v1: 11, v2: 6, fill: 4, vn: 10 });
export const rhythmSlow = rhythm('rhythmSlow', 84, 'choir');
export const rhythmMid = rhythm('rhythmMid', 112, 'std');
export const rhythmFast = rhythm('rhythmFast', 148, 'march');
export const rhythmRush = rhythm('rhythmRush', 176, 'anvil');

// ZERO, true form: the motifs of every zone in turn
const Z1 = ['Em', 'Em', 'C', 'D', 'Em', 'G', 'C', 'B', 'Em', 'C', 'G', 'D', 'C', 'D', 'Em', 'B'];
export const zeroTrueI = theme('zeroTrueI', 96, Z1,
  ['0:4 r:4 2:4 r:4', '2:8 r:8 3:8 r:8 2:4 r:4', '1:4 r:4 0:4 r:4', '0:2 r:4 -1:4'],
  ['3:8 r:8 2:8 r:8 3:4 r:4', '4:4 r:4 3:4 r:4', '2:8 3:8 2:8 r:8 1:4 r:4', '0:2 r:2'],
  { duty: 0, kit: 'glass', bass: 'long', v1: 12, v2: 6, fill: 8, vn: 8 });
const Z2 = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'G'];
export const zeroTrueII = theme('zeroTrueII', 112, Z2,
  ['0:4 2:4 3:4 2:4', '2:4 4:4 5:4 4:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'],
  ['3:4 4:4 5:2', '5:4 4:4 3:2', '4:4 5:4 6:4 5:4', '3:2 2:2'],
  { duty: 2, p2: 'thirds', kit: 'march', bass: 'long', v1: 12, v2: 9, fill: 4, vn: 10 });
const Z3 = ['Gm', 'Eb', 'Bb', 'F', 'Gm', 'Eb', 'F', 'D', 'Eb', 'F', 'Gm', 'Bb', 'Eb', 'F', 'Gm', 'D'];
export const zeroTrueIII = theme('zeroTrueIII', 92, Z3,
  ['0:2 2:2', '2:2 1:2', '1:4 0:4 -1:4 0:4', '0:2 r:2'],
  ['3:4 2:4 1:4 2:4', '3:2 4:2', '2:4 1:4 0:4 1:4', '0:1'],
  { duty: 2, p2: 'choir', kit: 'tom', bass: 'walk', v1: 12, v2: 8, fill: 4, vn: 11 });
const Z4 = ['Em', 'C', 'G', 'D', 'Em', 'Bb', 'F', 'D', 'C', 'G', 'Am', 'Em', 'Gm', 'D', 'Em', 'B'];
export const zeroTrueIV = theme('zeroTrueIV', 168, Z4,
  ['0:8 0:8 2:8 3:8 2:8 3:8 4:8 3:8', '2:8 2:8 3:8 4:8 3:8 4:8 5:8 4:8', '1:8 1:8 2:8 3:8 2:8 1:8 0:8 1:8', '0:8 1:8 2:4 r:4 -1:4'],
  ['5:8 4:8 5:8 6:8 5:4 4:4', '6:8 5:8 6:8 7:8 6:4 5:4', '4:8 5:8 6:8 5:8 4:4 3:4', '3:2 r:2'],
  { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 13, v2: 9, fill: 2, vn: 13 });

// Dash Unbound: his melody again, an octave up and an octave down at once, under a choir
export const rivalUnbound = {
  id: 'rivalUnbound',
  tempo: 158,
  channels: {
    p1: { duty: 1, env: { decay: 0.3, sustain: 0.6 }, vibrato: true, mml: rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.min(7, +d + 1)}`) },
    p2: { duty: 2, env: { decay: 0.4, sustain: 0.55 }, vibrato: true, mml: `v7 ${rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(2, +d - 1)}`)}` },
    tri: { ...rivalShowdown.channels.tri },
    noise: { ...rivalShowdown.channels.noise },
  },
};

// the cutscenes
const MAP = ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'Am', 'F', 'C', 'G', 'Em', 'F', 'G', 'Am', 'E'];
export const voidMap = theme('voidMap', 72, MAP,
  ['0:2 2:2', '2:2 1:2', '1:2 0:2', '0:1'], ['3:2 2:2', '2:2 1:2', '1:2 2:2', '0:1'],
  { duty: 0, kit: 'choir', bass: 'long', v1: 9, v2: 5, fill: 8, vn: 5 });
const DOOR = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A', 'Bb', 'Gm', 'Dm', 'A', 'Bb', 'Gm', 'A', 'Dm'];
export const voidDoor = theme('voidDoor', 56, DOOR,
  ['1:2 0:2', '0:2 -1:2', '1:2 2:2', '1:1'], ['2:2 3:2', '3:2 2:2', '1:2 0:2', '0:1'],
  { duty: 2, p2: 'choir', kit: 'choir', bass: 'long', v1: 9, v2: 7, fill: 8, vn: 5 });
const FREE = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C'];
export const freedTheme = theme('freedTheme', 80, FREE,
  ['2:2 3:2', '4:2 3:2', '2:2 1:2', '0:1'], ['3:2 4:2', '5:2 4:2', '3:2 2:2', '0:1'],
  { duty: 1, p2: 'choir', kit: 'choir', bass: 'long', v1: 11, v2: 8, fill: 8, vn: 5 });
const REF = ['Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'B', 'C', 'G', 'D', 'Em', 'C', 'D', 'B', 'Em'];
export const reforgeTheme = theme('reforgeTheme', 66, REF,
  ['0:2 2:2', '2:2 3:2', '3:2 4:2', '4:1'], ['5:2 4:2', '4:2 3:2', '3:2 2:2', '0:1'],
  { duty: 2, p2: 'thirds', kit: 'tom', bass: 'walk', v1: 11, v2: 8, fill: 4, vn: 8 });
const END = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'C', 'C'];
export const trueEndingTheme = theme('trueEndingTheme', 84, END,
  ['0:4 2:4 3:4 2:4', '2:4 4:4 5:4 4:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'],
  ['3:4 4:4 5:2', '5:4 4:4 3:2', '4:4 5:4 6:4 5:4', '3:2 2:2'],
  { duty: 1, p2: 'thirds', kit: 'choir', bass: 'long', v1: 11, v2: 8, fill: 8, vn: 6 });

// --- entrances (the champions) and walk-ups (everyone else) --------------------------------------------------------
export const counterShardEntrance = jingle('counterShardEntrance', 108, ['Am', 'F', 'G', 'E'], ['0:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '2:8 r:8 3:8 r:8 4:8 r:8 3:8 r:8', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'], { duty: 0, duty2: 1, kit: 'glass', v1: 12, vn: 10, bass: 'walk', arpLen: 8 });
export const memoryShardEntrance = jingle('memoryShardEntrance', 96, ['Em', 'C', 'D', 'B'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '1:4 3:4 5:4 3:4', '4:4 3:4 1:2'], { duty: 0, duty2: 1, kit: 'tom', v1: 12, vn: 10, bass: 'long', arpLen: 8 });
export const willShardEntrance = jingle('willShardEntrance', 88, ['Dm', 'Bb', 'C', 'A'], ['0:4 2:4 4:4 2:4', '3:4 1:4 3:4 5:4', '1:4 3:4 5:4 3:4', '2:4 1:4 0:2'], { duty: 2, duty2: 2, vib: true, kit: 'tom', v1: 13, vn: 11, bass: 'walk', arpLen: 8 });
export const zeroTrueEntrance = jingle('zeroTrueEntrance', 72, ['Em', 'C', 'G', 'D'], ['0:2 2:2', '2:2 3:2', '3:2 4:2', '4:1'], { duty: 2, duty2: 1, vib: true, kit: 'choir', v1: 13, vn: 8, bass: 'long', arpLen: 8 });

const W3 = (id, tempo, chords, motif, o) => jingle(id + 'Walkup', tempo, chords, motif, o);
export const VOID_WALKUPS = [
  W3('dodgeShard', 150, ['Am', 'G', 'F'], ['3:8 4:8 5:8 4:8 3:8 4:8 5:8 6:8', '4:8 5:8 6:8 5:8 4:8 5:8 6:8 7:8', '5:4 4:4 3:2'], { duty: 0, kit: 'std', v1: 10, vn: 7 }),
  W3('blockShard', 70, ['Am', 'Em', 'F'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '1:2 0:2'], { duty: 2, duty2: 2, kit: 'tom', v1: 12, vn: 12, bass: 'long' }),
  W3('duckShard', 90, ['Dm', 'Bb', 'A'], ['0:2 r:4 2:4', '2:2 r:4 1:4', '0:1'], { duty: 1, duty2: 1, kit: 'glass', v1: 10, bass: 'long' }),
  W3('sightShard', 62, ['Em', 'C', 'D'], ['0:1', '2:1', '1:2 0:2'], { duty: 0, duty2: 0, kit: null, v1: 9, vn: 0 }),
  W3('soundShard', 100, ['Em', 'G', 'D'], ['3:8 r:8 3:8 r:8 4:8 r:8 3:8 r:8', '2:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '1:4 0:4 -1:2'], { duty: 0, kit: 'glass', v1: 10 }),
  W3('rhythmShard', 112, ['Fm', 'Db', 'Eb'], ['0:4 0:4 2:4 0:4', '2:4 2:4 3:4 2:4', '1:2 0:2'], { duty: 1, kit: 'std', v1: 11, vn: 9 }),
  W3('echoShard', 120, ['Am', 'F', 'G'], ['0:4 2:4 0:4 2:4', '0:4 2:4 0:4 2:4', '1:2 0:2'], { duty: 0, duty2: 0, kit: 'march', v1: 10 }),
  W3('chaosShard', 144, ['Bm', 'G', 'A'], ['3:8 1:8 4:8 0:8 5:8 2:8 3:8 r:8', '0:8 4:8 2:8 5:8 1:8 3:8 r:8 4:8', '2:4 1:4 0:2'], { duty: 0, kit: 'std', v1: 10, vn: 8 }),
  W3('timeShard', 76, ['Am', 'Em', 'Dm'], ['0:2 2:2', '2:2 1:2', '1:1'], { duty: 1, duty2: 1, vib: true, kit: 'choir', v1: 10, bass: 'long' }),
];
