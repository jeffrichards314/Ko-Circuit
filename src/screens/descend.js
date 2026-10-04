// The Underworld's cutscenes (spec §18 A4): the Ferryman.
//   DescendScreen  the first time you're in the dark (after The Fall): you lie on a landing stage at the edge of
//                  a black river. A lantern comes across the water in a boat: the Ferryman, a hooded figure who speaks in
//                  riddles. He is your cornerman down here (your trainer can't follow): one life, and his tips
//                  are shorter than a trainer's. Then the Underworld map.
//   FerryScreen    the ride between circuits (where the trainer's jog was): the Ferryman poles you across the black
//                  water to the next shore, and says a line or two about it. Then the training camp, if one is waiting.
// args: DescendScreen { }   FerryScreen { from, to }

import { drawTyped, drawLabel, drawBlock, linesOf, talkTick, talkReady } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { playerSprites } from '../engine/spriteCache.js';
import { playerPortrait } from '../../data/sprites/portraits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { frontPalette, hairStyleOf, costumeIdOf, playerPalettes } from '../../data/customization.js';
import { CIRCUITS, SHORT, zoneOf } from '../../data/circuits.js';

const BOX = c32(3, 4, 9);
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const SKY = [c32(1, 2, 4), c32(2, 4, 8), c32(4, 7, 12), c32(7, 11, 17), c32(10, 15, 20)];
const WATER = c32(1, 3, 7), WATER_HI = c32(6, 11, 18), FOG = c32(9, 14, 19), FOG_HI = c32(14, 20, 25);
const LAMP = c32(28, 20, 6), LAMP_DK = c32(18, 10, 3), SOUL = c32(10, 27, 25), HILL = c32(1, 1, 3);
const PLANK = c32(6, 5, 5), PLANK_HI = c32(11, 9, 8), PLANK_DK = c32(2, 2, 3), POST = c32(7, 5, 4);
const CLOAK = c32(8, 11, 16), CLOAK_HI = c32(15, 19, 24), WOOD = c32(12, 8, 4);

// the river at night: banded sky, a far shore with lanterns, fog resting on the water, ripples
function drawRiver(f, t, scroll = 0) {
  SKY.forEach((col, i) => f.rect(0, i * 26, 256, 26, col));
  for (let i = 1; i < SKY.length; i++) for (let y = i * 26 - 5; y < i * 26; y++) for (let x = (y & 1); x < 256; x += 2) f.px(x, y, SKY[i - 1]);
  // the far shore
  for (let x = 0; x < 256; x++) { const X = x + scroll * 0.3, hgt = 96 + Math.round(Math.sin(X * 0.03) * 8 + Math.sin(X * 0.09) * 4); f.rect(x, hgt, 1, 126 - hgt, HILL); }
  for (let i = 0; i < 9; i++) { const x = ((i * 61 - scroll * 0.3) % 300 + 300) % 300 - 20; if (x > 0 && x < 256) { f.px(Math.round(x), 112 + (i % 3) * 3, (t >> 4) % 5 === i % 5 ? LAMP_DK : LAMP); f.px(Math.round(x), 113 + (i % 3) * 3, LAMP_DK); } }
  // the water
  f.rect(0, 126, 256, 98, WATER);
  for (let y = 130; y < 224; y += 4) for (let x = ((y * 7) % 13) - ((scroll * (0.4 + (y - 126) / 150)) % 13); x < 256; x += 13) f.rect(Math.round(x), y, 3 + (y & 3), 1, WATER_HI);
  for (let y = 124; y < 150; y++) for (let x = 0; x < 256; x++) { const n = Math.sin((x + t * 0.3 + scroll) * 0.04 + y * 0.2) * 0.5 + 0.5; if (bayer(x, y) < (1 - (y - 124) / 26) * 0.55 * n) f.px(x, y, (x + y) & 3 ? FOG : FOG_HI); }
}

