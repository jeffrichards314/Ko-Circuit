// ZERO's twelve crystals (the true form rework, 2026-10-04). Each of the twelve Hollowed has ONE signature colour, used everywhere for them: the
// light they became in The Reforging, their crystal orbiting ZERO, the credits, the gallery. The colours are the twelve hues of a wheel, thirty
// degrees apart, so no two can be mistaken for each other.
//
// A crystal is a family of attacks: every move that is based on that Hollowed's skill (the shard's own blows, in ZERO's moves under a prefix) and ONE
// crystal attack, a super (§4) built from them: four of the family's blows in a fixed order and then the shard's own big blow as the golden moment.
// The crystal glows before any of its family comes (src/fight/asc/crystals.js); hitting the golden moment of its attack cracks it, and a cracked
// crystal's whole family is out of ZERO's pool for the rest of the fight (the segment that tested it is skipped, its blows leave his patterns, its
// attack is never thrown again).
import dodgeShard from './dodgeShard.js';
import blockShard from './blockShard.js';
import duckShard from './duckShard.js';
import counterShard from './counterShard.js';
import sightShard from './sightShard.js';
import soundShard from './soundShard.js';
import rhythmShard from './rhythmShard.js';
import memoryShard from './memoryShard.js';
import echoShard from './echoShard.js';
import chaosShard from './chaosShard.js';
import timeShard from './timeShard.js';
import willShard from './willShard.js';

// (r, g, b) 0-31; the wheel: red, orange, yellow, lime, green, mint, cyan, azure, indigo, violet, magenta, rose
export const HOLLOWED_COLORS = {
  willShard: [31, 5, 5], blockShard: [31, 16, 2], sightShard: [31, 29, 4], timeShard: [19, 31, 3], memoryShard: [4, 27, 7], soundShard: [3, 30, 17],
  dodgeShard: [3, 26, 31], counterShard: [5, 16, 31], echoShard: [11, 8, 31], duckShard: [22, 6, 31], chaosShard: [31, 4, 26], rhythmShard: [31, 12, 17],
};
export const HOLLOWED_COLOR_NAMES = {
  willShard: 'RED', blockShard: 'ORANGE', sightShard: 'YELLOW', timeShard: 'LIME', memoryShard: 'GREEN', soundShard: 'MINT',
  dodgeShard: 'CYAN', counterShard: 'AZURE', echoShard: 'INDIGO', duckShard: 'VIOLET', chaosShard: 'MAGENTA', rhythmShard: 'ROSE',
};
// the single line each says as they rise into the light in The Reforging (one line or a sound, spec: "a brief close-up and a single line or sound")
export const REFORGE_LINES = {
  dodgeShard: 'I REMEMBER THE ROAD.', blockShard: 'THE DOOR IS OPEN.', duckShard: 'I CAN STAND UP.', counterShard: 'TOUCHE.',
  sightShard: 'THE LIGHT IS ON.', soundShard: 'I CAN HEAR THE SEA.', rhythmShard: 'ONE. TWO. THREE. FOUR. FIVE.', memoryShard: 'WILHELMINA POOLE.',
  echoShard: 'I WAS HERE.', chaosShard: 'SNAKE EYES.', timeShard: 'QUARTER PAST.', willShard: 'ONE MORE ROUND.',
};

// the order they orbit in (the order they were freed)
export const CRYSTAL_ORDER = ['dodgeShard', 'blockShard', 'duckShard', 'counterShard', 'sightShard', 'soundShard', 'rhythmShard', 'memoryShard', 'echoShard', 'chaosShard', 'timeShard', 'willShard'];

// per crystal: the shard, the prefix his blows carry in ZERO's moves (the twelve tests, data/fighters/zeroTrue.js), the four blows of his crystal attack and
// the big blow that ends it (the shard's own super, the golden moment: its punch and window are the shard's)
const DEF = [
  ['dodgeShard', dodgeShard, 'dodge_', ['jab', 'hookL', 'hook', 'upper'], 'breakneck', 'DODGE', 'BREAKNECK', 'body', [11, 14]],
  ['blockShard', blockShard, 'block_', ['jab', 'body', 'hook', 'upper'], 'breaker', 'BLOCK', 'BULWARK BREAKER', 'head', [11, 14]],
  ['duckShard', duckShard, 'duck_', ['flick', 'sweep', 'drag', 'scythe'], 'whirlwind', 'DUCK', 'WHIRLWIND', 'head', [11, 14]],
  ['counterShard', counterShard, 'counter_', ['jab', 'hook', 'bodyR', 'upper'], 'riposte', 'COUNTER', 'RIPOSTE', 'body', [13, 16]],
  ['sightShard', sightShard, 'sight_', ['jab', 'hookL', 'sweep', 'bodyR'], 'gaze', 'SIGHT', 'THE GAZE', 'head', [9, 12]],
  ['soundShard', soundShard, 'sound_', ['jab', 'hook', 'body', 'upper'], 'chord', 'SOUND', 'THE CHORD', 'body', [12, 15]],
  ['rhythmShard', rhythmShard, 'rhythm_', ['jab', 'cross', 'hookL', 'body'], 'crescendo', 'RHYTHM', 'CRESCENDO', 'head', [12, 15]],
  ['memoryShard', memoryShard, 'memory_', ['jab', 'hook', 'bodyR', 'upper'], 'recital', 'MEMORY', 'THE RECITAL', 'body', [12, 15]],
  ['echoShard', echoShard, null, ['eJab', 'eBodyR', 'eJabR', 'eBody'], 'mimic', 'ECHO', 'THE MIMIC', 'head', [12, 15]],
  ['chaosShard', chaosShard, 'chaos_', ['flick', 'bodyB', 'hookL', 'slam'], 'snakeEyes', 'CHAOS', 'SNAKE EYES', 'body', [12, 15]],
  ['timeShard', timeShard, 'time_', ['jab', 'hook', 'body', 'haymaker'], 'stopped', 'TIME', 'STOPPED CLOCK', 'head', [12, 15]],
  ['willShard', willShard, 'will_', ['jab', 'wall', 'bodyR', 'breaking'], 'lastWord', 'WILL', 'THE LAST WORD', 'body', [13, 16]],
];

