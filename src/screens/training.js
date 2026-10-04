// Training camp (§7): one drill on the road to every new circuit (after the
// jogging cutscene), and the perks screen (from the circuit map).
//   SPEED BAG   rhythm: hit the bag on the beat, left and right in turn
//   JUMP ROPE   timing: jump as the rope reaches your feet; it keeps speeding up
//   ROAD RUN    mash left/right to run, UP to jump the hydrants and cones
// Each drill has bronze / silver / gold scores. SILVER wins the drill's first perk,
// GOLD its second (data/perks.js). Up to 3 perks are equipped; a new perk is
// equipped automatically while there's room. Perks never change any opponent's
// timing (they only touch hearts, damage, stars and get-ups).

import { drawBlock, drawLabel } from '../engine/textbox.js';
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { ICONS } from '../../data/sprites/ui.js';
import { playerSprites } from '../engine/spriteCache.js';
import { playerPalettes, hairStyleOf, costumeIdOf, trainerOf, cornermanFor } from '../../data/customization.js';
import { zoneOf } from '../../data/circuits.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { jogFrames, ropeFrames } from '../../data/sprites/jog.js';
import { PERKS, PERK, MAX_EQUIPPED } from '../../data/perks.js';
import { drawRoadScene } from './cutscenes.js';
import { DRILL_IDS, DRILL_MEDALS } from '../../data/drills.js';
import { Hits, anyTap } from '../engine/hits.js';

export const DRILLS = {
  bag: {
    name: 'SPEED BAG', unit: 'PTS', medals: DRILL_MEDALS.bag,
    text: 'HIT THE BAG ON THE BEAT, LEFT AND RIGHT IN TURN. PERFECT IS 2 POINTS, GOOD IS 1.',
    help: ['X = RIGHT HAND, Z = LEFT HAND,', 'AS THE RING CLOSES ON THE BAG.'],
  },
  rope: {
    name: 'JUMP ROPE', unit: 'JUMPS', medals: DRILL_MEDALS.rope,
    text: 'JUMP AS THE ROPE REACHES YOUR FEET. IT KEEPS GETTING FASTER. THREE TRIPS AND YOU\'RE DONE.',
    help: ['X, Z OR UP TO JUMP, JUST AS', 'THE ROPE REACHES YOUR FEET.'],
  },
  run: {
    name: 'ROAD RUN', unit: 'M', medals: DRILL_MEDALS.run,
    text: 'THIRTY SECONDS. ALTERNATE LEFT AND RIGHT TO RUN, JUMP THE HYDRANTS AND CONES.',
    help: ['X AND Z IN TURN TO RUN.', 'UP TO JUMP.'],
  },
};
const ORDER = DRILL_IDS;
const MEDALS = ['', 'BRONZE', 'SILVER', 'GOLD'];
const MEDAL_COL = [COL.grey, c32(24, 13, 5), c32(24, 25, 28), c32(31, 25, 6)];
export const medalOf = (game, score) => DRILLS[game].medals.reduce((m, v, i) => (score >= v ? i + 1 : m), 0);
const perksOf = (game) => PERKS.filter((p) => p.game === game); // [silver perk, gold perk]

const BG = c32(4, 5, 10), BG2 = c32(6, 7, 14);
const cursor = (f, x, y, t) => f.blit(ICONS.glove, x + ((t >> 3) & 1), y + 3, UIPAL);

// ---------------------------------------------------------------------------
// SPEED BAG
// ---------------------------------------------------------------------------
const BAG_PERIODS = [30, 27, 24, 21, 18, 16];
const BAG_BEATS = 48, BAG_PERFECT = 3, BAG_GOOD = 8;
const WOOD = c32(18, 10, 5), WOOD_HI = c32(25, 15, 8), METAL = c32(16, 17, 20), BAG = c32(23, 5, 5), BAG_HI = c32(29, 12, 10), BAG_DK = c32(12, 2, 3), WALL = c32(7, 8, 13), WALL_HI = c32(10, 11, 17);

