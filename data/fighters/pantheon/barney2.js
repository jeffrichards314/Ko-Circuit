// #81 Barney Buckets, Ascended — the bonus fight after Rho, the last gatekeeper before Halcyon. The janitor
// from the first fight in the game now sweeps the gates of heaven: white and gold, wings, a golden mop, an
// upturned bucket worn as a halo. "Somebody's gotta keep the heavens clean."
//   round 1  his ROOKIE pattern, move for move, at Pantheon speed (4-frame tells): the callback
//   round 2  adds MOP OF HEAVEN: a call, then three mop haymakers chained, each with its own defense:
//            slip LEFT, slip RIGHT, DUCK
//   round 3  adds HOLY SPILL: he kicks over his bucket and the canvas turns slick: every dodge slides
//            farther and takes longer to come back from, for the rest of the round
// The bucket slip is still there (a left body shot while the mop is up) but the window is 4 frames.
// His super is MOP BUCKET: the original's big mop swing at last. A knockdown: slip it.
// Pantheon VII difficulty: 4-frame tells, hearts 12; a bonus fight.

import { mv, superMove, stats, anims, GETUP } from './_kit.js';

const W = 4;
const idle = (n) => ({ idle: n });
const chain = (kind, name, o = {}) => mv(kind, 5, { name, counterWindow: null, starWindow: null, punishStar: null, recoveryFrames: 4, noFake: true, ...o });
const HAY = { hook: 'hook', hookL: 'hookL' };
void HAY;

