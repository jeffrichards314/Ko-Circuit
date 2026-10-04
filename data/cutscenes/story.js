// The story scenes (spec §19 G5): the cutscenes that were screens of their own before the engine.
//   jog.<circuit>    the road to a circuit: the player runs, the trainer talks           (template 'jog')
//   ferry.<circuit>  the ride between the Underworld's shores and across the Void        (template 'ferry')
//   rival.<n>.<pre|post>  Dash Maddox before and after each of his nine fights           (template 'rival')
//   story.*          The Sky Opens, The Fall, the Ferryman's landing, the deal, the door to the Void, a Hollowed freed, The Reforging,
//                    the true ending, the shatter and the credits: hand-drawn, hosted by the engine (src/scene/legacy.js)
import { TALK, FERRY_TALK } from './talk.js';
import { SHORT, ROMAN } from '../circuits.js';

const PANTH = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon']);
export const JOGS = Object.keys(TALK).map((to) => ({ id: `jog.${to}`, title: `ROAD TO ${SHORT[to] || to.toUpperCase()}`, zone: PANTH.has(to) ? 'pantheon' : 'road', template: 'jog', params: { to, lines: TALK[to], label: `ON THE ROAD TO ${SHORT[to] || 'GLORY'}` } }));
JOGS.push({ id: 'jog.next', title: 'ROAD: ANOTHER BELT', zone: 'road', template: 'jog', params: { to: 'next', lines: ['ANOTHER BELT! NEXT STOP: THE NEXT CIRCUIT.', 'EVERY CIRCUIT GETS TOUGHER. SO DO WE.'], label: 'ON THE ROAD' } });

const VOIDISH = new Set(['v1', 'v2', 'v3', 'rival9', 'zeroTrue']);
export const FERRIES = Object.keys(FERRY_TALK).filter((k) => k !== 'done').map((to) => ({ id: `ferry.${to}`, title: `FERRY: ${SHORT[to] || to.toUpperCase()}`, zone: VOIDISH.has(to) ? 'void' : 'underworld', template: 'ferry', params: { to, void: VOIDISH.has(to), lines: FERRY_TALK[to], label: `ON THE WAY TO ${SHORT[to] || 'THE NEXT SHORE'}` } }));
FERRIES.push({ id: 'ferry.done', title: 'FERRY: THE RIVER GOES ON', zone: 'underworld', template: 'ferry', params: { to: 'done', lines: FERRY_TALK.done, label: 'THE RIVER GOES ON' } });

const RZONE = (n) => (n <= 4 ? 'road' : n <= 6 ? 'pantheon' : n <= 8 ? 'underworld' : 'void');
export const RIVAL_SCENES_LIST = [];
for (let n = 1; n <= 9; n++) for (const phase of ['pre', 'post']) RIVAL_SCENES_LIST.push({ id: `rival.${n}.${phase}`, title: `DASH ${ROMAN[n]}: ${phase === 'pre' ? 'BEFORE THE FIGHT' : 'AFTER THE FIGHT'}`, zone: RZONE(n), template: 'rival', circuit: `rival${n}`, params: { n, phase, variant: 'first' } });

const H = (id, title, zone, screen, legacyArgs = {}, extra = {}) => ({ id, title, zone, fadeIn: false, circuit: undefined, legacy: screen, layers: [{ p: 'legacy', screen }], script: [{ do: 'legacy', screen }], params: { legacyArgs }, ...extra });
export const STORY = [
  H('story.ascend', 'THE SKY OPENS', 'pantheon', 'ascend'),
  H('story.fall', 'THE FALL', 'pantheon', 'fall'),
  H('story.descend', 'THE FERRYMAN\'S LANDING', 'underworld', 'descend'),
  H('story.deal', 'THE DEAL BREAKS', 'underworld', 'deal'),
  H('story.voidDoor', 'THE DOOR BELOW THE THRONE', 'void', 'voidDoor'),
  H('story.free', 'A HOLLOWED IS FREED', 'void', 'free', { id: 'dodgeShard', first: true, then: ['theater', {}] }),
  H('story.reforge', 'THE REFORGING', 'void', 'reforge', {}, { noSkipFirst: true }), // (plays in full the first time: nothing skips it until it has been seen)
  H('story.trueEnding', 'THE TRUE ENDING', 'void', 'trueEnding'),
  H('story.ending.interim', 'THE SHATTER (INTERIM ENDING)', 'secret', 'ending', { kind: 'interim' }),
  H('story.ending.main', 'UNDISPUTED (THE CREDITS)', 'road', 'ending', { kind: 'main' }),
];
// ORIGIN's four scenes (2026-10-04): each plays in full the first time and is in the Theater once he has been beaten (the zone `origin` is hidden until then, theater.js)
export const ORIGIN_SCENES = [
  H('boss.origin', 'ORIGIN: THE DOOR OPENS', 'origin', 'originIntro', { which: 'g' }, { noSkipFirst: true }),
  H('victory.origin', 'ORIGIN: THERE IS ONE MORE', 'origin', 'originVictory', {}, { noSkipFirst: true }),
  H('boss.originTrue', 'ORIGIN TRUE FORM: THE LAST DOOR', 'origin', 'originIntro', { which: 't' }, { noSkipFirst: true }),
  H('victory.originTrue', 'ORIGIN TRUE FORM: THE ORIGIN BELT', 'origin', 'originTrueVictory', {}, { noSkipFirst: true }),
];
export const STORY_SCENES = [...JOGS, ...FERRIES, ...RIVAL_SCENES_LIST, ...STORY, ...ORIGIN_SCENES];
