// #111 THE COUNTER SHARD — Void I's champion. A fencer's ghost. NOTHING hurts him but a counter: every punch that isn't one bounces off (and
// costs you hearts, and draws his REBUKE), Star Punches too. His windups are long and each has a 3-frame window, marked by a white flash
// of his whole body: press so the punch lands on the flash. A counter stuns him, and everything lands until he shakes it off.
// The first punch of every combo is the one to counter (the rest never come). His super is the RIPOSTE: counter it on the glint and he drops.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const slow = (kind, name, w, o = {}) => vm(kind, { name, windupFrames: w, counterWindow: [w - 6, w - 4], starWindow: null, recoveryFrames: 28, ...o });
const M = {
  jab: slow('jab', 'POINT', 12, { avoidBy: ALL4, sfx: { tell: 'parry', swing: 'whiff' } }),
  cross: slow('jabR', 'TIERCE', 12, { avoidBy: ALL4, sfx: { tell: 'parry', swing: 'whiff' } }),
  hook: slow('hook', 'SABRE', 13, { sfx: { tell: 'parry', swing: 'swingHeavy' } }),
  hookL: slow('hookL', 'SABRE (L)', 13, { sfx: { tell: 'parry', swing: 'swingHeavy' } }),
  body: slow('body', 'LUNGE', 13, { sfx: { tell: 'parry', swing: 'whiff' } }),
  bodyR: slow('bodyR', 'LUNGE (R)', 13, { sfx: { tell: 'parry', swing: 'whiff' } }),
  upper: slow('upper', 'FLECHE', 15, { counterWindow: [9, 11], sfx: { tell: 'parry', swing: 'swingHeavy' } }),
  // his answer to every punch that bounces: a slow one, so a jab that bounced can still be slipped
  rebuke: vm('hook', { name: 'REBUKE', windupFrames: 14, counterWindow: null, starWindow: null, recoveryFrames: 34, damage: 16, sfx: { tell: 'parry', swing: 'swingHeavy' }, noFake: true }),
  riposte: only(['dodgeL', 'dodgeR'], superMove('RIPOSTE', { windupFrames: 26, counterWindow: [8, 20], starWindow: [8, 11], sfx: { tell: 'parry', swing: 'crash' } })),
};
const P = (id, seed, moves, gaps) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 30, gaps, rest: null, first: 34, last: 44 }) });

