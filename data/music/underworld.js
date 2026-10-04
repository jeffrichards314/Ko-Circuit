// The Underworld's music (spec §18 A7, Phase C), all original: minor keys and heavy triangle bass, darker
// with every circuit you go down. Built with the same little chord-and-motif generator the upper
// Pantheon uses (summit.js `theme` / `jingle`): a key, a 16-bar progression and two four-bar motifs;
// every channel is exactly 16 bars of 4/4 (tools/audio-audit.mjs checks).
//
//   shoreFight        "Black Water"       U1  A minor, 100 bpm, the choir pulse over slow toms
//   ashFight          "Ash and Ember"     U2  D minor, 116 bpm, the lead echoed a beat late through the smoke
//   chainFight        "Every Link"        U3  E minor, 126 bpm, an anvil kit hammering the chain
//   rivalChains       Dash's melody in a lower, heavier voice (Dash in Chains)
//   underworldMap     the descent's map: slow and low
//   ferrymanTheme     the Ferryman's (the cutscenes: the landing in the dark, and the ferry between circuits)
//   <id>Entrance      the champions' walk-ins;   <id>Walkup   everyone else's three bars

import { theme, jingle } from './summit.js';
import { rivalFight, rivalShowdown } from './rival.js';

const SHORE = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'E', 'F', 'G', 'Am', 'Am', 'F', 'G', 'Am', 'E'];
export const shoreFight = theme('shoreFight', 100, SHORE,
  ['0:4 2:4 1:4 0:4', '2:4 r:8 3:8 2:4 1:4', '1:4 0:4 -1:4 0:4', '0:2 r:4 -1:4'],
  ['3:4 2:4 1:4 2:4', '3:4 4:4 3:4 2:4', '2:4 1:4 0:4 1:4', '0:2 r:2'],
  { duty: 1, p2: 'choir', kit: 'tom', bass: 'long', v1: 12, v2: 8, fill: 4, vn: 10 });

const ASH = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'A', 'Bb', 'C', 'Dm', 'F', 'Bb', 'C', 'Dm', 'A'];
export const ashFight = theme('ashFight', 116, ASH,
  ['0:8 0:8 2:8 3:8 2:4 1:4', '2:8 2:8 3:8 4:8 3:4 2:4', '1:8 1:8 2:8 3:8 2:4 0:4', '0:8 1:8 2:4 r:4 -1:4'],
  ['4:4 3:8 2:8 3:4 2:4', '5:4 4:8 3:8 4:4 3:4', '3:8 4:8 5:8 4:8 3:4 2:4', '2:2 r:2'],
  { duty: 2, echo: true, kit: 'march', bass: 'walk', v1: 12, fill: 4, vn: 11 });

const CHAIN = ['Em', 'C', 'D', 'Em', 'Em', 'C', 'D', 'B', 'C', 'D', 'Em', 'G', 'C', 'D', 'Em', 'B'];
export const chainFight = theme('chainFight', 126, CHAIN,
  ['0:4 0:8 2:8 3:4 2:4', '2:4 2:8 3:8 4:4 3:4', '1:8 1:8 2:8 3:8 2:4 1:4', '0:4 -1:4 0:2'],
  ['3:8 3:8 4:8 3:8 2:4 1:4', '4:8 4:8 5:8 4:8 3:4 2:4', '5:4 4:4 3:4 2:4', '3:2 r:2'],
  { duty: 2, p2: 'choir', kit: 'anvil', bass: 'walk', v1: 12, v2: 8, fill: 2, vn: 12 });

