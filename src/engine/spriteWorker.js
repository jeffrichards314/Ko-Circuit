// Composes a sprite bank off the main thread (spriteCache.js warmInWorker): one message a pose, then `done`. A bank this thread cannot build (a layer set
// made at runtime) answers with an error and is composed on the main thread as it is wanted.
import { fighterSprites, playerSprites } from './spriteCache.js';

self.onmessage = ({ data: { job, kind, key, hair, costume, poses } }) => {
  try {
    const bank = kind === 'player' ? playerSprites(hair, costume) : fighterSprites(key);
    for (const pose of poses || bank.poses) {
      try { self.postMessage({ job, pose, sprite: bank.get(pose) }); } catch { /* a pose this bank does not have */ }
    }
    self.postMessage({ job, done: true });
  } catch (e) {
    self.postMessage({ job, error: String(e) });
  }
};