class SpeedBag {
  constructor(s) {
    this.s = s; this.t = 0; this.score = 0; this.combo = 0; this.best = 0; this.done = false;
    this.times = [];
    let at = 110;
    for (let i = 0; i < BAG_BEATS; i++) { this.times.push(at); at += BAG_PERIODS[Math.floor(i / 8)]; }
    this.judged = new Array(BAG_BEATS).fill(null);
    this.next = 0; this.pose = null; this.poseT = 0; this.swing = 0; this.pop = null;
    this.bank = playerSprites(hairStyleOf(s.g.profile), costumeIdOf(s.g.profile));
    this.pal = playerPalettes(s.g.profile).default.u32;
  }
  judge(i, j) {
    this.judged[i] = j;
    if (j === 'perfect' || j === 'good') { this.score += j === 'perfect' ? 2 : 1; this.combo++; this.best = Math.max(this.best, this.combo); }
    else this.combo = 0;
    this.pop = { text: { perfect: 'PERFECT!', good: 'GOOD', miss: 'MISS', wrong: 'WRONG HAND', early: 'TOO EARLY' }[j], t: 0, ok: j === 'perfect' || j === 'good' };
  }
  update(I, A) {
    this.t++;
    const t = this.t;
    // the count-in, then a tick on every beat
    for (let k = 1; k <= 3; k++) if (t === this.times[0] - k * 30) A.sfx('count');
    if (this.times.includes(t)) A.sfx('tick');
    // (beats already judged are skipped, and a beat that has slipped past its window is a miss right now: `next` moves on at once, so a press
    // made on the very frame of the miss counts for the following beat instead of being judged against the missed one)
    while (this.next < BAG_BEATS && (this.judged[this.next] || t > this.times[this.next] + BAG_GOOD)) {
      if (!this.judged[this.next]) { this.judge(this.next, 'miss'); A.sfx('whiff'); }
      this.next++;
    }
    const hand = I.pressed('a') ? 'a' : I.pressed('b') ? 'b' : null;
    if (hand) {
      this.pose = hand === 'a' ? 'jabR_high' : 'jabL_high'; this.poseT = 10;
      const i = this.next;
      if (i < BAG_BEATS) {
        const d = Math.abs(t - this.times[i]);
        const want = i % 2 ? 'a' : 'b'; // left, right, left, right...
        if (d <= BAG_GOOD) {
          if (hand !== want) { this.judge(i, 'wrong'); A.sfx('whiff'); }
          else { this.judge(i, d <= BAG_PERFECT ? 'perfect' : 'good'); A.sfx(d <= BAG_PERFECT ? 'punchHeavy' : 'punchLand'); this.swing = 16 * (hand === 'a' ? -1 : 1); }
        } else if (this.times[i] - t < 18) { this.judge(i, 'early'); A.sfx('whiff'); } // mashing doesn't work
      }
    }
    if (this.poseT > 0) this.poseT--;
    if (this.swing) this.swing = Math.trunc(this.swing * 0.85);
    if (this.pop) this.pop.t++;
    if (this.next >= BAG_BEATS && t > this.times[BAG_BEATS - 1] + 40) this.done = true;
  }
  render(f) {
    const t = this.t;
    f.clear(WALL);
    for (let y = 0; y < 224; y += 16) f.rect(0, y, 256, 1, WALL_HI);
    for (let x = (t >> 5) % 2 ? 8 : 0; x < 256; x += 32) f.rect(x, 0, 1, 224, WALL_HI);
    // platform, swivel, bag
    f.rect(52, 70, 152, 12, COL.black); f.rect(54, 71, 148, 10, WOOD); f.rect(54, 71, 148, 2, WOOD_HI);
    f.rect(124, 82, 8, 8, METAL);
    const sx = Math.round(this.swing * 0.6), sy = Math.abs(this.swing) > 8 ? -4 : 0;
    for (let y = -17; y <= 17; y++) {
      const w = Math.round(13 * Math.sqrt(1 - (y / 18) ** 2) * (y < -8 ? 0.7 : 1));
      const cx = 128 + Math.round(sx * (y + 18) / 36), cy = 108 + sy + y;
      f.rect(cx - w - 1, cy, w * 2 + 2, 1, COL.black);
      f.rect(cx - w, cy, w * 2, 1, y < -6 ? BAG_HI : y > 8 ? BAG_DK : BAG);
      if (y > -12 && y < 4) f.rect(cx - w + 3, cy, 2, 1, BAG_HI);
    }
    f.rect(126, 88, 4, 4, METAL);
    // the approach ring for the next beat, and which hand
    const i = this.next;
    if (i < BAG_BEATS) {
      const left = this.times[i] - t;
      if (left < 40 && left > -BAG_GOOD) {
        const r = 20 + Math.max(0, left) * 1.3;
        const col = Math.abs(left) <= BAG_PERFECT ? COL.white : COL.yellow;
        for (let a = 0; a < 64; a++) { const th = (a / 64) * Math.PI * 2; f.px(Math.round(128 + Math.cos(th) * r), Math.round(108 + Math.sin(th) * r * 0.9), col); }
        f.rect(128 - 20, 108, 1, 1, COL.white);
      }
      const right = i % 2 === 1;
      drawText(f, right ? 'R' : 'L', right ? 170 : 78, 104, (t >> 2) & 1 ? COL.yellow : COL.orange);
      f.blit(ICONS.glove, right ? 186 : 70, 108, UIPAL, { flip: !right });
    }
    // the player, from behind
    const pose = this.poseT > 0 ? this.pose : ((t / 24) | 0) % 2 ? 'idle2' : 'idle1';
    f.blit(this.bank.get(pose), 128, 226, this.pal);
    // HUD
    panel(f, 6, 6, 244, 20);
    drawText(f, `SCORE ${this.score}`, 12, 12, COL.white);
    drawText(f, `COMBO ${this.combo}`, 110, 12, this.combo >= 8 ? COL.yellow : COL.cyan);
    drawText(f, `${Math.max(0, BAG_BEATS - this.next)}`, 244 - textWidth(`${Math.max(0, BAG_BEATS - this.next)}`), 12, COL.grey);
    if (t < this.times[0]) {
      const k = Math.ceil((this.times[0] - t) / 30);
      drawTextBig(f, k > 3 ? 'READY?' : String(k), 128, 150, COL.yellow, COL.black, 3);
    }
    if (this.pop && this.pop.t < 24) drawTextCentered(f, this.pop.text, 128, 40 - Math.min(6, this.pop.t >> 1), this.pop.ok ? COL.yellow : COL.red);
  }
}