// the Void's own sea: black, a few pale points, fragments drifting by, thin white glints where a horizon would be
function drawVoidSea(f, t, scroll = 0) {
  f.rect(0, 0, 256, 224, c32(0, 0, 1));
  for (let y = 0; y < 126; y += 3) for (let x = (y * 7) % 11; x < 256; x += 11) if (((x * 3 + y) >> 1) % 5 === 0) f.px(x, y, c32(14, 14, 20));
  f.rect(0, 126, 256, 1, c32(7, 7, 12));
  for (let y = 132; y < 224; y += 5) for (let x = ((y * 7) % 19) - ((scroll * (0.3 + (y - 126) / 200)) % 19); x < 256; x += 19) f.rect(Math.round(x), y, 4 + (y & 3), 1, c32(11, 11, 17));
  for (let i = 0; i < 9; i++) { const x = ((i * 57 - scroll * (0.2 + i * 0.03)) % 300 + 300) % 300 - 22, y = 30 + (i * 37) % 140; f.rect(Math.round(x), y + Math.round(Math.sin((t + i * 40) / 50) * 3), 5 + (i % 4) * 3, 2 + (i & 1), i & 1 ? c32(20, 20, 26) : c32(10, 10, 16)); }
}

// a hooded figure in a boat's stern with a pole: (x, y) is the middle of the boat's deck
export function drawFerryman(f, x, y, t, pole = 0) {
  // the pole
  const tip = Math.sin(t * 0.05) * 3 + pole;
  for (let i = 0; i < 70; i++) f.px(Math.round(x + 14 + i * 0.16 + tip * i / 70), y - 62 + i, i & 1 ? WOOD : c32(6, 3, 2));
  // cloak and hood
  for (let j = 0; j < 46; j++) { const w = Math.round(9 + j * 0.28 + (j > 40 ? 3 : 0)); f.rect(x - w, y - 50 + j, w * 2, 1, j < 3 ? CLOAK_HI : CLOAK); f.px(x - w, y - 50 + j, CLOAK_HI); }
  for (let j = -8; j <= 4; j++) { const w = Math.round(Math.sqrt(Math.max(0, 1 - (j / 8.6) ** 2)) * 8.4); f.rect(x - w, y - 60 + j, w * 2, 1, j < -4 ? CLOAK_HI : CLOAK); }
  f.rect(x - 4, y - 58, 8, 6, c32(1, 1, 3)); // the dark of the hood
  f.px(x - 2, y - 56, SOUL); f.px(x + 2, y - 56, SOUL); // two cold points
  f.rect(x - 1, y - 50 + 5, 3, 2, c32(15, 17, 18)); // a hand
}
// the boat: a low black hull, a lantern on a post at the bow with a pool of light under it
export function drawBoat(f, x, y, t, lit = true) {
  for (let j = 0; j < 9; j++) { const w = 46 - j * 2 + (j === 0 ? 4 : 0); f.rect(x - w, y + j, w * 2, 1, j < 2 ? c32(17, 14, 12) : j < 6 ? c32(9, 7, 6) : c32(4, 3, 4)); }
  f.rect(x - 50, y - 3, 6, 4, c32(17, 14, 12)); f.rect(x + 44, y - 3, 6, 4, c32(17, 14, 12));
  // the lantern
  const lx = x - 40, ly = y - 26;
  f.rect(lx, ly, 2, 26, POST);
  f.rect(lx - 4, ly - 12, 10, 12, c32(3, 3, 5)); f.rect(lx - 3, ly - 11, 8, 10, lit ? (t >> 3) % 7 === 3 ? LAMP_DK : LAMP : LAMP_DK); f.rect(lx - 1, ly - 9, 4, 6, c32(31, 29, 14));
  if (lit) for (let j = 0; j < 30; j++) for (let i = -34; i <= 34; i++) { const d = (i * i) / 1156 + (j * j) / 900; if (d < 1 && bayer(lx + i, y + 12 + j) < (1 - d) * 0.35) f.px(lx + i, y + 12 + j, LAMP_DK); }
}
export function drawPlayer(f, bank, pal, x, y, pose) {
  try { f.blit(bank.get(pose), x, y, pal); } catch (e) { f.blit(bank.get('idle1'), x, y, pal); }
}

