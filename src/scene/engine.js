// The cutscene engine (spec §19 G1): a timeline interpreter. A scene is plain data (see data/cutscenes/):
//   { id, title, zone, music, world: [w, h], layers: [...], actors: {...}, script: [...] }
// `Scene` runs the script step by step; the CutsceneScreen owns input, skipping and what comes next.
//
// Steps (each an object with `do`): fade, pan, drift, move, wait, say, caption, card, music, sfx, shake, flash,
// pose, anim, show, hide, set, layer, if, par. `frames` steps block until done; `async: true` starts a step
// and lets the script go on; `par: [...]` runs several together.
//
// TEXT-DRIVEN (2026-10-03): the words lead and everything else waits for them. A `say` does not end until its box has fully typed out (every page) and
// the player has pushed to go on; a push while it types finishes the typing, it never skips it. With `auto: n` it goes on by itself, but only after the
// page has fully shown plus a reading delay (at least readFrames(text), or n frames from its start, whichever is longer). The script is sequential, so no
// cue after a line (a move, a fade, a song, the end of the scene) starts before the line is done; a caption is held on screen long enough to read before
// another replaces it or the scene ends; a card stays at least as long as its words take to read. Only holding START skips a scene.
//   scene.log (when set to an array) records what each line did, for tools/scene-text-test.mjs.
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { TextBox, drawBlock, drawLabel, linesOf, readFrames, TALK_CPF } from '../engine/textbox.js';

// the dialogue box's text widths: plain (no face), beside a portrait or the announcer's mic, and the sky box
export const SAY_BOX = { plain: 224, portrait: 160, top: 226 };
export const CAPTION_W = 228, CAPTION_LINES = 4;
import { c32 } from '../engine/palette.js';
import { W, H } from '../engine/renderer.js';
import { Arena } from '../engine/arena.js';
import { ARENAS } from '../../data/arenas/index.js';
import { PAINTERS, veil, C } from './painters.js';
import { drawActor } from './actors.js';
import { speaker } from './speakers.js';
import { LEGACY } from './legacy.js';

const BOX = c32(3, 4, 9);
const ease = (u) => u * u * (3 - 2 * u);

export class Scene {
  constructor(game, def, ctx) {
    this.g = game; this.def = def; this.ctx = ctx;
    this.t = 0;
    this.cam = { x: 0, y: 0 };
    this.world = def.world || [W, H];
    this.layers = (def.layers || []).map((l) => ({ ...l, on: l.on !== false }));
    this.actors = {};
    for (const [id, a] of Object.entries(def.actors || {})) this.actors[id] = { vis: true, ...a, key: id };
    this.fade = { level: def.fadeIn === false ? 0 : 1, color: def.fadeColor || 'black' };
    this.text = null;     // the open text box
    this.card = null;     // the title card
    this.drift = 0; // the camera's steady scroll (px a frame): the road and the river go on under the words for as long as they take
    this.caption = ''; this.capT = 0; // the caption on screen and how long it has been there
    this.log = null;
    this.flashT = 0; this.shakeT = 0; this.shakeAmp = 2;
    this.arenas = {}; this.hosts = {}; this.legacyResult = null; this.hostShake = null;
    this.done = false;
    this.bg = [];         // async tasks
    this.main = { steps: def.script || [], i: 0, task: null };
    this.runners = [this.main];
    this.advance = false;
    this.audio = game.audio;
  }

  // a hosted legacy screen (spec §19): built over a stand-in game whose go() only records where it wanted to go
  host(name) {
    if (this.hosts[name]) return this.hosts[name];
    const H = { done: false, result: null, screen: null };
    const proxy = Object.create(this.g);
    proxy.go = (n, a) => { H.result = [n, a]; H.done = true; this.legacyResult = H.result; };
    // (only holding START leaves a scene: a hosted screen never sees PAUSE / B as "leave")
    const base = this.g.input;
    proxy.input = new Proxy(base, { get: (t, k) => (k === 'pressed' ? (a, ...r) => (a === 'pause' ? false : t.pressed(a, ...r)) : k === 'back' ? () => false : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) });
    H.screen = new LEGACY[name](proxy, this.ctx.params.legacyArgs || this.ctx.params);
    if (H.screen.enter) H.screen.enter();
    this.hosts[name] = H;
    return H;
  }
  skipHosts() { for (const H of Object.values(this.hosts)) if (!H.done) { const S = H.screen; if (S.leave) S.leave(); else if (S.finish) S.finish(); if (!H.done) { H.done = true; } } }
  arenaFor(id) { return (this.arenas[id] ||= new Arena(ARENAS[id])); }

