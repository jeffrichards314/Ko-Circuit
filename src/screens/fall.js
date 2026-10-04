// THE FALL (spec §18 A4): the cutscene after Halcyon.
//   1  you rise toward a gate of light, the belt glowing on your waist
//   2  a chain of shadow closes round your ankle: Dash is holding the other end, and behind him
//      stands the shadowy figure of Vorgath. "He said it was the only way."
//   3  you're pulled down, and fall past every Pantheon arena in reverse (the Summit, the Mirror
//      Sanctum, the Thunder Forge, the Starfield, the Hall of Heroes, the Cloud Terrace, the Gate of Dawn)
//   4  you land in the dark. Your trainer can't follow you there.
// After it the Ferryman's landing (screens/descend.js: the first time you're in the dark), then the Underworld map. (args: none)

import { drawTyped, drawLabel, talkTick, talkReady } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { Frame, W, H } from '../engine/renderer.js';
import { Arena } from '../engine/arena.js';
import { ARENAS } from '../../data/arenas/index.js';
import { fighterSprites, paletteFor, playerSprites } from '../engine/spriteCache.js';
import { playerPortrait } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, costumeIdOf, playerPalettes, trainerOf } from '../../data/customization.js';
import { beltSprite } from './cutscenes.js';

const BOX = c32(3, 4, 9);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const SKY = [c32(31, 31, 28), c32(31, 30, 22), c32(31, 27, 15), c32(30, 22, 12), c32(27, 16, 13)];
const ARENA_ORDER = ['pantheon7', 'pantheon6', 'pantheon5', 'pantheon4', 'pantheon3', 'pantheon2', 'pantheon1'];
const T = { rise: 0, chain: 170, fall: 350, land: 600 };

export class FallScreen {
  constructor(game) {
    this.g = game;
    this.t = 0; this.line = -1; this.lineT = 0; this.shown = 0;
    const p = game.profile, fp = frontPalette(p), tr = trainerOf(p);
    this.you = { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name };
    const tp = trainerPortrait(tr.id);
    this.coach = { portrait: tp.sprite, pal: tp.pal, name: tr.name || 'COACH' };
    const dp = paletteFor('dash6');
    this.dash = { portrait: null, pal: dp.u32, bank: fighterSprites('dash6') };
    this.player = { bank: playerSprites(hairStyleOf(p), costumeIdOf(p)), pal: playerPalettes(p).default.u32 };
    this.belt = beltSprite('halcyon');
    // the seven arenas, each drawn once (the fall shows them scrolling by)
    this.shots = ARENA_ORDER.map((id) => { const a = new Arena(ARENAS[id]); for (let i = 0; i < 30; i++) a.update(); const f = new Frame(); f.clear(0xff000000); a.draw(f); return f.buf.slice(); });
    this.lines = [
      // [when (frame), who, text]
      [T.chain + 110, 'dash', 'I\'M SORRY, CHAMP. HE SAID HE\'D LET ME UP THE STAIRS. HE SAID IT WAS THE ONLY WAY.'],
      [T.land + 60, 'coach', 'CHAMP! CHAMP, CAN YOU HEAR ME? I CAN\'T FOLLOW YOU DOWN THERE. NOBODY CAN.'],
      [T.land + 60, 'coach', 'YOU\'RE ON YOUR OWN NOW. GET UP. YOU\'VE ALWAYS GOTTEN UP.'],
    ];
    this.queue = [];
  }
  enter() { this.g.audio.play(this.g.songs.fallTheme || this.g.songs.ascend); }

  update() {
    const I = this.g.input, A = this.g.audio;
    // dialogue holds the scene until it's read (typed out, then a push)
    if (this.line >= 0) {
      const [, who, text] = this.lines[this.line];
      if (talkTick(this, text, who === 'coach' ? 160 : 228, I.confirm() || I.pressed('star'))) { A.sfx('menu'); this.lineT = 0; this.line = -1; }
      return;
    }
    this.t++;
    if (this.t === T.chain + 20) A.sfx('rumble');
    if (this.t === T.fall) { A.sfx('crash'); A.sfx('whoosh'); }
    if (this.t > T.fall && this.t < T.land && this.t % 30 === 0) A.sfx('whoosh');
    if (this.t === T.land) { A.sfx('knockdown'); A.sfx('thud'); }
    const next = this.lines[this.shown];
    if (next && this.t >= next[0]) { this.line = this.shown++; this.lineT = 0; }
    if (this.t > T.land + 320 && this.shown >= this.lines.length) this.leave();
  }
  leave() { const c = this.g.career; this.g.go(c && c.flags.underworldSeen ? 'map' : 'descend'); }

