// FIRST ENCOUNTER — ZERO. There's nothing to him: a blank figure the colour of the
// void, no face, no idle animation, not even breathing. What he has is the champions
// you beat. He replays your career, one round at a time (spec §18 A2: nine of the
// twelve signatures; the three hardest, Karver's Guillotine, the Warden's Solitary and
// Eclipse's Corona, are kept for his true form):
//   round 1  GUS GRILL, BRICK WALL BRODY, MAYOR MCBRIDE
//   round 2  COUNT MIDNIGHT, RINGMASTER REX, THE BARON
//   round 3  MAESTRO VALE, AVALANCHE, THE MIRROR
// Every signature move is pulled straight from that champion's own data (the
// move, its damage, whether it's a knockdown, its sounds and its poses) and
// thrown on a 4-frame tell (loosened from 3: spec §18 A2). Nobody can react to 4 frames, so he warns you, once:
// the ECHO. He flickers into that champion's colours, their name flashes under
// the clock and a triple chime rings. 22 frames later the signature lands.
// Every signature is slipped (left or right), and your first punch after a slip
// is a star. Counter the echo itself and the signature never comes (early: a
// star; on the glint, ZERO goes down: a perfect hit).
// Between echoes he jabs and hooks on the same 4-frame tells, in fixed
// routines: learn them by heart. And when his plain routine ends he comes
// undone for a moment (open, a star).

import { POSES } from '../sprites/builds/poses.js';
import gus from './gus.js';
import brody from './brody.js';
import mcbride from './mcbride.js';
import midnight from './midnight.js';
import rex from './rex.js';
import baron from './baron.js';
import maestro from './maestro.js';
import avalanche from './avalanche.js';
import mirror from './mirror.js';
import karver from './karver.js';
import warden from './warden.js';
import eclipse from './eclipse.js';

// champion, their signature move, ZERO's echo colour, the round he replays it in.
// ALL_SIGNATURES is all twelve (their echo palettes and poses all exist: his true form,
// §18 A6, uses every one); SIGNATURES is what the first encounter throws (`dropped`: the
// three hardest, the biggest hits on the fastest tells).
export const ALL_SIGNATURES = [
  { champ: gus, move: 'spatulaFlip', color: [31, 16, 4], round: 1 },
  { champ: brody, move: 'cementMixer', color: [24, 10, 6], round: 1 },
  { champ: mcbride, move: 'landslide', color: [6, 12, 31], round: 1 },
  { champ: midnight, move: 'midnightStrike', color: [20, 6, 31], round: 2 },
  { champ: rex, move: 'grandFinale', color: [31, 28, 6], round: 2 },
  { champ: baron, move: 'fleche', color: [30, 4, 8], round: 2 },
  { champ: maestro, move: 'fortissimo', color: [31, 31, 24], round: 3 },
  { champ: avalanche, move: 'whiteout', color: [18, 30, 31], round: 3 },
  { champ: mirror, move: 'shatter', color: [22, 24, 28], round: 3 },
  { champ: karver, move: 'guillotine', color: [30, 22, 2], round: 3, dropped: true },
  { champ: warden, move: 'solitary', color: [12, 24, 14], round: 3, dropped: true },
  { champ: eclipse, move: 'corona', color: [31, 10, 20], round: 3, dropped: true },
];
export const SIGNATURES = ALL_SIGNATURES.filter((s) => !s.dropped);

export const ECHO_WINDUP = 22;
const SIG_WINDUP = 4;
const ALL = ['dodgeL', 'dodgeR', 'block', 'duck'];

// A champion's own pose, as ZERO's sprite layers know it: the shared pose
// library as is, anything from the champion's layers namespaced by their id
// (ZERO's layers pull those poses in; see /data/sprites/fighters/zero.js).
export const posePath = (champ, p) => (p in POSES ? p : `${champ.spriteLayers}:${p}`);

const src = (s) => s.champ.moves[s.move];

