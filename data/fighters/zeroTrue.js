// ZERO, TRUE FORM — the true final boss (spec §18 A6, K6). The whole of what the first ZERO was a piece of. FOUR PHASES, one per round, each at full
// health, KO only:
//   PHASE 1  the twelve shards' skill tests in turn, six seconds each: dodge, block, duck, counter, sight (silence), sound (unseen), rhythm,
//            memory, echo, chaos, time, will. The gimmick of each is switched on for its test and off again after (segments: ai.mods.seg).
//   PHASE 2  every champion's signature: the first ZERO's twelve (Karver's Guillotine, the Warden's Solitary and Eclipse's Corona are back)
//            and the ten of the Pantheon and the Underworld, on 3-frame tells behind the ECHO warning: the flicker into that champion's
//            colours, their name, a triple chime, 22 frames later the signature. Every one is slipped, and your first punch after is a star.
//   PHASE 3  Halcyon's three forms (dawn, noon, dusk) and Vorgath's three phases (the tithe, the crumbling floor, the last floor), twelve seconds each.
//   PHASE 4  a pure white screen with a minimal HUD, and everything at full speed: the gaps shrink, the tells never do.
// Knowledge (K6): every signature can be undone once per fight, and he adapts to your two most-used behaviours (the answers a Dash would have, live).
// Dash is in your corner and tells you exactly what comes.
import { vm, only, longSteps } from './void/_void.js';
import { stats } from './pantheon/_kit.js';
import { ALL_SIGNATURES, echoMove, sigMove, plainZero } from './zero.js';
import dodgeShard from './void/dodgeShard.js';
import blockShard from './void/blockShard.js';
import duckShard from './void/duckShard.js';
import counterShard from './void/counterShard.js';
import sightShard from './void/sightShard.js';
import soundShard from './void/soundShard.js';
import rhythmShard from './void/rhythmShard.js';
import memoryShard from './void/memoryShard.js';
import echoShard from './void/echoShard.js';
import chaosShard from './void/chaosShard.js';
import timeShard from './void/timeShard.js';
import willShard from './void/willShard.js';
import halcyon from './pantheon/halcyon.js';
import vorgath from './underworld/vorgath.js';
import aurora from './pantheon/aurora.js';
import cirrus from './pantheon/cirrus.js';
import oldguard from './pantheon/oldguard.js';
import nebula from './pantheon/nebula.js';
import hale from './pantheon/hale.js';
import prism from './pantheon/prism.js';
import moros from './underworld/moros.js';
import soot from './underworld/soot.js';
import jailer from './underworld/jailer.js';
import crucible from './underworld/crucible.js';
import { NEW_ECHO_COLORS } from '../sprites/fighters/void/zeroTrue.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'], D2 = ['dodgeL', 'dodgeR'];
const moves = {}, patterns = [];