export default {
  id: 'counterShard',
  name: 'THE COUNTER SHARD',
  short: 'COUNTER SHARD',
  nickname: 'THE ANSWER',
  circuit: 'v1',
  rank: 1,
  isChampion: true,
  longTells: true, // (balance audit: his windups are long by design)
  card: { age: 0, weight: 168, record: '0-0 0KO', hometown: 'THE LAST WORD', quote: 'YOU HAVE TO HIT ME WHILE I HIT YOU. THAT IS ALL A FIGHT EVER WAS.' },
  lines: { win: 'YOU NEVER ANSWERED.', lose: 'YOU... HAD THE LAST WORD...' },

  build: 'medium',
  palette: 'counterShard',
  spriteLayers: 'counterShard',

  stats: stats({ health: 340, damageMult: 2.2, stunResistance: 6, starLossChance: 0.65, stunFrames: 96, hitstun: 12, comboLimit: 2, stunComboLimit: 9, idleGuard: 'none', idleHitLimit: 0 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }),
  guardCounter: null,

  moves: M,
  patterns: [
    P('point1', 1121, [['jab', 3], ['cross', 3], ['hook', 2], ['hookL', 2], ['body', 2], ['bodyR', 2], ['upper', 1]], [26, 44]),
    P('point2', 2131, [['hook', 3], ['hookL', 3], ['upper', 2], ['jab', 2], ['cross', 2], ['body', 1], ['bodyR', 1]], [28, 46]),
    P('point3', 3137, [['body', 3], ['bodyR', 3], ['jab', 3], ['cross', 3], ['hook', 1], ['hookL', 1], ['upper', 2]], [26, 40]),
  ],

  super: { hit: 'body', move: 'riposte', golden: 'windup', window: [13, 16], taunt: 52, shout: 'RIPOSTE!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'starInTheWindow', type: 'instantKd', name: 'A STAR IN THE WINDOW',
      trigger: { state: 'windup', move: 'upper', star: true, frames: [9, 12] },
      effect: { knockdown: true, say: 'A STAR IN THE WINDOW!', sfx: 'perfect' },
      hint: { kind: 'visual', text: 'THE FLECHE\'S FLASH IS THE WIDEST OF THEM ALL, AND A STAR PUNCH TAKES TWENTY FRAMES TO ARRIVE.', hidden: true },
      scout: 'A STAR PUNCH THAT LANDS INSIDE THE FLASH OF THE FLECHE (THE UPPERCUT WITH THE WIDEST WINDOW): AN INSTANT KNOCKDOWN.',
    },
    {
      id: 'firstOfMany', type: 'patternBreak', name: 'THE REST NEVER COME',
      trigger: { state: 'windup', move: ['jab', 'cross'], counter: true, frames: [6, 8], clean: 24 },
      effect: { stun: 104, hits: 8, star: true, cancel: 2, say: 'THE REST NEVER COME!', sfx: 'crash' },
      hint: { kind: 'audio', text: 'HIS POINT AND TIERCE RING LIKE A PARRIED BLADE THE INSTANT THEY START.' },
      scout: 'A COUNTER ON THE FLASH OF HIS POINT OR TIERCE: STUNNED FOR 8 HITS, THE FIRST A STAR, AND HIS NEXT TWO STEPS ARE CANCELLED.',
    },
    {
      id: 'rebukeSlipped', type: 'quirk', name: 'THE REBUKE MISSES',
      trigger: { on: 'resolved', move: 'rebuke', result: ['dodged', 'ducked'] },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'THE REBUKE MISSES!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE REBUKE IS SLOW ON PURPOSE: HE WANTS YOU TO SEE IT COMING AND TAKE THE BAIT.' },
      scout: 'SLIP OR DUCK HIS REBUKE, THE SLOW HOOK HE THROWS AT PUNCHES THAT BOUNCE OFF HIM: HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'answersTheSwinger', type: 'rushing', name: 'ANSWERS THE SWINGER', span: 150, count: 2, counter: ['rebuke'], say: 'ANSWERED!',
      scout: 'SWING AT HIM TWICE WITHIN TWO AND A HALF SECONDS WITHOUT A COUNTER AND HE ANSWERS AT ONCE WITH THE REBUKE INSTEAD OF WAITING.',
    },
    {
      id: 'lastWord', type: 'getUpMash', name: 'THE LAST WORD', response: 'harder', punches: 3, mult: 1.3, say: 'THE LAST WORD!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'onGuard', name: 'ON GUARD', when: { left: 90, round: 1 }, say: 'ON GUARD!', steps: [{ idle: 22 }, { move: 'jab' }, { idle: 30 }, { move: 'hook' }, { idle: 30 }, { move: 'upper' }, { idle: 40 }] },
    { id: 'touche', name: 'TOUCHE', when: { health: 0.3 }, say: 'TOUCHE!', steps: [{ idle: 20 }, { move: 'hookL' }, { idle: 28 }, { move: 'bodyR' }, { idle: 28 }, { move: 'upper' }, { idle: 40 }] },
  ],
  special: [{ type: 'counterOnly', move: 'rebuke', hittable: [], flash: 'counterShard.flash', lead: 4 }],
  titleDefense: null,
  gallery: 'A FENCER\'S GHOST. NOTHING HURTS HIM BUT A COUNTER, IN A THREE-FRAME WINDOW. HE FLASHES WHITE ON EACH.',
  medals: { signature: { text: 'LAND FOUR COUNTERS.', check: 'counters', n: 4 } },
  music: 'counterShardEntrance',
};