  render(f) {
    const t = this.t;
    if (t < T.chain) this.renderRise(f, t);
    else if (t < T.fall) this.renderChain(f, t - T.chain);
    else if (t < T.land) this.renderFall(f, t - T.fall);
    else this.renderLand(f, t - T.land);
    if (this.line >= 0) this.renderText(f);
    // a caption for each beat
    const cap = t < T.chain ? 'YOU RISE TOWARD THE GATE OF LIGHT...' : t < T.fall ? 'A CHAIN OF SHADOW...' : t < T.land ? 'YOU FALL.' : t < T.land + 140 ? 'THE DARK.' : '';
    if (cap && this.line < 0) drawTextCentered(f, cap, 128, 8, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
  }

  // 1: the climb to the gate, the belt shining
  renderRise(f, t) {
    for (let i = 0; i < 5; i++) f.rect(0, i * 45, 256, 45, SKY[4 - i]);
    // the gate: an arch of white at the top, rays fanning down
    const gx = 128, gy = 48;
    for (let r = 44; r > 0; r -= 6) { const col = r > 34 ? c32(31, 29, 16) : r > 20 ? c32(31, 31, 24) : c32(31, 31, 31); for (let y = -r; y <= 6; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); f.rect(gx - w, gy + y, w * 2, 1, col); } }
    f.rect(gx - 40, gy - 10, 6, 70, c32(26, 20, 6)); f.rect(gx + 34, gy - 10, 6, 70, c32(26, 20, 6));
    for (let r = 0; r < 9; r++) for (let d = 30; d < 180; d += 3) { const a = 0.35 + r * 0.29, x = Math.round(gx + Math.cos(a) * d * 1.2), y = Math.round(gy + Math.sin(a) * d * 0.9); if (y > 0 && y < 224 && ((d + r + (t >> 1)) & 3) === 0) f.px(x, y, c32(31, 31, 24)); }
    // clouds racing down as you climb
    for (let i = 0; i < 7; i++) { const y = ((i * 41 + t * 2.4) % 260) - 20, x = (i * 67) % 230; f.rect(x, y, 30, 4, c32(31, 28, 26)); f.rect(x + 6, y - 2, 20, 2, c32(31, 30, 29)); }
    const py = 190 - Math.round((t / T.chain) * 70);
    this.drawPlayer(f, 128, py, 'idle1', 1);
    // the belt on his waist, glowing
    const glow = (t >> 2) & 1 ? c32(31, 31, 22) : c32(31, 26, 8);
    for (let a = 0; a < 16; a++) { const an = (a / 16) * Math.PI * 2 + t * 0.05; f.px(128 + Math.round(Math.cos(an) * 24), py - 46 + Math.round(Math.sin(an) * 9), glow); }
    f.blit(this.belt.sprite, 128, py - 40, this.belt.pal, { scale: 0.24 });
  }

  // 2: the chain, and who holds it
  renderChain(f, t) {
    this.renderRise(f, T.chain - 1);
    // the sky darkens from below as the shadow rises
    const k = Math.min(1, t / 60), dark = c32(2, 1, 6);
    for (let y = 224 - Math.round(k * 190); y < 224; y++) for (let x = 0; x < 256; x++) if (bayer(x, y) < 0.35 + 0.5 * ((y - (224 - k * 190)) / (k * 190 + 1))) f.px(x, y, dark);
    // Vorgath: a huge shadow with a crown of spikes and two red eyes, behind Dash
    const vs = Math.min(1, t / 50), vx = 168, vy = 224;
    if (vs > 0) {
      const h = Math.round(150 * vs), sh = c32(1, 0, 3);
      for (let y = 0; y < h; y++) { const w = Math.round(26 + Math.sin(y / 14) * 4 + (y > h - 30 ? (y - (h - 30)) * 0.5 : 0)); f.rect(vx - w, vy - y, w * 2, 1, sh); }
      for (let i = -3; i <= 3; i++) for (let j = 0; j < 12; j++) f.rect(vx + i * 8 - 1, vy - h - j, 3, 1, sh);
      if (t > 40) { const e = (t >> 3) & 1 ? c32(31, 6, 4) : c32(31, 14, 6); f.rect(vx - 10, vy - h + 26, 5, 3, e); f.rect(vx + 6, vy - h + 26, 5, 3, e); f.rect(vx - 6, vy - h - 6, 12, 2, e); }
    }
    // Dash, at the bottom left, holding the chain
    const dp = 60;
    f.blit(this.dash.bank.get(t < 100 ? 'idle1' : 'beckon2'), dp, 222, this.dash.pal, { scale: 0.9 });
    // the chain: links from his glove up to your ankle, taut, swaying
    const py = 190 - 70;
    for (let i = 0; i <= 26; i++) { const u = i / 26, x = Math.round(dp + 26 + (128 - dp - 26 - 2) * u + Math.sin(u * 9 + t * 0.2) * 3 * (1 - u)), y = Math.round(150 + (py - 150) * u * 0.0 + (py + 4 - 150) * u * 1 - Math.sin(u * Math.PI) * 4); const link = i & 1; f.rect(x, y, link ? 4 : 2, link ? 2 : 4, c32(6, 5, 10)); f.px(x, y, c32(20, 18, 24)); }
    this.drawPlayer(f, 128, py, 'idle1', 1);
    // the chain wraps the ankle
    if (t > 20) for (let i = 0; i < 4; i++) f.rect(122 + i * 3, py - 6 + (i & 1) * 2, 4, 2, c32(4, 3, 8));
  }