  // ---- text: {name} {nick} {corner} ... from the context
  expand(s) { return String(s).replace(/\{([\w.]+)\}/g, (m, k) => (this.ctx.tokens[k] != null ? this.ctx.tokens[k] : m)); }

  // ---- stepping
  update(advance = false) {
    this.t++;
    this.advance = advance;
    for (const k of Object.keys(this.actors)) { const a = this.actors[k]; if (a.bobAmp) a.by = Math.round(Math.sin((this.t + (a.phase || 0)) / (a.bobRate || 14)) * a.bobAmp); }
    if (this.flashT > 0) this.flashT--;
    if (this.shakeT > 0) this.shakeT--;
    if (this.drift) this.cam.x += this.drift;
    if (this.caption) this.capT++;
    this.bg = this.bg.filter((task) => !task.tick());
    for (const r of this.runners.slice()) this.runRunner(r);
    if (this.main.i >= this.main.steps.length && !this.main.task && !this.bg.length && !this.text && !this.card && this.captionWait() === 0) this.done = true;
  }

  runRunner(r) {
    for (let guard = 0; guard < 64; guard++) {
      if (!r.task) {
        if (r.i >= r.steps.length) return true;
        const step = r.steps[r.i++];
        const task = this.begin(step);
        if (!task) continue;
        if (step.async) { this.bg.push(task); continue; }
        r.task = task;
      }
      if (r.task.tick()) r.task = null; else return false;
    }
    return false;
  }

  // frames a caption on screen still needs before it has been readable long enough
  captionWait() { return this.caption ? Math.max(0, readFrames(this.caption) - this.capT) : 0; }