// ---------------------------------------------------------------------------
// JUMP ROPE
// ---------------------------------------------------------------------------
const FLOOR_Y = 184, ROPE_CX = 128, ROPE_RX = 34, ROPE_RY = 56;
const ROPE_CLEAR = 8; // how high your feet must be as the rope passes (a ~16-frame window)
const MAT = c32(9, 14, 22), MAT_HI = c32(12, 19, 28), GYM = c32(13, 9, 8), GYM_HI = c32(17, 12, 10), ROPE = c32(30, 27, 18);

class JumpRope {
  constructor(s) {
    this.s = s; this.t = 0; this.score = 0; this.trips = 0; this.done = false;
    this.theta = -Math.PI / 2; this.h = 0; this.vy = 0; this.stumble = 0; this.limit = 45 * 60; this.start = 100;
    // drawn at 2x natively (not blown up), so the pixels match the rest of the game
    const j = jogFrames(s.g.profile, undefined, 2), r = ropeFrames(s.g.profile, 2);
    this.pal = j.pal;
    this.stand = r.frames[0]; this.air = r.frames[1]; this.trip = j.frames[3];
  }
  period() { return Math.max(22, 48 - 0.45 * this.score); }
  update(I, A) {
    this.t++;
    if (this.t === this.start - 60 || this.t === this.start - 30) A.sfx('count');
    if (this.t === this.start) A.sfx('bell');
    // jumping
    if (this.h > 0 || this.vy) { this.vy += 0.34; this.h -= this.vy; if (this.h <= 0) { this.h = 0; this.vy = 0; } }
    if (this.t < this.start) return;
    if (this.stumble > 0) { if (--this.stumble === 0 && this.trips >= 3) this.done = true; return; }
    if ((I.pressed('a') || I.pressed('up') || I.pressed('b')) && this.h === 0) { this.vy = -3.6; this.h = 0.01; A.sfx('dodge'); }
    // the rope: 0 at the top, PI at your feet
    const before = this.theta;
    this.theta += (Math.PI * 2) / this.period();
    const passed = (a) => Math.floor((a - Math.PI) / (Math.PI * 2));
    if (passed(this.theta) > passed(before)) {
      if (this.h >= ROPE_CLEAR) { this.score++; A.sfx('tick'); }
      else { this.trips++; this.stumble = 50; A.sfx('thud'); A.sfx('tired'); this.theta = -Math.PI / 2; } // (a beat to get set again)
    }
    if (this.t - this.start >= this.limit) this.done = true;
  }
  render(f) {
    const t = this.t;
    f.clear(GYM);
    for (let y = 0; y < FLOOR_Y; y += 12) f.rect(0, y, 256, 1, GYM_HI);
    f.rect(0, FLOOR_Y, 256, 224 - FLOOR_Y, MAT);
    for (let x = 0; x < 256; x += 16) f.rect(x, FLOOR_Y, 1, 224 - FLOOR_Y, MAT_HI);
    // shadow
    const sw = Math.max(6, 18 - Math.round(this.h / 2));
    f.rect(ROPE_CX - sw, FLOOR_Y + 1, sw * 2, 2, COL.black);
    const cy = FLOOR_Y - ROPE_RY - 2;
    const th = this.theta;
    const px = ROPE_CX + Math.round(Math.sin(th) * ROPE_RX), py = cy - Math.round(Math.cos(th) * ROPE_RY);
    const hx = ROPE_CX + 10, hy = FLOOR_Y - 42 - Math.round(this.h); // the hands, low at the hips
    const rope = () => {
      // hands -> the far point of the loop, as a gentle curve
      const mx = (hx + px) / 2 + Math.cos(th) * 10, my = (hy + py) / 2 + Math.sin(th) * 10;
      for (let k = 0; k <= 80; k++) {
        const u = k / 80, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
        f.rect(Math.round(a * hx + b * mx + c * px), Math.round(a * hy + b * my + c * py), 2, 2, ROPE);
      }
    };
    const behind = Math.cos(th) > 0.2; // over the top: the rope is behind him
    if (behind) rope();
    const spr = this.stumble > 0 ? this.trip : this.h > 0 ? this.air : this.stand;
    f.blit(spr, ROPE_CX, FLOOR_Y - Math.round(this.h), this.pal);
    if (!behind) rope();
    // HUD
    panel(f, 6, 6, 244, 20);
    drawText(f, `JUMPS ${this.score}`, 12, 12, COL.white);
    for (let i = 0; i < 3; i++) f.blit(i < 3 - this.trips ? ICONS.heart : ICONS.heartPink, 118 + i * 12, 11, UIPAL);
    const left = Math.max(0, Math.ceil((this.limit - Math.max(0, t - this.start)) / 60));
    drawText(f, `${left}`, 244 - textWidth(`${left}`), 12, left <= 5 ? COL.red : COL.grey);
    if (t < this.start) drawTextBig(f, t < this.start - 60 ? 'READY?' : String(Math.ceil((this.start - t) / 30)), 128, 60, COL.yellow, COL.black, 3);
    if (this.stumble > 0 && (t >> 3) & 1) drawTextCentered(f, 'TRIPPED!', 128, 40, COL.red);
  }
}

