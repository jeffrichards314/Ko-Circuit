// Actors of a cutscene (spec §19 G1): the sprites that walk, jog, pose and hover in a scene's world.
// An actor is { kind, x, y, ... } in world coordinates (its feet); the step `move` slides it, `pose` / `anim` change its frame.
//   player        the runner in side view (anim 'jog' cycles, otherwise it stands); flip faces left
//   playerBack    the player from behind, as in the ring (poses of the player sprite: idle1, victory, hit, down, ...)
//   bike          the trainer on the bike (the road)
//   fighter       any fighter by `id`: anims 'idle', 'walk' (a shuffle with a bob), 'taunt', 'victory', 'hit', 'down', or a raw `pose`
//   ferryman      the hooded Ferryman with his pole;   boat  the lantern boat
//   prop          drawn things: `shape: 'belt' | 'envelope' | 'letter' | 'chest'`
import { jogFrames, bikeFrames } from '../../data/sprites/jog.js';
import { fighterSprites, playerSprites, paletteFor } from '../engine/spriteCache.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { hairStyleOf, costumeIdOf, playerPalettes, trainerOf } from '../../data/customization.js';
import { drawFerryman, drawBoat } from '../screens/descend.js';
import { beltSprite } from './belts.js';
import { c32 } from '../engine/palette.js';

const cache = new Map();
const memo = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };

const pick = (list, t, rate) => list[Math.floor(t / rate) % list.length];
function framesOf(d, name, fallback) {
  const a = d.anims && d.anims[name];
  if (!a) return fallback;
  return Array.isArray(a) ? { frames: a, rate: 20 } : { frames: a.frames, rate: a.rate || 20 };
}

export function fighterPose(id, anim, t) {
  const d = FIGHTERS[id];
  const idle = framesOf(d, 'idle', { frames: ['idle1'], rate: 20 });
  if (anim === 'walk') return pick(idle.frames, t, 9);
  if (anim === 'beckon') return pick(['beckon1', 'beckon2'], t, 16);
  if (anim === 'taunt') { const a = framesOf(d, 'taunt', idle); return pick(a.frames, t, a.rate); }
  if (anim === 'victory') { const a = framesOf(d, 'victory', idle); return pick(a.frames, t, a.rate); }
  if (anim === 'hit') { const a = framesOf(d, 'hitHigh', idle); return pick(a.frames, t, a.rate); }
  if (anim === 'stunned') { const a = framesOf(d, 'stunned', idle); return pick(a.frames, t, a.rate); }
  if (anim === 'down') { const a = framesOf(d, 'down', idle); return pick(a.frames, t, a.rate); }
  return pick(idle.frames, t, idle.rate);
}

// draw one actor into the frame at screen position (sx, sy)
export function drawActor(f, a, sx, sy, S) {
  const t = S.t + (a.phase || 0);
  const ctx = S.ctx, p = ctx.profile;
  switch (a.kind) {
    case 'player': {
      const R = memo('run:' + JSON.stringify(p), () => jogFrames(p));
      const i = a.anim === 'jog' ? Math.floor(t / (a.rate || 7)) % 4 : 1;
      f.blit(R.frames[i], sx, sy + (a.anim === 'jog' && (Math.floor(t / (a.rate || 7)) & 1) ? 0 : -1), R.pal, { flip: !!a.flip });
      break;
    }
    case 'playerBack': {
      const bank = memo('pb:' + hairStyleOf(p) + costumeIdOf(p), () => playerSprites(hairStyleOf(p), costumeIdOf(p)));
      const pal = memo('pbpal:' + JSON.stringify(p), () => playerPalettes(p).default.u32);
      let pose = a.pose || 'idle1';
      if (a.anim === 'idle') pose = (t >> 5) & 1 ? 'idle2' : 'idle1';
      try { f.blit(bank.get(pose), sx, sy, pal, { flip: !!a.flip, scale: a.scale }); } catch { f.blit(bank.get('idle1'), sx, sy, pal, { scale: a.scale }); }
      break;
    }
    case 'bike': {
      const B = memo('bike:' + trainerOf(p).id, () => bikeFrames(trainerOf(p).id));
      f.blit(B.frames[a.anim === 'jog' ? Math.floor(t / 7) % 4 : 0], sx, sy, B.pal, { flip: !!a.flip });
      break;
    }
    case 'fighter': {
      const d = FIGHTERS[a.id];
      const bank = memo('fb:' + d.spriteLayers, () => fighterSprites(d.spriteLayers));
      const pal = memo('fp:' + d.palette, () => paletteFor(d.palette).u32);
      const pose = a.pose || fighterPose(a.id, a.anim, t);
      const bob = a.anim === 'walk' ? (Math.floor(t / 9) & 1 ? -1 : 0) : 0;
      let s; try { s = bank.get(pose); } catch { s = bank.get('idle1'); }
      // a fade: hidden, then a checkerboard, then solid (no blending)
      const fd = a.fade == null ? 1 : a.fade;
      if (fd < 0.2) break;
      const sc = a.fit ? Math.min(1, a.fit / s.h) : a.scale;
      f.blit(s, sx, sy + bob, pal, { flip: !!a.flip, scale: sc && sc !== 1 ? sc : undefined, dither: a.dither || fd < 0.6 ? 1 : 0 });
      break;
    }
    case 'ferryman': drawFerryman(f, sx, sy, t, a.pole != null ? a.pole : Math.sin(t * 0.04) * 6); break;
    case 'boat': drawBoat(f, sx, sy, t, a.lit !== false); break;
    case 'prop': drawProp(f, a, sx, sy, t, S); break;
    default: break;
  }
}

