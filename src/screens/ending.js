// The endings (§5).
//   kind 'main'  "UNDISPUTED", after Jax Crane. A spotlight and the words, then
//                the roll call: every fighter you beat on the way up, circuit by
//                circuit, scrolling past with their portrait and their last
//                words to you (hold A to hurry it). THE END... and a hint that
//                it isn't: the Nightmare Circuit is open.
//   kind 'interim'  (was 'true') the INTERIM ENDING, after the first ZERO (spec §18 A2).
//                The silent white void: ZERO cracks and SHATTERS, the pieces scatter,
//                you turn gold where you stand, and the champions whose signatures he
//                stole come back one by one, each in the colour he borrowed from them
//                (read from ZERO's data). THE LAST CHAMPION... for now: the shards are
//                still out there, and the sky is either open or sealed (the medal gate).
//                The gold player is yours. It is not the end: the true ending (Phase E)
//                comes after the Ascension.
// Both end on PUSH START and go back to the circuit map.

import { drawLabelCentered, drawBlock } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS, MAIN_PATH } from '../../data/circuits.js';
import { PORTRAITS, playerPortrait } from '../../data/sprites/portraits.js';
import { SIGNATURES } from '../../data/fighters/zero.js';
import { cutShards, drawShards, drawCracks } from './shards.js';
import { pantheonGate } from '../save/unlocks.js';
import { fighterSprites, playerSprites, paletteFor } from '../engine/spriteCache.js';
import { frontPalette, hairStyleOf, costumeIdOf, nicknameOf, trainerOf, playerPalettes } from '../../data/customization.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]; // 4x4 Bayer, for dissolves
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;

// Draw a sprite, keeping only the pixels whose dither threshold is under k
// (k = 1: all of it, k = 0: none): a pixel-by-pixel dissolve.
function blitDissolve(frame, s, x, y, pal, k) {
  const ox = Math.round(x) - s.ax, oy = Math.round(y) - s.ay;
  for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
    const v = s.data[j * s.w + i];
    if (!v) continue;
    const X = ox + i, Y = oy + j;
    if (bayer(X, Y) < k) frame.px(X, Y, pal[v]);
  }
}

export class EndingScreen {
  constructor(game, { kind = 'main' } = {}) {
    this.g = game;
    this.kind = kind === 'true' ? 'interim' : kind;
    kind = this.kind;
    this.t = 0;
    const p = game.profile;
    this.p = p;
    const fp = frontPalette(p);
    this.portrait = playerPortrait(fp, hairStyleOf(p));
    this.portraitPal = fp.u32;
    this.trainer = trainerOf(p);
    this.name = `${p.name} "${nicknameOf(p)}"`;
    if (kind === 'main') this.buildRollCall();
    else this.buildInterim();
  }

  enter() { this.g.audio.play(this.g.songs[this.kind === 'main' ? 'endingMain' : 'endingTrue']); }

  // --- UNDISPUTED ---------------------------------------------------------------
  buildRollCall() {
    const f = (this.g.career && this.g.career.flags) || {};
    const road = [];
    for (const id of MAIN_PATH) {
      road.push(id);
      if (id === 'major' && f.carnivalCleared) road.push('carnival');
      if (id === 'legends' && f.undergroundCleared) road.push('underground');
    }
    // one row per fighter, a header per circuit
    this.rows = [];
    for (const cid of road) {
      this.rows.push({ head: CIRCUITS[cid].name });
      for (const id of CIRCUITS[cid].fighters) {
        const d = FIGHTERS[id];
        const line = (d.lines && d.lines.lose) || (d.card && d.card.quote) || '...';
        this.rows.push({ id, name: d.name, line });
      }
    }
    this.rows.push({ gap: 40 }, { credit: 'STARRING', value: this.name }, { credit: 'IN YOUR CORNER', value: this.trainer.name }, { gap: 60 });
    let y = 0;
    for (const r of this.rows) { r.y = y; y += r.head ? 22 : r.credit ? 30 : r.gap || 72; }
    this.rollH = y;
    this.rollT0 = 330;
    this.scroll = 0;
    this.portraits = new Map();
  }

  portraitOf(id) {
    if (!this.portraits.has(id)) {
      const d = FIGHTERS[id], pal = paletteFor(d.palette);
      this.portraits.set(id, { s: (PORTRAITS[id] || PORTRAITS.barney)(pal), pal: pal.u32 });
    }
    return this.portraits.get(id);
  }

