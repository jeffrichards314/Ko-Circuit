// #95 Fallen Brody — Underworld IV, the Hall of the Fallen. The Minor champion who never took a step backward, and
// the Underworld has taken his stillness for its own. His sprite is Brick Wall Brody's (dark palette), his wall
// is the same wall (a punch that isn't a counter thuds off him and costs you hearts), but his counter-
// puncher's pride has gone bad. Every counter you land on him is answered: when the stun runs out he fires the
// BACKLASH, a slow uppercut (slip it or duck it). The old tricks (the weak brick, the dropped brick) are gone; he
// has been rebuilt from the same bricks and has different weak points.
// His super is the CEMENT MIXER: an uppercut that takes you off your feet. Counter it on the glint and the wall comes down.
// Underworld difficulty: 5-frame tells for a heavy (3-frame circuit), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';
import brody from '../brody.js';

const W = 5;
const thud = { tell: 'thud' };
const SETTLE = { open: 64, anim: 'stunned', comboLimit: 5, id: 'settle', sfx: 'crunch', exposed: true };
const CRACK = { open: 64, anim: 'stunned', comboLimit: 5, id: 'crack', sfx: 'crunch', exposed: true };

export default {
  id: 'fbrody',
  name: 'FALLEN BRODY',
  short: 'BRODY',
  nickname: 'THE TOMB WALL',
  circuit: 'u4',
  rank: 3,
  isChampion: false,
  card: { age: 36, weight: 262, record: '24-2 18KO (+ONE)', hometown: 'THE DEEP QUARRY', quote: '...' },
  lines: { win: '...', lose: '...THE WALL... WAS ALREADY... DOWN.' },

  build: 'heavy',
  palette: 'fbrody',
  spriteLayers: 'brody',

  stats: stats({ health: 340, damageMult: 2.05, stunResistance: 6, starLossChance: 0.6, stunComboLimit: 6, idleGuard: 'none', stunFrames: 62, hitstun: 13, guardCounter: 0 }),
  anims: { ...anims({ idle: { frames: ['idle1', 'idle2'], rate: 30 } }), taunt: brody.anims.taunt, victory: brody.anims.victory },

  moves: {
    mortar: mv('jab', W, { name: 'MORTAR JAB', sfx: thud }),
    mortarR: mv('jabR', W, { name: 'MORTAR CROSS', sfx: thud }),
    foundation: mv('body', W, { name: 'FOUNDATION', avoidBy: ['block'], sfx: thud }),
    footing: mv('bodyR', W, { name: 'FOOTING', avoidBy: ['block'], sfx: thud }),
    wrecking: mv('hook', W, { name: 'WRECKING BALL', windupFrames: 9, counterWindow: [3, 8], starWindow: [4, 7], damage: 16, sfx: { tell: 'thud', swing: 'swingHeavy' } }),
    layer1: mv('hookL', W, { name: 'BRICKLAYER', windupFrames: 8, recoveryFrames: 6, counterWindow: [3, 7], starWindow: null, punishStar: null, noFake: true, sfx: { tell: 'thud' } }),
    layer2: mv('hook', W, { name: 'BRICKLAYER (2)', windupFrames: 14, recoveryFrames: 34, counterWindow: null, starWindow: null, noFake: true, sfx: { swing: 'swingHeavy' } }),
    // the answer to a counter: slow, and it can be slipped or ducked
    backlash: mv('upper', W, {
      name: 'BACKLASH', windupFrames: 12, recoveryFrames: 38, damage: 15, avoidBy: ['dodgeL', 'dodgeR', 'duck'], counterWindow: null, starWindow: null, noFake: true,
      punishStar: ['dodged', 'ducked'], sfx: { tell: 'grind', swing: 'swingHeavy' }, animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
    }),
    cement: superMove('CEMENT MIXER', { windupFrames: 16, activeFrames: 8, recoveryFrames: 44, counterWindow: [4, 14], starWindow: [4, 8], kdWindow: [10, 13], sfx: { tell: 'thud', swing: 'swingHeavy' }, animation: { windup: ['upperTell'], active: ['upper'], recovery: ['upper', 'idle1'] } }),
  },

  // (clock update 2026-10-03: dust settles after the second brick, an opening for three hits: the wall, his gimmick, is untouched)
  patterns: [
    { id: 'groundwork', weight: 3, when: { rounds: [1] }, steps: [...steps('i30 mortar i44 foundation i36 wrecking i30'), CRACK, ...steps('i26 mortarR i34 layer1 layer2 i30'), SETTLE, ...steps('i26 footing i40')] },
    { id: 'loadBearing', weight: 3, steps: [...steps('i26 footing i24 mortar i38 wrecking i24'), CRACK, ...steps('i26 layer1 layer2 i26'), SETTLE, ...steps('i26 foundation i30 mortarR i36 wrecking i50')] },
    { id: 'demolition', weight: 2, when: { health: [0, 0.5] }, steps: [...steps('i24 wrecking i28 foundation i20 mortar i24'), CRACK, ...steps('i26 layer1 layer2 i24'), SETTLE, ...steps('i24 wrecking i40')] },
    { id: 'rubble', script: 'rubble', steps: [...steps('i24 foundation i22 wrecking i20 mortar i22'), CRACK, ...steps('i20 foundation i22 layer1 layer2 i26'), SETTLE, ...steps('i20')] },
  ],

  super: { hit: 'body', move: 'cement', golden: 'windup', window: [10, 13], taunt: 46, shout: '...', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'keystone', type: 'quirk', name: 'A CRACKED KEYSTONE',
      trigger: { on: 'resolved', move: 'backlash', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'THE KEYSTONE CRACKS!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'STONE GRINDS ON STONE BEFORE THE BACKLASH: IT IS THE SOUND OF THE KEYSTONE SLIPPING.' },
      scout: 'SLIP HIS BACKLASH (THE GRINDING UPPERCUT AFTER A COUNTER): THE KEYSTONE CRACKS AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'looseBall', type: 'stunTrigger', name: 'THE BALL COMES LOOSE',
      trigger: { state: 'windup', move: 'wrecking', counter: true, frames: [6, 8], clean: 24 },
      effect: { stun: 104, hits: 7, star: true, flag: 'unanswered', until: 'round', say: 'THE BALL COMES LOOSE!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE WRECKING BALL WOBBLES AT THE TOP OF ITS SWING: IT IS ONLY HELD ON BY HIS FIST.', hidden: true },
      scout: 'A COUNTER ON THE LAST THREE FRAMES OF THE WRECKING BALL: STUNNED FOR 7 HITS, THE FIRST A STAR, AND NO BACKLASH FOR THE REST OF THE ROUND.',
    },
  ],
  antiStrategies: [
    {
      id: 'buriesTurtle', type: 'turtling', name: 'BURIES THE TURTLE', response: 'unblockable', moves: ['mortar'], span: 420, share: 0.4, cue: 'NO BLOCK!', say: 'HIS JAB GOES THROUGH!',
      scout: 'BLOCK FOR TOO LONG AND HIS MORTAR JAB GOES THROUGH YOUR GUARD: SLIP IT INSTEAD.',
    },
  ],
  scriptedMoments: [
    { id: 'toppling', name: 'THE WALL TOPPLES', when: { left: 70 }, say: 'THE WALL LEANS...', steps: [{ idle: 18 }, { move: 'wrecking' }, { idle: 30 }, { move: 'foundation' }, { idle: 26 }, { move: 'wrecking' }] },
    { id: 'rubble', name: 'RUBBLE', when: { health: 0.3 }, patterns: 'rubble', say: 'THE WALL IS FALLING!' },
  ],
  special: [{ type: 'unstaggerable' }, { type: 'counterback', move: 'backlash', unless: 'unanswered' }],
  titleDefense: null,
  gallery: 'THE MINOR CHAMPION, FALLEN. EVERY COUNTER YOU LAND ON HIM IS ANSWERED WITH THE BACKLASH: SLIP IT.',
  medals: { speed: 510, /* Phase F: the bot needs 6:05 (of the circuit's 6:15) */ signature: { text: 'SLIP HIS BACKLASH TWICE.', check: 'moveResult', move: 'backlash', result: 'dodged', n: 2 } },
  music: 'fbrodyWalkup',
};
