// Short non-looping jingles (original).

export const victory = {
  id: 'victory',
  tempo: 150,
  loop: false,
  channels: {
    p1: { duty: 2, env: { decay: 0.4, sustain: 0.7 }, mml: 'o4 l8 v12 g >c e g4 e8 g2. r4' },
    p2: { duty: 1, env: { decay: 0.4, sustain: 0.6 }, mml: 'o4 l8 v8 e g >c e4 c8 e2. r4' },
    tri: { mml: 'o3 l4 v15 c g8 e8 c4 g4 c2 r4' },
    noise: { mml: 'l8 v10 k k s k x4 r2. r4' },
  },
};

export const defeat = {
  id: 'defeat',
  tempo: 96,
  loop: false,
  channels: {
    p1: { duty: 1, env: { decay: 0.5, sustain: 0.6 }, mml: 'o4 l4 v11 g f+ f e2. r4' },
    p2: { duty: 0, env: { decay: 0.5, sustain: 0.5 }, mml: 'o4 l4 v6 e d+ d c+2. r4' },
    tri: { mml: 'o3 l4 v15 c <b b- a2. r4' },
  },
};

export const matchup = {
  id: 'matchup',
  tempo: 132,
  loop: true,
  channels: {
    p1: { duty: 1, env: { decay: 0.2, sustain: 0.5 }, mml: 'o4 l8 v10 [g r g r >c< r b a]2 [a r a r >d< r c< b]2' },
    p2: { duty: 0, env: { decay: 0.1, sustain: 0.3 }, mml: 'o4 l8 v6 [e r e r g r g r]2 [f+ r f+ r a r a r]2' },
    tri: { mml: 'o2 l8 v15 [c r c r c r c r]2 [d r d r d r d r]2' },
    noise: { mml: 'l8 v8 [k h s h]8' },
  },
};
