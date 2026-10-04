// #87 Scorch — Underworld II, Ashen Fields. A man on fire who likes it. His gloves are two flames wrapped in rags,
// and whatever they touch, blocked or not, catches: you BURN, and keep burning, a little health every
// second (never your last point), until you slip or duck one of his punches. So the answer to fire is
// footwork. Block-only punches (his body blow) are the ones to be careful with: they light you up and give you
// no way to put it out.
// His super is the CONFLAGRATION: both fists high and the whole plain behind them. A knockdown: slip it. Counter it
// on the glint and it goes off in his hands.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const flame = { tell: 'ignite' };

export default {
  id: 'scorch',
  name: 'SCORCH',
  short: 'SCORCH',
  nickname: 'THE TORCH',
  circuit: 'u2',
  rank: 2,
  isChampion: false,
  card: {
    age: 34,
    weight: 176,
    record: '61-2 55KO',
    hometown: 'THE BURNING PLAIN',
    quote: 'I DON\'T KNOCK YOU OUT. I LIGHT YOU UP AND WAIT.',
  },
  lines: { win: 'STILL WARM. STAY DOWN.', lose: 'THE FIRE... GOES OUT...' },

  build: 'medium',
  palette: 'scorch',
  spriteLayers: 'scorch',

  stats: stats({ health: 330, damageMult: 1.95, stunResistance: 5, stunFrames: 44, hitstun: 11 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 14 }, winded: { frames: ['winded1', 'winded2'], rate: 14 } }),

  moves: {
    blaze: mv('jab', W, { name: 'BLAZING JAB', sfx: flame }),
    blazeR: mv('jabR', W, { name: 'BLAZING CROSS', sfx: flame }),
    torch: mv('hook', W, { name: 'TORCH HOOK', sfx: flame }),
    torchL: mv('hookL', W, { name: 'TORCH HOOK (L)', sfx: flame }),
    coal: mv('bodyR', W, { name: 'HOT COAL', sfx: { tell: 'ember' } }),
    scald: mv('upper', W, { name: 'SCALD', windupFrames: 9, counterWindow: [3, 8], starWindow: [3, 5], sfx: { tell: 'ignite', swing: 'swingHeavy' } }),
    inferno: mv('haymaker', W, { name: 'INFERNO', windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], sfx: { tell: 'ignite', swing: 'swingHeavy' } }),
    // the super
    conflagration: superMove('CONFLAGRATION', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'flame', swing: 'crash' } }),
  },

  patterns: [
    { id: 'kindle', weight: 3, when: { rounds: [1] }, steps: steps('i26 blaze i14 blazeR i18 torch i28 coal i22 scald i32 inferno i38') },
    { id: 'wildfire', weight: 3, steps: steps('i22 blazeR i12 blaze i16 torchL i24 scald i20 coal i30 inferno i32 torch i14 torchL i40') },
    { id: 'firestorm', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 torch i12 torchL i14 blaze i12 blazeR i26 inferno i22 scald i18 coal i38') },
  ],

  super: { hit: 'body', move: 'conflagration', golden: 'windup', window: [12, 15], taunt: 48, shout: 'CONFLAGRATION!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'burnedOut', type: 'quirk', name: 'BURNED OUT',
      trigger: { on: 'resolved', move: 'inferno', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'winded', comboLimit: 6, star: [0, 34] }, say: 'BURNED OUT!', sfx: 'pant' },
      hint: { kind: 'visual', text: 'THE INFERNO TAKES EVERYTHING HE HAS. SLIP IT AND HIS FLAMES GUTTER.' },
      scout: 'SLIP HIS INFERNO: THE FLAMES GUTTER AND HE IS WINDED AND OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'whiteHotTell', type: 'stunTrigger', name: 'THE WHITE-HOT TELL',
      trigger: { state: 'windup', move: 'scald', counter: true, frames: [6, 8] },
      effect: { stun: 84, hits: 5, star: true, say: 'HE SEARS HIMSELF!', sfx: 'hiss' },
      hint: { kind: 'visual', text: 'HIS FLAMES FLARE WHITE AT THE TOP OF THE SCALD.', hidden: true },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE SCALD (THE FLAMES GO WHITE) MAKES HIM SEAR HIMSELF: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'heatSeeps', type: 'turtling', name: 'THE HEAT SEEPS THROUGH', response: 'drain', share: 0.4, span: 480, every: 40, say: 'THE HEAT SEEPS THROUGH!',
      scout: 'BLOCK A LOT AND THE HEAT COMES THROUGH THE GUARD: A HEART DRAINS EVERY SECOND OR SO WHILE YOU HOLD IT.',
    },
  ],
  scriptedMoments: [
    {
      id: 'flashpoint', name: 'FLASHPOINT', when: { health: 0.5 }, say: 'FLASHPOINT!',
      steps: [{ idle: 18 }, { move: 'torch' }, { idle: 14 }, { move: 'torchL' }, { idle: 18 }, { move: 'scald' }, { idle: 24 }, { move: 'inferno' }],
    },
  ],
  special: [{ type: 'burn', dmg: 1, every: 18, cap: 16, hearts: 0 }],
  titleDefense: null,
  gallery: 'A MAN WHOSE GLOVES ARE FLAMES. WHAT THEY TOUCH, YOU CARRY: BURN DAMAGE UNTIL YOU SLIP A PUNCH.',
  medals: { signature: { text: 'NEVER CATCH FIRE.', check: 'noCue', cue: '!ignited' } },
  music: 'scorchWalkup',
};
