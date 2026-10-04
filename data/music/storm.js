// "Eye Wall": Storm Circuit fight theme (original).
// The most intense theme yet: D minor at 176 bpm, a relentless sixteenth-note
// arpeggio lashing underneath like rain, driving eighth-note bass, a lead that
// howls in long notes and then tears down in runs, and a crash of thunder at
// the end of every eight bars.
// Form (16 bars): Dm Dm Bb Bb Gm Gm A A7 | Dm C Bb A Gm A Dm A, loop.

export default {
  id: 'stormFight',
  tempo: 176,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.3, sustain: 0.65 }, vibrato: true,
      mml: `l4 v12
        o5 d2. c+8 d8 | o5 f4 e4 d4 o4 a4 | o5 d2 f4 d4 | o5 b-2. a4 |
        o5 g2 f4 e4 | o5 d4 e4 f4 g4 | o5 a2 g4 f4 | o5 e2 c+2 |
        o5 d8 e8 f8 g8 a4 d4 | o5 e8 f8 g8 a8 b-4 e4 | o5 f4. g8 f4 d4 | o5 e2 o4 a2 |
        o5 b-8 a8 g8 f8 e8 d8 c+8 d8 | o5 e4 c+4 o4 a4 o5 c+4 | o5 d2 a2 | o5 a8 g8 f8 e8 d8 c+8 o4 b-8 a8 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.04, sustain: 0.25 },
      mml: `l16 v6
        o4 [d16 f16 a16 >d16<]4 | o4 [d16 f16 a16 >d16<]4 | o3 [b-16 >d16 f16 b-16<]4 | o3 [b-16 >d16 f16 b-16<]4 |
        o3 [g16 b-16 >d16 g16<]4 | o3 [g16 b-16 >d16 g16<]4 | o3 [a16 >c+16 e16 a16<]4 | o3 [a16 >c+16 e16 g16<]4 |
        o4 [d16 f16 a16 >d16<]4 | o4 [c16 e16 g16 >c16<]4 | o3 [b-16 >d16 f16 b-16<]4 | o3 [a16 >c+16 e16 a16<]4 |
        o3 [g16 b-16 >d16 g16<]4 | o3 [a16 >c+16 e16 a16<]4 | o4 [d16 f16 a16 >d16<]4 | o3 [a16 >c+16 e16 g16<]4 |`,
    },
    tri: {
      env: { decay: 0.12, sustain: 0.6 },
      mml: `l8 v15
        o2 d8 d8 d8 d8 >d8< d8 d8 d8 | o2 d8 d8 d8 d8 >d8< d8 d8 d8 | o2 b-8 b-8 b-8 b-8 >b-8< b-8 b-8 b-8 | o2 b-8 b-8 b-8 b-8 >b-8< b-8 b-8 b-8 |
        o2 g8 g8 g8 g8 >g8< g8 g8 g8 | o2 g8 g8 g8 g8 >g8< g8 g8 g8 | o2 a8 a8 a8 a8 >a8< a8 a8 a8 | o2 a8 a8 a8 a8 >a8< a8 a8 a8 |
        o2 d8 d8 d8 d8 >d8< d8 d8 d8 | o2 c8 c8 c8 c8 >c8< c8 c8 c8 | o2 b-8 b-8 b-8 b-8 >b-8< b-8 b-8 b-8 | o2 a8 a8 a8 a8 >a8< a8 a8 a8 |
        o2 g8 g8 g8 g8 >g8< g8 g8 g8 | o2 a8 a8 a8 a8 >a8< a8 a8 a8 | o2 d8 d8 d8 d8 >d8< d8 d8 d8 | o2 a8 a8 a8 a8 >a8< a8 a8 a8 |`,
    },
    noise: {
      mml: `l16 v11
        [k16 h16 h16 h16 s16 h16 k16 h16 k16 h16 h16 h16 s16 h16 k16 s16]7 | k8 s16 s16 s16 s16 s16 s16 x2 |
        [k16 h16 h16 h16 s16 h16 k16 h16 k16 h16 h16 h16 s16 h16 k16 s16]7 | k8 s16 s16 s16 s16 s16 s16 x2 |`,
    },
  },
};

// Avalanche's entrance: a low rumbling march that climbs the mountain (non-looping).
export const avalancheEntrance = {
  id: 'avalancheEntrance',
  tempo: 108,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.45, sustain: 0.75 }, vibrato: true, mml: 'o3 l4 v12 d2 e4 f4 | g2 a4 b-4 | >c2 d4 e4 | f2. r4' },
    p2: { duty: 1, env: { decay: 0.45, sustain: 0.6 }, mml: 'o3 l4 v8 a2 b4 >c4 | d2 e4 f4 | g2 a4 b-4 | >c2. r4' },
    tri: { mml: 'o2 l4 v15 d4 d4 d4 d4 | g4 g4 g4 g4 | >c4 c4 c4 c4< | d2. r4' },
    noise: { mml: 'l4 v12 k4 r8 k8 k4 s4 | k4 r8 k8 k4 s4 | k4 k4 s8 s8 s8 s8 | x2. r4' },
  },
};
