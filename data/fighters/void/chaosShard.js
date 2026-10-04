// #117 THE CHAOS SHARD — Void III. A gambler the Void emptied out. His move pool is RE-ROLLED EVERY TEN SECONDS: five moves out of twelve, a
// new pattern of thirty-two out of them, and his whole body changes colour when it lands (the screen flashes, "CHAOS!"). Nothing he does is
// the same for long. The roll itself dazes him for a moment. His super is SNAKE EYES.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
const M = {
  jab: vm('jab', { name: 'WILD JAB', avoidBy: ALL4 }),
  cross: vm('jabR', { name: 'WILD CROSS', avoidBy: ALL4 }),
  hook: vm('hook', { name: 'LOADED HOOK' }),
  hookL: vm('hookL', { name: 'LOADED HOOK (L)' }),
  body: vm('body', { name: 'LOW ROLL' }),
  bodyR: vm('bodyR', { name: 'LOW ROLL (R)' }),
  upper: only(D2, vm('upper', { name: 'HIGH ROLL' })),
  sweep: only(['duck'], vm('sweep', { name: 'SNAKE SWEEP' })),
  bodyB: only(['block'], vm('body', { name: 'HARD WAY', recoveryFrames: 30 })),
  haymaker: only(D2, vm('haymaker', { name: 'ALL IN' })),
  slam: only(D2, vm('upper', { name: 'JACKPOT', windupFrames: 10, counterWindow: [4, 8], starWindow: [4, 6], recoveryFrames: 34, damage: 18 })),
  flick: vm('jab', { name: 'CHEAP SHOT', avoidBy: ALL4, recoveryFrames: 18, damage: 7 }),
  snakeEyes: only(D2, superMove('SNAKE EYES', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'glitch', swing: 'crash' } })),
};
const POOL = ['jab', 'cross', 'hook', 'hookL', 'body', 'bodyR', 'upper', 'sweep', 'bodyB', 'haymaker', 'slam', 'flick'];

export default {
  id: 'chaosShard',
  name: 'THE CHAOS SHARD',
  short: 'CHAOS SHARD',
  nickname: 'SNAKE EYES',
  circuit: 'v3',
  rank: 3,
  isChampion: false,
  card: { age: 0, weight: 155, record: '? - ?', hometown: 'WHEREVER THE DICE LAND', quote: 'I DON\'T KNOW WHAT I\'LL DO NEXT EITHER.' },
  lines: { win: 'LUCK IS ALL THERE IS.', lose: 'I ROLLED... AND YOU... WERE THE SIX...' },

  build: 'medium',
  palette: 'chaosShard',
  spriteLayers: 'chaosShard',

  stats: stats({ health: 400, damageMult: 2.3, stunResistance: 5, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 10 } }),
  guardCounter: 'haymaker',

  moves: M,
  patterns: [{ id: 'chaos', weight: 1, fixed: true, steps: longSteps({ seed: 8117, moves: POOL.slice(0, 7), count: 32, gaps: [12, 26], rest: null }) }],

  super: { hit: 'body', move: 'snakeEyes', golden: 'windup', window: [12, 15], taunt: 46, shout: 'SNAKE EYES!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'diceInTheAir', type: 'stunTrigger', name: 'DICE IN THE AIR',
      trigger: { state: ['idle', 'recovery', 'block'], since: { event: 'reroll', frames: [0, 22] } },
      effect: { stun: 92, hits: 6, star: true, say: 'THE DICE ARE IN THE AIR!', sfx: 'glitch' },
      hint: { kind: 'visual', text: 'EVERY TEN SECONDS THE SCREEN FLASHES AND HE CHANGES COLOUR: THAT IS THE ROLL.' },
      scout: 'HIT HIM IN THE FIRST SECOND AFTER A RE-ROLL (THE FLASH AND THE COLOUR CHANGE) WHILE HE IS IN HIS STANCE OR RECOVERING: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'jackpotMissed', type: 'stunTrigger', name: 'JACKPOT, MISSED',
      trigger: { state: 'windup', move: 'slam', counter: true, frames: [6, 9], clean: 26 },
      effect: { stun: 108, hits: 8, star: true, say: 'THE JACKPOT SPILLS!', sfx: 'crash' },
      hint: { kind: 'audio', text: 'THE JACKPOT IS THE SLOWEST THING IN THE POOL, WHEN IT IS IN THE POOL.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE JACKPOT (THE SLOW UPPERCUT, WHEN HE HAS IT): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'allInLoses', type: 'quirk', name: 'ALL IN, ALL OUT',
      trigger: { on: 'resolved', move: 'haymaker', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 38] }, say: 'ALL IN, ALL OUT!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'HIS BIGGEST SWING ISN\'T IN EVERY POOL, BUT WHEN IT MISSES HE HAS NOTHING LEFT.', hidden: true },
      scout: 'SLIP HIS ALL IN (THE BIG HAYMAKER, WHEN HE HAS IT): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'readsYourSide', type: 'dodgeBias', name: 'LOADED DICE', moves: ['jab', 'cross', 'upper'], min: 5, share: 0.75, say: 'LOADED DICE!',
      scout: 'SLIP THE SAME WAY OVER AND OVER AND HIS JABS, CROSSES AND UPPERCUTS COME FROM THAT SIDE. WATCH WHICH GLOVE HE COCKS.',
    },
  ],
  scriptedMoments: [
    { id: 'doubleOrNothing', name: 'DOUBLE OR NOTHING', when: { left: 70 }, say: 'DOUBLE OR NOTHING!', steps: [{ idle: 20 }, { move: 'hook' }, { idle: 20 }, { move: 'hookL' }, { idle: 20 }, { move: 'jab' }, { idle: 34 }, { move: 'haymaker' }, { idle: 40 }] },
  ],
  special: [{ type: 'chaos', every: 10, size: 5, moves: POOL, gaps: [12, 26], locked: ['sweep', 'bodyB'], palettes: ['chaosShard', 'chaosShard.a', 'chaosShard.b', 'chaosShard.c'] }],
  titleDefense: null,
  gallery: 'A GAMBLER THE VOID EMPTIED OUT. EVERY TEN SECONDS HIS WHOLE MOVE POOL IS RE-ROLLED AND HE CHANGES COLOUR.',
  medals: { signature: { text: 'HIT HIM RIGHT AFTER A RE-ROLL.', check: 'cueCount', cue: '!exploit:diceInTheAir', n: 1 } },
  music: 'chaosShardWalkup',
};