// ---------------------------------------------------------------------------
// ROAD RUN
// ---------------------------------------------------------------------------
const RUN_X = 70, RUN_Y = 192, RUN_TIME = 30 * 60, PX_PER_M = 12;
const HYDRANT = c32(26, 5, 5), HYDRANT_HI = c32(31, 13, 11), CONE = c32(30, 14, 3), CONE_HI = c32(31, 26, 22);

class RoadRun {
  constructor(s) {
    this.s = s; this.t = 0; this.done = false;
    this.dist = 0; this.v = 0; this.last = null; this.h = 0; this.vy = 0; this.stumble = 0; this.start = 100;
    const j = jogFrames(s.g.profile);
    this.frames = j.frames; this.pal = j.pal;
    this.obs = []; this.nextAt = 360;
    this.city = s.args.to !== 'minor';
  }
  get score() { return Math.floor(this.dist / PX_PER_M); }
  update(I, A) {
    this.t++;
    if (this.t === this.start - 60 || this.t === this.start - 30) A.sfx('count');
    if (this.t === this.start) A.sfx('bell');
    if (this.h > 0 || this.vy) { this.vy += 0.3; this.h -= this.vy; if (this.h <= 0) { this.h = 0; this.vy = 0; A.sfx('thud'); } }
    if (this.t < this.start) return;
    if (this.t - this.start >= RUN_TIME) { this.done = true; return; }
    if (this.stumble > 0) this.stumble--;
    else {
      const hand = I.pressed('a') ? 'a' : I.pressed('b') ? 'b' : null;
      if (hand) { this.v += hand !== this.last ? 0.32 : 0.08; this.last = hand; }
      if (I.pressed('up') && this.h === 0) { this.vy = -4.4; this.h = 0.01; A.sfx('dodge'); }
    }
    this.v = Math.min(4.4, this.v * 0.986);
    this.dist += this.v;
    // hydrants and cones, spaced out ahead
    while (this.nextAt < this.dist + 300) {
      this.obs.push({ x: this.nextAt, kind: Math.random() < 0.5 ? 'hydrant' : 'cone', hit: false });
      this.nextAt += 150 + Math.floor(Math.random() * 130);
    }
    for (const o of this.obs) {
      const sx = RUN_X + (o.x - this.dist), w = o.kind === 'hydrant' ? 10 : 9, ht = o.kind === 'hydrant' ? 14 : 11;
      if (!o.hit && sx < RUN_X + 6 && sx + w > RUN_X - 6 && this.h < ht) {
        o.hit = true; this.stumble = 36; this.v = 0.4; A.sfx('crash');
      }
    }
    this.obs = this.obs.filter((o) => o.x - this.dist > -80);
  }
  render(f) {
    const t = this.t;
    drawRoadScene(f, this.dist / 2, this.city);
    for (const o of this.obs) {
      const x = Math.round(RUN_X + (o.x - this.dist)), y = RUN_Y;
      if (o.kind === 'hydrant') {
        f.rect(x - 1, y - 15, 12, 16, COL.black);
        f.rect(x, y - 14, 10, 14, HYDRANT); f.rect(x + 1, y - 13, 2, 11, HYDRANT_HI); f.rect(x - 2, y - 10, 14, 3, HYDRANT);
      } else {
        for (let k = 0; k < 11; k++) { const w = 2 + Math.floor(k * 0.7); f.rect(x + 4 - w, y - 11 + k, w * 2 + 1, 1, k === 4 || k === 5 ? CONE_HI : CONE); }
        f.rect(x - 3, y - 1, 15, 2, CONE);
      }
    }
    const frame = this.stumble > 0 ? this.frames[3] : this.h > 0 ? this.frames[1] : this.frames[Math.floor(this.dist / 14) % 4];
    f.blit(frame, RUN_X, RUN_Y - Math.round(this.h) + (this.stumble > 0 ? 2 : 0), this.pal);
    panel(f, 6, 6, 244, 20);
    drawText(f, `${this.score} M`, 12, 12, COL.white);
    drawText(f, 'SPEED', 84, 12, COL.cyan, { mono: false });
    f.rect(128, 12, 70, 7, COL.barBack);
    f.rect(129, 13, Math.round(68 * this.v / 4.4), 5, this.v > 3.6 ? COL.yellow : COL.green);
    const left = Math.max(0, Math.ceil((RUN_TIME - Math.max(0, t - this.start)) / 60));
    drawText(f, `${left}`, 244 - textWidth(`${left}`), 12, left <= 5 ? COL.red : COL.grey);
    if (t < this.start) drawTextBig(f, t < this.start - 60 ? 'READY?' : String(Math.ceil((this.start - t) / 30)), 128, 60, COL.yellow, COL.black, 3);
    if (this.stumble > 0 && (t >> 3) & 1) drawTextCentered(f, 'OOF!', RUN_X + 10, 136, COL.red);
  }
}