  // start one step; returns a task ({ tick() -> true when finished }) or null when it is instant
  begin(s) {
    const A = this.actors, tween = (frames, fn, done) => { let n = 0; return { tick: () => { n++; fn(Math.min(1, n / Math.max(1, frames))); if (n >= frames) { done && done(); return true; } return false; } }; };
    switch (s.do) {
      case 'wait': { let n = 0; return { tick: () => ++n >= s.frames }; }
      case 'fade': {
        const from = this.fade.level, to = s.to, fr = s.frames || 30;
        if (s.color) this.fade.color = s.color;
        return tween(fr, (u) => { this.fade.level = from + (to - from) * u; });
      }
      case 'pan': {
        const x0 = this.cam.x, y0 = this.cam.y, [x1, y1] = s.to, fr = s.frames || 60, e = s.ease === 'linear' ? (u) => u : ease;
        return tween(fr, (u) => { this.cam.x = x0 + (x1 - x0) * e(u); this.cam.y = y0 + ((y1 ?? y0) - y0) * e(u); });
      }
      case 'drift': this.drift = s.vx || 0; return null;
      case 'cam': { this.cam.x = s.x ?? this.cam.x; this.cam.y = s.y ?? this.cam.y; return null; }
      case 'follow': { // the camera keeps an actor at a screen x for `frames`
        const a = A[s.actor], sx = s.at ?? 96, fr = s.frames || 60, cx0 = this.cam.x;
        return tween(fr, () => { this.cam.x = Math.max(s.min ?? 0, Math.min(s.max ?? this.world[0] - W, a.x - sx)); void cx0; });
      }
      case 'move': {
        const a = A[s.actor], x0 = a.x, y0 = a.y, [x1, y1] = s.to, fr = s.frames || 60;
        if (s.anim !== undefined) a.anim = s.anim;
        if (s.flip !== undefined) a.flip = s.flip; else if (x1 !== x0 && a.autoFlip) a.flip = x1 < x0;
        const e = s.ease === 'linear' || !s.ease ? (u) => u : ease;
        return tween(fr, (u) => { a.x = x0 + (x1 - x0) * e(u); a.y = y0 + ((y1 ?? y0) - y0) * e(u); }, () => { if (s.end !== undefined) a.anim = s.end; if (s.endPose !== undefined) a.pose = s.endPose; });
      }
      case 'tween': { // tween numeric fields of an actor or a layer: { actor | layer, to: { field: value }, frames }
        const tgt = s.actor ? [A[s.actor]] : this.layers.filter((l) => l.id === s.layer || l.group === s.layer), from = tgt.map((o) => Object.fromEntries(Object.keys(s.to).map((k) => [k, o[k] ?? 0])));
        return tween(s.frames || 30, (u) => { tgt.forEach((o, i) => { for (const [k, v] of Object.entries(s.to)) o[k] = from[i][k] + (v - from[i][k]) * u; }); });
      }
      case 'pose': { const a = A[s.actor]; a.pose = s.pose; if (s.anim !== undefined) a.anim = s.anim; return null; }
      case 'anim': { const a = A[s.actor]; a.anim = s.anim; a.pose = s.pose; return null; }
      case 'show': case 'hide': {
        const on = s.do === 'show';
        if (s.actor) A[s.actor].vis = on; if (s.layer) for (const l of this.layers) if (l.id === s.layer || l.group === s.layer) { l.on = on; if (on) l.t0 = this.t; } if (s.group) for (const a of Object.values(A)) if (a.group === s.group) a.vis = on;
        return null;
      }
      case 'set': { // change an actor's or a layer's fields
        if (s.actor) Object.assign(A[s.actor], s.values); if (s.layer) for (const l of this.layers) if (l.id === s.layer || l.group === s.layer) Object.assign(l, s.values);
        return null;
      }
      case 'caption': { // (a caption stays up long enough to be read before another replaces it)
        const set = () => { if (this.caption && this.log) this.log.push({ type: 'caption', text: this.caption, shown: this.capT }); this.caption = s.text ? this.expand(s.text) : ''; this.capT = 0; };
        if (this.captionWait() > 0) return { tick: () => { if (this.captionWait() > 0) return false; set(); return true; } };
        set(); return null;
      }
      case 'music': this.audio.play(this.g.songs[s.song]); return null;
      case 'stopMusic': this.audio.stop(); return null;
      case 'sfx': this.audio.sfx(s.name, s.arg); return null;
      case 'shake': this.shakeT = s.frames || 20; this.shakeAmp = s.amp || 2; return null;
      case 'flash': this.flashT = s.frames || 8; this.flashColor = s.color || 'white'; return null;
      case 'card': {
        const words = [s.title, s.sub, s.small].filter(Boolean).join(' ').length, total = Math.max(s.frames || 150, 50 + Math.round(words * 1.5)); let n = 0;
        this.card = { title: this.expand(s.title), sub: s.sub ? this.expand(s.sub) : '', small: s.small ? this.expand(s.small) : '', t: 0, total, color: Array.isArray(s.color) ? C(...s.color) : s.color, gold: s.gold, big: s.scale };
        return { tick: () => { this.card.t = ++n; if (n >= total || (n > 40 && this.advance)) { this.card = null; return true; } return false; } };
      }
      case 'say': {
        const sp = speaker(s.who, this.ctx), txt = this.expand(s.text);
        // the shared paged box (src/engine/textbox.js): words that need more than one box page on START, with a ▼
        const w = s.top ? SAY_BOX.top : sp.portrait || sp.mic ? SAY_BOX.portrait : SAY_BOX.plain;
        this.text = { sp, txt, t: 0, top: !!s.top, box: new TextBox(txt, { w, lines: 5, lineH: s.top ? 10 : 9, speed: 1.5 }), pose: s.pose };
        if (s.face) this.text.face = s.face;
        const auto = s.auto, L = this.log, ev = { type: 'say', text: txt, pages: this.text.box.pages.length, shownFull: 0, by: null, frames: 0 };
        if (L) L.push(ev);
        let typedFor = 0; // frames the current page has been fully typed
        const close = (by) => { ev.by = by; this.text = null; return true; };
        return { tick: () => {
          const T = this.text, B = T.box; T.t++; ev.frames++; B.update();
          typedFor = B.typed ? typedFor + 1 : 0;
          if (B.typed && !B.more) ev.shownFull++;
          if (this.advance && T.t > 6) {
            this.advance = false;
            if (!B.typed) { B.next(); typedFor = 0; } // (a push while it types finishes the typing: it is shown whole, then waits for the next push)
            else if (B.more) { B.next(); T.t = 7; typedFor = 0; }
            else if (T.t > 20) return close('press');
          }
          // on its own: only after the page has fully shown, plus the reading delay
          if (auto && B.typed) {
            const page = B.lines.join(' '), wait = Math.max(readFrames(page), auto - Math.ceil((page.length + 1) / TALK_CPF));
            if (typedFor >= wait) { if (B.more) { B.next(); T.t = 7; typedFor = 0; } else return close('auto'); }
          }
          return false;
        } };
      }
      case 'par': {
        const rs = s.par.map((steps) => ({ steps, i: 0, task: null }));
        return { tick: () => { let all = true; for (const r of rs) if (!this.runRunner(r)) all = false; return all; } };
      }
      case 'if': {
        const yes = this.cond(s.when), list = yes ? s.then : s.else;
        if (list && list.length) { const r = { steps: list, i: 0, task: null }; return { tick: () => this.runRunner(r) }; }
        return null;
      }
      case 'press': { // wait for START / A, at least `frames`; a layer with `press` shows PUSH START
        let n = 0;
        return { tick: () => { n++; return n > (s.frames || 60) && this.advance; } };
      }
      case 'legacy': { // an older, hand-drawn scene hosted by the engine: it draws and runs itself, the engine adds fades, skipping and the Theater
        const H = this.host(s.screen);
        return { tick: () => { if (!H.done) { H.screen.update(); if (H.screen.shake) this.hostShake = H.screen.shake(); } return H.done; } };
      }
      case 'end': this.main.i = this.main.steps.length; return null;
      default: throw new Error(`cutscene ${this.def.id}: unknown step ${s.do}`);
    }
  }
  cond(w) {
    if (!w) return true;
    const neg = w[0] === '!', k = neg ? w.slice(1) : w, F = this.ctx.flags;
    const v = k.startsWith('param:') ? !!this.ctx.params[k.slice(6)] : !!F[k];
    return neg ? !v : v;
  }

