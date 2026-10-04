// #119 THE WILL SHARD — Void III's champion, and the last of the twelve. An endurance fight: FIVE ROUNDS, and NOTHING IS RESTORED BETWEEN THEM:
// not your health, not his (the corner gives you nothing). Every round he hits harder and recovers faster (the WILL meter under the clock), and
// his patterns grow (34, 40, 46 moves). He is the sum of everything the other eleven tested, and he does not fall easily: his get-ups come back
// with most of his health. His super is the LAST WORD. No judges: after the five rounds the championship rounds go on (§4) until one of you is down.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
const M = {
  jab: vm('jab', { name: 'RESOLVE', avoidBy: ALL4 }),
  cross: vm('jabR', { name: 'RESOLVE (R)', avoidBy: ALL4 }),
  hook: vm('hook', { name: 'STUBBORN HOOK' }),
  hookL: vm('hookL', { name: 'STUBBORN HOOK (L)' }),
  body: vm('body', { name: 'GRIT' }),
  bodyR: vm('bodyR', { name: 'GRIT (R)' }),
  upper: only(D2, vm('upper', { name: 'RISING WILL' })),
  sweep: only(['duck'], vm('sweep', { name: 'UNDERFOOT' })),
  wall: only(['block'], vm('body', { name: 'HARD WALL', recoveryFrames: 30 })),
  breaking: only(D2, vm('haymaker', { name: 'WILL BREAKER' })),
  lastWord: only(D2, superMove('THE LAST WORD', { windupFrames: 26, counterWindow: [6, 23], starWindow: [6, 10], sfx: { tell: 'roar', swing: 'crash' } })),
};
const rest = { every: 8, steps: [{ idle: 26 }, { move: 'breaking' }, { idle: 40 }] };
const P = (id, seed, moves, count, when) => ({ id, weight: 3, fixed: true, when: { rounds: when }, steps: longSteps({ seed, moves, count, gaps: [10, 22], rest, after: (a) => (['sweep', 'wall'].includes(a) ? 8 : 0) }) });
const MIX = [['jab', 3], ['cross', 3], ['hook', 2], ['hookL', 2], ['body', 2], ['bodyR', 2], ['upper', 2], ['sweep', 1], ['wall', 1]];

