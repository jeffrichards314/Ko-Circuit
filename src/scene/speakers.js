// Who can speak in a text box (spec §19 G1): the player, whoever is in the corner, the Ferryman, Dash,
// any fighter by id, an announcer and a narrator. Each gives a name, a colour and (mostly) a portrait.
import { COL } from '../fight/hud.js';
import { c32 } from '../engine/palette.js';
import { playerPortrait, PORTRAITS } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, cornermanFor } from '../../data/customization.js';
import { paletteFor } from '../engine/spriteCache.js';
import { FIGHTERS } from '../../data/fighters/index.js';

const TEAL = c32(4, 24, 22), FERRY = c32(10, 26, 25);
const cache = new Map();

// who: 'player' | 'trainer' (or 'corner': the cornerman of this scene's zone) | 'ferryman' | 'dash' | 'announcer' | 'narrator' | a fighter id
export function speaker(who, ctx) {
  const key = who + '|' + ctx.zone + '|' + (ctx.params.dashId || '') + '|' + ctx.profile.name + ctx.profile.hair + ctx.profile.skin;
  if (cache.has(key)) return cache.get(key);
  const p = ctx.profile;
  let s;
  if (who === 'player') { const fp = frontPalette(p); s = { name: p.name, col: COL.green, portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, side: 'right' }; }
  else if (who === 'trainer' || who === 'corner') {
    const cm = who === 'corner' ? cornermanFor(p, ctx.zone, ctx.circuit) : cornermanFor(p, ctx.zone === 'void' || ctx.zone === 'underworld' ? 'road' : ctx.zone);
    const tp = trainerPortrait(cm.id);
    s = { name: cm.name || 'COACH', col: cm.id === 'ferryman' ? FERRY : COL.orange, portrait: tp.sprite, pal: tp.pal, side: 'left' };
  } else if (who === 'ferryman') { const tp = trainerPortrait('ferryman'); s = { name: 'THE FERRYMAN', col: FERRY, portrait: tp.sprite, pal: tp.pal, side: 'left' }; }
  else if (who === 'announcer') s = { name: 'ANNOUNCER', col: COL.yellow, portrait: null, side: 'left', mic: true };
  else if (who === 'narrator') s = { name: '', col: COL.white, portrait: null, side: 'left' };
  else if (who === 'dash') {
    const id = ctx.params.dashId || 'dash1', d = FIGHTERS[id], pal = paletteFor(d.palette);
    s = { name: 'DASH MADDOX', col: TEAL, portrait: (PORTRAITS[id] || PORTRAITS.barney)(pal), pal: pal.u32, side: 'left' };
  } else if (FIGHTERS[who]) {
    const d = FIGHTERS[who], pal = paletteFor(d.palette);
    s = { name: d.name, col: COL.cyan, portrait: (PORTRAITS[who] || PORTRAITS.barney)(pal), pal: pal.u32, side: 'left' };
  } else s = { name: String(who).toUpperCase(), col: COL.white, portrait: null, side: 'left' };
  cache.set(key, s);
  return s;
}