  // 3: falling past the arenas, top to bottom in reverse
  renderFall(f, t) {
    const per = 34, idx = Math.min(ARENA_ORDER.length - 1, Math.floor(t / per)), k = (t % per) / per;
    // two arenas cross-scrolling: the one leaving upward, the next rising from below (the whole fall is a scroll of rows)
    const off = Math.round(k * 224 * 0.85), cur = this.shots[idx], nxt = this.shots[Math.min(this.shots.length - 1, idx + 1)];
    for (let y = 0; y < H; y++) { const sy = y + off; const src = sy < H ? cur : nxt, row = sy < H ? sy : sy - H; f.buf.set(src.subarray(row * W, row * W + W), y * W); }
    // motion streaks and a dark vignette closing in
    for (let i = 0; i < 26; i++) { const x = (i * 37 + 11) % 256, y = ((i * 53 + t * 9) % 260) - 20, len = 10 + (i % 5) * 5; for (let j = 0; j < len; j++) if (j % 3 !== 2) f.px(x, y + j, c32(28, 28, 31)); }
    const v = Math.min(1, 0.15 + (t / (per * ARENA_ORDER.length)) * 0.8);
    for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) { const dx = (x - 128) / 128, dy = (y - 112) / 112; if (bayer(x, y) < v * (dx * dx + dy * dy) * 0.55) f.px(x, y, c32(1, 1, 4)); }
    // the label of the arena you pass
    drawTextCentered(f, ['THE SUMMIT', 'THE MIRROR SANCTUM', 'THE THUNDER FORGE', 'THE STARFIELD', 'THE HALL OF HEROES', 'THE CLOUD TERRACE', 'THE GATE OF DAWN'][idx], 128, 30, COL.white, { mono: false });
    // you, falling and turning; the chain snaking up after you
    const sway = Math.round(Math.sin(t * 0.18) * 10);
    for (let i = 0; i < 30; i++) f.rect(128 + sway + Math.round(Math.sin(i * 0.6 + t * 0.3) * 4), 130 - i * 4, 3, 2, i & 1 ? c32(5, 4, 9) : c32(20, 18, 24));
    this.drawPlayer(f, 128 + sway, 170, t % 40 < 20 ? 'hit' : 'tired', 1);
  }

  // 4: the dark
  renderLand(f, t) {
    f.rect(0, 0, 256, 224, c32(1, 0, 3));
    for (let i = 0; i < 20; i++) { const x = (i * 71 + 13) % 256, y = (i * 37) % 200; if ((t + i * 9) % 60 < 3) f.px(x, y, c32(8, 4, 12)); }
    // red glints far off in the dark
    for (const [x, y] of [[40, 60], [44, 60], [210, 80], [214, 80], [128, 30], [132, 30]]) if (((t >> 4) + x) % 5 !== 0) f.rect(x, y, 3, 2, c32(28, 3, 3));
    // the last of the light on the canvas where you landed
    const cx = 128, cy = 190, a = Math.max(0, 1 - t / 200);
    for (let y = -24; y <= 24; y++) for (let x = -50; x <= 50; x++) if ((x * x) / 2500 + (y * y) / 576 < 1 && bayer(cx + x, cy + y) < 0.5 * a + 0.1) f.px(cx + x, cy + y, c32(10, 8, 14));
    this.drawPlayer(f, 128, 200, t < 60 ? 'hit' : t < 140 ? 'down' : 'getup', 1);
  }

  drawPlayer(f, x, y, pose, s) {
    try { f.blit(this.player.bank.get(pose), x, y, this.player.pal, s === 1 ? {} : { scale: s }); } catch (e) { f.blit(this.player.bank.get('idle1'), x, y, this.player.pal); }
  }

  renderText(f) {
    const [, who, text] = this.lines[this.line];
    const S = who === 'coach' ? { ...this.coach, col: COL.orange } : { ...this.dash, name: 'DASH MADDOX', col: c32(4, 24, 22), portrait: this.dash.face };
    panel(f, 6, 150, 244, 68);
    if (who === 'coach') {
      f.rect(10, 153, 66, 62, COL.white); f.rect(11, 154, 64, 60, BOX);
      f.blit(S.portrait, 11, 154, S.pal);
    }
    const tx = who === 'coach' ? 82 : 14;
    drawLabel(f, S.name, tx, 156, 160, S.col, { mono: false, where: 'talk name' });
    let n = Math.floor(this.lineT * 1.5);
    drawTyped(f, text, tx, 168, who === 'coach' ? 160 : 228, 5, n, COL.white, { lineH: 9, where: 'fall talk' });
    if (talkReady(this, text, who === 'coach' ? 160 : 228) && (this.t >> 4) & 1) drawText(f, '>', 238, 208, COL.grey, { mono: false });
  }
}
void drawTextBig;
