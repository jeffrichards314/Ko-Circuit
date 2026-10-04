// Composes every pose a fighter can show (anims, move animations, modifier
// poses) so a missing pose or palette key fails here instead of mid-fight.
//   node tools/check-poses.mjs [ids...] [--td]   (--td: the Title Defense remixes)
import { FIGHTERS } from '../data/fighters/index.js';
import { TITLE_DEFENSE, remixed } from '../data/fighters/titleDefense.js';
import { fighterSprites, paletteFor } from '../src/engine/spriteCache.js';
import { PORTRAITS } from '../data/sprites/portraits.js';

const TD = process.argv.includes('--td');
const argIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ids = argIds.length ? argIds : TD ? TITLE_DEFENSE : Object.keys(FIGHTERS);
let bad = 0;
for (const id of ids) {
  const d = TD ? remixed(id) : FIGHTERS[id];
  const names = new Set();
  const add = (a) => { if (!a) return; if (typeof a === 'string') names.add(a); else if (Array.isArray(a)) a.forEach(add); else if (a.frames) a.frames.forEach(add); };
  Object.values(d.anims).forEach(add);
  for (const m of Object.values(d.moves)) { const A = m.animation || {}; add(A.windup); add(A.active); add(A.recovery); }
  for (const s of d.special || []) for (const k of ['poseL', 'poseR', 'holdPose', 'holdPose2', 'twitchPose', 'reachPose']) add(s[k]);
  const bank = fighterSprites(d.spriteLayers);
  const errs = [];
  for (const n of names) { try { const s = bank.get(n); if (!s.w) errs.push(`${n}: empty`); } catch (e) { errs.push(`${n}: ${e.message}`); } }
  try { if (!PORTRAITS[id]) errs.push('no portrait'); else PORTRAITS[id](paletteFor(d.palette)); } catch (e) { errs.push(`portrait: ${e.message}`); }
  if (errs.length) bad++;
  console.log(`${id}: ${names.size} poses${errs.length ? '\n  ' + errs.join('\n  ') : ' ok'}`);
}
process.exit(bad ? 1 : 0);