// the warning: he becomes the champion for 22 frames
function echoMove(s) {
  const m = src(s), P = posePath(s.champ, m.animation.windup[0]);
  return {
    name: s.champ.name,
    echo: s.champ.id, echoName: s.champ.name, echoColor: s.color,
    feint: true, call: true, noFake: true,
    windupFrames: ECHO_WINDUP, activeFrames: 0, recoveryFrames: 1,
    damage: 0,
    avoidBy: ALL,
    counterWindow: [3, ECHO_WINDUP - 3],
    starWindow: [3, 7],
    kdWindow: [ECHO_WINDUP - 6, ECHO_WINDUP - 5],
    cancels: 1,
    animation: { windup: [P], active: [P], recovery: [P] },
  };
}

// the signature itself: the champion's move, on a 4-frame tell
function sigMove(s) {
  const m = src(s), A = m.animation;
  const map = (list) => list.map((p) => posePath(s.champ, p));
  return {
    ...m,
    echoOf: s.champ.id,
    windupFrames: SIG_WINDUP,
    counterWindow: null, starWindow: null, kdWindow: null,
    punishStar: ['dodged'],
    noFake: true, cancels: 0, openAfter: undefined,
    sfx: { ...m.sfx },
    animation: { windup: map(A.windup.slice(-1)), active: map(A.active), recovery: map(A.recovery) },
  };
}

const plain = (name, tell, act, avoid, low, rec, sfx) => ({
  name, windupFrames: SIG_WINDUP, activeFrames: 5, recoveryFrames: rec,
  damage: low ? 15 : 16,
  height: low ? 'low' : 'high',
  avoidBy: avoid,
  counterWindow: null, starWindow: null,
  sfx: { tell: sfx, swing: 'whiff' },
  animation: { windup: [tell], active: [act], recovery: [tell, 'idle1'] },
});

export { echoMove, sigMove, plain as plainZero };
const moves = {
  zJab: plain('NOTHING', 'jabTell', 'jab', ALL, false, 22, 'voidTell'),
  zHook: plain('NOWHERE', 'hookTell', 'hook', ['dodgeL', 'duck'], false, 24, 'voidTell'),
  zHookL: plain('NOWHERE', 'hookLTell', 'hookL', ['dodgeR', 'duck'], false, 24, 'voidTell'),
  zBody: plain('NO ONE', 'bodyRTell', 'bodyR', ['block', 'dodgeL'], true, 24, 'voidTell'),
};
for (const s of SIGNATURES) {
  moves['echo_' + s.champ.id] = echoMove(s);
  moves['sig_' + s.champ.id] = sigMove(s);
}

// Each echo lives in a fixed routine; the routines vary so no two feel alike.
// (clock update 2026-10-03: each routine ends in a hesitation, 'the echo fades': an opening for three hits, so he can be hit about half the time)
const FADE = { open: 46, anim: 'undone', comboLimit: 3, id: 'fade', sfx: 'heartbeat' };
const ROUTINES = [
  (e, g) => [{ idle: 30 }, { move: 'zJab' }, { idle: 22 }, { move: e }, { move: g }, { idle: 26 }, { move: 'zBody' }, { idle: 20 }, FADE, { idle: 16 }],
  (e, g) => [{ idle: 28 }, { move: 'zHookL' }, { idle: 22 }, { move: e }, { move: g }, { idle: 24 }, { move: 'zJab' }, { idle: 20 }, { move: 'zHook' }, { idle: 20 }, FADE, { idle: 16 }],
  (e, g) => [{ idle: 30 }, { move: e }, { move: g }, { idle: 26 }, { move: 'zHook' }, { idle: 22 }, { move: 'zBody' }, { idle: 20 }, FADE, { taunt: 30 }],
  (e, g) => [{ idle: 28 }, { move: 'zBody' }, { idle: 22 }, { move: 'zJab' }, { idle: 20 }, { move: e }, { move: g }, { idle: 20 }, FADE, { idle: 16 }],
];