// Dash in Chains: the rival's melody again, lower and heavier, dragging a chain of its own
export const rivalChains = {
  id: 'rivalChains',
  tempo: 148,
  channels: {
    p1: { duty: 2, env: { decay: 0.3, sustain: 0.6 }, vibrato: true, mml: rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(3, +d - 1)}`) },
    p2: { duty: 0, env: { decay: 0.2, sustain: 0.4 }, mml: `v6 ${rivalFight.channels.p1.mml.replace(/o(\d)/g, (m, d) => `o${Math.max(2, +d - 2)}`)}` },
    tri: { ...rivalShowdown.channels.tri },
    noise: { ...rivalShowdown.channels.noise },
  },
};

// the map and the Ferryman: slow, low, and never quite resolving
const MAPC = ['Am', 'Am', 'F', 'Em', 'Am', 'Am', 'Dm', 'E', 'F', 'F', 'C', 'G', 'Dm', 'Em', 'Am', 'E'];
export const underworldMap = theme('underworldMap', 72, MAPC,
  ['0:2 2:2', '2:2 1:2', '1:2 0:2', '0:1'],
  ['3:2 2:2', '2:2 1:2', '1:2 2:2', '0:1'],
  { duty: 1, p2: 'choir', kit: 'choir', bass: 'long', v1: 10, v2: 7, fill: 8, vn: 7 });
const FERRY = ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A', 'Bb', 'Gm', 'Dm', 'A', 'Bb', 'Gm', 'A', 'Dm'];
export const ferrymanTheme = theme('ferrymanTheme', 64, FERRY,
  ['1:2 0:2', '0:2 -1:2', '1:2 2:2', '1:1'],
  ['2:2 3:2', '3:2 2:2', '1:2 0:2', '0:1'],
  { duty: 2, p2: 'choir', kit: 'choir', bass: 'long', v1: 10, v2: 8, fill: 8, vn: 6 });

// --- entrances: the champions' walk-ins -------------------------------------------------------------
export const morosEntrance = jingle('morosEntrance', 84, ['Am', 'F', 'Dm', 'E'], ['0:4 2:4 4:4 2:4', '3:4 1:4 3:4 5:4', '1:4 3:4 5:4 3:4', '2:4 1:4 0:2'], { duty: 1, duty2: 2, vib: true, kit: 'tom', v1: 12, vn: 10, bass: 'long', arpLen: 8 });

export const sootEntrance = jingle('sootEntrance', 96, ['Dm', 'Bb', 'Gm', 'A'], ['0:4 2:4 3:4 5:4', '2:4 4:4 5:4 7:4', '1:4 3:4 5:4 3:4', '4:4 3:4 1:2'], { duty: 2, duty2: 1, vib: true, kit: 'march', v1: 12, vn: 10, bass: 'walk', arpLen: 8 });
export const jailerEntrance = jingle('jailerEntrance', 90, ['Em', 'C', 'D', 'B'], ['0:4 0:8 2:8 3:4 2:4', '2:4 2:8 3:8 4:4 3:4', '3:4 3:8 4:8 5:4 4:4', '4:4 3:4 1:2'], { duty: 2, duty2: 2, vib: true, kit: 'anvil', v1: 12, vn: 11, bass: 'walk', arpLen: 8 });

// --- walk-ups: three bars for each of the rest ------------------------------------------------------
const W3 = (id, tempo, chords, motif, o) => jingle(id + 'Walkup', tempo, chords, motif, o);
export const UNDERWORLD_WALKUPS = [
  // Ferryman's Shore
  W3('grue', 78, ['Am', 'Em', 'F'], ['0:2 2:2', '1:2 0:2', '0:1'], { duty: 2, duty2: 2, kit: 'tom', bass: 'long', v1: 12, vn: 10 }),
  W3('mae', 116, ['Am', 'F', 'G'], ['0:8 1:8 2:8 3:8 4:8 3:8 2:8 1:8', '3:8 2:8 1:8 0:8 1:8 2:8 3:8 4:8', '2:4 1:4 0:2'], { duty: 1, kit: null, v1: 10, vn: 6 }),
  W3('toll', 108, ['Dm', 'A', 'Dm'], ['0:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '4:8 r:8 3:8 r:8 2:8 r:8 1:8 r:8', '0:2 r:2'], { duty: 0, kit: 'glass', v1: 10 }),
  // Ashen Fields
  W3('cinder', 122, ['Dm', 'Bb', 'C'], ['3:8 2:8 1:8 0:8 1:8 2:8 3:8 4:8', '4:8 3:8 2:8 1:8 2:8 3:8 4:8 5:8', '5:4 4:4 3:2'], { duty: 0, kit: 'std', v1: 10, vn: 7 }),
  W3('scorch', 136, ['Gm', 'Eb', 'F'], ['0:8 0:8 2:8 3:8 4:4 3:4', '2:8 2:8 3:8 4:8 5:4 4:4', '5:4 4:4 3:2'], { duty: 2, duty2: 0, kit: 'std', v1: 12, vn: 10, bass: 'walk' }),
  W3('kiln', 80, ['Dm', 'Gm', 'A'], ['0:2 0:4 2:4', '2:2 2:4 3:4', '3:1'], { duty: 2, duty2: 2, kit: 'tom', bass: 'long', v1: 12, vn: 11 }),
  // Chain Pits
  W3('shackle', 82, ['Em', 'Am', 'B'], ['0:4 r:4 0:4 r:4', '2:4 r:4 2:4 r:4', '1:2 0:2'], { duty: 2, duty2: 2, kit: 'anvil', v1: 12, vn: 12, bass: 'walk' }),
  W3('link', 150, ['Em', 'D', 'C'], ['3:8 r:8 3:8 r:8 3:8 r:8 4:8 r:8', '4:8 r:8 4:8 r:8 5:8 r:8 4:8 r:8', '3:4 2:4 1:2'], { duty: 0, kit: 'glass', v1: 10 }),
  W3('brisk', 104, ['Am', 'E', 'Am'], ['0:4 2:4 3:4 2:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'], { duty: 1, duty2: 1, vib: true, kit: 'march', v1: 11 }),
  W3('rattle', 160, ['Bm', 'G', 'A'], ['0:8 r:8 2:8 r:8 3:8 r:8 2:8 r:8', '2:8 r:8 3:8 r:8 4:8 r:8 3:8 r:8', '4:8 3:8 2:8 1:8 0:2'], { duty: 0, kit: 'glass', v1: 10, vn: 6 }),
];