  // ---- drawing
  sx(x, par = 1) { return Math.round(x - this.cam.x * par); }
  render(f) {
    f.clear(C(0, 0, 0));
    for (const L of this.layers) if (L.on && !L.fg) this.paint(f, L);
    // actors, back to front by their feet
    const list = Object.values(this.actors).filter((a) => a.vis).sort((a, b) => (a.z ?? a.y) - (b.z ?? b.y));
    for (const a of list) drawActor(f, a, Math.round(a.x - this.cam.x * (a.par ?? 1)), Math.round(a.y + (a.by || 0) - this.cam.y), this);
    for (const L of this.layers) if (L.on && L.fg) this.paint(f, L);
    this.renderOverlay(f);
  }
  // only the backdrop layers (the audit counts their colours against the 4-palette rule of §2)
  renderBackdrop(f) { f.clear(C(0, 0, 0)); for (const L of this.layers) if (L.on) this.paint(f, L); }
  paint(f, L) { const p = PAINTERS[L.p]; if (!p) throw new Error(`cutscene ${this.def.id}: unknown painter ${L.p}`); p(f, L, this); }

  renderOverlay(f) {
    if (this.flashT > 0) veil(f, this.flashColor === 'black' ? C(0, 0, 0) : C(31, 31, 31), Math.min(1, this.flashT / 5));
    if (this.caption) {
      const n = Math.min(CAPTION_LINES, linesOf(this.caption, CAPTION_W));
      panel(f, 8, 6, 240, 6 + n * 10);
      drawBlock(f, this.caption, 14, 9, CAPTION_W, CAPTION_LINES, COL.yellow, { align: 'center', where: 'scene caption' });
    }
    if (this.text) this.renderText(f);
    if (this.card) this.renderCard(f);
    if (this.fade.level > 0.001) veil(f, this.fade.color === 'white' ? C(31, 31, 31) : C(0, 0, 0), this.fade.level);
  }