export default {
  id: 'barney2',
  name: 'BARNEY BUCKETS, ASCENDED',
  short: 'BARNEY',
  nickname: 'THE MOP OF HEAVEN',
  circuit: 'p7',
  rank: 0,
  isChampion: false,
  card: {
    age: 52,
    weight: 191,
    record: '5-17 1KO',
    hometown: 'THE GATES OF HEAVEN',
    quote: 'SOMEBODY\'S GOTTA KEEP THE HEAVENS CLEAN.',
  },
  lines: { win: 'SWEPT YOU RIGHT OUT, KID! AGAIN!', lose: 'GUESS I\'LL GO GET THE BIG BUCKET...' },

  build: 'medium',
  palette: 'barney2',
  spriteLayers: 'barney2',

  stats: stats({ health: 420, damageMult: 2.1, stunResistance: 5, stunFrames: 44 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    // the Rookie kit, at Pantheon speed
    jab: mv('jab', W, { name: 'JAB', sfx: { tell: 'squeak' } }),
    hook: mv('hook', W, { name: 'PUSH-BROOM HOOK', windupFrames: 5, counterWindow: [2, 5], sfx: { tell: 'squeak' } }),
    mopSwing: mv('haymaker', W, {
      name: 'MOP SWING', windupFrames: 8, counterWindow: [2, 7], starWindow: [2, 5], height: 'high',
      sfx: { tell: 'squeak', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 4, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    }),
    // round 2: three mop haymakers in a row, each one slipped a different way
    mopUp: {
      name: 'MOP OF HEAVEN', feint: true, call: true, noFake: true,
      windupFrames: 14, activeFrames: 0, recoveryFrames: 4, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: [2, 12], starWindow: [2, 5], cancels: 3,
      sfx: { tell: 'squeak' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 7, active: ['overheadTell2'], recovery: ['overheadTell2'] },
    },
    mop1: chain('hook', 'MOP: LEFT', { avoidBy: ['dodgeL'], damage: 15, recoveryFrames: 12, sfx: { swing: 'swingHeavy' } }),
    mop2: chain('hookL', 'MOP: RIGHT', { avoidBy: ['dodgeR'], damage: 15, recoveryFrames: 12, sfx: { swing: 'swingHeavy' } }),
    mop3: mv('sweep', 5, { name: 'MOP: LOW', counterWindow: null, starWindow: null, damage: 16, noFake: true, sfx: { tell: 'squeak' } }),
    // round 3: he kicks the bucket over and the canvas turns slick
    holySpill: {
      name: 'HOLY SPILL', feint: true, call: true, noFake: true,
      windupFrames: 20, activeFrames: 0, recoveryFrames: 18, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: [2, 18], starWindow: [2, 6],
      sfx: { tell: 'splash' },
      animation: { windup: ['bodyTell'], active: ['bodyTell'], recovery: ['bodyTell', 'idle1'] },
    },
    // the super: the big mop swing, at last
    mopBucket: superMove('MOP BUCKET', { sfx: { tell: 'squeak', swing: 'swingHeavy' }, kdWindow: [10, 13] }),
  },

  patterns: [
    // round 1: warmup, exactly as in the Rookie Circuit (jab, jab, mop swing, hook), the rests shortened to Pantheon pace
    { id: 'warmup', weight: 1, fixed: true, when: { rounds: [1], health: [0.5, 1] }, steps: [idle(30), { move: 'jab' }, idle(24), { move: 'jab' }, idle(28), { move: 'mopSwing' }, idle(24), { move: 'hook' }, idle(22), idle(28)] },
    // round 2: the sweeping pattern, and the Mop of Heaven
    { id: 'sweeping', weight: 1, fixed: true, when: { rounds: [2], health: [0.5, 1] }, steps: [idle(24), { move: 'mopSwing' }, idle(20), { move: 'jab' }, idle(14), { move: 'hook' }, idle(22), idle(20), { move: 'jab' }, idle(10), { move: 'jab' }] },
    { id: 'mopOfHeaven', weight: 2, fixed: true, when: { rounds: [2] }, steps: [idle(26), { move: 'mopUp' }, idle(2), { move: 'mop1' }, { move: 'mop2' }, { move: 'mop3' }, idle(44), { move: 'jab' }, idle(20), { move: 'mopSwing' }, idle(40)] },
    // round 3: the spill first, then everything, on a slick floor
    { id: 'slick', weight: 1, fixed: true, when: { rounds: [3], health: [0.5, 1] }, steps: [idle(20), { move: 'holySpill' }, idle(30), { move: 'mopUp' }, idle(2), { move: 'mop1' }, { move: 'mop2' }, { move: 'mop3' }, idle(50), { move: 'mopSwing' }, idle(40), { move: 'jab' }, idle(20), { move: 'hook' }, idle(30)] },
    { id: 'mopAndBucket', weight: 2, fixed: true, when: { rounds: [3] }, steps: [idle(24), { move: 'mopSwing' }, idle(30), { move: 'mopUp' }, idle(2), { move: 'mop1' }, { move: 'mop2' }, { move: 'mop3' }, idle(52), { move: 'jab' }, idle(22), { move: 'jab' }, idle(30), { move: 'hook' }, idle(30)] },
    // under half health, in any round: the Rookie 'desperate' pattern, double-mop and all
    { id: 'desperate', weight: 1, fixed: true, when: { health: [0, 0.5] }, steps: [idle(20), { move: 'mopSwing' }, idle(30), { move: 'mopSwing' }, idle(30), { move: 'jab' }, idle(16), { move: 'hook' }, idle(30), idle(26)] },
  ],

  super: { hit: 'Lbody', move: 'mopBucket', golden: 'windup', window: [10, 13], taunt: 50, shout: 'MOP BUCKET!', times: [1, 2] },
  // more supers (super.js): each armored from its first frame to its last attack, each with one golden moment
  supers: [
    { hit: 'head', key: 'mopOfHeaven', name: 'MOP OF HEAVEN', inline: true, move: 'mopUp', then: ['mop1', 'mop2', 'mop3'], golden: 'windup', window: [6, 9] },
  ],

  getUpTable: GETUP,


  exploits: [
    {
      id: 'bucketSlip', type: 'stunTrigger', name: 'BUCKET SLIP',
      trigger: { state: 'windup', move: 'mopSwing', side: 'L', height: 'low', frames: [2, 5], clean: 30 },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 5 }, say: 'SLIPPED ON HIS BUCKET!', sfx: 'splash' },
      hint: { kind: 'trainer', text: 'WATCH THAT BUCKET BY HIS FEET.' },
      scout: 'A LEFT BODY SHOT ON THE FIRST FRAMES OF HIS MOP SWING SLIPS HIM ON HIS BUCKET: 4 FREE HITS. THE WINDOW IS 4 FRAMES.',
    },
    {
      id: 'wetFloorSign', type: 'quirk', name: 'WET FLOOR',
      trigger: { on: 'resolved', move: 'mop3', result: 'ducked' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'CAUTION: WET FLOOR!', sfx: 'splash' },
      hint: { kind: 'visual', text: 'THE LOW MOP SWEEP LEAVES HIM STANDING IN HIS OWN PUDDLE.', hidden: true },
      scout: 'DUCK THE THIRD (LOW) MOP OF THE MOP OF HEAVEN: HE SLIPS IN HIS OWN PUDDLE AND IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'haloOff', type: 'stunTrigger', name: 'THE HALO SLIPS',
      trigger: { state: 'idle', star: true },
      effect: { stun: 80, hits: 5, say: 'THE BUCKET FALLS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE BUCKET ON HIS HEAD IS NOT NAILED DOWN.', hidden: true },
      scout: 'A STAR PUNCH THAT LANDS ON HIM WHILE HE STANDS STILL KNOCKS HIS BUCKET-HALO OFF: STUNNED FOR 5 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'smokeBreak', type: 'passivity', name: 'TAKES A BREAK', response: 'snack', frames: 300, limit: 1, say: 'TAKING FIVE!',
      step: { open: 62, anim: 'taunt', id: 'break', heal: 0.05, comboLimit: 3, star: [0, 22] },
      scout: 'WAIT AROUND FOR 5 SECONDS AND HE TAKES A BREAK ON HIS MOP (HEALING A LITTLE): AN OPENING, BUT ONLY ONCE A ROUND.',
    },
  ],
  scriptedMoments: [
    {
      id: 'keepItClean', name: 'KEEPING THE HEAVENS CLEAN', when: { left: 75 }, say: 'KEEPING IT CLEAN!',
      steps: [{ idle: 18 }, { move: 'jab' }, { idle: 12 }, { move: 'jab' }, { idle: 20 }, { move: 'mopSwing' }],
    },
  ],
  props: [{ type: 'bucket', exploit: 'bucketSlip', dx: 36 }],
  special: [{ type: 'slide', call: 'holySpill', extra: 10, frames: 0, until: 'round', label: 'HOLY SPILL', shout: 'THE FLOOR IS SLICK!', sfx: 'splash' }],
  titleDefense: null,
  gallery: 'THE JANITOR FROM THE FIRST FIGHT, NOW SWEEPING THE GATES OF HEAVEN. THE SAME MOP, A LOT FASTER.',
  medals: { signature: { text: 'WIN LANDING DAMAGE ONLY BY COUNTERING HIS MOP WINDUPS.', check: 'onlyCounters', moves: ['mopSwing'] } },
  music: 'barney2Walkup',
  fightMusic: 'barneyAscendedFight',
};
