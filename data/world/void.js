// THE VOID (spec §18, §19 G11): through the tear, a floor of black glass ruled with faint white lines that runs on to the edge of the
// map and past it, holes of nothing in it, pieces of the world drifting overhead, and tall white figures standing silent in the distance.
// The way goes east, from the tear to ZERO's true form. Tiles glitch; nothing moves that should not.
export default {
  id: 'void', name: 'THE VOID', cols: 60, rows: 36,
  song: 'voidMap', ambient: 'void', fogSky: 'static', fogDir: 'right',
  base: [
    ['fill', 'voidfloor'],
    // holes of nothing
    ['blob', 'void', 14, 4, 5, 3, 1, { wobble: 0.9 }], ['blob', 'void', 28, 31, 6, 3, 2, { wobble: 0.9 }], ['blob', 'void', 44, 5, 6, 3, 3, { wobble: 0.9 }],
    ['blob', 'void', 4, 30, 4, 3, 4, { wobble: 0.9 }], ['blob', 'void', 56, 30, 4, 4, 5, { wobble: 0.9 }], ['blob', 'void', 26, 6, 3, 2, 6, { wobble: 0.9 }],
    ['blob', 'void', 38, 29, 3, 2, 7, { wobble: 0.9 }], ['blob', 'void', 57, 4, 3, 3, 8, { wobble: 0.9 }],
    // fragments of the worlds you came through, set into the floor
    ['blob', 'shard', 12, 14, 3, 2, 10], ['blob', 'shard', 21, 21, 3, 2, 11], ['blob', 'shard', 31, 14, 3, 2, 12], ['blob', 'shard', 41, 21, 3, 2, 13], ['blob', 'shard', 51, 17, 4, 3, 14],
    ['blob', 'marble', 36, 26, 2, 1, 15], ['blob', 'grass', 18, 29, 2, 1, 16], ['blob', 'ash', 48, 27, 2, 1, 17], ['blob', 'cloud', 8, 8, 2, 1, 18], ['blob', 'city', 34, 8, 2, 1, 19],
    ['scatter', 'shardDeco', [0, 0, 59, 35], 0.02, 20, { on: ['voidfloor', 'shard'] }],
    ['scatter', 'cube', [0, 0, 59, 35], 0.015, 21, { on: ['voidfloor'] }],
    ['scatter', 'doorframe', [0, 0, 59, 35], 0.004, 22, { on: ['voidfloor'] }],
    ['scatter', 'hollowStatue', [0, 0, 59, 35], 0.004, 23, { on: ['voidfloor'] }],
    ['put', 'tree', 18, 29], ['put', 'column', 36, 26], ['put', 'stalagmite', 48, 27], ['put', 'cloudPuff', 8, 8], ['put', 'tower1', 34, 8, 1],
  ],
  realms: [],
  regions: [
    { id: 'fundamentals', name: 'THE FUNDAMENTALS', sub: 'WHAT A FIGHTER IS MADE OF', rect: [0, 0, 16, 35] },
    { id: 'senses', name: 'THE SENSES', sub: 'WHAT A FIGHTER SEES', rect: [17, 0, 28, 35] },
    { id: 'mind', name: 'THE MIND', sub: 'WHAT A FIGHTER KNOWS', rect: [29, 0, 38, 35] },
    { id: 'heart', name: 'THE HEART OF NOTHING', sub: 'WHERE ZERO WAITS', rect: [39, 0, 59, 35] },
  ],
  nodes: {
    tearOut: { c: 4, r: 18, kind: 'portal', lm: 'tearGate', name: 'THE TEAR', sub: 'BACK TO THE UNDERWORLD', to: 'underworld', at: 'voiddoor', travel: 'tear', back: true },
    blimpVoid: { c: 4, r: 24, kind: 'blimp', lm: 'blimpDock', name: 'THE BLIMP', sub: 'FLY TO ANY WORLD YOU HAVE OPENED' },
    v1: { c: 12, r: 14, kind: 'circuit' }, v2: { c: 21, r: 21, kind: 'circuit' }, v3: { c: 31, r: 14, kind: 'circuit' }, rival9: { c: 41, r: 21, kind: 'rival' },
    zeroTrue: { c: 51, r: 17, kind: 'circuit', boss: true },
  },
  edges: [
    { a: 'tearOut', b: 'blimpVoid', type: 'void' },
    { a: 'tearOut', b: 'v1', via: [[8, 18], [8, 14]], type: 'void' },
    { a: 'v1', b: 'v2', via: [[16, 14], [16, 21]], type: 'void' },
    { a: 'v2', b: 'v3', via: [[26, 21], [26, 14]], type: 'void' },
    { a: 'v3', b: 'rival9', via: [[36, 14], [36, 21]], type: 'void' },
    { a: 'rival9', b: 'zeroTrue', via: [[46, 21], [46, 17]], type: 'void' },
  ],
  // the static over what is ahead, by the Ascension circuit reached (c.asc 15 = Void I ... 18 = ZERO); it covers everything EAST of the column
  fog: { by: 'asc', from: 15, dir: 'right', rows: [16, 26, 36, 60] },
};