export class Dialogue {
  constructor(game) {
    const p = game.profile, fp = frontPalette(p);
    this.you = { portrait: playerPortrait(fp, hairStyleOf(p)), pal: fp.u32, name: p.name, col: COL.green };
    const tp = trainerPortrait('ferryman');
    this.ferry = { portrait: tp.sprite, pal: tp.pal, name: 'THE FERRYMAN', col: c32(10, 26, 25) };
    this.line = 0; this.lineT = 0;
  }
  // the box: the speaker's portrait on the left (the Ferryman) or the right (you)
  render(f, t, lines) {
    const [who, text] = lines[Math.min(this.line, lines.length - 1)];
    const S = who === 'you' ? this.you : this.ferry, left = who !== 'you';
    panel(f, 6, 150, 244, 68);
    const px = left ? 10 : 180;
    f.rect(px, 153, 66, 62, COL.white); f.rect(px + 1, 154, 64, 60, BOX);
    f.blit(S.portrait, px + 1, 154, S.pal);
    const tx = left ? 82 : 12;
    drawLabel(f, S.name, tx, 156, 160, S.col, { mono: false, where: 'talk name' });
    let n = Math.floor(this.lineT * 1.5);
    drawTyped(f, text, tx, 168, 160, 5, n, COL.white, { lineH: 9, where: 'descend talk' });
    if (talkReady(this, text, 160) && (t >> 4) & 1) drawText(f, this.line + 1 < lines.length ? '>' : 'GO', left ? 238 - (this.line + 1 < lines.length ? 0 : 12) : 164, 208, COL.grey, { mono: false });
  }
}

