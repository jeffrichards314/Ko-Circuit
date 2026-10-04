// Lazily composes and caches fighter/player frames. Frames are palette-index
// grids, so palette swaps only need a different palette table, not new frames.

import { composeFigure, resolvePose } from './figure.js';
import { spritePalette } from './palette.js';
import { PALETTES } from '../../data/palette.js';
import { BUILDS, FIGHTER_LAYERS, PLAYER } from '../../data/sprites/index.js';

const cache = new Map();

export function paletteFor(name) {
  const p = PALETTES[name];
  if (!p) throw new Error(`unknown palette ${name}`);
  return spritePalette(p.A, p.B);
}

// Fighter layers may add their own poses on top of the build's shared library.
function bank(key, build, layers, basePalette, req) {
  if (cache.has(key)) return cache.get(key);
  const pal = paletteFor(basePalette); // index layout is shared by every swap
  const poses = layers.poses ? { ...build.poses, ...layers.poses } : build.poses;
  const frames = new Map();
  const b = {
    build, layers, pal,
    get(pose) {
      if (!frames.has(pose)) frames.set(pose, composeFigure(build, layers, { ...resolvePose(poses, pose), mirrored: pose[0] === '~' }, pal));
      return frames.get(pose);
    },
    poses: Object.keys(poses),
    warm() { for (const p of this.poses) this.get(p); },
    frames, req, asked: new Set(),
  };
  cache.set(key, b);
  return b;
}

// His build with his own body on top (layers.body): { size: [kx, ky] (times the
// build's scale), dims (over the build's), legLen, torsoLen, shoulders, neckLen }
// (see figure.js reshape). The canvas grows to fit.
export function shapedBuild(build, body, key) {
  if (!body) return build;
  const [sx0, sy0] = build.scale, [kx, ky] = body.size || [1, 1], sx = sx0 * kx, sy = sy0 * ky;
  const B = { L: body.legLen ?? 1, T: body.torsoLen ?? 1, W: body.shoulders ?? 1, N: body.neckLen ?? 0 };
  const C = build.canvas, below = C.h - C.ay;
  const h = Math.ceil((C.ay * (sy / sy0) * Math.max(1, B.L, B.T)) + B.N * sy + 6) + below;
  const w = Math.ceil(C.w * (sx / sx0) * Math.max(1, B.W) + 6) & ~1;
  return {
    ...build, id: `${build.id}+${key}`, scale: [sx, sy], body: B,
    dims: { ...build.dims, ...(body.dims || {}) },
    canvas: { w, h, ax: w / 2, ay: h - below },
  };
}

export function fighterSprites(layersId) {
  const layers = FIGHTER_LAYERS[layersId];
  const build = shapedBuild(BUILDS[layers.build], layers.body, layersId);
  return bank('f:' + layersId, build, layers, layers.palettes.default, { kind: 'f', key: layersId });
}

// One bank per hair style (hair is geometry; every other option is a palette swap).
// ...and per costume (§16): its pieces are geometry too.
export function playerSprites(hair = 'spiky', costume = 'none') {
  return bank(`player:${hair}:${costume}`, PLAYER.build, PLAYER.layersFor(hair, costume), 'player', { kind: 'player', hair, costume });
}

// Composing one pose costs 10-40 ms (a mask and a bevel for every part), so a pose first drawn in the middle of a punch is a dropped frame or two. A fight
// (or a hall, for the few poses its fighters stand in) has its banks composed in a worker (spriteWorker.js) from the moment it is built, a pose at a
// time, and the poses are installed here as they arrive: by the first punch they are all there. A pose that has not arrived when it is wanted is composed
// on the spot, as it always was (so no Worker, no problem). `only`: the poses to compose (all of them when left out).
let worker = null;
const jobs = new Map();
let jobN = 0;
// (started when the game boots, so its modules are loaded long before the first fight asks for anything)
export function startSpriteWorker() {
  if (worker || typeof Worker === 'undefined') return;
  try {
    worker = new Worker(new URL('./spriteWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const j = jobs.get(data.job);
      if (!j) return;
      if (data.sprite && !j.frames.has(data.pose)) j.frames.set(data.pose, data.sprite);
      if (data.done || data.error) jobs.delete(data.job);
    };
    worker.onerror = () => { worker = null; jobs.clear(); };
  } catch { worker = null; }
}
export function warmInWorker(b, only = null) {
  if (!b || !b.req || typeof Worker === 'undefined') return;
  const want = (only || b.poses).filter((p) => !b.frames.has(p) && !b.asked.has(p));
  if (!want.length) return;
  startSpriteWorker();
  if (!worker) return;
  for (const p of want) b.asked.add(p);
  jobs.set(++jobN, b);
  worker.postMessage({ job: jobN, ...b.req, poses: want });
}
