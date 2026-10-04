// #110 THE DUCK SHARD — Void I. A dancer the Void emptied out, all leg. EVERY attack of his is a horizontal sweep, and the only answer is
// to duck it (Down, Down): a slip is no use, a block no use. The follow-ups are DELAYED: a second and third sweep come after a pause too long
// to be part of the first, so a duck that stands up early is swept anyway. The long Scythe is the one you can punish: duck it (or counter
// its wide windup) and he is open. His super is the WHIRLWIND.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const D = ['duck'];
const M = {
  flick: only(D, vm('sweep', { name: 'FLICK', windupFrames: 3, recoveryFrames: 18, counterWindow: [2, 2], starWindow: null, damage: 12, sfx: { tell: 'whoosh', swing: 'swingHeavy' } })),
  sweep: only(D, vm('sweep', { name: 'SWEEP', windupFrames: 4, recoveryFrames: 22, counterWindow: [2, 3], starWindow: null, sfx: { tell: 'whoosh', swing: 'swingHeavy' } })),
  drag: only(D, vm('sweep', { name: 'DRAG', windupFrames: 6, recoveryFrames: 26, counterWindow: [3, 5], starWindow: null, sfx: { tell: 'whoosh', swing: 'swingHeavy' } })),
  scythe: only(D, vm('sweep', { name: 'THE SCYTHE', windupFrames: 15, recoveryFrames: 46, damage: 18, counterWindow: [4, 12], starWindow: [4, 7], sfx: { tell: 'whoosh', swing: 'crash' } })),
  whirlwind: only(D, superMove('WHIRLWIND', { windupFrames: 22, counterWindow: [5, 19], starWindow: [5, 9], animation: { windup: ['sweepTell'], windupRate: 8, active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] }, sfx: { tell: 'whoosh', swing: 'crash' } })),
};
// a sweep that is followed by another must leave the duck (26 frames, locked) time to end: never closer than 30 impact to impact
const after = () => 6;
const P = (id, seed, moves, gaps) => ({ id, weight: 3, fixed: true, steps: longSteps({ seed, moves, count: 32, gaps, rest: { every: 8, steps: [{ idle: 30 }, { move: 'scythe' }, { idle: 44 }] }, after }) });

export default {
  id: 'duckShard',
  name: 'THE DUCK SHARD',
  short: 'DUCK SHARD',
  nickname: 'THE LOW ROAD',
  circuit: 'v1',
  rank: 2,
  isChampion: false,
  card: { age: 0, weight: 150, record: '0-0 0KO', hometown: 'BENEATH THE ROPES', quote: 'KEEP YOUR HEAD UP AND I WILL TAKE IT. KEEP IT DOWN AND I WILL TAKE IT LATER.' },
  lines: { win: 'THE FLOOR IS WHERE YOU BELONG.', lose: 'I WAS... A DANCER... ONCE...' },

  build: 'lean',
  palette: 'duckShard',
  spriteLayers: 'duckShard',

  stats: stats({ health: 390, damageMult: 2.1, stunResistance: 4, starLossChance: 0.6, stunFrames: 52, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 14 } }),
  guardCounter: 'scythe',

  moves: M,
  patterns: [
    P('low1', 1103, [['flick', 3], ['sweep', 4], ['drag', 2]], [4, 24]),
    P('low2', 2117, [['sweep', 4], ['drag', 3], ['flick', 2]], [8, 34]),
    P('low3', 3131, [['flick', 4], ['drag', 3], ['sweep', 2]], [4, 40]),
  ],

  super: { hit: 'head', move: 'whirlwind', golden: 'windup', window: [11, 14], taunt: 46, shout: 'WHIRLWIND!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'scytheMissed', type: 'quirk', name: 'ON ONE LEG',
      trigger: { on: 'resolved', move: 'scythe', result: 'ducked' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 7, star: [0, 38] }, say: 'HE\'S ON ONE LEG!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE SCYTHE SWINGS HIM ALL THE WAY ROUND. WHEN IT FINDS NOTHING HE STANDS ON ONE LEG FOR A MOMENT.' },
      scout: 'DUCK THE SCYTHE (THE SLOW, WIDE SWEEP AT THE END OF EACH RUN): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'legsTangled', type: 'stunTrigger', name: 'LEGS TANGLED',
      trigger: { state: 'windup', move: 'scythe', counter: true, frames: [9, 12], clean: 28 },
      effect: { stun: 118, hits: 8, star: true, say: 'LEGS TANGLED!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE SCYTHE HE CROSSES HIS LEGS.', hidden: true },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE SCYTHE (HIS LEGS CROSS): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'sweepsTheJabber', type: 'jabSpam', name: 'SWEEPS THE JABBER', streak: 3, gap: 40, counter: ['scythe'], say: 'SWEPT!',
      scout: 'THROW THREE PUNCHES IN A ROW THAT AREN\'T PART OF AN OPENING AND HE PARRIES THE THIRD AND SWEEPS: THE SCYTHE, SLOW ENOUGH TO DUCK.',
    },
  ],
  scriptedMoments: [
    { id: 'dropTheFloor', name: 'DROP THE FLOOR', when: { left: 70 }, say: 'DROP THE FLOOR!', steps: [{ idle: 20 }, { move: 'flick' }, { idle: 34 }, { move: 'sweep' }, { idle: 44 }, { move: 'drag' }, { idle: 36 }, { move: 'flick' }, { idle: 30 }] },
  ],
  special: [],
  titleDefense: null,
  gallery: 'A DANCER THE VOID EMPTIED OUT. EVERY ATTACK IS A LOW SWEEP, AND FOLLOW-UPS ARRIVE LATE. DON\'T RISE TOO SOON.',
  medals: { signature: { text: 'DUCK THE SCYTHE THREE TIMES.', check: 'moveResult', move: 'scythe', result: 'ducked', n: 3 }, speed: 525 }, // (Phase F: the bot needs 5:04, up to 8:21)
  music: 'duckShardWalkup',
};