// ----------------------------------------------------------------------------------------- phase 1: the tests
const nonSuper = (M) => Object.fromEntries(Object.entries(M).filter(([, m]) => !m.knockdown));
const withPrefix = (pre, M) => Object.fromEntries(Object.entries(nonSuper(M)).map(([k, m]) => [pre + k, { ...m, sfx: { ...(m.sfx || {}) } }]));
const trim = (steps, n) => { const out = []; let c = 0; for (const s of steps) { if (s.move) { if (c >= n) break; c++; } out.push({ ...s }); } return out; };
const rename = (steps, pre) => steps.map((s) => (s.move ? { ...s, move: pre + s.move } : s));
const TESTS = [
  ['dodge', 'DODGE', dodgeShard, 'dodge_', 12], ['block', 'BLOCK', blockShard, 'block_', 9], ['duck', 'DUCK', duckShard, 'duck_', 11], ['counter', 'COUNTER', counterShard, 'counter_', 6],
  ['sight', 'SIGHT', sightShard, 'sight_', 9], ['sound', 'SOUND', soundShard, 'sound_', 9], ['rhythm', 'RHYTHM', rhythmShard, 'rhythm_', 10], ['memory', 'MEMORY', memoryShard, 'memory_', 20],
  ['echo', 'ECHO', echoShard, 'echo_', 8], ['chaos', 'CHAOS', chaosShard, 'chaos_', 8], ['time', 'TIME', timeShard, 'time_', 9], ['will', 'WILL', willShard, 'will_', 10],
];
for (const [seg, , S, pre, n] of TESTS) {
  Object.assign(moves, withPrefix(pre, S.moves));
  if (seg !== 'echo') patterns.push({ id: `test_${seg}`, seg, weight: 1, fixed: true, steps: [...rename(trim(S.patterns[0].steps, n), pre), { idle: 30 }] });
}
// (the echo test's own moves keep their names: the echo modifier builds his pattern from your punches)
for (const k of ['eJab', 'eJabR', 'eBody', 'eBodyR', 'eStar']) moves[k] = { ...echoShard.moves[k] };
patterns.push({ id: 'test_echo', seg: 'echo', weight: 1, fixed: true, steps: longSteps({ seed: 909, moves: ['eJab', 'eJabR', 'eBody', 'eBodyR'], count: 8, gaps: [22, 30], rest: null }) });

