// Rival fight VIII, Dash, the King's Champion (§18 A5): Dash Maddox, at the Abyss Gate, in Vorgath's colours. Whatever he owes, he has
// stopped arguing about it: a black breastplate with the King's crown in red on it, a black iron circlet with a ruby at the brow,
// spiked bracers where the cuffs were (the chain is gone; the mark it left is not). Everything he's ever thrown at you (the read, the flashbulb,
// the highlight reel, the grand finale, the divine dash, the reckless flurry, the chain hook) plus the SHADOW STEP: throw a punch at him
// while he's in his stance (or guarding) and it whiffs through smoke: he steps into shadow and comes back on the OTHER side of you from
// your punching hand, and answers from there with a hook. Slip away from him, or duck. Counter the reply and he's in trouble.
// Underworld difficulty: 3-frame tells, adaptive, 10 hearts, one life (his own health is Grand Prix tough, and he keeps his file on you).
import { baseMoves, knowItAll, flashbulb, highlightReel, grandFinale, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';
import { divine, reckless, GASP } from './dash6.js';

const W = 3;

// the chain hook, as in dash7 (a hook with a chain wound round the fist; a clinch when it lands)
const chainHook = () => ({
  name: 'CHAIN HOOK', clinch: true, noFake: true,
  windupFrames: W + 6, activeFrames: 8, recoveryFrames: 32, damage: 8,
  avoidBy: ['dodgeL', 'duck'],
  counterWindow: [3, W + 4], starWindow: [3, 6], punishStar: ['dodged', 'ducked'],
  sfx: { tell: 'chainRattle', swing: 'chainSnap' },
  openAfter: { when: ['hit'], open: 150, anim: 'hold', id: 'hold', comboLimit: 0 },
  animation: { windup: ['chainTell'], active: ['hook'], recovery: ['hook', 'idle1'] },
});
// the shadow step's reply: a hook from the side he came back on (his right = the hook that is slipped LEFT, and the other way)
const reply = (side) => ({
  name: 'SHADOW HOOK', noFake: true,
  windupFrames: W + 4, activeFrames: 7, recoveryFrames: 32, damage: 14,
  avoidBy: [side > 0 ? 'dodgeL' : 'dodgeR', 'duck'],
  counterWindow: [3, W + 2], starWindow: [3, 4], punishStar: ['dodged', 'ducked'],
  sfx: { tell: 'shadowStep', swing: 'swingHeavy' },
  animation: side > 0 ? { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] } : { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
});

export default {
  id: 'dash8',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE KING\'S CHAMPION',
  circuit: 'rival8',
  rank: 0,
  isChampion: false,
  rival: 8,
  card: { ...DASH_CARD, weight: 166, record: '47-0 42KO', hometown: 'THE ABYSS GATE', quote: 'I SAID I\'D BEAT YOU AT ANY PRICE. THIS IS THE PRICE.' },
  lines: {
    win: 'THE KING WILL BE PLEASED. I\'M NOT.',
    lose: 'THEN GO. GO DOWN THERE AND END IT. I DIDN\'T... I DIDN\'T WANT...',
  },

  build: 'medium',
  palette: 'dash8',
  spriteLayers: 'dash8',

  stats: {
    health: 470, damageMult: 2.2, stunResistance: 6, heartDrainOnBlock: 3, starLossChance: 0.6,
    comboLimit: 3, stunComboLimit: 6, idleHitLimit: 1, idleGuard: 'high', stunFrames: 44, hitstun: 11, betweenRoundHeal: 0.2,
  },

  anims: { ...DASH_ANIMS, winded: { frames: ['winded1', 'winded2'], rate: 12 }, hold: { frames: ['chainHold'], rate: 30 } },
  guardCounter: 'chainHook', // (a slow answer to punches into his guard; a 3-frame smart cross would come before a jab was over)

  moves: {
    ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W + 3), ...grandFinale(W + 2),
    divineL: divine(-1),
    divineR: divine(1),
    ...reckless(),
    chainHook: chainHook(),
    shHook: reply(1),
    shHookL: reply(-1),
  },

  patterns: [
    { id: 'gate1', weight: 3, fixed: true, steps: [
      { idle: 24 }, { move: 'showJab' }, { idle: 22 }, { move: 'chainHook' }, { idle: 40 }, { move: 'smartCross' }, { idle: 26 }, { move: 'divineL' }, { idle: 30 },
      { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP }, { idle: 30 } ] },
    { id: 'gate2', weight: 3, fixed: true, steps: [
      { idle: 22 }, { move: 'cheapShot' }, { idle: 20 }, { move: 'knowItAll' }, { idle: 24 }, { move: 'chainHook' }, { idle: 42 },
      { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 26 }, { move: 'flashbulb' }, { idle: 30 } ] },
    { id: 'gate3', weight: 3, fixed: true, steps: [
      { idle: 20 }, { move: 'divineR' }, { idle: 24 }, { move: 'smartCross' }, { idle: 18 }, { move: 'chainHook' }, { idle: 40 },
      { move: 'showJab' }, { idle: 18 }, { move: 'flashbulb' }, { idle: 28 }, { move: 'chainHook' }, { idle: 44 } ] },
    { id: 'gate4', weight: 2, steps: [
      { idle: 22 }, { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }, { idle: 26 },
      { move: 'divineL' }, { idle: 22 }, { move: 'chainHook' }, { idle: 40 }, { move: 'knowItAll' }, { idle: 30 } ] },
  ],

  super: { hit: 'head', move: 'finaleCall', name: 'GRAND FINALE', then: ['finale1', 'finale2', 'finale3'], golden: 'windup', taunt: 38, shout: 'GRAND FINALE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [4, 6] },
    { hit: 'body', key: 'highlightReel', name: 'HIGHLIGHT REEL', inline: true, move: 'reelCall', then: ['reel1', 'reel2', 'reel3'], golden: 'windup', window: [5, 7] },
    { hit: 'body', key: 'recklessFlurry', name: 'RECKLESS FLURRY', inline: true, move: 'recklessCall', then: ['reck1', 'reck2', 'reck3', 'reck4', 'reck5'], golden: 'windup', window: [6, 8] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  exploits: [
    trashTalkExploit({ stun: 130, hits: 11, frames: [10, 24] }),
    {
      id: 'outOfGas', type: 'quirk', name: 'OUT OF GAS',
      trigger: { state: 'open', open: 'gasp', height: 'low', first: true },
      effect: { extendOpen: 52, max: 96, say: 'HE CAN\'T CATCH HIS BREATH!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'HE WHEEZES LIKE A BELLOWS WITH A HOLE IN IT WHEN THE FLURRY IS SPENT.' },
      scout: 'BODY SHOTS WHILE HE GASPS AFTER THE RECKLESS FLURRY KEEP HIM GASPING: THE OPENING GROWS BY UP TO 96 FRAMES.',
    },
    {
      id: 'darkReprise', type: 'stunTrigger', name: 'A DARK REPRISE',
      trigger: { state: 'windup', move: ['shHook', 'shHookL'], counter: true, frames: [3, 5] },
      effect: { stun: 116, hits: 9, star: true, say: 'OUT OF THE DARK, INTO YOUR FIST!', sfx: 'shatter' },
      hint: { kind: 'audio', text: 'THE SHADOW STEP ENDS WITH A LOW WHISTLE AS HE ARRIVES: HIS HOOK IS ALREADY COMING, AND HE IS STILL LANDING.' },
      scout: 'COUNTER THE HOOK HE THROWS WHEN HE COMES OUT OF THE SHADOW STEP: STUNNED FOR 9 HITS, THE FIRST A STAR.',
    },
    {
      id: 'tautChain', type: 'quirk', name: 'THE CHAIN GOES TAUT',
      trigger: { on: 'resolved', move: 'chainHook', result: 'dodged' },
      effect: { open: { frames: 104, anim: 'winded', comboLimit: 8, star: [0, 42] }, say: 'THE CHAIN YANKS HIM BACK!', sfx: 'chainSnap' },
      hint: { kind: 'audio', text: 'A CHAIN HOOK THAT MISSES RUNS OUT OF SLACK WITH A SNAP.' },
      scout: 'SLIP LEFT OF HIS CHAIN HOOK: THE CHAIN RUNS OUT OF SLACK AND YANKS HIM OFF BALANCE, OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'burnedBulb', type: 'quirk', name: 'THE BULB BURNS OUT',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 7, star: [0, 38] }, say: 'THE BULB BURNS OUT!', sfx: 'crash' },
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
    { id: 'atTheGate', name: 'AT THE GATE', when: { left: 110 }, say: 'AT THE GATE!', steps: [{ idle: 20 }, { move: 'chainHook' }, { idle: 44 }, { move: 'showJab' }, { idle: 18 }, { move: 'divineR' }, { idle: 30 }, { move: 'chainHook' }, { idle: 44 }] },
    { id: 'allIn', name: 'ALL IN', when: { left: 55 }, say: 'ALL IN!', steps: [{ idle: 20 }, { move: 'recklessCall' }, { move: 'reck1' }, { move: 'reck2' }, { move: 'reck3' }, { move: 'reck4' }, { move: 'reck5' }, { ...GASP }] },
    { id: 'lastStand', name: 'THE LAST STAND', when: { health: 0.3 }, say: 'THE LAST STAND!', steps: [{ idle: 16 }, { move: 'divineL' }, { idle: 20 }, { move: 'divineR' }, { idle: 22 }, { move: 'chainHook' }, { idle: 44 }, { move: 'flashbulb' }] },
  ],
  special: [
    { type: 'comboReader', move: 'knowItAll', gap: 36, single: true },
    { type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'dash4.ghost' },
    { type: 'lunge', dist: 160, inFrames: 8, side: 30, back: 14, arrow: true },
    { type: 'yank', timeout: 150, every: 30, damage: 3, heart: 1, power: 1, decay: 1, letGo: { open: 58, anim: 'winded', comboLimit: 6, star: [0, 26] }, hand: [22, -70] },
    { type: 'shadowstep', frames: 22, cooldown: 300, left: 'shHookL', right: 'shHook' },
  ],
  titleDefense: null,
  gallery: 'HE WEARS THE KING\'S MARK NOW. HIT HIS GUARD AND HE STEPS INTO SHADOW, THEN ANSWERS FROM THE OTHER SIDE.',
  medals: { signature: { text: 'COUNTER HIS SHADOW HOOK.', check: 'cueCount', cue: '!exploit:darkReprise', n: 1 } },
  music: 'rivalAbyss',
};
