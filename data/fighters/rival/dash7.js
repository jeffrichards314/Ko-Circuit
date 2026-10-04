// Rival fight VII, Dash in Chains (§18 A5): Dash Maddox, at the bottom, and not alone. Whatever Vorgath traded him
// for the stairs, he's paying it now: the halo is gone, the gold has gone to dull iron, there are cuffs on
// both wrists with a chain hanging from each, and a collar at his neck with a shadow chain running out of the
// frame and up into the dark. Everything he's ever thrown at you (the read, the flashbulb, the highlight
// reel, the grand finale, the divine dash, the reckless flurry) plus the CHAIN HOOK: a hook with a shadow
// chain wound round the fist. Slip LEFT or duck it. If it lands, the chain takes you: it REELS YOU IN to
// the middle and holds you there. You can't dodge, block or punch until you mash A / B free.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life (his own health is Grand Prix tough,
// and he keeps his file on you).
import { baseMoves, knowItAll, flashbulb, highlightReel, grandFinale, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';
import { divine, reckless, GASP } from './dash6.js';

const W = 4;

// the chain hook: a hook (slip LEFT or duck it) with a chain round the fist. Landed, it holds you (a clinch: see `yank`).
const chainHook = () => ({
  name: 'CHAIN HOOK', clinch: true, noFake: true,
  windupFrames: W + 6, activeFrames: 8, recoveryFrames: 32, damage: 8,
  avoidBy: ['dodgeL', 'duck'],
  counterWindow: [3, W + 4], starWindow: [3, 6], punishStar: ['dodged', 'ducked'],
  sfx: { tell: 'chainRattle', swing: 'chainSnap' },
  openAfter: { when: ['hit'], open: 150, anim: 'hold', id: 'hold', comboLimit: 0 },
  animation: { windup: ['chainTell'], active: ['hook'], recovery: ['hook', 'idle1'] },
});

export default {
  id: 'dash7',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'IN CHAINS',
  circuit: 'rival7',
  rank: 0,
  isChampion: false,
  rival: 7,
  card: { ...DASH_CARD, weight: 163, record: '43-0 38KO', hometown: 'THE CHAIN PITS', quote: 'HE SAID I COULD STAY. HE JUST DIDN\'T SAY WHERE.' },
  lines: {
    win: 'STAY DOWN, CHAMP. HE\'S WATCHING.',
    lose: 'TELL HIM... TELL HIM I TRIED...',
  },

  build: 'medium',
  palette: 'dash7',
  spriteLayers: 'dash7',

  stats: {
    health: 415, damageMult: 2.1, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.55,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: { ...DASH_ANIMS, winded: { frames: ['winded1', 'winded2'], rate: 12 }, hold: { frames: ['chainHold'], rate: 30 } },

  moves: {
    ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W + 3), ...grandFinale(W + 2),
    divineL: divine(-1),
    divineR: divine(1),
    ...reckless(),
    chainHook: chainHook(),
  },

  patterns: [
    { id: 'bound', weight: 3, fixed: true, steps: [
      { idle: 24 }, { move: 'showJab' }, { idle: 22 }, { move: 'chainHook' }, { idle: 40 }, { move: 'smartCross' }, { idle: 26 }, { move: 'divineL' }, { idle: 30 },
      { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP }, { idle: 30 } ] },
    { id: 'shackled', weight: 3, fixed: true, steps: [
      { idle: 22 }, { move: 'cheapShot' }, { idle: 20 }, { move: 'knowItAll' }, { idle: 24 }, { move: 'chainHook' }, { idle: 42 },
      { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 26 }, { move: 'flashbulb' }, { idle: 30 } ] },
    { id: 'pulled', weight: 3, fixed: true, steps: [
      { idle: 20 }, { move: 'divineR' }, { idle: 24 }, { move: 'smartCross' }, { idle: 18 }, { move: 'chainHook' }, { idle: 40 },
      { move: 'showJab' }, { idle: 18 }, { move: 'flashbulb' }, { idle: 28 }, { move: 'chainHook' }, { idle: 44 } ] },
    { id: 'lastLink', weight: 2, steps: [
      { idle: 22 }, { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }, { idle: 26 },
      { move: 'divineL' }, { idle: 22 }, { move: 'chainHook' }, { idle: 40 }, { move: 'knowItAll' }, { idle: 30 } ] },
  ],

  super: { hit: 'head', move: 'finaleCall', name: 'GRAND FINALE', then: ['finale1', 'finale2', 'finale3'], golden: 'windup', taunt: 38, shout: 'GRAND FINALE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [4, 6] },
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
    trashTalkExploit({ stun: 126, hits: 11, frames: [11, 26] }),
    {
      id: 'outOfGas', type: 'quirk', name: 'OUT OF GAS',
      trigger: { state: 'open', open: 'gasp', height: 'low', first: true },
      effect: { extendOpen: 48, max: 92, say: 'HE CAN\'T CATCH HIS BREATH!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'HE WHEEZES LIKE A BELLOWS WITH A HOLE IN IT WHEN THE FLURRY IS SPENT.' },
      scout: 'BODY SHOTS WHILE HE GASPS AFTER THE RECKLESS FLURRY KEEP HIM GASPING: THE OPENING GROWS BY UP TO 92 FRAMES.',
    },
    {
      id: 'tautChain', type: 'quirk', name: 'THE CHAIN GOES TAUT',
      trigger: { on: 'resolved', move: 'chainHook', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'winded', comboLimit: 8, star: [0, 40] }, say: 'THE CHAIN YANKS HIM BACK!', sfx: 'chainSnap' },
      hint: { kind: 'audio', text: 'A CHAIN HOOK THAT MISSES RUNS OUT OF SLACK WITH A SNAP.' },
      scout: 'SLIP LEFT OF HIS CHAIN HOOK: THE SHADOW CHAIN RUNS OUT OF SLACK AND YANKS HIM OFF BALANCE, OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'burnedBulb', type: 'quirk', name: 'THE BULB BURNS OUT',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 7, star: [0, 38] }, say: 'THE BULB BURNS OUT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'A FLASHBULB THAT MISSES IS SPENT: THERE\'S NOTHING LEFT IN IT.', hidden: true },
      scout: 'SLIP THE FLASHBULB UPPERCUT: THE BULB BURNS OUT AND HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
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
    { id: 'bound', name: 'BOUND', when: { left: 110 }, say: 'BOUND!', steps: [{ idle: 20 }, { move: 'chainHook' }, { idle: 44 }, { move: 'showJab' }, { idle: 18 }, { move: 'chainHook' }, { idle: 44 }] },
    { id: 'allIn', name: 'ALL IN', when: { left: 55 }, say: 'ALL IN!', steps: [{ idle: 20 }, { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP }] },
    { id: 'lastStand', name: 'THE LAST STAND', when: { health: 0.3 }, say: 'THE LAST STAND!', steps: [{ idle: 16 }, { move: 'divineL' }, { idle: 20 }, { move: 'divineR' }, { idle: 22 }, { move: 'chainHook' }, { idle: 44 }, { move: 'flashbulb' }] },
  ],
  special: [
    { type: 'comboReader', move: 'knowItAll', gap: 36, single: true },
    { type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'dash4.ghost' },
    { type: 'lunge', dist: 160, inFrames: 8, side: 30, back: 14, arrow: true },
    { type: 'yank', timeout: 150, every: 30, damage: 3, heart: 1, power: 1, decay: 1, letGo: { open: 58, anim: 'winded', comboLimit: 6, star: [0, 26] }, hand: [22, -70] },
  ],
  titleDefense: null,
  gallery: 'HE FOLLOWED YOU ALL THE WAY DOWN, AND NOT OF HIS OWN WILL. THE CHAIN HOOK REELS YOU IN: SLIP LEFT OR DUCK.',
  medals: { signature: { text: 'SLIP THE CHAIN HOOK TWICE.', check: 'moveResult', move: 'chainHook', result: 'dodged', n: 2 } },
  music: 'rivalChains',
};
