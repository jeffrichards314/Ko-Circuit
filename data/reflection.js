// Reflection (#72) wears YOUR colours: a palette for his sprite layers built from the player's profile
// (skin, hair colour, trunks, gloves, shoes). The hair STYLE is geometry (sprite layers `reflection.<style>`).
import { swapPalette, spritePalette } from '../src/engine/palette.js';
import { PALETTES } from './palette.js';
import { SKINS, HAIR_COLORS, TRUNKS, GLOVES, SHOES, hairStyleOf, costumeOf } from './customization.js';

export const reflectionLayersFor = (profile) => `reflection.${hairStyleOf(profile)}`;
export function reflectionPalette(profile) {
  const base = PALETTES.reflection;
  const [sHi, s, sSh, sDk] = SKINS[profile.skin].c, [h, hHi] = HAIR_COLORS[profile.hairColor].c;
  let [tHi, t, tDk] = TRUNKS[profile.trunks].c, [gHi, g, gDk] = GLOVES[profile.gloves].c;
  let [oHi, o, oDk] = SHOES[profile.shoes].c;
  const K = costumeOf(profile);
  // (a costume overrides trunks, gloves AND shoes, and brings its own trim and outline, exactly as the player's own palette does)
  if (K && K.trunks) { [tHi, t, tDk] = K.trunks; [gHi, g, gDk] = K.glove; [oHi, o, oDk] = K.shoe; }
  const A = swapPalette('reflection.mine.A', base.A, { skinHi: sHi, skin: s, skinSh: sSh, skinDk: sDk, hairHi: hHi, hair: h, hairDk: h, gloveHi: gHi, glove: g, gloveDk: gDk, ...(K && K.outline ? { outline: K.outline } : {}) });
  const B = swapPalette('reflection.mine.B', base.B, { shHi: tHi, sh: t, shDk: tDk, bootHi: oHi, boot: o, bootDk: oDk, ...(K && K.trunks && K.accent ? { trimHi: K.accent[0], trim: K.accent[1], trimSh: K.accent[2] } : {}) });
  return spritePalette(A, B);
}
