// The borrowed signatures (ZERO's true form, and ORIGIN's Medley and Every Arena): for every champion of the base game's twelve, the Pantheon's six and the
// Underworld's four, an ECHO (a 22-frame call that flickers him into that champion's colours, names them and chimes: the warning) and the SIG (their signature
// blow, a 3-frame tell, a one-hit knockdown). Built once, here, so every fight that borrows them borrows the same blows.
//   signatureMoves() -> { moves: { echo_<id>, sig_<id> ... }, sigs: [{ id, name }], zones: { road: [ids], pantheon: [...], underworld: [...] } }
import { ALL_SIGNATURES, echoMove, sigMove } from '../zero.js';
import aurora from '../pantheon/aurora.js';
import cirrus from '../pantheon/cirrus.js';
import oldguard from '../pantheon/oldguard.js';
import nebula from '../pantheon/nebula.js';
import hale from '../pantheon/hale.js';
import prism from '../pantheon/prism.js';
import moros from '../underworld/moros.js';
import soot from '../underworld/soot.js';
import jailer from '../underworld/jailer.js';
import crucible from '../underworld/crucible.js';
import { NEW_ECHO_COLORS } from '../../sprites/fighters/void/zeroTrue.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
export const NEW_SIGNATURES = [
  ['aurora', aurora, 'firstLight'], ['cirrus', cirrus, 'stormFist'], ['oldguard', oldguard, 'firstChampion'], ['nebula', nebula, 'supernova'], ['hale', hale, 'forgeFall'], ['prism', prism, 'spectrum'],
  ['moros', moros, 'requiem'], ['soot', soot, 'fireStorm'], ['jailer', jailer, 'lifeSentence'], ['crucible', crucible, 'meltdown'],
];
export function signatureMoves() {
  const moves = {}, sigs = [];
  for (const s of ALL_SIGNATURES) {
    const e = echoMove(s), g = { ...sigMove(s), windupFrames: 3 };
    moves['echo_' + s.champ.id] = e; moves['sig_' + s.champ.id] = g;
    sigs.push({ id: s.champ.id, name: s.champ.name });
  }
  for (const [id, champ, mid] of NEW_SIGNATURES) {
    const m = champ.moves[mid];
    moves['echo_' + id] = {
      name: champ.name, echo: id, echoName: champ.name, echoColor: NEW_ECHO_COLORS[id], feint: true, call: true, noFake: true,
      windupFrames: 22, activeFrames: 0, recoveryFrames: 1, damage: 0, avoidBy: ALL4, counterWindow: [3, 19], starWindow: [3, 7], kdWindow: [16, 17], cancels: 1,
      animation: { windup: ['overheadTell1'], active: ['overheadTell2'], recovery: ['overheadTell2'] },
    };
    moves['sig_' + id] = {
      name: m.name, echoOf: id, knockdown: true, noFake: true, windupFrames: 3, activeFrames: m.activeFrames || 10, recoveryFrames: m.recoveryFrames || 46, damage: m.damage || 30,
      avoidBy: m.avoidBy && m.avoidBy.length ? m.avoidBy.slice() : D2, counterWindow: null, starWindow: null, punishStar: ['dodged'],
      sfx: { tell: 'voidTell', swing: (m.sfx && m.sfx.swing) || 'swingHeavy' },
      animation: { windup: ['overheadTell2'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    };
    sigs.push({ id, name: champ.name });
  }
  return {
    moves, sigs,
    zones: {
      road: ALL_SIGNATURES.map((s) => s.champ.id),
      pantheon: ['aurora', 'cirrus', 'oldguard', 'nebula', 'hale', 'prism'],
      underworld: ['moros', 'soot', 'jailer', 'crucible'],
    },
  };
}
