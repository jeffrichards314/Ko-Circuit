// ORIGIN's music (2026-10-04), all original, from the generator the Pantheon and the Void use (summit.js `theme` / `jingle`). His theme is built from the motifs of every
// zone's music, a bar or four of each in turn (the road's major, the warped city's tritones, the Pantheon's bright D, the Underworld's minor, the Void's glass), and it
// RISES with every phase: the tempo, the voices (a choir in thirds, an echo), the drums.
//   originI-IV         the Gauntlet's four phases    originTrueI-VI    the true form's six    originEntrance / originTrueEntrance  his walk-out
//   originIntro        the cinematic (a held, rising drone of the motifs)   originVictory / originTrueVictory   the two victory scenes   originCredits  the secret credits
import { theme, jingle } from './summit.js';

const ROAD = ['C', 'F', 'G', 'C'], WARP = ['Em', 'Bb', 'F#', 'B'], PANT = ['D', 'A', 'Bm', 'G'], UNDER = ['Dm', 'Bb', 'Gm', 'A'], VOID = ['Am', 'Eb', 'Dm', 'E'];
const LA = ['0:4 2:4 3:4 2:4', '2:4 4:4 5:4 4:4', '1:4 3:4 4:4 3:4', '2:4 1:4 0:2'];
const LB = ['3:4 4:4 5:2', '5:4 4:4 3:2', '4:4 5:4 6:4 5:4', '3:2 2:2'];
const FA = ['0:8 0:8 2:8 3:8 2:8 3:8 4:8 3:8', '2:8 2:8 3:8 4:8 3:8 4:8 5:8 4:8', '1:8 1:8 2:8 3:8 2:8 1:8 0:8 1:8', '0:8 1:8 2:4 r:4 -1:4'];
const FB = ['5:8 4:8 5:8 6:8 5:4 4:4', '6:8 5:8 6:8 7:8 6:4 5:4', '4:8 5:8 6:8 5:8 4:4 3:4', '3:2 r:2'];
const prog = (...zones) => zones.flat();
// phase 1: the road's, then the Pantheon's, bright and plain
export const originI = theme('originI', 120, prog(ROAD, PANT, ROAD, PANT), LA, LB, { duty: 2, kit: 'march', bass: 'long', v1: 12, vn: 10, fill: 4 });
// phase 2: every arena: a bar of each zone in turn, an echo of the lead
export const originII = theme('originII', 132, prog(ROAD, WARP, PANT, UNDER), FA, FB, { duty: 2, echo: true, kit: 'std', bass: 'walk', v1: 12, v2: 7, fill: 4, vn: 11 });
// phase 3: the medley: the Underworld's and the Void's under a choir in thirds
export const originIII = theme('originIII', 144, prog(UNDER, VOID, PANT, UNDER), LA, LB, { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 12, v2: 9, fill: 2, vn: 12 });
// phase 4: the beginning: all of them at once, quick, the lead doubled in octaves of arpeggio
export const originIV = theme('originIV', 164, prog(ROAD, WARP, PANT, VOID), FA, FB, { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 13, v2: 10, fill: 2, vn: 13 });

const T = (id, tempo, zones, A, B, o) => theme(id, tempo, prog(...zones), A, B, o);
export const originTrueI = T('originTrueI', 128, [ROAD, PANT, ROAD, PANT], LA, LB, { duty: 2, kit: 'march', bass: 'walk', v1: 13, vn: 11, fill: 4 });
export const originTrueII = T('originTrueII', 140, [ROAD, WARP, ROAD, WARP], FA, FB, { duty: 2, echo: true, kit: 'std', bass: 'walk', v1: 13, v2: 8, fill: 4, vn: 12 });
export const originTrueIII = T('originTrueIII', 150, [PANT, UNDER, PANT, UNDER], LA, LB, { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 13, v2: 9, fill: 2, vn: 12 });
export const originTrueIV = T('originTrueIV', 158, [ROAD, WARP, PANT, VOID], FA, FB, { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 13, v2: 10, fill: 2, vn: 13 });
export const originTrueV = T('originTrueV', 168, [UNDER, VOID, WARP, VOID], FA, FB, { duty: 2, echo: true, kit: 'tom', bass: 'walk', v1: 13, v2: 8, fill: 2, vn: 13 });
export const originTrueVI = T('originTrueVI', 180, [ROAD, WARP, PANT, UNDER], FA, FB, { duty: 2, p2: 'thirds', kit: 'anvil', bass: 'walk', v1: 14, v2: 11, fill: 2, vn: 14 });

export const originEntrance = jingle('originEntrance', 84, ['C', 'D', 'Em', 'G'], ['0:2 2:2', '2:2 3:2', '3:2 4:2', '4:1'], { duty: 2, duty2: 1, vib: true, kit: 'choir', v1: 13, vn: 8, bass: 'long', arpLen: 8 });
export const originTrueEntrance = jingle('originTrueEntrance', 92, ['C', 'D', 'Em', 'A'], ['0:2 2:2', '2:2 3:2', '4:2 5:2', '6:1'], { duty: 2, duty2: 1, vib: true, kit: 'choir', v1: 14, vn: 9, bass: 'long', arpLen: 8 });

export const originIntro = theme('originIntro', 60, prog(ROAD, PANT, UNDER, VOID), ['0:2 2:2', '2:2 3:2', '3:2 4:2', '4:1'], ['5:2 4:2', '4:2 3:2', '3:2 2:2', '0:1'], { duty: 2, p2: 'choir', kit: 'choir', bass: 'long', v1: 10, v2: 7, fill: 8, vn: 5 });
export const originVictory = theme('originVictory', 72, prog(ROAD, PANT, ROAD, PANT), ['2:2 3:2', '4:2 3:2', '2:2 1:2', '0:1'], ['3:2 4:2', '5:2 4:2', '3:2 2:2', '0:1'], { duty: 1, p2: 'choir', kit: 'choir', bass: 'long', v1: 11, v2: 8, fill: 8, vn: 5 });
export const originTrueVictory = theme('originTrueVictory', 88, prog(ROAD, PANT, UNDER, ROAD), LA, LB, { duty: 1, p2: 'thirds', kit: 'march', bass: 'long', v1: 12, v2: 9, fill: 4, vn: 8 });
export const originCredits = theme('originCredits', 96, prog(ROAD, WARP, PANT, UNDER), LA, LB, { duty: 1, p2: 'thirds', kit: 'choir', bass: 'long', v1: 11, v2: 8, fill: 8, vn: 6 });
