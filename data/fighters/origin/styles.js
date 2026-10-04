// ORIGIN's EVERY ARENA (the first fighter's moves are the first of every style): the arena flickers between fragments of past arenas and he fights in that
// arena's champion's style. A style is the champion's own two characteristic blows (his poses, sounds and defenses, retimed to ORIGIN's speed) and his
// signature (data/fighters/void/signatures.js), in the champion's colours, in the champion's arena. Twelve of them: the champions of the base game's circuits
// (the same twelve whose signatures ZERO borrowed), in the order a career meets them. The table is shared by ORIGIN's data, his sprite layers (which must
// carry the champions' poses) and the arena (the fragments that light up).
//   champion id -> { circuit (his arena), blows: [two of his own move ids], color }
import { ALL_SIGNATURES } from '../zero.js';

export const STYLES = [
  ['gus', 'rookie', ['grillPress', 'orderUp1']],
  ['brody', 'minor', ['foundation', 'wreckingBall']],
  ['mcbride', 'metro', ['ribbon', 'taxHike']],
  ['midnight', 'major', ['batWing', 'graveDigger']],
  ['rex', 'carnival', ['lionTamer', 'rollUp']],
  ['baron', 'continental', ['coupe', 'basse']],
  ['maestro', 'world', ['legato', 'pizzicato']],
  ['avalanche', 'storm', ['drift', 'packed']],
  ['mirror', 'legends', ['silverHook', 'silverJab']],
  ['karver', 'grandprix', ['carveL', 'scepterR']],
  ['warden', 'underground', ['cellHook', 'patDown']],
  ['eclipse', 'nightmare', ['eHook', 'eBody']],
].map(([id, circuit, blows]) => ({ id, circuit, blows, sig: ALL_SIGNATURES.find((s) => s.champ.id === id) }));
export const STYLE_BY_ID = Object.fromEntries(STYLES.map((s) => [s.id, s]));
