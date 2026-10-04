// Rival fight VI, Dash Desperate (§18 A5): Dash Maddox, at the top of the stairs and out of tricks.
// The halo is cracked and slipping, the laurel is missing leaves, one of his winged boots has lost its
// feathers, and he's sweating through the gold. Everything he's ever thrown at you (the read, the
// flashbulb, the highlight reel, the grand finale, the divine dash) plus the RECKLESS FLURRY: a cry, and
// then five hits, fast and strong, each with its own defense (slip RIGHT, slip LEFT, BLOCK or slip RIGHT,
// any, slip either way). He has never thrown so hard, and he can't keep it up: when the fifth hit is
// spent he stands there GASPING, wide open for as long as it takes him to breathe again. Counter the cry
// itself and the whole flurry (and the gasp) is cancelled.
// Pantheon VI difficulty: 4-frame tells, adaptive, hearts 12 (his own health is Grand Prix tough, and he
// keeps his file on you).
import { baseMoves, knowItAll, flashbulb, highlightReel, grandFinale, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 5;
const DIVINE_WINDUP = 20;

// (Dash VII, Dash VIII... keep both of these: see dash7.js)
export const divine = (side) => ({
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

// the flurry: a cry (a call: counter it and the whole thing is cancelled), then five links 15 frames apart
export const reckless = () => {
  const hit = (name, pose, avoidBy, o = {}) => ({
    name, noFake: true, windupFrames: W, activeFrames: 6, recoveryFrames: 4, damage: 15,
    avoidBy, counterWindow: null, starWindow: null,
    sfx: { tell: 'zip', swing: 'swingHeavy' },
    animation: { windup: [pose + 'Tell'], active: [pose], recovery: [pose] },
    ...o,
  });
  return {
    recklessCall: {
      name: 'RECKLESS FLURRY', feint: true, call: true, noFake: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 4, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 12], starWindow: [2, 5],
      sfx: { tell: 'roar' },
      animation: { windup: ['finaleTell1'], active: ['finaleTell1'], recovery: ['finaleTell1'] },
    },
    reck1: hit('FLURRY 1', 'hookL', ['dodgeR']),
    reck2: hit('FLURRY 2', 'hook', ['dodgeL']),
    reck3: hit('FLURRY 3', 'bodyR', ['block', 'dodgeR'], { height: 'low' }),
    reck4: hit('FLURRY 4', 'jab', ['dodgeL', 'dodgeR', 'block', 'duck']),
    reck5: hit('FLURRY 5', 'hookL', ['dodgeR'], { recoveryFrames: 10, damage: 17 }),
  };
};

export const GASP = { open: 100, anim: 'winded', id: 'gasp', comboLimit: 9, star: [0, 44], sfxLoop: 'pant', sfxEvery: 22 };

export default {
  id: 'dash6',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE DESPERATE',
  circuit: 'rival6',
  rank: 0,
  isChampion: false,
  rival: 6,
  card: { ...DASH_CARD, weight: 165, record: '39-0 34KO', hometown: 'THE MIRROR SANCTUM', quote: 'I DON\'T HAVE ANYTHING LEFT TO PROVE. SO I\'LL JUST HIT YOU.' },
  lines: {
    win: 'NOTHING LEFT... EXCEPT YOU. STILL STANDING?',
    lose: 'I TOLD MYSELF I\'D NEVER RUN OUT. I RAN OUT.',
  },

  build: 'medium',
  palette: 'dash6',
  spriteLayers: 'dash6',

  stats: {
    health: 345, damageMult: 2.05, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: { ...DASH_ANIMS, winded: { frames: ['winded1', 'winded2'], rate: 12 } },

  moves: {
    ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W + 3), ...grandFinale(W + 2),
    divineL: divine(-1),
    divineR: divine(1),
    ...reckless(),
  },

  patterns: [
    { id: 'desperation', weight: 3, fixed: true, steps: [
      { idle: 24 }, { move: 'showJab' }, { idle: 22 }, { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP },
      { idle: 30 }, { move: 'smartCross' }, { idle: 30 } ] },
    { id: 'lastTricks', weight: 3, steps: [
      { idle: 22 }, { move: 'divineL' }, { idle: 24 }, { move: 'flashbulb' }, { idle: 22 }, { move: 'smartCross' }, { idle: 20 },
      { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 24 }, { move: 'knowItAll' }, { idle: 30 } ] },
    { id: 'burnout', weight: 3, fixed: true, steps: [
      { idle: 20 }, { move: 'divineR' }, { idle: 24 }, { move: 'cheapShot' }, { idle: 20 }, { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP },
      { idle: 28 }, { move: 'divineL' }, { idle: 30 } ] },
    { id: 'fireworks', weight: 2, steps: [
      { idle: 22 }, { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }, { idle: 26 },
      { move: 'divineR' }, { idle: 22 }, { move: 'showJab' }, { idle: 18 }, { move: 'knowItAll' }, { idle: 30 } ] },
  ],

  super: { hit: 'head', move: 'finaleCall', name: 'GRAND FINALE', then: ['finale1', 'finale2', 'finale3'], golden: 'windup', taunt: 38, shout: 'GRAND FINALE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [5, 7] },
    { hit: 'body', key: 'highlightReel', name: 'HIGHLIGHT REEL', inline: true, move: 'reelCall', then: ['reel1', 'reel2', 'reel3'], golden: 'windup', window: [6, 8] },
    { hit: 'body', key: 'recklessFlurry', name: 'RECKLESS FLURRY', inline: true, move: 'recklessCall', then: ['reck1', 'reck2', 'reck3', 'reck4', 'reck5'], golden: 'windup', window: [6, 8] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  exploits: [
    trashTalkExploit({ stun: 120, hits: 10, frames: [10, 24] }),
    {
      id: 'outOfGas', type: 'quirk', name: 'OUT OF GAS',
      trigger: { state: 'open', open: 'gasp', height: 'low', first: true },
      effect: { extendOpen: 44, max: 88, say: 'HE CAN\'T CATCH HIS BREATH!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'HE WHEEZES LIKE A BELLOWS WITH A HOLE IN IT WHEN THE FLURRY IS SPENT.' },
      scout: 'BODY SHOTS WHILE HE GASPS AFTER THE RECKLESS FLURRY KEEP HIM GASPING: THE OPENING GROWS BY UP TO 88 FRAMES.',
    },
    {
      id: 'burnedBulb', type: 'quirk', name: 'THE BULB BURNS OUT',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE BULB BURNS OUT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'A FLASHBULB THAT MISSES IS SPENT: THERE\'S NOTHING LEFT IN IT.', hidden: true },
      scout: 'SLIP THE FLASHBULB UPPERCUT: THE BULB BURNS OUT AND HE IS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
    {
      id: 'nothingToLose', type: 'getUpMash', name: 'NOTHING LEFT TO LOSE', response: 'harder', mult: 1.5, punches: 4, say: 'NOTHING TO LOSE!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT FOUR PUNCHES HIT MUCH HARDER.',
    },
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'allIn', name: 'ALL IN', when: { left: 60 }, say: 'ALL IN!', steps: [{ idle: 20 }, { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP }] },
    { id: 'lastStand', name: 'THE LAST STAND', when: { health: 0.3 }, say: 'THE LAST STAND!', steps: [{ idle: 16 }, { move: 'divineL' }, { idle: 20 }, { move: 'divineR' }, { idle: 22 }, { move: 'flashbulb' }] },
  ],
  special: [
    { type: 'comboReader', move: 'knowItAll', gap: 36, single: true },
    { type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'dash4.ghost' },
    { type: 'lunge', dist: 160, inFrames: 8, side: 30, back: 14, arrow: true },
  ],
  titleDefense: null,
  gallery: 'HE FOLLOWED YOU ALL THE WAY UP AND HE\'S OUT OF TRICKS. THE RECKLESS FLURRY IS FIVE HITS, THEN HE\'S GASPING.',
  medals: { signature: { text: 'COUNTER THE RECKLESS FLURRY\'S ROAR TWICE.', check: 'counterMove', move: 'recklessCall', n: 2 } },
  music: 'rivalDesperate',
};
