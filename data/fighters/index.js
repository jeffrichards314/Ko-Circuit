// Fighter registry. Adding a fighter = one data file + sprite layers + one line here.
import barney from './barney.js';
import kid from './kid.js';
import mort from './mort.js';
import gus from './gus.js';
import rocco from './rocco.js';
import gambini from './gambini.js';
import knox from './knox.js';
import brody from './brody.js';
import ray from './ray.js';
import pidge from './pidge.js';
import sam from './sam.js';
import mcbride from './mcbride.js';
import djdrop from './djdrop.js';
import anchor from './anchor.js';
import gemini from './gemini.js';
import midnight from './midnight.js';
import strongman from './strongman.js';
import pockets from './pockets.js';
import tess from './tess.js';
import jinx from './jinx.js';
import rex from './rex.js';
import rusty from './rusty.js';
import tia from './tia.js';
import sutures from './sutures.js';
import baron from './baron.js';
import lars from './lars.js';
import hank from './hank.js';
import glacier from './glacier.js';
import maestro from './maestro.js';
import bolt from './bolt.js';
import downpour from './downpour.js';
import cole from './cole.js';
import avalanche from './avalanche.js';
import rourke from './rourke.js';
import ignatius from './ignatius.js';
import duchess from './duchess.js';
import mirror from './mirror.js';
import nova from './nova.js';
import goliath from './goliath.js';
import quinn from './quinn.js';
import monk from './monk.js';
import karver from './karver.js';
import jax from './jax.js';
import staticFighter from './static.js'; // (static and null are reserved words as import names)
import cade from './cade.js';
import nullFighter from './null.js';
import warden from './warden.js';
import hollow from './hollow.js';
import revenant from './revenant.js';
import frenzy from './frenzy.js';
import eclipse from './eclipse.js';
import zero from './zero.js';
import zeroTrue from './zeroTrue.js';
import dash1 from './rival/dash1.js';
import dash2 from './rival/dash2.js';
import dash3 from './rival/dash3.js';
import dash4 from './rival/dash4.js';
import dash5 from './rival/dash5.js';
import dash6 from './rival/dash6.js';
import dash7 from './rival/dash7.js';
import dash8 from './rival/dash8.js';
import dash9 from './rival/dash9.js';

import { PANTHEON_FIGHTERS } from './pantheon/index.js';
import { UNDERWORLD_FIGHTERS } from './underworld/index.js';
import { VOID_FIGHTERS } from './void/index.js';
import { withSuper } from './super.js';
import { withKnowledge } from '../../src/fight/knowledge.js';
import { CIRCUITS } from '../circuits.js';
import { tuneFighter, damageOf } from '../difficulty.js';
import CLASSIC_REMIX from './remixes/classic.js';
import ASCENSION_REMIX from './remixes/ascension.js';
import EXCLUSIVE from './remixes/exclusive.js';
import VOID_REMIX from './remixes/void.js';

const RAW = { barney, kid, mort, gus, rocco, gambini, knox, brody, ray, pidge, sam, mcbride, djdrop, anchor, gemini, midnight, strongman, pockets, tess, jinx, rex,
  rusty, tia, sutures, baron, lars, hank, glacier, maestro, bolt, downpour, cole, avalanche,
  rourke, ignatius, duchess, mirror, nova, goliath, quinn, monk, karver, jax,
  static: staticFighter, cade, null: nullFighter, warden, hollow, revenant, frenzy, eclipse, zero, zeroTrue,
  dash1, dash2, dash3, dash4, dash5, dash6, dash7, dash8, dash9, // the rival (§11b): extra story fights, not in the roster
  ...PANTHEON_FIGHTERS, ...UNDERWORLD_FIGHTERS, ...VOID_FIGHTERS }; // the Ascension (§18): the Pantheon's #51-81 and Halcyon, the Underworld's #82-94 and, as they are built, the rest

// what the executor runs: supers wired up, taunts and stray perfect hits folded away (super.js),
// and every exploit's trainer tip added (the knowledge layer, src/fight/knowledge.js)
// The remixes' own data (spec §6, data/fighters/titleDefense.js): the Classic champions' knowledge layers (their moves and patterns are in their own
// files) and the Ascension fighters' whole remix blocks, joined to each fighter's `titleDefense` before his supers are wired.
// (and every one's exclusive attack, remixes/exclusive.js: the one super that only exists in Title Defense)
const REMIX = Object.fromEntries([...new Set([...Object.keys(CLASSIC_REMIX), ...Object.keys(ASCENSION_REMIX), ...Object.keys(VOID_REMIX), ...Object.keys(EXCLUSIVE)])].map((k) => [k, { ...CLASSIC_REMIX[k], ...ASCENSION_REMIX[k], ...VOID_REMIX[k], ...(EXCLUSIVE[k] ? { exclusive: EXCLUSIVE[k] } : {}) }]));
// AUTHORED: each fighter as written (his own timings and damage). FIGHTERS: the same, put on the difficulty curve
// (data/difficulty.js: tells, damage, get-up, stars, pace, supers, anti-strategy strictness). retune() rebuilds FIGHTERS
// in place from the knobs (the fight lab's sliders), so a fight already running picks up the new numbers.
export const AUTHORED = Object.fromEntries(Object.entries(RAW).map(([k, d]) => [k, withKnowledge(withSuper(REMIX[k] ? { ...d, titleDefense: { ...(d.titleDefense || {}), ...REMIX[k] } } : d))]));
// each circuit's authored average punch (the damage curve keeps some of every fighter's weight against it)
const CIRCUIT_DAMAGE = {};
for (const C of Object.values(CIRCUITS)) {
  const L = (C.fighters || []).filter((id) => AUTHORED[id]).map((id) => damageOf(AUTHORED[id]));
  CIRCUIT_DAMAGE[C.id] = L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0;
}
export const FIGHTERS = {};
const listeners = [];
export const onRetune = (fn) => listeners.push(fn);
export function retune() {
  for (const [k, d] of Object.entries(AUTHORED)) {
    const C = CIRCUITS[d.circuit];
    const t = tuneFighter(d, C, CIRCUIT_DAMAGE[d.circuit]);
    const cur = FIGHTERS[k];
    if (cur) { for (const key of Object.keys(cur)) delete cur[key]; Object.assign(cur, t); } else FIGHTERS[k] = { ...t };
  }
  for (const fn of listeners) fn();
}
retune();