const GAP = 12; // the least a recovery between two blows of a crystal attack may be (a blow keeps its own, the shard's: a duck or a block needs room before the next one)

export const CRYSTALS = DEF.map(([id, S, pre, blows, finKey, skill, finName, hit, window], i) => ({
  id, index: i, skill, key: skill.toLowerCase(), color: HOLLOWED_COLORS[id], colorName: HOLLOWED_COLOR_NAMES[id], name: `${skill} CRYSTAL`,
  shard: S, pre, blows, finKey, finName, hit, window,
  // every move of the family in ZERO's moves (the twelve tests' own ids): the shard's blows, never his super
  moveIds: id === 'echoShard' ? ['eJab', 'eJabR', 'eBody', 'eBodyR', 'eStar'] : Object.entries(S.moves).filter(([, m]) => !m.knockdown).map(([k]) => pre + k),
  superMove: `cx_${skill.toLowerCase()}_1`,
}));
export const CRYSTAL_BY_ID = Object.fromEntries(CRYSTALS.map((c) => [c.id, c]));
export const CRYSTAL_OF_MOVE = {};
for (const c of CRYSTALS) for (const m of c.moveIds) CRYSTAL_OF_MOVE[m] = c.id;

// The crystal attacks' moves: the family's own blows retimed into a run (a fixed recovery between them) and the shard's super as the finisher.
// `cx_<key>_1..4` the blows, `cx_<key>_fin` the golden blow (armed by withSuper through the super below).
export function crystalMoves() {
  const moves = {};
  for (const c of CRYSTALS) {
    const M = c.shard.moves;
    c.blows.forEach((k, n) => {
      const src = M[k];
      const { kdWindow, recoveryKd, super: sup, noFake, goldenHit, glow, counterWindow, starWindow, ...base } = src;
      void kdWindow; void recoveryKd; void sup; void noFake; void goldenHit; void glow; void counterWindow; void starWindow;
      moves[`cx_${c.key}_${n + 1}`] = { ...base, name: `${c.skill} ${src.name}`, recoveryFrames: Math.max(GAP, src.recoveryFrames), counterWindow: null, starWindow: null, noFake: true, crystal: c.id };
      delete moves[`cx_${c.key}_${n + 1}`].knockdown;
    });
    const fin = M[c.finKey];
    const { super: s2, noFake: n2, goldenHit: g2, kdWindow: k2, recoveryKd: r2, ...fb } = fin;
    void s2; void n2; void g2; void k2; void r2;
    moves[`cx_${c.key}_fin`] = { ...fb, name: c.finName, noFake: true, counterWindow: null, starWindow: null, crystal: c.id };
  }
  return moves;
}
export const crystalChain = (c) => [1, 2, 3, 4].map((n) => `cx_${c.key}_${n}`);

// The twelve crystal attacks as supers (spec §4): ZERO's `supers` list. Sequence supers: he steps back, his crystal glows, he taunts, steps in,
// throws four blows of that family in a fixed order and the shard's big one. Armored the whole way; the one golden moment is on the big blow.
export function crystalSupers() {
  return CRYSTALS.map((c) => ({
    move: `cx_${c.key}_1`, then: [...crystalChain(c).slice(1), `cx_${c.key}_fin`], on: `cx_${c.key}_fin`, golden: 'windup', window: c.window, hit: c.hit,
    name: `${c.name}: ${c.finName}`, shout: `${c.finName}!`, taunt: 46, times: [1, 2], crystal: c.id,
    scout: `${c.name}: SURVIVE ITS FOUR BLOWS, THEN ${c.hit === 'head' ? 'A HEAD SHOT' : 'A BODY SHOT'} ON THE GLINT IN THE WINDUP OF ${c.finName} LEAVES HIM WIDE OPEN AND CRACKS THE ${c.colorName} CRYSTAL. ITS WHOLE FAMILY LEAVES HIS POOL FOR THE REST OF THE FIGHT.`,
  }));
}

// ---------------------------------------------------------------------------------------------------------------- pair attacks
// The final phase's crystals glow in pairs: `pair_go` (a call: both crystals flare) and then two crystals' attacks run into each other, ending in ONE golden
// blow that cracks both. Which two is decided as he throws it (src/fight/asc/crystals.js `pickSuper`), so the move ids of the blows are the ones above.
export const PAIR_MOVES = {
  pair_go: {
    name: 'THE CRYSTALS CALL', call: true, feint: true, noFake: true, windupFrames: 18, activeFrames: 0, recoveryFrames: 8, damage: 0, avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
    counterWindow: [2, 14], starWindow: null, cancels: 0, sfx: { tell: 'glitch' },
    animation: { windup: ['nought'], active: ['nought'], recovery: ['idle1'] },
  },
  pair_fin: {
    name: 'TWO AS ONE', knockdown: true, noFake: true, windupFrames: 26, activeFrames: 10, recoveryFrames: 46, damage: 30, avoidBy: ['dodgeL', 'dodgeR'], counterWindow: null, starWindow: null,
    sfx: { tell: 'voidTell', swing: 'crash' }, animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 10, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
  },
};