const patterns = SIGNATURES.map((s, i) => ({
  id: s.champ.id, weight: 2, fixed: true,
  when: { rounds: [s.round] },
  steps: ROUTINES[i % ROUTINES.length]('echo_' + s.champ.id, 'sig_' + s.champ.id),
}));
// PHASE 2, THE VOID STIRS (spec §4 "Boss phases": a lighter preview of his true form). He gets back up and the ring drains to
// white around him (only the hearts and the health bars stay), every act of your career comes at once instead of one a round,
// his waits shorten, and he remembers one of the three signatures he kept back: King Karver's Guillotine.
const ACT2 = [...SIGNATURES, ALL_SIGNATURES.find((s) => s.champ.id === 'karver')];
moves.echo_karver = echoMove(ACT2[ACT2.length - 1]);
moves.sig_karver = sigMove(ACT2[ACT2.length - 1]);
ACT2.forEach((s, i) => patterns.push({
  id: 'stir_' + s.champ.id, weight: s.champ.id === 'karver' ? 3 : 1, fixed: true,
  when: { phase: [2] },
  steps: ROUTINES[(i + 1) % ROUTINES.length]('echo_' + s.champ.id, 'sig_' + s.champ.id),
}));
patterns.push({
  id: 'nothing', weight: 2, fixed: true, when: { phase: [1, 2] },
  steps: [
    { idle: 28 }, { move: 'zJab' }, { idle: 20 }, { move: 'zHook' }, { idle: 20 }, { move: 'zBody' }, { idle: 20 }, { move: 'zHookL' },
    { idle: 14 },
    { open: 44, anim: 'undone', star: [2, 14], interrupt: true, stunOnInterrupt: 30, sfx: 'heartbeat' },
    { idle: 20 },
  ],
});