export default {
  id: 'willShard',
  name: 'THE WILL SHARD',
  short: 'WILL SHARD',
  nickname: 'THE LAST TO FALL',
  circuit: 'v3',
  rank: 1,
  isChampion: true,
  card: { age: 0, weight: 330, record: '0-0 0KO', hometown: 'THE LAST ROUND', quote: 'I WILL STILL BE STANDING WHEN YOU ARE NOT.' },
  lines: { win: 'FIVE ROUNDS, AND YOU FELL IN THE LAST.', lose: 'I DIDN\'T FALL. I... WAS... LET GO...' },

  build: 'heavy',
  palette: 'willShard',
  spriteLayers: 'willShard',
  rounds: 5,
  gauntletStage: 5, // (a Gauntlet fight is one round: he fights it in his fifth-round form, WILL full and his longest pattern)
  cornerHeal: 0, // (nothing is restored between the rounds)

  stats: stats({ health: 620, damageMult: 2.3, stunResistance: 9, starLossChance: 0.7, stunFrames: 96, hitstun: 12, comboLimit: 3, betweenRoundHeal: 0 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),
  guardCounter: 'breaking',

  moves: M,
  patterns: [
    P('resolve1', 1191, MIX, 34, [1, 2]),
    P('resolve2', 2203, MIX, 40, [3, 4]),
    P('resolve3', 3217, MIX, 46, [5]),
  ],

  super: { hit: 'body', move: 'lastWord', golden: 'windup', window: [13, 16], taunt: 52, shout: 'THE LAST WORD!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.75 }, { upAt: [8, 9], health: 0.7 }, { upAt: [9, 9], health: 0.65 }, { upAt: [9, 9], stayDown: 0.4, health: 0.6 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'willBreaks', type: 'stunTrigger', name: 'THE WILL BREAKS',
      trigger: { state: 'windup', move: 'breaking', counter: true, frames: [10, 13], clean: 28 },
      effect: { stun: 128, hits: 9, star: true, say: 'THE WILL BREAKS!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE WILL BREAKER IS HIS ONLY LONG WINDUP: BOTH ARMS UP AND HIS WHOLE BODY SHAKING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE WILL BREAKER (THE HAYMAKER, ARMS UP): STUNNED FOR 9 HITS, THE FIRST A STAR.',
    },
    {
      id: 'willBent', type: 'quirk', name: 'THE WILL BENDS',
      trigger: { on: 'resolved', move: 'breaking', result: 'dodged' },
      effect: { open: { frames: 108, anim: 'stunned', comboLimit: 8, star: [0, 42] }, say: 'THE WILL BENDS!', sfx: 'thud' },
      hint: { kind: 'audio', text: 'THE BREAKER TAKES EVERYTHING HE HAS. WHEN IT MISSES, HE HAS TO FIND IT AGAIN.' },
      scout: 'SLIP THE WILL BREAKER (THE HAYMAKER): HE IS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'stubbornGetUp', type: 'stunTrigger', name: 'A STUBBORN RISE', limit: 3,
      trigger: { on: 'getUp' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HE RISES... SLOWLY!', sfx: 'thud' },
      hint: { kind: 'quote', text: 'I WILL STILL BE STANDING WHEN YOU ARE NOT.', hidden: true },
      scout: 'HE IS OPEN WHEN HE GETS UP OFF THE CANVAS: 5 FREE HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'wearsYouDown', type: 'turtling', name: 'WEARS YOU DOWN', response: 'drain', span: 300, share: 0.7, every: 36, say: 'HE WEARS YOU DOWN!',
      scout: 'HOLD YOUR GUARD UP FOR MOST OF THE LAST FIVE SECONDS AND HE WEARS YOU DOWN: A HEART DRAINS EVERY SECOND. BLOCK WHEN HE PUNCHES, NOT BEFORE.',
    },
    {
      id: 'willNotStayDown', type: 'getUpMash', name: 'WILL NOT STAY DOWN', response: 'harder', punches: 4, mult: 1.4, say: 'HE WON\'T STAY DOWN!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 4 PUNCHES HIT 40% HARDER.',
    },
  ],
  scriptedMoments: [
    { id: 'secondWind', name: 'A SECOND WIND', when: { left: 80, round: 3 }, say: 'A SECOND WIND!', steps: [{ idle: 20 }, { move: 'hook' }, { idle: 16 }, { move: 'hookL' }, { idle: 16 }, { move: 'upper' }, { idle: 30 }, { move: 'breaking' }, { idle: 40 }] },
    { id: 'notYet', name: 'NOT YET', when: { left: 60, round: 5 }, say: 'NOT YET!', steps: [{ idle: 16 }, { move: 'jab' }, { idle: 12 }, { move: 'cross' }, { idle: 12 }, { move: 'hook' }, { idle: 12 }, { move: 'hookL' }, { idle: 26 }, { move: 'breaking' }, { idle: 40 }] },
  ],
  special: [{ type: 'will', dmg: 0.09, rec: 0.05 }],
  titleDefense: null,
  gallery: 'THE LAST OF THE TWELVE. FIVE ROUNDS AND NOTHING RESTORED BETWEEN THEM: HE GROWS STRONGER WITH EVERY ONE.',
  medals: { signature: { text: 'KNOCK HIM DOWN IN THE FIFTH ROUND.', check: 'kdInRound', round: 5 }, speed: 600 }, // (Phase F: five rounds, but the bot knocks him out in 5:43)
  music: 'willShardEntrance',
};