  renderText(f) {
    const T = this.text, sp = T.sp, left = sp.side !== 'right', B = T.box;
    if (T.top) {
      // the box up in the sky, over no one: the road and the river scenes (a name, the words, a ▼ for another page)
      panel(f, 8, 6, 240, 18 + B.n * 10);
      drawLabel(f, `${sp.name}:`, 14, 10, 226, sp.col, { mono: false, where: 'scene name' });
      B.draw(f, 14, 21, COL.white, { t: this.t, moreColor: COL.yellow, endMark: true });
      return;
    }
    panel(f, 6, 150, 244, 68);
    let tx = 14, w = SAY_BOX.plain;
    if (sp.portrait) {
      const px = left ? 10 : 180;
      f.rect(px, 153, 66, 62, COL.white); f.rect(px + 1, 154, 64, 60, BOX);
      f.blit(sp.portrait, px + 1, 154, sp.pal);
      tx = left ? 82 : 12; w = SAY_BOX.portrait;
    } else if (sp.mic) {
      // the announcer: a microphone in a box
      f.rect(10, 153, 66, 62, COL.white); f.rect(11, 154, 64, 60, BOX);
      const cx = 43, cy = 178, k = (this.t >> 3) & 1;
      f.rect(cx - 5, cy - 14, 10, 14, C(20, 20, 24)); f.rect(cx - 5, cy - 14, 10, 2, C(28, 28, 31)); f.rect(cx - 4, cy - 12, 2, 10, C(10, 10, 15));
      for (let y = 0; y < 14; y += 2) for (let x = -5; x < 5; x += 2) f.px(cx + x + (y & 2 ? 1 : 0), cy - 14 + y, C(10, 10, 15));
      f.rect(cx - 1, cy, 2, 22, C(14, 14, 20)); f.rect(cx - 8, cy + 21, 16, 3, C(14, 14, 20));
      for (let i = 1; i <= 2; i++) { const r = 9 + i * 4 + k * 2; for (let a = -6; a <= 6; a++) f.px(cx + Math.round(Math.cos(a * 0.22) * r), cy - 7 + Math.round(Math.sin(a * 0.22) * r * 0.9), i === 1 ? C(31, 27, 8) : C(22, 18, 5)); }
      tx = 82; w = SAY_BOX.portrait;
    }
    // (a name too long for the row drops its title after the comma: BARNEY BUCKETS, ASCENDED)
    if (sp.name) drawLabel(f, textWidth(sp.name, false) <= w ? sp.name : sp.name.split(',')[0], tx, 156, w, sp.col, { mono: false, where: 'scene name' });
    B.draw(f, tx, 168, COL.white, { t: this.t, moreColor: COL.yellow, endMark: true });
  }

  renderCard(f) {
    const c = this.card, u = c.t / c.total;
    // the card slides in over a dark band, holds, and goes
    const on = Math.min(1, c.t / 14), off = u > 0.88 ? (1 - u) / 0.12 : 1, k = Math.min(on, off);
    const bandH = Math.round(58 * k), y0 = 84 - (bandH >> 1);
    f.rect(0, y0, W, bandH, C(1, 1, 5)); f.rect(0, y0, W, 1, c.gold ? C(31, 26, 8) : C(20, 20, 26)); f.rect(0, y0 + bandH - 1, W, 1, c.gold ? C(31, 26, 8) : C(20, 20, 26));
    if (bandH < 50) return;
    const col = c.color || (c.gold ? COL.yellow : COL.white);
    if (c.small) drawTextCentered(f, c.small, 128, y0 + 6, COL.cyan, { mono: false });
    drawTextBig(f, c.title, 128, y0 + (c.small ? 16 : 12), col, COL.black, c.big || Math.max(1, Math.min(3, Math.floor(232 / Math.max(1, textWidth(c.title))))));
    if (c.sub) drawTextCentered(f, c.sub, 128, y0 + 44, COL.orange, { mono: false });
  }

  shake() { if (this.hostShake) { const h = this.hostShake; this.hostShake = null; return h; } return this.shakeT > 0 ? [((this.shakeT & 1) ? 1 : -1) * this.shakeAmp, ((this.shakeT >> 1) & 1) ? 1 : 0] : [0, 0]; }
}
