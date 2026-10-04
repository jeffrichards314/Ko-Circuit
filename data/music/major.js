// "Main Event": Major Circuit fight theme (original).
// A minor arena rock at 172 bpm: eighth-note power chords on the second pulse,
// a pounding eighth-note bass, and a big stadium lead. The loudest, fastest theme so far.
// Form: A (Am F C G | Am F G E), B (F G Am Am | Dm E Am E), loop.

export default {
  id: 'majorFight',
  tempo: 172,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.3, sustain: 0.6 }, vibrato: true,
      mml: `o4 l8 v12
        a4 >c8 e8 a4 g8 e8< | f4 a8 >c8 f4 e8 c8< | e8 g8 >c8< g8 e8 g8 >c8 e8< | d4 g8 b8 >d4< b4 |
        a8 b8 >c8 d8 e4 c4< | f8 e8 f8 a8 >c4< a4 | g8 f8 g8 b8 >d4 g4< | g+2 e4 b4 |
        >c4< a8 f8 >c4 f4< | >d4< b8 g8 >d4 g4< | >e2 d8 c8< b8 a8 | >c4< a4 e4 a4 |
        d8 f8 a8 >d8 f4 d4< | e8 g+8 b8 >e8 g+4 e4< | >a4 g8 e8 c4< a4 | b8 >d8 e8 g+8< b4 e4 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.1, sustain: 0.35 },
      mml: `l8 v6
        o3 [a >e<]4 | o3 [f >c<]4 | o3 [c g]4 | o3 [g >d<]4 |
        o3 [a >e<]4 | o3 [f >c<]4 | o3 [g >d<]4 | o3 [e b]4 |
        o3 [f >c<]4 | o3 [g >d<]4 | o3 [a >e<]4 | o3 [a >e<]4 |
        o3 [d a]4 | o3 [e b]4 | o3 [a >e<]4 | o3 [e b]4 |`,
    },
    tri: {
      env: { decay: 0.3, sustain: 0.8 },
      mml: `l8 v15
        o2 [a]8 | o2 [f]8 | o3 [c]8 | o2 [g]8 |
        o2 [a]8 | o2 [f]8 | o2 [g]8 | o2 [e]8 |
        o2 [f]8 | o2 [g]8 | o2 [a]8 | o2 [a]8 |
        o3 [d]8 | o2 [e]8 | o2 [a]8 | o2 [e]8 |`,
    },
    noise: {
      mml: `l8 v13
        [k h s h k k s h]7 | k k s s s16 s16 s16 s16 x4 |
        [k h s k h k s h]7 | s s s s s16 s16 s16 s16 x4 |`,
    },
  },
};

// Count Midnight's entrance: a slow pipe-organ phrase (non-looping).
export const midnightEntrance = {
  id: 'midnightEntrance',
  tempo: 76,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.9, sustain: 0.8 }, vibrato: true, mml: 'o4 l4 v12 d4 f4 a4 >d4< | c+2 e2 | d4 f4 b-4 a4 | d1' },
    p2: { duty: 1, env: { decay: 0.9, sustain: 0.7 }, mml: 'o3 l4 v8 a4 >d4 f4 a4< | a2 >c+2< | b-4 >d4 g4 f4< | a1' },
    tri: { env: { decay: 1.2, sustain: 0.95 }, mml: 'o2 l1 v15 d | a | g | d' },
    noise: { mml: 'l4 v9 x4 r4 r2 | r1 | r1 | x4 r4 r2' },
  },
};