// ----------------------------------------------------------------------------------------- phase 2: the signatures
const plain = (name, tell, act, avoid, low, rec) => ({ ...plainZero(name, tell, act, avoid, low, rec, 'voidTell'), windupFrames: 3 });
Object.assign(moves, {
  zJab: plain('NOTHING', 'jabTell', 'jab', ALL4, false, 22),
  zHook: plain('NOWHERE', 'hookTell', 'hook', ['dodgeL', 'duck'], false, 24),
  zHookL: plain('NOWHERE', 'hookLTell', 'hookL', ['dodgeR', 'duck'], false, 24),
  zBody: plain('NO ONE', 'bodyRTell', 'bodyR', ['block', 'dodgeL'], true, 24),
  // (a slow one: the answer to a swinger, a spammer, a repeater: a 3-frame reply would come before a jab was over)
  zSlow: { ...plain('NOBODY', 'hookTell', 'hook', ['dodgeL', 'duck'], false, 34), windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], damage: 18, noFake: true },
});
const sigs = [];
for (const s of ALL_SIGNATURES) {
  const e = echoMove(s), g = { ...sigMove(s), windupFrames: 3 };
  moves['echo_' + s.champ.id] = e; moves['sig_' + s.champ.id] = g;
  sigs.push({ id: s.champ.id, name: s.champ.name });
}
const NEW = [
  ['aurora', aurora, 'firstLight'], ['cirrus', cirrus, 'stormFist'], ['oldguard', oldguard, 'firstChampion'], ['nebula', nebula, 'supernova'], ['hale', hale, 'forgeFall'], ['prism', prism, 'spectrum'],
  ['moros', moros, 'requiem'], ['soot', soot, 'fireStorm'], ['jailer', jailer, 'lifeSentence'], ['crucible', crucible, 'meltdown'],
];
for (const [id, champ, mid] of NEW) {
  const m = champ.moves[mid];
  moves['echo_' + id] = {
    name: champ.name, echo: id, echoName: champ.name, echoColor: NEW_ECHO_COLORS[id], feint: true, call: true, noFake: true,
    windupFrames: 22, activeFrames: 0, recoveryFrames: 1, damage: 0, avoidBy: ALL4, counterWindow: [3, 19], starWindow: [3, 7], kdWindow: [16, 17], cancels: 1,
    animation: { windup: ['overheadTell1'], active: ['overheadTell2'], recovery: ['overheadTell2'] },
  };
  moves['sig_' + id] = {
    name: m.name, echoOf: id, knockdown: true, noFake: true, windupFrames: 3, activeFrames: m.activeFrames || 10, recoveryFrames: m.recoveryFrames || 46, damage: m.damage || 30,
    avoidBy: m.avoidBy && m.avoidBy.length ? m.avoidBy.slice() : D2, counterWindow: null, starWindow: null, punishStar: ['dodged'],
    sfx: { tell: 'voidTell', swing: (m.sfx && m.sfx.swing) || 'swingHeavy' },
    animation: { windup: ['overheadTell2'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  };
  sigs.push({ id, name: champ.name });
}
const ROUTINES = [
  (e, g) => [{ idle: 30 }, { move: 'zJab' }, { idle: 22 }, { move: e }, { move: g }, { idle: 26 }, { move: 'zBody' }, { idle: 28 }],
  (e, g) => [{ idle: 28 }, { move: 'zHookL' }, { idle: 22 }, { move: e }, { move: g }, { idle: 24 }, { move: 'zJab' }, { idle: 20 }, { move: 'zHook' }, { idle: 28 }],
  (e, g) => [{ idle: 30 }, { move: e }, { move: g }, { idle: 26 }, { move: 'zHook' }, { idle: 22 }, { move: 'zBody' }, { idle: 30 }],
  (e, g) => [{ idle: 28 }, { move: 'zBody' }, { idle: 22 }, { move: 'zJab' }, { idle: 20 }, { move: e }, { move: g }, { idle: 30 }],
];
sigs.forEach((s, i) => patterns.push({ id: 'sig_' + s.id, seg: 'sigs', weight: 2, fixed: true, steps: ROUTINES[i % 4]('echo_' + s.id, 'sig_' + s.id) }));
patterns.push({ id: 'nothing', seg: 'sigs', weight: 2, fixed: true, steps: [{ idle: 28 }, { move: 'zJab' }, { idle: 20 }, { move: 'zHook' }, { idle: 20 }, { move: 'zBody' }, { idle: 20 }, { move: 'zHookL' }, { idle: 14 }, { open: 44, anim: 'undone', star: [2, 14], interrupt: true, stunOnInterrupt: 30, sfx: 'heartbeat', id: 'comesUndone' }, { idle: 20 }] });

// ----------------------------------------------------------------------------------------- phase 3: Halcyon's and Vorgath's forms
Object.assign(moves, withPrefix('h_', halcyon.moves), withPrefix('v_', vorgath.moves));
const SETS = [['dawn', 'h1', 'h_', halcyon], ['noon', 'h2', 'h_', halcyon], ['dusk', 'h3', 'h_', halcyon], ['p1', 'v1', 'v_', vorgath], ['p2', 'v2', 'v_', vorgath], ['p3', 'v3', 'v_', vorgath]];
for (const [set, seg, pre, F] of SETS) for (const p of F.patterns.filter((q) => q.set === set)) patterns.push({ id: `${seg}_${p.id}`, seg, weight: 1, fixed: !!p.fixed, steps: rename(p.steps, pre) });

// ----------------------------------------------------------------------------------------- phase 4: full speed
// (64 moves a sequence plus two echoes: the longest patterns in the game, past the Memory Shard's 60; data/difficulty.js)
const F4 = ['dodge_jab', 'dodge_cross', 'dodge_hook', 'dodge_hookL', 'dodge_body', 'dodge_bodyR', 'dodge_upper', 'duck_flick', 'duck_sweep', 'block_jab', 'block_hook', 'block_body'];
const LOCKED = ['duck_flick', 'duck_sweep', 'duck_drag', 'block_jab', 'block_hook', 'block_body'];
const ECH = [['echo_gus', 'sig_gus'], ['echo_avalanche', 'sig_avalanche'], ['echo_hale', 'sig_hale'], ['echo_moros', 'sig_moros']];
[[1, 4041], [2, 4057], [3, 4079]].forEach(([n, seed], k) => {
  const base = longSteps({ seed, moves: F4.map((m, i) => [m, i < 7 ? 3 : 2]), count: 64, gaps: [8, 16], first: 24, last: 40, after: (a) => (LOCKED.includes(a) ? 12 : 0), rest: { every: 6, steps: [{ idle: 22 }, { open: 46, anim: 'undone', star: [2, 14], comboLimit: 5, id: 'undone4' }] } });
  // an echo and its signature go in at the middle and at the end
  const at = base.map((s, i) => (s.move ? i : -1)).filter((i) => i >= 0);
  const out = base.slice(0, at[31]), tailS = base.slice(at[31]);
  patterns.push({ id: `final${n}`, seg: 'final', weight: 3, fixed: true, steps: [...out, { idle: 28 }, { move: ECH[k][0] }, { move: ECH[k][1] }, { idle: 30 }, ...tailS, { idle: 28 }, { move: ECH[k + 1][0] }, { move: ECH[k + 1][1] }, { idle: 40 }] });
});

// ----------------------------------------------------------------------------------------- the segments
const seg = (s, name, form) => ({ seg: s, name, form });
const ROUNDS = {
  1: { segs: TESTS.map(([s, n]) => seg(s, `TEST: ${n}`)) },
  2: { segs: [seg('sigs', 'EVERY CHAMPION')] },
  3: { segs: [seg('h1', 'HALCYON: DAWN', 1), seg('h2', 'HALCYON: NOON', 2), seg('h3', 'HALCYON: DUSK', 3), seg('v1', 'VORGATH: THE TITHE', 1), seg('v2', 'VORGATH: THE CRUMBLING', 2), seg('v3', 'VORGATH: THE THRONE', 3)] },
  4: { segs: [seg('final', null)], pace: 1.25 },
  5: { segs: [seg('final', null)], pace: 1.25 },
};
const gate = (segOrSegs, inner) => (Array.isArray(segOrSegs) ? { type: 'segGate', segs: segOrSegs, inner } : { type: 'segGate', seg: segOrSegs, inner });

// ----------------------------------------------------------------------------------------- knowledge
const slipExploit = (s) => ({
  id: 'slip_' + s.id, type: 'quirk', name: `${s.name} UNDONE`, limit: 1,
  trigger: { on: 'resolved', move: 'sig_' + s.id, result: 'dodged' },
  effect: { open: { frames: 84, anim: 'undone', comboLimit: 6, star: [0, 30] }, say: `${s.name}\'S MOVE, UNDONE!`, sfx: 'glitch' },
  hint: { kind: 'visual', text: `WHEN THE ECHO TURNS HIM ${s.name}'S COLOUR HE IS BORROWING THEIR BIGGEST MOVE. SLIPPED, IT LEAVES HIM NOTHING.` },
  scout: `SLIP THE SIGNATURE MOVE HE BORROWS FROM ${s.name} (THE ECHO IN THEIR COLOURS): HE COMES UNDONE, OPEN FOR 6 HITS, THE FIRST A STAR. ONCE PER FIGHT.`,
});
const hid = (id) => 'h_' + id, vid = (id) => 'v_' + id;
const exploits = [
  ...sigs.map(slipExploit),
  {
    id: 'shadowHead', type: 'stunTrigger', name: 'THE SHADOW\'S HEAD', limit: 1,
    trigger: { state: 'windup', test: 'noonForm', height: 'high', frames: [1, 6], clean: 30 },
    effect: { stun: 104, hits: 7, star: true, say: 'YOU HIT THE SUN!', sfx: 'crash' },
    hint: { kind: 'visual', text: 'IN HALCYON\'S NOON HE OPENS EVERY WINDUP WITH A FLASH. THE FLASH LEAVES HIS HEAD EXPOSED.' },
    scout: 'DURING HIS HALCYON: NOON SEGMENT, A HEAD SHOT ON THE FIRST FRAMES OF ANY WINDUP (THE FLASH) COUNTS AS A COUNTER: STUNNED FOR 7 HITS, THE FIRST A STAR. ONCE PER FIGHT.',
  },
  {
    id: 'firstRayMissed', type: 'quirk', name: 'THE FIRST RAY MISSES', limit: 1,
    trigger: { on: 'resolved', move: [hid('dUpperEnd'), hid('dHookEnd')], result: 'dodged' },
    effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'THE RAY GOES WIDE!', sfx: 'thud' },
    hint: { kind: 'visual', text: 'THE LAST HIT OF A DAWN COMBO THROWS ALL OF HIM AFTER IT.', hidden: true },
    scout: 'DURING HIS HALCYON: DAWN SEGMENT, SLIP THE FINAL HIT OF A COMBO (THE HOOK OR THE UPPERCUT): HE IS OPEN FOR 7 HITS, THE FIRST A STAR. ONCE PER FIGHT.',
  },
  {
    id: 'kingStumbles', type: 'quirk', name: 'THE KING STUMBLES', limit: 1,
    trigger: { on: 'resolved', move: [vid('haymaker'), vid('crush')], result: ['dodged', 'ducked'] },
    effect: { open: { frames: 110, anim: 'stunned', comboLimit: 8, star: [0, 42] }, say: 'THE KING STUMBLES!', sfx: 'crash' },
    hint: { kind: 'audio', text: 'A HEAVY BLOW THAT FINDS NOTHING HAS NOWHERE TO GO BUT DOWN.', hidden: true },
    scout: 'DURING HIS VORGATH SEGMENTS, SLIP OR DUCK THE CROWN BREAKER OR THE FLOOR BREAKER (THE SLOW OVERHEADS): HE STUMBLES, OPEN FOR 8 HITS, THE FIRST A STAR. ONCE PER FIGHT.',
  },
  {
    id: 'comesUndone', type: 'stunTrigger', name: 'COMES UNDONE', limit: 3,
    trigger: { state: 'open', open: 'comesUndone', frames: [0, 40] },
    effect: { stun: 90, hits: 5, star: true, say: 'HE COMES UNDONE!', sfx: 'glitch' },
    hint: { kind: 'visual', text: 'WHEN HIS PLAIN ROUTINE ENDS HE COMES UNDONE FOR A MOMENT: ARMS HANGING, HEAD DROPPED.' },
    scout: 'IN PHASE 2, HIT HIM WHILE HE COMES UNDONE AT THE END OF HIS PLAIN ROUTINE: STUNNED FOR 5 HITS, THE FIRST A STAR.',
  },
];
const answers = {
  jab: { type: 'jabSpam', streak: 3, counter: 'zSlow', say: 'PARRIED!' },
  turtle: { type: 'turtling', response: 'unblockable', moves: ['zJab', 'zBody'], cue: 'NO BLOCK!', say: 'NO BLOCK!' },
  early: { type: 'earlyDodge', response: 'hold', moves: ['zHook', 'zHookL'], say: 'HELD IT!' },
  bias: { type: 'dodgeBias', moves: ['zJab'], min: 6, share: 0.75, say: 'YOUR FAVORITE SIDE!' },
  hoard: { type: 'starHoard', moves: ['zJab', 'zHook', 'zHookL', 'zBody'], say: 'STAR ERASED!' },
  zone: { type: 'zoneBias', frames: 480, say: 'I KNOW WHERE YOU PUNCH!' },
  passive: { type: 'passivity', response: 'buff', frames: 240, gain: 1 / 480, decay: 1 / 220, dmg: 0.3, rec: 0.1, meter: 'ADAPTING', say: 'HE LEARNED YOU WAIT!' },
  rush: { type: 'rushing', span: 150, count: 2, counter: ['zSlow'], say: 'TOO EAGER!' },
  repeat: { type: 'comboRepeat', gap: 45, counter: ['zSlow'], say: 'SAME AGAIN?' },
};
const antiStrategies = [
  {
    id: 'adaptsToYou', type: 'adapt', name: 'HE ADAPTS TO YOU', after: 1200, demo: 'turtle', say: 'HE ADAPTS!', answers,
    scout: 'HE WATCHES WHAT YOU DO. AFTER 20 SECONDS THE TWO THINGS YOU LEAN ON MOST (TURTLING, JAB SPAM, EARLY DODGES, ONE-SIDED SLIPS, HOARDED STARS, ONE-ZONE PUNCHING, WAITING, RUSHING, REPEATED COMBOS) GET THEIR ANSWER, UNTIL YOU STOP.',
  },
  {
    id: 'nothingToHold', type: 'turtling', name: 'NOTHING TO HOLD ONTO', response: 'drain', share: 0.4, span: 480, every: 50, say: 'YOUR GUARD IS EMPTY!',
    scout: 'KEEP YOUR GUARD UP TOO LONG AND THERE\'S NOTHING TO HOLD ONTO: YOUR HEARTS DRAIN WHILE YOU BLOCK.',
  },
  {
    id: 'backToZero', type: 'getUpMash', name: 'BACK TO ZERO', response: 'harder', punches: 3, mult: 1.3, say: 'BACK TO ZERO!',
    scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
  },
];

export default {
  id: 'zeroTrue',
  name: 'ZERO',
  short: 'ZERO',
  nickname: 'THE WHOLE OF NOTHING',
  circuit: 'zeroTrue',
  rank: 0,
  isChampion: true,
  card: { age: 0, weight: 0, record: '0-0 0KO', hometown: 'THE BEGINNING, AND THE END', quote: 'EVERYONE YOU FREED WAS A PIECE OF ME. I DON\'T NEED PIECES.' },
  lines: { win: 'BACK TO ZERO. FOR GOOD.', lose: 'I WAS... ONLY EVER... THE SPACE... BETWEEN YOUR PUNCHES...' },

  build: 'medium',
  palette: 'zeroTrue',
  spriteLayers: 'zeroTrue',
  rounds: 4,
  roundMusic: ['zeroTrueI', 'zeroTrueII', 'zeroTrueIII', 'zeroTrueIV'],

  // full health every phase (the fight heals him between rounds); no idle animation: one frame, perfectly still
  stats: stats({ health: 420, damageMult: 2.4, stunResistance: 8, starLossChance: 0.7, stunFrames: 84, hitstun: 12, comboLimit: 3, betweenRoundHeal: 0.2, idleGuard: 'high' }),
  anims: {
    idle: ['idle1'], block: ['block'], hitHigh: ['hitHigh'], hitLow: ['hitLow'], stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'], down: ['down'], getup: ['getup'], taunt: ['nought'], victory: ['victory'], undone: { frames: ['undone1', 'undone2'], rate: 6 },
  },
  guardCounter: 'zSlow',

  moves,
  patterns,

  // his four phases (spec §4 "Boss phases"): each lasts until its health bar is emptied, not a round
  phases: [
    { name: 'THE TWELVE TESTS', scout: 'THE SHARDS\' TESTS, ONE AFTER ANOTHER: EVERY DEFENSE, EVERY SENSE, EVERY HABIT YOU HAVE.' },
    { name: 'EVERY CHAMPION', scout: 'EVERY CHAMPION YOU EVER BEAT, THEIR SIGNATURES ECHOED ONE AFTER ANOTHER.' },
    { name: 'BORROWED FORMS', scout: 'HALCYON\'S LIGHT AND VORGATH\'S CRUMBLING FLOOR, WORN IN TURN.' },
    { name: 'THE WHOLE OF NOTHING', scout: 'A WHITE SCREEN, ONLY THE HEARTS AND THE BARS. FULL SPEED, A THIN HEALTH BAR. ONLY NOW CAN HE BE KNOCKED OUT.' },
  ],
  super: { hit: 'head', moves: sigs.map((s) => 'echo_' + s.id), then: Object.fromEntries(sigs.map((s) => ['echo_' + s.id, ['sig_' + s.id]])), name: 'ECHO OF AN OLD CHAMP', keep: true, golden: 'windup', taunt: 34, times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.45 }, { upAt: [9, 9], stayDown: 0.65, health: 0.35 }, { upAt: null }],

  // Dash's corner (he is the cornerman in this fight: real, specific advice for the phase that comes next, by the round just ended)
  modFlags: [],

  exploits,
  antiStrategies,
  scriptedMoments: [
    { id: 'theTwelveTests', name: 'THE TWELVE TESTS', when: { left: 100, round: 1 }, say: 'THE TWELVE TESTS!', steps: [{ idle: 20 }, { move: 'zJab' }, { idle: 22 }, { move: 'zHook' }, { idle: 22 }, { move: 'zBody' }, { idle: 30 }] },
    { id: 'everyChampion', name: 'EVERY CHAMPION', when: { left: 90, round: 2 }, say: 'EVERY CHAMPION!', steps: [{ idle: 24 }, { move: 'echo_avalanche' }, { move: 'sig_avalanche' }] },
    { id: 'borrowedForms', name: 'BORROWED FORMS', when: { left: 60, round: 3 }, say: 'BORROWED FORMS!', steps: [{ idle: 20 }, { move: 'zJab' }, { idle: 22 }, { move: 'zHookL' }, { idle: 30 }] },
    { id: 'fullSpeed', name: 'FULL SPEED', when: { left: 40, round: 4 }, say: 'FULL SPEED!', steps: [{ idle: 16 }, { move: 'zJab' }, { idle: 12 }, { move: 'zHook' }, { idle: 12 }, { move: 'zBody' }, { idle: 20 }] },
  ],
  special: [
    { type: 'zeroSeg', rounds: ROUNDS, finalHealth: 230 },
    { type: 'echo' },
    gate('block', { type: 'syncopate', rhythms: [[0, 0, 0, 30], [22, 0, 0, 0], [8, 8, 8, 8, 40], [40, 0]] }),
    gate('counter', { type: 'counterOnly', move: 'counter_rebuke', hittable: [], flash: 'zeroTrue.flash', lead: 4 }),
    gate('sight', { type: 'hush' }),
    gate('sight', { type: 'sightEye', first: 300, every: 520, frames: 16 }),
    gate('sound', { type: 'unseen', reveal: 50, density: 0.07 }),
    gate('rhythm', { type: 'beatgrid', tempos: [112, 148], start: 0, bars: 2 }),
    gate('memory', { type: 'memcount', total: 20 }),
    gate('echo', { type: 'echoReplay', minGap: 46, minIdle: 14, moveLen: 30, stock: ['eJab', 'eBodyR', 'eJabR', 'eBody'], rolling: 900, patternSeg: 'echo' }),
    gate('chaos', { type: 'chaos', every: 10, size: 5, moves: ['chaos_jab', 'chaos_cross', 'chaos_hook', 'chaos_hookL', 'chaos_body', 'chaos_bodyR', 'chaos_upper', 'chaos_sweep', 'chaos_bodyB', 'chaos_haymaker', 'chaos_flick'], gaps: [12, 26], locked: ['chaos_sweep', 'chaos_bodyB'], palettes: ['zeroTrue', 'zero.gus', 'zero.mirror', 'zero.avalanche'], patternSeg: 'chaos' }),
    gate('time', { type: 'timewarp', every: [3, 5], paces: [0.6, 1, 1.5], minRecovery: 14 }),
    gate(['h1', 'h2', 'h3'], { type: 'halcyon', slow: 10, max: 30 }),
    gate(['v1', 'v2', 'v3'], { type: 'gloom', dark: 0.94, eyeHi: [31, 26, 22], eyeLo: [28, 4, 6] }),
    gate(['v1', 'v2', 'v3'], { type: 'thief', take: 3, blocked: true, say: 'THE TITHE IS PAID!' }),
  ],
  titleDefense: null,
  gallery: 'THE WHOLE OF ZERO. FOUR PHASES: THE TWELVE TESTS, EVERY SIGNATURE, HALCYON AND VORGATH, THEN ALL AT FULL SPEED.',
  medals: { signature: { text: 'UNDO GUS\'S BORROWED SPATULA FLIP.', check: 'cueCount', cue: '!exploit:slip_gus', n: 1 }, speed: 1080 },
  music: 'zeroTrueEntrance',
};
