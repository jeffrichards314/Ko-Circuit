// ZERO'S WORLD (spec §19 G11): through the warp, the city of champions again, gone wrong. The ground is purple stone split by rifts of
// nothing, the towers lean and break, dead trees and black obelisks stand where the parks were. The Nightmare circuit is in the ruins;
// ZERO's throne rises out of the null once the Nightmare and the Underground are both cleared. Past the throne is THE CROSSROADS: the Sky
// Gate to the Pantheon on its west side (once ZERO is beaten), and after The Fall the chasm to the Underworld on its east side, so from
// then on both worlds are a choice from the same spot.
export default {
  id: 'zero', name: 'THE WARPED CITY', cols: 40, rows: 44,
  song: 'zeroMap', ambient: 'zero',
  base: [
    ['fill', 'warp'],
    // raised slabs of the old city, split by the rifts
    ['blob', 'warpHigh', 9, 32, 6, 5, 1], ['blob', 'warpHigh', 31, 33, 6, 5, 2], ['blob', 'warpHigh', 8, 14, 5, 6, 3], ['blob', 'warpHigh', 32, 13, 5, 6, 4],
    ['blob', 'rift', 4, 22, 3, 5, 5, { wobble: 0.9 }], ['blob', 'rift', 36, 23, 3, 4, 6, { wobble: 0.9 }], ['blob', 'rift', 13, 41, 4, 2, 7, { wobble: 0.9 }], ['blob', 'rift', 30, 42, 4, 2, 8, { wobble: 0.9 }],
    ['blob', 'rift', 20, 1, 18, 2, 9, { wobble: 0.6 }],
    // the crossroads past the throne: a ledge of old stone, a glimpse of sky over its west end
    ['rect', 'warpHigh', 3, 4, 37, 9], ['blob', 'cloud', 7, 4, 3, 1, 20], ['rect', 'marble', 6, 5, 10, 8],
    ['put', 'column', 5, 7], ['put', 'column', 11, 7], ['put', 'obelisk', 16, 5], ['put', 'obelisk', 24, 5], ['put', 'sign', 18, 9],
    ['blob', 'night', 20, 27, 5, 3, 10, { on: true }],
    ['rect', 'road', 20, 30, 20, 43, { on: 'land' }],
    // the ruins: broken towers, dead trees, obelisks, shards floating over the rifts
    ['scatter', 'towerBroken', [0, 16, 39, 43], 0.14, 11, { on: ['warp', 'warpHigh'], v: 3 }],
    ['scatter', 'deadTree', [0, 16, 39, 43], 0.12, 12, { on: ['warp'] }],
    ['scatter', 'obelisk', [0, 5, 39, 43], 0.04, 13, { on: ['warp', 'warpHigh'] }],
    ['scatter', 'stalagmite', [0, 5, 39, 43], 0.06, 14, { on: ['warpHigh'] }],
    ['scatter', 'shardDeco', [0, 5, 39, 43], 0.05, 15, { on: ['warp', 'warpHigh'] }],
    ['scatter', 'bones', [0, 5, 39, 43], 0.03, 16, { on: ['warp'] }],
    ['scatter', 'neon', [0, 16, 39, 43], 0.04, 17, { on: ['warp'] }],
    ['put', 'obelisk', 16, 24], ['put', 'obelisk', 24, 24], ['put', 'towerBroken', 14, 29, 1], ['put', 'towerBroken', 26, 29, 2], ['put', 'deadTree', 17, 35], ['put', 'deadTree', 23, 35],
  ],
  realms: [
    // The Fall: the east end of the crossroads splits and the chasm opens
    { id: 'chasm', rect: [31, 0, 39, 12], when: 'fallen', fx: 'crack', at: [34, 6], line: [[38, 2], [35, 5], [33, 8], [36, 11]],
      cover: [], full: [['blob', 'ash', 35, 6, 4, 4, 34], ['rect', 'ash', 31, 7, 34, 8], ['blob', 'pit', 37, 5, 2, 3, 35, { wobble: 0.7 }], ['put', 'brazier', 32, 4], ['put', 'chain', 36, 10], ['put', 'stalagmite', 38, 9]] },
    // ZERO's throne: a stair of black stone rising out of the null
    { id: 'zero', rect: [10, 5, 30, 19], when: 'zeroUnlocked', fx: 'sweep', at: [20, 16],
      cover: [['blob', 'rift', 20, 11, 9, 5, 18, { wobble: 0.7 }]],
      full: [['blob', 'warpHigh', 20, 11, 8, 5, 19], ['rect', 'voidfloor', 17, 8, 23, 18], ['rect', 'warpHigh', 16, 6, 24, 7], ['put', 'obelisk', 15, 9], ['put', 'obelisk', 25, 9], ['put', 'column', 17, 14], ['put', 'column', 23, 14], ['put', 'spotlight', 16, 12, 0], ['put', 'spotlight', 24, 12, 1]] },
  ],
  regions: [
    { id: 'crossroads', name: 'THE CROSSROADS', sub: 'UP TO THE SKY, DOWN TO THE DEEP', rect: [0, 0, 39, 9] },
    { id: 'nullThrone', name: 'THE NULL THRONE', sub: 'NOTHING SITS HERE', rect: [0, 10, 39, 19] },
    { id: 'warpedCity', name: 'THE WARPED CITY', sub: 'THE WORLD GONE WRONG', rect: [0, 20, 39, 43] },
  ],
  nodes: {
    zeroOut: { c: 20, r: 40, kind: 'portal', lm: 'warpGate', name: 'THE WARP', sub: 'BACK TO THE CITY OF CHAMPIONS', to: 'champ', at: 'toZero', travel: 'warp', back: true },
    blimpZero: { c: 26, r: 40, kind: 'blimp', lm: 'blimpDock', name: 'THE BLIMP', sub: 'FLY TO ANY WORLD YOU HAVE OPENED' },
    nightmare: { c: 20, r: 28, kind: 'circuit', secret: true },
    zero: { c: 20, r: 13, kind: 'circuit', secret: true, boss: true },
    crossroads: { c: 20, r: 8, kind: 'junction', name: 'THE CROSSROADS', sub: 'THE SKY OR THE DEEP' },
    skygate: { c: 8, r: 6, kind: 'gate', lm: 'skygate', name: 'THE SKY GATE', sub: 'TO THE PANTHEON', to: 'pantheon', at: 'skyStairs', travel: 'climb' },
    chasm: { c: 33, r: 6, kind: 'gate', lm: 'chasm', name: 'THE CHASM', sub: 'DOWN TO THE UNDERWORLD', to: 'underworld', at: 'chasmTop', travel: 'fall', realm: 'chasm' },
  },
  edges: [
    { a: 'zeroOut', b: 'nightmare' },
    { a: 'zeroOut', b: 'blimpZero' },
    { a: 'nightmare', b: 'zero', type: 'secret', needs: 'zeroUnlocked', realm: 'zero' },
    { a: 'zero', b: 'crossroads', needs: 'zeroBeaten', realm: 'zero' },
    { a: 'crossroads', b: 'skygate', via: [[8, 8]], type: 'stairs', needs: 'zeroBeaten' },
    { a: 'crossroads', b: 'chasm', via: [[33, 8]], type: 'ledge', needs: 'fallen', realm: 'chasm' },
  ],
};
