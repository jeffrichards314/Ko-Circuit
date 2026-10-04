// Phase 7 songs (original).

// "Contender's Row": game modes menu, the Title Defense / Gauntlet hub and
// Practice. A minor, determined: the belts are won, now keep them.
// Form: A (Am F C G | Am F G E), B (Dm Am Dm E | Am Dm E Am), loop.
export const modes = {
  id: 'modes',
  tempo: 128,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.3, sustain: 0.6 }, vibrato: true,
      mml: `o4 l8 v11
        a4 >c8< a8 e4 a4 | f4 a8 >c8 f4 e4< | e4 g8 >c8 e4 d4< | d4 g8 b8 >d2< |
        a4 >c8< a8 e4 a4 | f4 a8 >c8 f4 a4< | g4 >d8 c8< b4 g4 | e2 g+4 b4 |
        >d4. c8< a4 f4 | e4. d8 c4 e4 | >d4. c8< a4 >d4< | b2 g+4 e4 |
        a8 b8 >c8 d8 e4 a4< | >f8 e8 d8 c8< b4 a4 | g+8 a8 b8 >c8< b4 g+4 | a2 r2 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.25 },
      mml: `o4 l8 v6
        [e a >c< a]2 | [f a >c< a]2 | [e g >c< g]2 | [d g b g]2 |
        [e a >c< a]2 | [f a >c< a]2 | [d g b g]2 | [e g+ b g+]2 |
        [d f a f]2 | [c e a e]2 | [d f a f]2 | [e g+ b g+]2 |
        [c e a e]2 | [d f a f]2 | [e g+ b g+]2 | [c e a e]2 |`,
    },
    tri: {
      env: { decay: 0.5, sustain: 0.9 },
      mml: `l8 v15
        o2[a>a<]4 | o2[f>f<]4 | o3[c>c<]4 | o2[g>g<]4 |
        o2[a>a<]4 | o2[f>f<]4 | o2[g>g<]4 | o2[e>e<]4 |
        o2[d>d<]4 | o2[a>a<]4 | o2[d>d<]4 | o2[e>e<]4 |
        o2[a>a<]4 | o2[d>d<]4 | o2[e>e<]4 | o2 a>a<a>a< e g+ a4 |`,
    },
    noise: {
      mml: `l8 v9
        [k h s h k k s h]7 | k h s h s16 s16 s8 x4 |
        [k h s h k k s h]7 | k h s h s16 s16 s8 x4 |`,
    },
  },
};

// "Sweat Equity": the training camp. D major, montage tempo.
// Form: A (D G A Bm | D A G-A D), B (G A F#m Bm | G A Bm-A D), loop.
export const training = {
  id: 'training',
  tempo: 144,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.25, sustain: 0.55 }, vibrato: true,
      mml: `o4 l8 v11
        d4 f+8 a8 >d4 c+4< | b4 a8 f+8 g4 e4 | a4 >c+8 e8 d4 c+4< | b2 a4 r4 |
        d4 f+8 a8 >d4 e4< | >f+4 e8 d8 c+4 a4< | b8 >c+8 d8 e8 f+4 e4< | >d2< r2 |
        g4. f+8 e4 d4 | e4. f+8 a4 e4 | f+4. e8 d4 c+4 | d4 f+4 b4 a4 |
        g8 a8 b8 >c+8 d4< b4 | a8 b8 >c+8 d8 e4 c+4< | >d8 c+8< b8 a8 f+4 e4 | d2 r2 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.25 },
      mml: `o4 l8 v6
        [d f+ a f+]2 | [d g b g]2 | [c+ e a e]2 | [d f+ b f+]2 |
        [d f+ a f+]2 | [c+ e a e]2 | [d g b g]1 [c+ e a e]1 | [d f+ a f+]2 |
        [d g b g]2 | [c+ e a e]2 | [c+ f+ a f+]2 | [d f+ b f+]2 |
        [d g b g]2 | [c+ e a e]2 | [d f+ b f+]1 [c+ e a e]1 | [d f+ a f+]2 |`,
    },
    tri: {
      env: { decay: 0.5, sustain: 0.9 },
      mml: `l8 v15
        o2[d>d<]4 | o2[g>g<]4 | o2[a>a<]4 | o2[b>b<]4 |
        o2[d>d<]4 | o2[a>a<]4 | o2[g>g<]2 o2[a>a<]2 | o2[d>d<]4 |
        o2[g>g<]4 | o2[a>a<]4 | o2[f+>f+<]4 | o2[b>b<]4 |
        o2[g>g<]4 | o2[a>a<]4 | o2[b>b<]2 o2[a>a<]2 | o2 d>d<d>d< a f+ d4 |`,
    },
    noise: {
      mml: `l8 v10
        [k h s h k h s s]7 | k k s k s16 s16 s16 s16 x4 |
        [k h s h k h s s]7 | k k s k s16 s16 s16 s16 x4 |`,
    },
  },
};
