// "Sawdust Galop": Carnival Circuit fight theme (original).
// D minor circus galop at 184 bpm: oom-pah bass and offbeat "pah" chords under
// a chromatic, slightly sinister lead that runs up and down like a calliope,
// then a bright F major middle that doesn't quite shake off the menace.
// Form: A (Dm A7 Dm A7 | Dm Gm A7 Dm), B (F C7 F C7 | Dm Gm A7 Dm), loop.

export default {
  id: 'carnivalFight',
  tempo: 184,
  channels: {
    p1: {
      duty: 0, env: { decay: 0.2, sustain: 0.55 }, vibrato: true,
      mml: `o4 l8 v12
        a8 g+8 a8 >d8 f4 e8 d8< | c+8 d8 e8 f8 g4 e4 | f8 e8 d8 c+8 d8 e8 f8 a8 | g4 a8 b-8 a4 r4 |
        a8 g+8 a8 >d8 f4 e8 d8< | d8 e8 f8 g8 b-4 a4 | a8 b-8 a8 g8 f8 e8 d8 c+8 | d4 f4 d4 r4 |
        >c8 c8 c8 d8 c4< a4 | b-8 b-8 b-8 >c8< b-4 g4 | a8 b-8 >c8 d8 e-8 d8 c8< a8 | g4 e4 c4 r4 |
        d8 f8 a8 >d8 f8 d8< a8 f8 | g8 b-8 >d8 g8 f8 d8< b-8 g8 | e8 g8 b-8 >c+8 e8 c+8< b-8 g8 | a8 f8 e8 c+8 d4 r4 |`,
    },
    p2: {
      duty: 1, env: { decay: 0.06, sustain: 0.25 },
      mml: `o4 l8 v7
        [r8 f8]4 | [r8 >c+<8]4 | [r8 f8]4 | [r8 >c+<8]4 |
        [r8 f8]4 | [r8 b-8]4 | [r8 >c+<8]4 | [r8 f8]4 |
        [r8 a8]4 | [r8 e8]4 | [r8 a8]4 | [r8 e8]4 |
        [r8 f8]4 | [r8 b-8]4 | [r8 >c+<8]4 | [r8 f8]4 |`,
    },
    tri: {
      env: { decay: 0.2, sustain: 0.6 },
      mml: `l8 v15
        o3 [d8 r8 >d8< r8]2 | o2 [a8 r8 >a8< r8]2 | o3 [d8 r8 >d8< r8]2 | o2 [a8 r8 >a8< r8]2 |
        o3 [d8 r8 >d8< r8]2 | o2 [g8 r8 >g8< r8]2 | o2 [a8 r8 >a8< r8]2 | o3 [d8 r8 >d8< r8]2 |
        o2 [f8 r8 >f8< r8]2 | o3 [c8 r8 >c8< r8]2 | o2 [f8 r8 >f8< r8]2 | o3 [c8 r8 >c8< r8]2 |
        o3 [d8 r8 >d8< r8]2 | o2 [g8 r8 >g8< r8]2 | o2 [a8 r8 >a8< r8]2 | o3 [d8 r8 >d8< r8]2 |`,
    },
    noise: {
      mml: `l8 v11
        [k s k s k s k s]7 | k s k s s16 s16 s16 s16 x4 |
        [k s k s k s k s]7 | k s k s s16 s16 s16 s16 x4 |`,
    },
  },
};

// Ringmaster Rex's entrance: a brassy circus march (non-looping).
export const rexEntrance = {
  id: 'rexEntrance',
  tempo: 132,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.4, sustain: 0.7 }, vibrato: true, mml: 'o4 l8 v12 d8 d8 d8 a8 >d4< a4 | f8 f8 f8 a8 >d4 f4< | e8 f8 g8 e8 c+4 a4 | d2 r2' },
    p2: { duty: 1, env: { decay: 0.4, sustain: 0.6 }, mml: 'o4 l8 v8 f8 f8 f8 >d8 f4 d4< | a8 a8 a8 >d8 f4 a4< | c+8 d8 e8 c+8 < a4 > e4 | f2 r2' },
    tri: { mml: 'o2 l4 v15 d a d a | d a d f | a e a a | d2 r2' },
    noise: { mml: 'l8 v11 k8 s8 k8 s8 k8 s8 k8 s8 | k8 s8 k8 s8 k8 s8 s8 s8 | k8 s8 k8 s8 s16 s16 s16 s16 x4 | x2 r2' },
  },
};