  // --- BACK TO ZERO: the interim ending -------------------------------------------
  buildInterim() {
    this.zero = fighterSprites('zero');
    this.zeroPal = paletteFor('zero').u32;
    this.cut = cutShards(this.zero.get('idle1'), 15, 11);
    this.gate = pantheonGate(this.g.medals || { got: {} }, this.g.career);
    this.pl = playerSprites(hairStyleOf(this.p), costumeIdOf(this.p));
    const pp = playerPalettes(this.p);
    this.plPal = pp.default.u32; this.goldPal = pp.gold.u32;
    this.champs = SIGNATURES.map((s) => ({ name: s.champ.name, move: s.champ.moves[s.move].name, col: c32(...s.color) }));
  }

  update() {
    this.t++;
    const I = this.g.input;
    if (this.kind === 'interim') {
      if (this.t === CRACK_AT + 2) this.g.audio.sfx('glass');
      if (this.t === SHATTER_AT) { this.g.audio.sfx('shatter'); this.g.audio.sfx('crash'); }
    }
    if (this.kind === 'main' && this.t > this.rollT0) {
      const fast = I.held('a') || I.held('b'); // (START is the skip button: hold it and the credits end, spec §19)
      this.scroll = Math.min(this.rollH + 224, this.scroll + (fast ? 3 : 0.6));
    }
    if (this.done() && this.t > this.doneAt + 60 && (I.confirm() || I.pressed('star'))) { this.g.audio.sfx('confirm'); this.leave(); }
    if (this.done() && !this.doneAt) this.doneAt = this.t;
  }

  // on to the map; after the credits of the main ending, by way of the invitation to the Nightmare (spec §19 G2)
  leave() {
    const c = this.g.career;
    if (this.kind === 'main' && c && !(c.flags.invited && c.flags.invited.nightmare)) { c.flags.invited = c.flags.invited || {}; c.flags.invited.nightmare = true; this.g.saveCareer(); this.g.go('cutscene', { id: 'invite.nightmare', params: { circuit: 'nightmare' }, then: ['map', {}] }); }
    else this.g.go('map');
  }

  done() {
    if (this.kind === 'main') return this.scroll >= this.rollH + 224;
    return this.t > END_AT;
  }

  // a little camera shake as the cracks spread and at the break
  shake() {
    if (this.kind !== 'interim') return [0, 0];
    const t = this.t;
    const k = t > CRACK_AT && t < SHATTER_AT ? Math.min(2, 1 + (t - CRACK_AT) / 50) : t >= SHATTER_AT && t < SHATTER_AT + 16 ? 3 : 0;
    return k ? [(t * 7) % 3 === 0 ? k : -k, (t * 5) % 3 === 0 ? 1 : -1] : [0, 0];
  }

  render(f) {
    if (this.kind === 'main') this.renderMain(f);
    else this.renderInterim(f);
  }

  renderMain(f) {
    const t = this.t;
    f.clear(COL.black);
    // the spotlight
    const cone = [c32(3, 4, 8), c32(5, 6, 12), c32(8, 9, 16)];
    cone.forEach((col, i) => { for (let y = 0; y < 224; y++) { const w = 30 + y * (0.45 - i * 0.12); f.rect(128 - w, y, w * 2, 1, col); } });
    if (t < this.rollT0 + 40) {
      const lines = [[20, 'SIXTY FIGHTS. SIXTY WINS.'], [80, 'THEN YOU.'], [150, this.name], [210, 'UNDISPUTED CHAMPION']];
      lines.forEach(([at, s], i) => { if (t > at) drawTextCentered(f, s, 128, 132 + i * 14, i === 3 ? ((t >> 3) & 1 ? COL.yellow : COL.orange) : i === 2 ? COL.white : COL.cyan, { mono: false }); });
      if (t > 150) { f.rect(93, 40, 70, 66, COL.white); f.rect(95, 42, 66, 62, c32(9, 24, 12)); f.blit(this.portrait, 96, 44, this.portraitPal); }
      if (t > 210) drawTextBig(f, 'OF THE WORLD', 128, 196, COL.yellow, COL.black, 2);
      if (t >= this.rollT0) f.rect(0, 0, 256, Math.round((t - this.rollT0) * 5.6), COL.black); // wipe to the roll call
      return;
    }
    f.clear(COL.black);
    // the roll call
    const y0 = 224 - this.scroll;
    for (const r of this.rows) {
      const y = Math.round(y0 + r.y);
      if (y > 224 || y < -80) continue;
      if (r.head) { drawTextCentered(f, r.head, 128, y + 6, COL.orange); continue; }
      if (r.credit) { drawTextCentered(f, r.credit, 128, y, COL.cyan, { mono: false }); drawTextCentered(f, r.value, 128, y + 12, COL.white, { mono: false }); continue; }
      if (!r.id) continue;
      const P = this.portraitOf(r.id);
      f.rect(15, y, 70, 66, COL.white); f.rect(17, y + 2, 66, 62, c32(11, 22, 27));
      f.blit(P.s, 18, y + 4, P.pal);
      drawText(f, r.name, 94, y + 6, COL.yellow, { mono: false });
      drawBlock(f, `"${r.line}"`, 94, y + 20, 150, 4, COL.white, { where: 'ending line' });
    }
    // THE END... ?
    const left = this.rollH + 224 - this.scroll;
    if (left < 140) {
      const k = Math.min(1, (140 - left) / 60);
      drawTextBig(f, 'THE END', 128, 84, k < 1 ? COL.grey : COL.white, COL.black, 3);
      if (this.doneAt && this.t > this.doneAt + 90) {
        drawTextCentered(f, '...OR IS IT?', 128, 124, COL.pink, { mono: false });
        drawTextCentered(f, 'SOME FIGHTERS ONLY COME OUT', 128, 138, COL.grey, { mono: false });
        drawTextCentered(f, 'AFTER DARK.', 128, 148, COL.grey, { mono: false });
        drawTextCentered(f, 'NIGHTMARE CIRCUIT UNLOCKED', 128, 164, (this.t >> 3) & 1 ? COL.yellow : COL.orange, { mono: false });
      }
      if (this.doneAt && this.t > this.doneAt + 60 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 204, COL.grey);
    }
  }

