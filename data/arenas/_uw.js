// Shared boilerplate for the Underworld's arenas (Phase C): a crowd of shades (pale grey faces under dark
// hoods, seated in the dark) and the standard ring furniture from the Pantheon's helpers (_zone.js).
import { makePalette } from '../../src/engine/palette.js';
export { crowdOf, ringRopes, seatedCrowdReact } from './_zone.js';

// hood: [hi, mid, dark] colours of the hoods; robe: 4 colours (three robes and a shade); the faces are the colour of old candle wax
export const shadePalette = (name, hood, robe, outline = [1, 1, 3]) => makePalette(name, {
  outline,
  skin1: [22, 24, 24], skin1s: [14, 16, 18], skin2: [17, 19, 21], skin2s: [10, 11, 14], skin3: [12, 13, 16], skin3s: [7, 8, 10],
  hairA: hood[0], hairB: hood[1], hairC: hood[2],
  robeA: robe[0], robeB: robe[1], robeC: robe[2], robeSh: robe[3],
});
