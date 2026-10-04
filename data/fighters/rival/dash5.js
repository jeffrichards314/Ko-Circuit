// Rival fight V, Dash Ascendant (§18 A5): Dash Maddox followed you up the stairs.
// Halo, laurel, winged boots and a gold-and-teal banner hung among the heroes of the Hall.
// Everything he's ever thrown at you (the read, the flashbulb, the highlight reel, the grand
// finale) plus the DIVINE DASH: a beam of light burns on one edge of the screen, and he's
// gone; then he flashes in from THAT side. Beam on the LEFT, he comes from the left: slip
// RIGHT. Beam on the RIGHT: slip LEFT. Slip it and he's flown straight past the target.
// Pantheon III difficulty: 5-frame tells, adaptive, hearts 12 (his own health is Grand Prix
// tough, and he keeps his file on you).
import { baseMoves, knowItAll, flashbulb, highlightReel, grandFinale, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 6;
const DIVINE_WINDUP = 20; // ten frames of beam, then he flies in

const divine = (id, side) => ({
  name: 'DIVINE DASH',
  lunge: side, noFake: true,
  windupFrames: DIVINE_WINDUP, activeFrames: 6, recoveryFrames: 34,
  damage: 20,
  avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL'],
  counterWindow: null, starWindow: null,
  punishStar: ['dodged'],
  sfx: { tell: 'glowUp', swing: 'swingHeavy' },
  animation: side < 0
    ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL', 'idle1'] }
    : { windup: ['hookTell'], active: ['hook'], recovery: ['hook', 'idle1'] },
});

export default {
  id: 'dash5',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE ASCENDANT',
  circuit: 'rival5',
  rank: 0,
  isChampion: false,
  rival: 5,
  card: { ...DASH_CARD, weight: 165, record: '38-0 34KO', hometown: 'THE HALL OF HEROES', quote: 'THEY BUILT THE STAIRS FOR SOMEBODY LIKE ME. YOU JUST GOT THERE FIRST.' },
  lines: {
    win: 'SEE? I DIDN\'T EVEN NEED THE HALO.',
    lose: '...AT THE TOP OF THE STAIRS, AND I STILL CAN\'T GET PAST YOU.',
  },

  build: 'medium',
  palette: 'dash5',
  spriteLayers: 'dash5',

  stats: {
    health: 380, damageMult: 1.75, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: DASH_ANIMS,

  moves: {
    ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W + 3), ...grandFinale(W + 2),
    divineL: divine('divineL', -1),
    divineR: divine('divineR', 1),
  },

  patterns: [
    { id: 'entrance', weight: 3, fixed: true, steps: [
      { idle: 26 }, { move: 'showJab' }, { idle: 22 }, { move: 'divineL' }, { idle: 30 }, { move: 'smartCross' }, { idle: 22 },
      { move: 'divineR' }, { idle: 30 }, { move: 'cheapShot' }, { idle: 30 }, { taunt: 30 } ] },
    { id: 'greatestHits', weight: 3, steps: [
      { idle: 24 }, { move: 'flashbulb' }, { idle: 24 }, { move: 'smartCross' }, { idle: 18 },
      { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' },
      { idle: 24 }, { move: 'knowItAll' }, { idle: 30 }, { taunt: 28 } ] },
    { id: 'ascent', weight: 3, steps: [
      { idle: 22 }, { move: 'divineR' }, { idle: 26 }, { move: 'showJab' }, { idle: 18 }, { move: 'cheapShot' }, { idle: 22 },
      { move: 'divineL' }, { idle: 26 }, { move: 'knowItAll' }, { idle: 20 }, { move: 'smartCross' }, { idle: 28 }, { taunt: 26 } ] },
    { id: 'halo', weight: 2, steps: [
      { idle: 22 }, { move: 'divineL' }, { idle: 22 }, { move: 'divineL' }, { idle: 26 }, { move: 'flashbulb' }, { idle: 24 },
      { move: 'divineR' }, { idle: 24 }, { move: 'showJab' }, { idle: 28 }, { taunt: 24 } ] },
    { id: 'lastRound', weight: 1, when: { health: [0, 0.5] }, steps: [
      { idle: 20 }, { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }, { idle: 22 },
      { move: 'divineR' }, { idle: 20 }, { move: 'divineL' }, { idle: 26 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 26 }, { taunt: 24 } ] },
  ],

  super: { hit: 'head', move: 'finaleCall', name: 'GRAND FINALE', then: ['finale1', 'finale2', 'finale3'], golden: 'windup', taunt: 38, shout: 'GRAND FINALE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [6, 8] },
    { hit: 'body', key: 'highlightReel', name: 'HIGHLIGHT REEL', inline: true, move: 'reelCall', then: ['reel1', 'reel2', 'reel3'], golden: 'windup', window: [7, 9] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // Dash (K4): 3 exploits, 3 anti-strategies, 2 scripted moments.
  exploits: [
    trashTalkExploit({ stun: 110, hits: 9, frames: [10, 28] }),
    {
      id: 'fireworksFizzle', type: 'quirk', name: 'FIREWORKS FIZZLE',
      trigger: { on: 'resolved', move: 'finale3', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE FIREWORKS FIZZLE!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE FINALE\'S SPARKS ARE ALL SPENT BY THE LAST PUNCH.' },
      scout: 'SLIP THE FIREWORKS HAYMAKER AT THE END OF THE GRAND FINALE: HE\'S SPENT AND OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'overshoot', type: 'quirk', name: 'OVERSHOOT',
      trigger: { on: 'resolved', move: 'divineR', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 7, star: [0, 34] }, say: 'HE OVERSHOT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'HE\'S FASTER THAN HE CAN STOP: THE RIGHT-HAND STREAK ENDS IN A STUMBLE.', hidden: true },
      scout: 'SLIP A DIVINE DASH THAT COMES FROM THE RIGHT: HE OVERSHOOTS AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
    {
      id: 'noMercy', type: 'getUpMash', name: 'NO MERCY', response: 'harder', mult: 1.4, punches: 4, say: 'NO MERCY!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT FOUR PUNCHES HIT HARDER.',
    },
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'ascendantRound', name: 'THE ASCENDANT ROUND', when: { left: 60 }, say: 'DIVINE!', steps: [{ idle: 20 }, { move: 'divineL' }, { idle: 20 }, { move: 'divineR' }, { idle: 24 }, { move: 'showJab' }] },
    { id: 'lastLight', name: 'THE LAST LIGHT', when: { health: 0.3 }, say: 'THE LAST LIGHT!', steps: [{ idle: 16 }, { move: 'divineR' }, { idle: 20 }, { move: 'divineL' }, { idle: 22 }, { move: 'flashbulb' }] },
  ],
  special: [
    { type: 'comboReader', move: 'knowItAll', gap: 36, single: true },
    { type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'dash4.ghost' },
    { type: 'lunge', dist: 160, inFrames: 8, side: 30, back: 14, arrow: true },
  ],
  titleDefense: null,
  gallery: 'HE FOLLOWED YOU UP THE STAIRS. A LEFT BEAM MEANS A LEFT LUNGE: SLIP THE OTHER WAY.',
  medals: { signature: { text: 'SLIP THREE DIVINE DASHES FROM THE LEFT.', check: 'moveResult', move: 'divineL', result: 'dodged', n: 3 } },
  music: 'rivalAscendant',
};