const INK = c32(2, 1, 3), PAPER = c32(31, 29, 22), PAPER_SH = c32(24, 21, 15);
function drawProp(f, a, x, y, t, S) {
  if (a.shape === 'belt') {
    const B = memo('belt:' + a.id, () => beltSprite(a.id)), k = a.scale || 1;
    f.blit(B.sprite, Math.round(x - (B.sprite.w * k) / 2), Math.round(y - (B.sprite.h * k) / 2), B.pal, { scale: k !== 1 ? k : undefined });
  } else if (a.shape === 'envelope' || a.shape === 'letter') {
    // an envelope seen flat: paper (optionally striped), a flap, a seal (optionally an eye)
    const w = Math.round(a.w || 40), h = Math.round(a.h || 26), seal = a.seal ? c32(...a.seal) : c32(28, 5, 8), sealHi = a.sealHi ? c32(...a.sealHi) : c32(31, 18, 14);
    const paper = a.paper ? c32(...a.paper) : PAPER, edge = a.edge ? c32(...a.edge) : PAPER_SH, ink = a.ink ? c32(...a.ink) : INK;
    f.rect(x - w / 2 - 1, y - h - 1, w + 2, h + 2, ink);
    f.rect(x - w / 2, y - h, w, h, paper);
    if (a.stripe) for (let i = 0; i < w; i += 6) f.rect(x - w / 2 + i, y - h, 3, h, c32(...a.stripe));
    f.rect(x - w / 2, y - 3, w, 3, edge);
    if (a.shape === 'envelope') {
      for (let i = 0; i < w / 2; i++) { const dy = Math.round((i / (w / 2)) * (h * 0.55)); f.px(x - w / 2 + i, y - h + dy, ink); f.px(x + w / 2 - 1 - i, y - h + dy, ink); }
      const r = Math.max(3, Math.round(w / 9));
      for (let j = -r; j <= r; j++) { const ww = Math.round(Math.sqrt(r * r - j * j)); f.rect(x - ww, y - h + Math.round(h * 0.5) + j, ww * 2 + 1, 1, seal); }
      for (let j = -(r - 2); j <= r - 2; j++) { const ww = Math.round(Math.sqrt((r - 2) * (r - 2) - j * j)); f.rect(x - ww, y - h + Math.round(h * 0.5) + j, ww * 2 + 1, 1, sealHi); }
      if (a.eye) { f.rect(x - r + 1, y - h + Math.round(h * 0.5), r * 2 - 1, 1, c32(31, 31, 31)); f.px(x, y - h + Math.round(h * 0.5), c32(28, 3, 10)); }
    } else for (let i = 0; i < 4; i++) f.rect(x - w / 2 + 4, y - h + 5 + i * 5, w - 8 - (i === 3 ? 12 : 0), 1, ink);
    void t; void S;
  }
}
