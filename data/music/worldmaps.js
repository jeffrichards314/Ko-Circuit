// The map songs of the worlds added with the zone maps (spec §19 G11), all original, built with the Pantheon's chord-and-motif
// generator (summit.js `theme`): every channel is 16 bars of 4/4.
//   champMap     "City of Champions"   the city at the end of the road: C major, 124 bpm, a march under a bright fanfare lead
//   zeroMap      "Wrong Side"          ZERO's warped city: E minor leaning on its flat second, 84 bpm, slow choir, a lead that won't settle
//   roadTrip     "Mile Markers"        the journeys' song (the road trip, the climb back down, the ride home): G major, 140 bpm, bouncing
import { theme } from './summit.js';

const CHAMP = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G', 'C', 'G'];
export const champMap = theme('champMap', 124, CHAMP,
  ['0:8 1:8 2:4 2:4 3:4', '2:4 1:8 0:8 1:4 2:4', '0:4 1:4 2:8 1:8 0:4', '1:2 r:4 2:4'],
  ['3:4 3:8 2:8 1:4 2:4', '3:8 2:8 1:8 2:8 3:4 r:4', '2:4 1:4 0:4 1:4', '0:2 r:2'],
  { duty: 2, kit: 'march', bass: 'walk', v1: 12, fill: 4, vn: 9 });

const ZERO = ['Em', 'F', 'Em', 'F', 'Am', 'Bb', 'Em', 'B', 'C', 'F', 'Em', 'Em', 'Am', 'Bb', 'B', 'Em'];
export const zeroMap = theme('zeroMap', 84, ZERO,
  ['0:2 1:4 0:4', '1:2 2:4 1:4', '2:4 1:4 0:2', '0:1'],
  ['2:2 3:2', '2:4 1:4 2:2', '1:4 0:4 -1:2', '0:1'],
  { duty: 1, p2: 'choir', kit: 'choir', bass: 'long', v1: 10, v2: 7, fill: 8, vn: 7 });

const ROAD = ['G', 'C', 'G', 'D', 'Em', 'C', 'G', 'D', 'C', 'G', 'Am', 'D', 'G', 'C', 'D', 'G'];
export const roadTrip = theme('roadTrip', 140, ROAD,
  ['0:8 1:8 2:8 1:8 0:4 2:4', '1:8 2:8 3:8 2:8 1:4 0:4', '2:8 1:8 0:8 1:8 2:4 3:4', '2:4 1:4 0:2'],
  ['3:8 3:8 2:8 2:8 1:4 2:4', '3:4 2:8 1:8 2:4 r:4', '1:8 2:8 3:8 2:8 1:4 0:4', '0:2 r:2'],
  { duty: 2, kit: 'std', bass: 'oct', v1: 12, fill: 4, vn: 10 });