  renderInterim(f) {
    const t = this.t;
    // the white void, a horizon
    const W = [c32(31, 31, 31), c32(29, 29, 30), c32(27, 27, 29), c32(25, 25, 27)];
    for (let y = 0; y < 224; y++) f.rect(0, y, 256, 1, W[Math.min(3, Math.floor(y / 30))]);
    f.rect(0, 118, 256, 1, c32(21, 21, 24));
    // ZERO: standing there, cracking, then coming apart into shards that scatter
    const pose = this.zero.get('idle1');
    if (t < SHATTER_AT) {
      f.blit(pose, 128, 176, this.zeroPal);
      if (t > CRACK_AT) {
        const k = Math.min(1, (t - CRACK_AT) / 90);
        drawCracks(f, 128, 128, k, COL.white, 5, 9, 60);
        drawCracks(f, 128, 128, k, c32(24, 25, 31), 9, 5, 34);
      }
    } else {
      const age = t - SHATTER_AT;
      drawShards(f, this.cut, 128, 176, this.zeroPal, age, { fade: Math.max(0, Math.min(1, (age - 200) / 120)), ordered: bayer });
      if (age < 5) f.rect(0, 0, 256, 224, c32(31, 31, 31)); // the flash
      // the void takes a breath: motes where the pieces went
      if (age > 4 && age < 160) for (let i = 0; i < 16; i++) {
        const a = i * 2.4 + age * 0.015, r = age * 0.6 + (i % 5) * 5;
        f.px(Math.round(128 + Math.cos(a) * r), Math.round(130 - age * 0.18 - (i % 7) * 5 + Math.sin(a) * r * 0.45), c32(8, 8, 11));
      }
    }
    // you, from behind, arms up: turning gold
    if (t > GOLD_AT - 90) {
      const p = this.pl.get(t > GOLD_AT - 20 ? 'victory' : 'idle1');
      f.blit(p, 128, 222, this.plPal);
      const gk = Math.max(0, Math.min(1, (t - GOLD_AT) / 140));
      if (gk > 0) blitDissolve(f, p, 128, 222, this.goldPal, gk);
      if (gk > 0 && gk < 1) for (let i = 0; i < 10; i++) { const x = 100 + ((i * 37 + t * 3) % 56), y = 150 + ((i * 53 + t * 2) % 70); f.px(x, y, COL.yellow); }
    }
    // lines
    const say = [[SHATTER_AT + 70, 'ZERO.'], [SHATTER_AT + 120, 'NOTHING LEFT TO BEAT?']];
    if (t < LIST_AT - 20) say.forEach(([at, s], i) => { if (t > at) drawTextCentered(f, s, 128, 20 + i * 14, COL.dark, { mono: false }); });
    // the champions come back, one by one, in the colours he stole
    if (t > LIST_AT && t <= LAST_AT + 200) {
      const n = Math.min(this.champs.length, Math.floor((t - LIST_AT) / 30) + 1);
      panel(f, 8, 8, 240, 78);
      drawTextCentered(f, 'THE CHAMPIONS YOU BEAT', 128, 12, COL.white, { mono: false });
      for (let i = 0; i < n; i++) {
        const c = this.champs[i], x = i < 5 ? 10 : 132, y = 26 + (i % 5) * 11;
        f.rect(x, y + 1, 5, 5, c.col);
        drawText(f, c.name, x + 8, y, i === n - 1 && t - LIST_AT - (n - 1) * 30 < 12 ? COL.white : COL.off, { mono: false });
      }
    }
    // (the champion's card and the gold line give way when the sky's own box comes up over them)
    const skyBox = t > SKY_AT + 190;
    if (t > LAST_AT && !skyBox) {
      panel(f, 24, 104, 208, 44);
      drawTextBig(f, 'THE LAST CHAMPION', 128, 108, (t >> 3) & 1 ? COL.yellow : COL.orange, COL.black, 1);
      drawLabelCentered(f, this.name, 128, 124, 200, COL.white, { mono: false, where: 'ending name' });
      if (t > LAST_AT + 70) drawTextCentered(f, '...FOR NOW.', 128, 136, COL.grey, { mono: false });
    }
    if (t > GOLD_SAYS_AT && !skyBox) {
      const s = 'YOU FIGHT IN GOLD NOW';
      panel(f, 128 - ((textWidth(s, false) + 12) >> 1), 154, textWidth(s, false) + 12, 12);
      drawTextCentered(f, s, 128, 156, COL.yellow, { mono: false });
    }
    // the last word: the shards are still out there, and one of them is lit
    if (t > SKY_AT) this.renderSky(f, t - SKY_AT);
    if (this.done() && this.doneAt && t > this.doneAt + 60 && (t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 212, COL.dark);
  }

  // the hint: the sky over the void, a lit shard, a pillar of gold light with steps in it
  renderSky(f, k) {
    const dim = Math.min(1, k / 70);
    for (let y = 0; y < 224; y++) for (let x = (y & 1); x < 256; x += 2) if (bayer(x, y) < dim * 0.9) f.px(x, y, c32(2, 2, 6));
    const cx = 172;
    // a shard, glowing gold, drifting; the pillar of light and the steps that light up in it
    const gy = 40 + Math.round(Math.sin(k * 0.05) * 3);
    if (k > 40) {
      const glow = (k >> 2) & 1 ? c32(31, 28, 10) : c32(31, 22, 4);
      for (let i = -5; i <= 5; i++) f.rect(cx - 3 + (Math.abs(i) >> 1), gy + i, 7 - Math.abs(i), 1, i < 0 ? c32(31, 31, 24) : glow);
      f.rect(cx - 1, gy - 1, 3, 3, c32(31, 31, 31));
      const h = Math.min(120, (k - 60) * 1.4);
      if (k > 60) for (let y = 0; y < h; y++) { const w = 2 + (y >> 3); f.rect(cx - w, gy + 6 + y, w * 2, 1, y & 1 ? c32(28, 24, 8) : c32(31, 29, 16)); }
      const steps = Math.min(7, Math.floor(Math.max(0, k - 100) / 12));
      for (let i = 0; i < steps; i++) f.rect(cx - 20 + i * 5, 176 - i * 14, 26 - i * 2, 3, i & 1 ? c32(31, 31, 28) : c32(27, 27, 25));
    }
    if (k > 90) drawTextCentered(f, 'THE SHARDS ARE STILL OUT THERE.', 128, 46, COL.white, { mono: false });
    if (k > 150) drawTextCentered(f, 'ONE OF THEM IS LIT.', 128, 58, COL.grey, { mono: false });
    if (k > 190) {
      panel(f, 20, 132, 216, 46);
      const g = this.gate;
      if (g.open) {
        drawTextCentered(f, 'THE SKY IS OPEN.', 128, 138, (k >> 3) & 1 ? COL.yellow : COL.white, { mono: false });
        drawTextCentered(f, 'THE PANTHEON WAITS ON THE MAP.', 128, 150, COL.cyan, { mono: false });
        drawTextCentered(f, '"ONLY THE UNDEFEATED CLIMB."', 128, 162, COL.grey, { mono: false });
      } else {
        drawTextCentered(f, 'THE HEAVENS ARE SEALED.', 128, 138, COL.pink, { mono: false });
        drawTextCentered(f, `EARN ${g.short} MORE MEDAL${g.short === 1 ? '' : 'S'}.`, 128, 150, COL.yellow, { mono: false });
        drawTextCentered(f, `(${g.have}/${g.need} OF THE BASE GAME'S)`, 128, 162, COL.grey, { mono: false });
      }
    }
    if (k > 230) drawTextBig(f, 'TO BE CONTINUED...', 128, 190, COL.white, COL.black, 1);
  }
}

// the interim ending's beats (frames)
const CRACK_AT = 50, SHATTER_AT = 150, GOLD_AT = 330, LIST_AT = 500, LAST_AT = 900, GOLD_SAYS_AT = 1080, SKY_AT = 1200, END_AT = 1480;