// ---------------------------------------------------------------------------------------------------------
export class DescendScreen {
  constructor(game) {
    this.g = game;
    this.t = 0;
    this.D = new Dialogue(game);
    const p = game.profile;
    this.bank = playerSprites(hairStyleOf(p), costumeIdOf(p));
    this.pal = playerPalettes(p).default.u32;
    this.lines = [
      ['ferry', 'YOU FELL. THEY ALL FALL. FEW ARRIVE WITH THEIR BELT.'],
      ['ferry', 'NO TRAINER COMES DOWN THIS RIVER. NOBODY COMES DOWN IT WHO HAS SOMEONE TO CALL.'],
      ['you', 'WHO ARE YOU?'],
      ['ferry', 'THE ONE WHO CARRIES. I CARRY YOU TO THE FIRST SHORE, AND THE NEXT.'],
      ['ferry', 'I AM YOUR CORNER NOW. MY WORDS ARE FEW. THE DEAD DO NOT WASTE THEM.'],
      ['ferry', 'ONE LIFE. THE RIVER LENDS ONLY ONE. WHEN IT IS SPENT, YOU BEGIN AGAIN AT THE SHORE.'],
      ['ferry', 'DOWN. ALWAYS DOWN. THE KING WAITS AT THE BOTTOM, AND HE HAS YOUR FRIEND.'],
    ];
    this.textAt = 420;
  }
  enter() { this.g.audio.play(this.g.songs.ferrymanTheme || this.g.songs.ascend); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, D = this.D;
    if (this.t === 4) A.sfx('rumble');
    if (this.t === 150) A.sfx('thud');
    if (this.t === 320) A.sfx('oarDip');
    if (this.t === this.textAt - 40) A.sfx('bellToll');
    if (this.t < this.textAt) { if (this.t > 40 && (I.confirm() || I.pressed('star'))) this.t = this.textAt; return; }
    if (talkTick(D, this.lines[D.line][1], 160, I.confirm() || I.pressed('star'))) {
      A.sfx('menu'); D.line++; D.lineT = 0;
      if (D.line >= this.lines.length) this.leave();
    }
  }
  leave() {
    const c = this.g.career;
    if (c) { c.flags.underworldSeen = true; this.g.saveCareer(); }
    this.g.go('map');
  }
  render(f) {
    const t = this.t;
    drawRiver(f, t, t * 0.3);
    // the landing stage: planks in the foreground, a post with a chain
    f.rect(0, 196, 256, 28, PLANK); f.rect(0, 196, 256, 2, PLANK_HI);
    for (let x = 0; x < 256; x += 22) f.rect(x, 198, 1, 26, PLANK_DK);
    for (let y = 204; y < 224; y += 9) for (let x = (y * 3) % 22; x < 256; x += 44) f.rect(x, y, 22, 1, PLANK_DK);
    f.rect(214, 150, 6, 50, POST); f.rect(215, 150, 2, 50, c32(13, 10, 8)); f.rect(212, 148, 10, 4, PLANK_DK);
    // you: down where you landed, then up
    const pose = t < 150 ? 'down' : t < 190 ? 'getup' : 'idle1';
    drawPlayer(f, this.bank, this.pal, 84, 214, t < 150 ? pose : pose);
    // the boat glides in from the right: the lantern first, out of the fog
    if (t > 190) {
      const k = Math.min(1, (t - 190) / 220), bx = 330 - k * 190, by = 172;
      drawBoat(f, Math.round(bx), by, t);
      drawFerryman(f, Math.round(bx) + 22, by + 4, t, k < 1 ? 5 : 0);
    }
    // the dark closing in on the corners
    for (let y = 0; y < 224; y += 2) for (let x = 0; x < 256; x += 2) { const dx = (x - 128) / 128, dy = (y - 112) / 112, d = dx * dx + dy * dy; if (bayer(x, y) < Math.max(0, d - 0.55) * 0.9) f.px(x, y, c32(1, 1, 3)); }
    if (t < 150) drawTextCentered(f, 'THE DARK.', 128, 8, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
    else if (t < this.textAt) drawTextCentered(f, t > 260 ? 'A LANTERN, ON THE WATER...' : 'YOU GET UP.', 128, 8, (t >> 4) & 1 ? COL.yellow : COL.white, { mono: false });
    if (this.t >= this.textAt) this.D.render(f, t, this.lines.map(([w, x]) => [w, x]));
  }
}

// ---------------------------------------------------------------------------------------------------------
import { FERRY_TALK as TALK } from '../../data/cutscenes/talk.js';

export class FerryScreen {
  constructor(game, { from, to }) {
    this.g = game; this.to = to; this.from = from;
    this.t = 0;
    this.D = new Dialogue(game);
    const p = game.profile;
    this.bank = playerSprites(hairStyleOf(p), costumeIdOf(p));
    this.pal = playerPalettes(p).default.u32;
    const key = from === to || !TALK[to] ? 'done' : to;
    this.lines = (TALK[key] || TALK.u4).map((x) => ['ferry', x]);
  }
  enter() { this.g.audio.play(this.g.songs.ferrymanTheme || this.g.songs.map); this.g.audio.sfx('oarDip'); }
  leave() { this.g.go('map'); } // (no training session is offered on the way any more: the Home gym's TRAINING station is where it is)
  update() {
    this.t++;
    const I = this.g.input, D = this.D;
    if (this.t % 90 === 30) this.g.audio.sfx('oarDip');
    // (the ferry talks on by itself, but only after a line has fully shown and been given a moment to read)
    if (talkTick(D, this.lines[D.line][1], 160, I.confirm() || I.pressed('star'), { auto: true })) { D.line++; D.lineT = 0; this.g.audio.sfx('menu'); if (D.line >= this.lines.length) this.leave(); }
  }
  render(f) {
    const t = this.t;
    if (zoneOf(this.to) === 'void') drawVoidSea(f, t, t * 1.2); else drawRiver(f, t, t * 1.2);
    // the boat, riding the swell, and you and the Ferryman in it
    const by = 172 + Math.round(Math.sin(t * 0.05) * 2);
    drawBoat(f, 116, by, t);
    drawPlayer(f, this.bank, this.pal, 104, by + 2, 'idle1');
    drawFerryman(f, 144, by + 4, t, Math.sin(t * 0.04) * 6);
    // wake
    for (let i = 0; i < 6; i++) { const x = 60 - i * 8 - ((t * 0.5) % 8), y = by + 12 + (i & 1); f.rect(Math.round(x), y, 8, 1, WATER_HI); }
    for (let y = 0; y < 224; y += 2) for (let x = 0; x < 256; x += 2) { const dx = (x - 128) / 128, dy = (y - 112) / 112, d = dx * dx + dy * dy; if (bayer(x, y) < Math.max(0, d - 0.6) * 0.8) f.px(x, y, c32(1, 1, 3)); }
    // the line, up in the sky so it never covers the water
    const txt = this.lines[Math.min(this.D.line, this.lines.length - 1)][1], n = Math.min(4, linesOf(txt, 226));
    panel(f, 8, 6, 240, 18 + n * 10);
    drawText(f, 'THE FERRYMAN:', 14, 10, c32(10, 26, 25), { mono: false });
    drawBlock(f, txt, 14, 21, 226, 4, COL.white, { where: 'ferry line' });
    drawText(f, this.to === this.from || !CIRCUITS[this.to] ? 'THE RIVER GOES ON' : `ON THE WAY TO ${SHORT[this.to] || 'THE NEXT SHORE'}`, 8, 212, COL.white, { mono: false });
    if ((t >> 4) & 1) drawText(f, '>', 240, 10, COL.yellow, { mono: false });
  }
}