export const DRILL_CLASS = { bag: SpeedBag, rope: JumpRope, run: RoadRun }; // (exported for tools/training-sim.mjs)

// ---------------------------------------------------------------------------
// The camp: pick a drill -> how to play -> the drill -> result -> map
// ---------------------------------------------------------------------------
export class TrainingScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.args = args;
    this.c = game.career;
    this.T = this.c.training;
    this.t = 0;
    this.sel = 0;
    this.hits = new Hits();
    this.state = 'pick';
    // (in the Underworld the Ferryman is your cornerman: your own trainer can't follow you down)
    this.trainer = cornermanFor(game.profile, args.to ? zoneOf(args.to) : zoneOf(this.c.circuit));
    this.tp = trainerPortrait(this.trainer.id);
    // a station of the home gym (the speed bag, the rope, the road) goes straight to its own drill and straight back out
    if (args.drill) { this.game = args.drill; this.state = 'howto'; }
  }
  enter() { this.g.audio.play(this.g.songs.training); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    if (this.state === 'pick') {
      const n = ORDER.length + 1;
      this.hits.rows(I, this.sel, (i) => { this.sel = i; A.sfx('menu'); });
      if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; A.sfx('menu'); }
      if (I.pressed('down')) { this.sel = (this.sel + 1) % n; A.sfx('menu'); }
      if (I.confirm() || I.pressed('star')) {
        A.sfx('confirm');
        if (this.sel === ORDER.length) { this.leave(); return; }
        this.game = ORDER[this.sel]; this.state = 'howto'; this.t = 0;
      }
      if (I.pressed('pause')) this.leave();
    } else if (this.state === 'howto') {
      if (this.t > 20 && anyTap(I)) I.fake('a'); // (a tap anywhere is START)
      if (I.pressed('pause') || I.pressed('b')) { if (this.args.drill) { this.leave(); return; } this.state = 'pick'; A.sfx('menu'); return; }
      if (this.t > 20 && (I.confirm() || I.pressed('star'))) {
        A.sfx('confirm');
        this.drill = new DRILL_CLASS[this.game](this);
        this.state = 'play'; this.t = 0;
        if (this.game === 'bag') A.stop(); // the beat is the music
      }
    } else if (this.state === 'play') {
      // PAUSE walks out of a drill: nothing counts, back to the list (the road's session stays waiting until you pick or skip)
      if (I.pressed('pause')) { A.sfx('menu'); A.play(this.g.songs.training); if (this.args.drill) { this.leave(); return; } this.state = 'pick'; this.t = 0; this.drill = null; return; }
      this.drill.update(I, A);
      if (this.drill.done) this.finish();
    } else if (this.state === 'result') {
      // a free session (from the map) goes back to the drills; the road's one drill, on to the map
      if (this.t > 60 && anyTap(I)) I.fake('a');
      if (this.t > 60 && (I.confirm() || I.pressed('star'))) {
        A.sfx('confirm');
        if (this.args.drill) this.g.go('map');
        else if (this.args.free) { this.state = 'pick'; this.t = 0; A.play(this.g.songs.training); } else this.g.go('map');
      }
    }
  }
  // back to the map (skipping the road's drill uses it up; a free session leaves it waiting)
  leave() {
    if (!this.args.free) { this.T.pending = false; this.g.saveCareer(); }
    this.g.go('map');
  }
  finish() {
    const game = this.game, score = this.drill.score, T = this.T;
    const medal = medalOf(game, score);
    const prev = T.best[game] || 0;
    this.newBest = score > prev;
    if (this.newBest) T.best[game] = score;
    this.medal = medal;
    this.won = [];
    perksOf(game).forEach((p, i) => {
      if (medal >= i + 2 && !T.perks.includes(p.id)) {
        T.perks.push(p.id);
        const eq = T.equipped.length < MAX_EQUIPPED;
        if (eq) T.equipped.push(p.id);
        this.won.push({ p, eq });
      }
    });
    if (!this.args.free) T.pending = false; // (a free session from the map leaves a waiting road session alone, as leave() does)
    this.g.saveCareer();
    this.state = 'result'; this.t = 0;
    const A = this.g.audio;
    A.play(medal >= 2 ? this.g.songs.victory : this.g.songs.training);
    if (this.won.length) A.sfx('fanfare');
  }
  render(f) {
    if (this.state === 'play') return this.drill.render(f);
    f.clear(BG);
    for (let y = 0; y < 224; y += 6) f.rect(0, y, 256, 2, BG2);
    drawTextBig(f, 'TRAINING CAMP', 128, 6, COL.yellow, COL.black, 2);
    if (this.state === 'pick') this.renderPick(f);
    else if (this.state === 'howto') this.renderHowto(f);
    else this.renderResult(f);
  }
  renderPick(f) {
    f.rect(10, 28, 70, 66, COL.white);
    f.rect(12, 30, 66, 62, c32(24, 16, 9));
    f.blit(this.tp.sprite, 13, 33, this.tp.pal);
    panel(f, 86, 28, 160, 66);
    drawText(f, `${this.trainer.name}:`, 92, 32, COL.cyan, { mono: false });
    const ferry = this.trainer.id === 'ferryman';
    const talk = ferry
      ? (this.args.free ? '"PRACTICE. THE RIVER ALLOWS IT. SILVER BUYS A PERK. GOLD, ANOTHER."' : '"ONE DRILL BEFORE THE NEXT SHORE. SILVER BUYS A PERK. GOLD, ANOTHER."')
      : this.args.free
      ? '"BACK IN THE GYM? PICK A DRILL, AS MANY AS YOU LIKE. SILVER EARNS YOU A PERK, GOLD EARNS YOU ANOTHER."'
      : '"ONE DRILL BEFORE WE HIT THE NEXT CIRCUIT. SILVER EARNS YOU A PERK, GOLD EARNS YOU ANOTHER."';
    drawBlock(f, talk, 92, 44, 148, 5, COL.white, { lineH: 9, where: 'training talk' });
    this.hits.clear();
    ORDER.forEach((g, i) => {
      const y = 102 + i * 30, on = i === this.sel, D = DRILLS[g], best = this.T.best[g] || 0, m = medalOf(g, best);
      panel(f, 10, y, 236, 26);
      this.hits.add(10, y, 236, 26, i);
      if (on) { f.frameRect(10, y, 236, 26, COL.yellow); cursor(f, 14, y + 4, this.t); }
      drawText(f, D.name, 30, y + 4, on ? COL.white : COL.off);
      drawText(f, best ? `BEST ${best} ${D.unit}` : 'NOT TRIED', 242 - textWidth(best ? `BEST ${best} ${D.unit}` : 'NOT TRIED', false), y + 4, m ? MEDAL_COL[m] : COL.grey, { mono: false });
      const [p1, p2] = perksOf(g);
      const has = (p) => this.T.perks.includes(p.id);
      drawText(f, `SILVER: ${p1.short}`, 30, y + 15, has(p1) ? COL.green : COL.grey, { mono: false });
      drawText(f, `GOLD: ${p2.short}`, Math.min(150, 242 - textWidth(`GOLD: ${p2.short}`, false)), y + 15, has(p2) ? COL.green : COL.grey, { mono: false }); // (slides left to stay in the box)
    });
    const y = 196, on = this.sel === ORDER.length;
    this.hits.add(10, y - 5, 236, 16, ORDER.length);
    drawText(f, this.args.free ? 'BACK TO THE MAP' : 'SKIP TRAINING', 30, y, on ? COL.white : COL.grey);
    if (on) cursor(f, 14, y - 3, this.t);
  }
  renderHowto(f) {
    const D = DRILLS[this.game];
    panel(f, 20, 40, 216, 132);
    drawTextCentered(f, D.name, 128, 48, COL.orange);
    drawBlock(f, D.text, 30, 66, 196, 4, COL.white, { lineH: 11, where: 'drill text' });
    D.help.forEach((l, i) => drawTextCentered(f, l, 128, 110 + i * 10, COL.cyan, { mono: false }));
    const [b, s, g] = D.medals;
    drawTextCentered(f, `BRONZE ${b}  SILVER ${s}  GOLD ${g}`, 128, 134, COL.white, { mono: false });
    const [p1, p2] = perksOf(this.game);
    drawTextCentered(f, `SILVER: ${p1.name}`, 128, 146, COL.grey, { mono: false });
    drawTextCentered(f, `GOLD: ${p2.name}`, 128, 156, COL.grey, { mono: false });
    if (this.t > 20 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 182, COL.yellow);
    drawTextCentered(f, 'B: PICK ANOTHER DRILL', 128, 200, COL.grey, { mono: false });
  }
  renderResult(f) {
    const D = DRILLS[this.game], m = this.medal;
    drawTextCentered(f, D.name, 128, 34, COL.orange);
    drawTextBig(f, `${this.drill.score} ${D.unit}`, 128, 52, COL.white, COL.black, 3);
    drawTextBig(f, m ? MEDALS[m] : 'NO MEDAL', 128, 86, m ? MEDAL_COL[m] : COL.grey, COL.black, 2);
    if (this.newBest) drawTextCentered(f, (this.t >> 3) & 1 ? 'NEW BEST!' : '', 128, 110, COL.yellow);
    panel(f, 20, 124, 216, 60);
    if (this.won.length) {
      this.won.forEach((w, i) => {
        drawText(f, `PERK: ${w.p.name}`, 28, 130 + i * 24, COL.green, { mono: false });
        if (w.eq) drawText(f, 'EQUIPPED', 228 - textWidth('EQUIPPED', false), 130 + i * 24, COL.cyan, { mono: false });
        drawLabel(f, w.p.text, 28, 140 + i * 24, 200, COL.white, { mono: false, where: 'perk text' });
      });
    } else {
      const next = perksOf(this.game).find((p) => !this.T.perks.includes(p.id));
      const line = next ? `${MEDALS[perksOf(this.game).indexOf(next) + 2]} (${D.medals[perksOf(this.game).indexOf(next) + 1]} ${D.unit}) WINS ${next.name}` : 'BOTH PERKS WON. NICE WORK, CHAMP.';
      drawBlock(f, line, 28, 132, 200, 3, COL.grey, { where: 'drill result' });
    }
    if (this.won.some((w) => !w.eq)) drawText(f, 'EQUIP IT FROM THE MAP: PERKS', 28, 172, COL.cyan, { mono: false });
    if (this.t > 60 && (this.t >> 4) & 1) drawTextCentered(f, 'PUSH START', 128, 200, COL.yellow);
  }
}

