// "Civic Hall Shuffle": Minor Circuit fight theme (original).
// D minor with a shuffling off-beat and a walking octave bass: a notch more
// serious than the Rookie theme, still small-town.
// Form: A (Dm Dm Bb A | Dm Dm Gm A), B (F C Dm Bb | Gm A Dm A), loop.

export default {
  id: 'minorFight',
  tempo: 158,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.28, sustain: 0.55 }, vibrato: true,
      mml: `o4 l8 v11
        d4 f8 a8 r8 a8 g8 f8 | e4 d8 e8 f4 a4 | b-4 a8 g8 f8 d8 f8 g8 | a2 >c+4 e4< |
        d4 f8 a8 r8 >d8< a8 f8 | g8 f8 e8 d8 e4 f4 | g8 a8 b-8 >d8< b-4 g4 | a4 g8 f8 e8 c+8 e8 a8 |
        >c4< a8 f8 >c8 d8 c8< a8 | g4 e8 c8 g8 a8 g8 e8 | f4 d8 f8 a4 >d4< | >d8 c8< b-8 a8 b-4 f4 |
        g8 b-8 >d8 g8 f8 d8< b-8 g8 | a4 >c+8 e8 a4 g4< | f8 e8 d8 e8 f8 g8 a8 >c8< | a4 e8 c+8 <a4> r4 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.2 },
      mml: `o4 l8 v7
        [r f]4 | [r f]4 | [r f]4 | [r e]4 |
        [r f]4 | [r f]4 | [r g]4 | [r e]4 |
        [r a]4 | [r g]4 | [r f]4 | [r f]4 |
        [r g]4 | [r e]4 | [r f]4 | [r e]4 |`,
    },
    tri: {
      env: { decay: 0.5, sustain: 0.9 },
      mml: `l8 v15
        o2[d>d<]4 | o2[d>d<]4 | o2[b->b-<]4 | o2[a>a<]4 |
        o2[d>d<]4 | o2[d>d<]4 | o2[g>g<]4 | o2[a>a<]4 |
        o2[f>f<]4 | o3[c>c<]4 | o2[d>d<]4 | o2[b->b-<]4 |
        o2[g>g<]4 | o2[a>a<]4 | o2[d>d<]4 | o2 a>a<a>a< e f g a |`,
    },
    noise: {
      mml: `l8 v12
        [k h s h k k s h]7 | k h s h s16 s16 s8 x4 |
        [k h s h k k s h]7 | k h s h s16 s16 s8 x4 |`,
    },
  },
};
