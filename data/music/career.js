// Career songs (original): circuit map, jogging cutscene, belt ceremony,
// and the champions' entrance jingles.

// "Road to the Title": circuit map theme. Easy march, C mixolydian colour.
export const map = {
  id: 'map',
  tempo: 112,
  channels: {
    p1: {
      duty: 1, env: { decay: 0.35, sustain: 0.6 }, vibrato: true,
      mml: `o4 l8 v10
        e4 g8 e8 d4 c4 | d4 e8 g8 a2 | g4 e8 c8 d4 g4 | e2. r4 |
        a4 g8 e8 d4 c4 | d4 e8 d8 c4 a4 | b-4 a8 g8 f4 d4 | c2. r4 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.1, sustain: 0.3 },
      mml: `o4 l8 v6
        [c e g e]2 | [c f a f]2 | [c e g e]2 | [c e g e]2 |
        [c f a f]2 | [d f a f]2 | [d f b- f]2 | [c e g e]2 |`,
    },
    tri: {
      env: { decay: 0.6, sustain: 0.9 },
      mml: `l4 v15
        o3 c c c c | o2 f f f f | o3 c c c c | o3 c c o2 g g |
        o2 f f f f | o2 d d d d | o2 b- b- b- b- | o3 c c c c |`,
    },
    noise: { mml: 'l8 v6 [k r h r s r h r]8' },
  },
};

// "Morning Roadwork": jogging cutscene theme. Bouncy G major.
export const jog = {
  id: 'jog',
  tempo: 144,
  channels: {
    p1: {
      duty: 2, env: { decay: 0.25, sustain: 0.55 }, vibrato: true,
      mml: `o4 l8 v11
        g8 b8 >d8< b8 >e4 d4< | c8 e8 g8 e8 a4 g4 | b8 >d8 g8 d8 e8 d8 c8< b8 | a2 >d4< r4 |
        g8 b8 >d8< b8 >e4 d4< | c8 e8 g8 e8 a4 >c4< | b8 a8 g8 a8 b8 >d8< a8 f+8 | g2 r2 |`,
    },
    p2: {
      duty: 0, env: { decay: 0.08, sustain: 0.2 },
      mml: `o4 l8 v7
        [r b]4 | [r >c<]4 | [r b]4 | [r a]4 |
        [r b]4 | [r >c<]4 | [r a]4 | [r b]4 |`,
    },
    tri: {
      env: { decay: 0.5, sustain: 0.9 },
      mml: `l8 v15
        o2[g>g<]4 | o3[c>c<]4 | o2[g>g<]4 | o2[d>d<]4 |
        o2[g>g<]4 | o3[c>c<]4 | o2[d>d<]4 | o2[g>g<]4 |`,
    },
    noise: { mml: 'l8 v10 [k h s h]16' },
  },
};

// Belt ceremony fanfare (non-looping).
export const belt = {
  id: 'belt',
  tempo: 120,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.5, sustain: 0.75 }, vibrato: true, mml: 'o4 l8 v12 g8 g8 g8 >c2 r8< | b4 >c8 d8 e2< | >g4 e8 c8 d4< b4 | >c1< r2' },
    p2: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o4 l8 v8 e8 e8 e8 g2 r8 | g4 g8 b8 >c2< | >e4 c8< g8 b4 g4 | g1 r2' },
    tri: { mml: 'o3 l4 v15 c c c c | g g c c | c c o2 g g | o3 c1 r2' },
    noise: { mml: 'l8 v11 k8 k8 k8 x4 r8 r8 r8 | k8 h8 s8 h8 x2 | k8 h8 s8 h8 k8 h8 s8 s8 | x1 r2' },
  },
};

// Champion entrance jingles (played on the intro card).
export const gusEntrance = {
  id: 'gusEntrance',
  tempo: 150,
  loop: false,
  channels: {
    p1: { duty: 1, env: { decay: 0.3, sustain: 0.6 }, mml: 'o5 l8 v11 c8 e8 g8 e8 f4 a4 | g8 e8 c8 d8 c2 | r2' },
    p2: { duty: 0, env: { decay: 0.2, sustain: 0.4 }, mml: 'o4 l8 v7 e8 g8 >c8< g8 a4 >c4< | b8 g8 e8 f8 e2 | r2' },
    tri: { mml: 'o3 l4 v15 c c f f | g g c2 | r2' },
    noise: { mml: 'l8 v10 [k h s h]3 k k x4 | r2' },
  },
};

export const brodyEntrance = {
  id: 'brodyEntrance',
  tempo: 96,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.6, sustain: 0.7 }, mml: 'o3 l4 v12 e e e c8 d8 | e2 r2' },
    p2: { duty: 1, env: { decay: 0.6, sustain: 0.6 }, mml: 'o3 l4 v8 b b b g8 a8 | b2 r2' },
    tri: { mml: 'o2 l4 v15 e e e e | e2 r2' },
    noise: { mml: 'l4 v12 k k k k | x2 r2' },
  },
};