export default {
  id: 'zero',
  name: 'ZERO',
  short: 'ZERO',
  nickname: 'THE LAST ONE',
  circuit: 'zero',
  rank: 0,
  isChampion: true,
  card: {
    age: 0,
    weight: 0,
    record: '0-0 0KO',
    hometown: 'THE BEGINNING',
    quote: 'EVERY CHAMPION YOU EVER BEAT. ALL AT ONCE.',
  },
  lines: {
    win: 'BACK TO ZERO.',
    lose: 'YOU... WERE THE LAST ONE... ALL ALONG...',
  },

  build: 'medium',
  palette: 'zero',
  spriteLayers: 'zero',

  stats: {
    health: 360,
    damageMult: 1.6,
    stunResistance: 6,
    heartDrainOnBlock: 3,
    starLossChance: 0.65,
    comboLimit: 2,
    stunComboLimit: 5,
    idleHitLimit: 0,
    idleGuard: 'high',
    stunFrames: 42,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  // no idle animation: one frame, perfectly still
  anims: {
    idle: ['idle1'],
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['nought'],
    victory: ['victory'],
    undone: { frames: ['undone1', 'undone2'], rate: 6 },
  },

  moves,
  patterns,

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', moves: SIGNATURES.map((s) => 'echo_' + s.champ.id), name: 'ECHO OF AN OLD CHAMP', then: Object.fromEntries(SIGNATURES.map((s) => ['echo_' + s.champ.id, ['sig_' + s.champ.id]])), keep: true, golden: 'windup', taunt: 34, times: [1, 2] },
  // the Guillotine he remembers in his second phase is a super too (armored, its echo's golden moment)
  supers: [{ key: 'echo_karver', name: 'ECHO OF KING KARVER', hit: 'head', inline: true, move: 'echo_karver', then: ['sig_karver'], golden: 'windup' }],

  getUpTable: [
    { upAt: [9, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], health: 0.4 },
    { upAt: null },
  ],


  // the knowledge layer (spec §17): what a player can learn about the first ZERO
  exploits: [
    {
      id: 'hotPlate', type: 'quirk', name: 'HOT PLATE',
      trigger: { on: 'resolved', move: 'sig_gus', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'undone', comboLimit: 6, star: [0, 30] }, say: 'ZERO BURNED HIS HAND!', sfx: 'sizzle' },
      hint: { kind: 'audio', text: 'THE SPATULA SIZZLES WHEN IT MISSES.' },
      scout: 'SLIP THE ECHOED SPATULA FLIP: ZERO COMES UNDONE FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'brokenMirror', type: 'quirk', name: 'BROKEN MIRROR',
      trigger: { on: 'resolved', move: 'sig_mirror', result: 'dodged' },
      effect: { open: { frames: 68, anim: 'undone', comboLimit: 8, star: [0, 28] }, say: 'HE SHATTERED HIS OWN REFLECTION!', sfx: 'glass' },
      hint: { kind: 'visual', text: 'THE ECHOED SHATTER LEAVES CRACKS IN THE AIR WHEN IT MISSES.', hidden: true },
      scout: 'SLIP THE ECHOED SHATTER IN ROUND 3: ZERO IS UNDONE FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'nothingToWaitFor', type: 'bait', name: 'NOTHING TO WAIT FOR', limit: 2,
      trigger: { on: 'passive', frames: 480 },
      effect: { script: [{ open: 56, anim: 'undone', id: 'hesitate', comboLimit: 4, star: [0, 24] }], say: 'ZERO HESITATES!' },
      hint: { kind: 'quote', text: 'NOTHING.', hidden: true },
      scout: 'STAND STILL FOR 8 SECONDS AND ZERO HESITATES, OPEN FOR 4 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'nothingToHold', type: 'turtling', name: 'NOTHING TO HOLD ONTO', response: 'drain', share: 0.4, span: 480, every: 50, say: 'YOUR GUARD IS EMPTY!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND THERE\'S NOTHING TO HOLD ONTO: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
    },
    {
      id: 'nothingLeft', type: 'starHoard', name: 'TAKES BACK WHAT YOU EARN', hold: 420, moves: ['zJab', 'zHook', 'zHookL', 'zBody', ...SIGNATURES.map((s) => 'sig_' + s.champ.id)], say: 'STAR ERASED!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS NEXT PUNCH ERASES ONE, EVEN BLOCKED.',
    },
    {
      id: 'backToZero', type: 'getUpMash', name: 'BACK TO ZERO', response: 'harder', punches: 3, mult: 1.25, say: 'BACK TO ZERO!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 25% HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'openingNight', name: 'OPENING NIGHT', when: { left: 90, round: 1 }, say: 'OPENING NIGHT!',
      steps: [{ idle: 24 }, { move: 'echo_gus' }, { move: 'sig_gus' }],
    },
    {
      id: 'intermission', name: 'INTERMISSION', when: { left: 90, round: 2 }, say: 'INTERMISSION OVER!',
      steps: [{ idle: 24 }, { move: 'echo_avalanche' }, { move: 'sig_avalanche' }],
    },
    {
      id: 'lastOneStanding', name: 'THE LAST ONE STANDING', when: { health: 0.3 }, say: 'THE LAST ONE!',
      steps: [{ idle: 20 }, { move: 'echo_mirror' }, { move: 'sig_mirror' }],
    },
  ],
  special: [{ type: 'echo' }, { type: 'phaseGate', phases: [2], inner: { type: 'voidStir', pace: 0.85 } }],
  // his two phases (spec §4): the scouting report's entries, the HUD's pips
  phases: [
    { name: 'THE ECHOES', scout: 'YOUR CAREER REPLAYED, ONE ACT A ROUND: THREE CHAMPIONS\' SIGNATURES EACH ROUND, EACH WARNED BY ITS ECHO.' },
    { name: 'THE VOID STIRS', scout: 'THE RING GOES WHITE. EVERY ACT AT ONCE, SHORTER WAITS, AND ONE SIGNATURE HE KEPT BACK: KING KARVER\'S GUILLOTINE. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE FIRST OF HIS TWO FIGHTS. NINE SIGNATURE MOVES, FOUR-FRAME TELLS, SILENCE. HE SHATTERS WHEN HE FALLS.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // (a big boss isn't knocked down by a golden moment, spec §4: his golden moments are what count)
  medals: { signature: { text: 'LAND TWO PERFECT HITS.', check: 'cueCount', cue: '!golden', n: 2 } },
  music: 'zeroEntrance',
};
