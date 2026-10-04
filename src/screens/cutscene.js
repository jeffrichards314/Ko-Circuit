// The cutscene player (spec §19 G1): plays one scene of the engine by id and goes on.
//   args: { id, params, then: [screen, args], theater }
// START: a tap advances the text, like A (the words lead: a scene cannot end before its text has shown and been pushed past, src/scene/engine.js);
// HOLDING START skips the whole scene (a bar fills), seen before or not. A scene counts as seen when it ends or is skipped, unless it was played from
// the Theater.
import { Scene } from '../scene/engine.js';
import { getScene } from '../../data/cutscenes/index.js';
import { markSeen, seenCount } from '../save/cutscenes.js';
import { COL } from '../fight/hud.js';
import { drawText, textWidth } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { nicknameOf, cornermanFor, hairStyleOf, trainerOf } from '../../data/customization.js';
import { CIRCUITS, zoneOf } from '../../data/circuits.js';
import { SIGN_OFF } from '../../data/cutscenes/talk.js';

const HOLD = 42, TAP = 14; // frames: hold START this long to skip; a shorter press is a tap

export function sceneContext(game, def, params = {}) {
  const p = game.profile, circuit = params.circuit || def.circuit || null;
  const zone = def.cornerZone || (circuit ? zoneOf(circuit) : null) || 'road';
  const cm = cornermanFor(p, zone === 'void' && circuit !== 'zeroTrue' ? 'void' : zone, circuit);
  const tokens = { signoff: SIGN_OFF[trainerOf(p).id] || '', name: p.name, nick: nicknameOf(p), corner: cm.name, trainer: cm.name, circuit: circuit && CIRCUITS[circuit] ? CIRCUITS[circuit].name.replace(/^.*: /, '') : '' };
  for (const [k, v] of Object.entries(params)) if (typeof v === 'string' || typeof v === 'number') tokens[k] = v;
  const c = game.career;
  return { g: game, profile: p, career: c, params, zone, circuit, tokens, flags: { replay: !!params.replay, unlocked: !!params.unlocked, ...(params.flags || {}) } };
}

export class CutsceneScreen {
  constructor(game, args = {}) {
    this.g = game;
    this.args = args;
    this.id = args.id;
    this.def = getScene(args.id, args.params || {});
    this.ctx = sceneContext(game, this.def, { ...(this.def.params || {}), ...(args.params || {}) });
    Object.assign(this.ctx.tokens, this.def.tokens || {});
    this.scene = new Scene(game, this.def, this.ctx);
    this.seenBefore = seenCount(game.seen, this.id) > 0;
    this.hold = 0; this.leaving = 0; this.t = 0;
    this.finished = false;
  }
  enter() {
    const m = this.def.music;
    if (m && this.g.songs[m]) this.g.audio.play(this.g.songs[m]);
  }
  exit() { this.finish(); }
  update() {
    this.t++;
    const I = this.g.input;
    if (this.leaving) { this.leaving++; this.scene.fade.level = Math.min(1, this.scene.fade.level + 1 / 12); if (this.leaving > 14) this.go(); return; }
    // START: tap = advance (first time) or skip (seen); hold = skip
    let advance = I.pressed('a') || I.pressed('star');
    if (I.held('start')) {
      this.hold++;
      if (this.hold >= HOLD) return this.skip();
    } else {
      if (this.hold > 0 && this.hold < TAP) advance = true;
      this.hold = 0;
    }
    this.scene.update(advance);
    if (this.scene.done) this.go();
  }
  skip() { this.scene.skipHosts(); this.scene.text = null; this.scene.card = null; this.leaving = 1; this.g.audio.sfx('menu'); }
  go() {
    if (this.finished) return;
    const then = this.args.then || this.scene.legacyResult || ['map', {}];
    this.finish();
    this.g.go(then[0], then[1]);
  }
  finish() {
    if (this.finished) return;
    this.finished = true;
    if (!this.args.theater && this.id) markSeen(this.g.seen, this.id);
  }
  shake() { return this.scene.shake(); }
  render(f) {
    this.scene.render(f);
    if (this.hold >= TAP) {
      // the skip bar
      const u = Math.min(1, this.hold / HOLD);
      f.rect(170, 212, 80, 9, COL.black); f.rect(171, 213, 78, 7, COL.dark);
      f.rect(171, 213, Math.round(78 * u), 7, COL.yellow);
      drawText(f, 'SKIPPING', 178, 213, u > 0.5 ? COL.black : COL.white, { mono: false });
    } else if ((this.seenBefore && this.t > 20 && this.t < 260) || (!this.seenBefore && this.t > 20 && this.t < 150)) {
      // bottom right; up in the top corner when the bottom is taken (a speech box, the road's label), and not at all when
      // both are (it never sits on other words)
      const s = 'HOLD START: SKIP', S = this.scene;
      const busyLow = S && ((S.text && !S.text.top) || S.layers.some((l) => l.on && l.p === 'label'));
      const busyHigh = S && ((S.text && S.text.top) || S.caption || S.card);
      if (!busyLow || !busyHigh) drawText(f, s, 250 - textWidth(s, false), !busyLow ? 214 : 3, this.seenBefore && (this.t >> 4) & 1 ? COL.grey : COL.dark, { mono: false });
    }
    void c32; void hairStyleOf;
  }
}
