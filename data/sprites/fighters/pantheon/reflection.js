// Reflection (#72): sprite layers on the medium build: YOU, seen from the front. One layer set per hair
// style (hair is geometry: `reflection.spiky` ...); the colours are yours too: the fight swaps in a palette built from
// your profile (data/reflection.js) so his skin, hair, trunks, gloves and shoes are what you chose.
// A little of the glass shows: a faint white edge on the trunks and a chip of light on the glove.
import { rig } from './_rig.js';

const STYLE = { spiky: 'spike', buzz: 'crop', afro: 'curls', mohawk: 'mohawk', ponytail: 'long', slick: 'crop' };
export const REFLECTION_STYLES = Object.keys(STYLE);

const build = (style) => rig('reflection', {
  build: 'medium',
  body: { size: [1.0, 1.0], legLen: 1.0, torsoLen: 1.0, shoulders: 1.0, dims: { belly: 3, chestW: 19, waistW: 15 } },
  colors: {
    skin: [[31, 24, 18], [27, 17, 12], [19, 11, 8], [13, 7, 6]],
    hair: [[10, 8, 12], [4, 3, 5], [2, 1, 3]],
    glove: [[31, 18, 14], [27, 5, 5], [15, 2, 4]],
    top: [[31, 31, 31], [24, 26, 30], [14, 16, 22], [6, 7, 12]],
    trim: [[31, 31, 31], [26, 28, 31], [15, 17, 24]],
    boot: [[10, 11, 16], [4, 5, 8], [2, 2, 4]],
    sh: [[14, 20, 31], [6, 11, 27], [3, 5, 16]],
  },
  head: { jaw: 'round', ears: [2.4, 3.4], hair: STYLE[style], eyeFace: 'focus', mouthW: 3 },
  top: { style: 'bare' }, belt: { buckle: 'none', wide: 3 }, stripe: true,
});
const all = Object.fromEntries(REFLECTION_STYLES.map((s) => [s, build(s)]));
// (the palette layout is the same for every style: the first one is registered)
export const palettes = { reflection: all.spiky.palettes.reflection };
export const REFLECTION_LAYERS = Object.fromEntries(REFLECTION_STYLES.map((s) => [`reflection.${s}`, { ...all[s].layers, id: `reflection.${s}` }]));
export default REFLECTION_LAYERS['reflection.spiky'];