// ---------------------------------------------------------------------------
// Perks (from the map): equip up to 3 of the perks you've won.
// ---------------------------------------------------------------------------
export class PerksScreen {
  constructor(game) { this.g = game; this.T = game.career.training; this.sel = 0; this.t = 0; this.note = null; this.hits = new Hits(); }
  enter() {}
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, n = PERKS.length + 1;
    this.hits.rows(I, this.sel, (i) => { this.sel = i; A.sfx('menu'); this.note = null; });
    if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; A.sfx('menu'); this.note = null; }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % n; A.sfx('menu'); this.note = null; }
    if (I.pressed('pause') || I.pressed('b')) { this.g.saveCareer(); this.g.go('map'); return; }
    if (!(I.confirm() || I.pressed('star'))) return;
    if (this.sel === PERKS.length) { A.sfx('confirm'); this.g.saveCareer(); this.g.go('map'); return; }
    const p = PERKS[this.sel], T = this.T;
    if (!T.perks.includes(p.id)) { A.sfx('tired'); this.note = `WIN IT AT ${DRILLS[p.game].name}`; return; }
    if (T.equipped.includes(p.id)) { T.equipped = T.equipped.filter((x) => x !== p.id); A.sfx('menu'); this.g.saveCareer(); }
    else if (T.equipped.length >= MAX_EQUIPPED) { A.sfx('tired'); this.note = `${MAX_EQUIPPED} AT A TIME. TAKE ONE OFF.`; }
    else { T.equipped.push(p.id); A.sfx('confirm'); this.g.saveCareer(); }
  }
  render(f) {
    f.clear(BG);
    for (let y = 0; y < 224; y += 6) f.rect(0, y, 256, 2, BG2);
    drawTextBig(f, 'PERKS', 128, 6, COL.yellow, COL.black, 2);
    drawTextCentered(f, `EQUIPPED ${this.T.equipped.length} / ${MAX_EQUIPPED}`, 128, 28, COL.cyan, { mono: false });
    this.hits.clear();
    PERKS.forEach((p, i) => {
      const y = 40 + i * 25, on = i === this.sel, has = this.T.perks.includes(p.id), eq = this.T.equipped.includes(p.id);
      panel(f, 14, y, 228, 22);
      this.hits.add(14, y, 228, 22, i);
      if (on) { f.frameRect(14, y, 228, 22, COL.yellow); cursor(f, 18, y + 3, this.t); }
      drawText(f, has ? p.name : '? ? ?', 34, y + 3, has ? (on ? COL.white : COL.off) : COL.grey, { mono: false });
      drawText(f, has ? p.text : `${DRILLS[p.game].name}: ${PERKS.filter((q) => q.game === p.game)[0] === p ? 'SILVER' : 'GOLD'}`, 34, y + 12, COL.grey, { mono: false });
      if (eq) drawText(f, 'ON', 236 - textWidth('ON', false), y + 3, COL.green, { mono: false });
    });
    const y = 196, on = this.sel === PERKS.length;
    this.hits.add(14, y - 5, 228, 16, PERKS.length);
    drawText(f, 'BACK', 34, y, on ? COL.white : COL.grey);
    if (on) cursor(f, 18, y - 3, this.t);
    if (this.note) drawTextCentered(f, this.note, 128, 210, COL.yellow, { mono: false });
    else drawTextCentered(f, 'NONE OF THEM CHANGE ANY TELLS', 128, 210, COL.grey, { mono: false });
  }
}
