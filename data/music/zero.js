// "Zero": the final boss theme (original). There is no music in round 1 at
// all (the arena's musicFrom): only the sound of the fight in the white void.
// From round 2 this plays: A minor at 208 bpm, the fastest theme in the game.
// It starts as nothing but a heartbeat bass and a lone high pulse counting,
// and then everything comes in at once: sixteenth arpeggios, a lead that
// climbs the whole range in one run after another, a pounding bass. The last
// four bars hang on the dominant and fall back to bar 1, so it never ends.
// Form (16 bars): Am Am F G | Am Am F E | Dm E Am F | Dm E E E, loop.

export default {
  id: 'zeroFight',
  tempo: 208,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.26, sustain: 0.66 }, vibrato: true,
      mml: `v13
        o5 a2 r2 | o5 a4 o6 c4 e4 d4 | o6 c4. o5 b8 a4 f4 | o5 g2 b2 |
        o5 a8 b8 o6 c8 d8 e4 a4 | o6 g4 e4 c4 o5 a4 | o5 f4 a4 o6 c4 f4 | o6 e2 g+2 |
        o6 f4 e8 d8 a4 f4 | o6 e4 d8 c8 o5 b4 g+4 | o5 a8 b8 o6 c8 d8 e8 f8 g8 a8 | o6 a4 g4 f4 c4 |
        o6 d4 f4 a4 f4 | o6 e4 g+4 b4 g+4 | o6 e8 f8 e8 d8 c8 o5 b8 a8 g+8 | o5 e2 o6 e2 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.03, sustain: 0.2 },
      mml: `l16 v6
        o6 [a16 r16 r16 r16]4 | o4 [a16 >c16 e16 a16<]4 | o4 [f16 a16 >c16 f16<]4 | o4 [g16 b16 >d16 g16<]4 |
        o4 [a16 >c16 e16 a16<]4 | o4 [a16 >c16 e16 a16<]4 | o4 [f16 a16 >c16 f16<]4 | o4 [e16 g+16 b16 >e16<]4 |
        o4 [d16 f16 a16 >d16<]4 | o4 [e16 g+16 b16 >e16<]4 | o4 [a16 >c16 e16 a16<]4 | o4 [f16 a16 >c16 f16<]4 |
        o4 [d16 f16 a16 >d16<]4 | o4 [e16 g+16 b16 >e16<]4 | o4 [e16 g+16 b16 >d16<]4 | o4 [e16 g+16 b16 >d16<]4 |`,
    },
    tri: {
      env: { decay: 0.12, sustain: 0.6 },
      mml: `v15
        o2 a8 r8 a8 r8 r2 | o2 [a8 >a8<]4 | o2 [f8 >f8<]4 | o2 [g8 >g8<]4 |
        o2 [a8 >a8<]4 | o2 [a8 >a8<]4 | o2 [f8 >f8<]4 | o2 [e8 >e8<]4 |
        o2 [d8 >d8<]4 | o2 [e8 >e8<]4 | o2 [a8 >a8<]4 | o2 [f8 >f8<]4 |
        o2 [d8 >d8<]4 | o2 [e8 >e8<]4 | o2 [e8 >e8<]4 | o2 [e8 >e8<]4 |`,
    },
    noise: {
      mml: `v12
        k8 r8 k8 r8 r2 | x8 h16 h16 s8 h8 k8 k8 s8 h8 | [k8 h16 h16 s8 h8 k8 k8 s8 h8]5 | k8 s8 s8 s8 s16 s16 s16 s16 x4 |
        x8 h16 h16 s8 h8 k8 k8 s8 h8 | [k8 h16 h16 s8 h8 k8 k8 s8 h8]6 | s16 s16 s16 s16 s8 s8 s16 s16 s16 s16 x4 |`,
    },
  },
};

// ZERO's walk-out: almost nothing. Four slow, quiet notes in a void, then one
// low one that doesn't resolve (non-looping).
export const zeroEntrance = {
  id: 'zeroEntrance',
  tempo: 60,
  loop: false,
  channels: {
    p1: { duty: 0, env: { decay: 0.8, sustain: 0.5 }, mml: 'o6 l4 v7 a r e r | c r o5 b r | r1' },
    tri: { mml: 'o2 l1 v10 r | r | a' },
  },
};
