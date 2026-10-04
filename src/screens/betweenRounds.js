// Between-rounds corner screen (§4): the cornerman's strategy hint for this opponent and this round (src/fight/cornerman.js;
// the Tactician adds a second one), mash A/B to recover health, hearts reset. The hint sits in the shared text box
// (src/engine/textbox.js): it pages with a ▼ when it runs long, and START turns the page (on the last page START starts the
// round). Driven by the Fight, which keeps all round state; update() returns true when the next round starts.

import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, textWidth } from '../engine/font.js';
import { TextBox, drawLabel } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { trainerPortrait } from '../../data/sprites/trainers.js';
import { cornerHints, championshipCall } from '../fight/cornerman.js';

const BG = c32(3, 4, 9), POST = c32(9, 10, 14), POST_HI = c32(16, 17, 22);
const PAD = c32(22, 5, 6), PAD_DK = c32(13, 2, 3), ROPE = c32(26, 26, 28), ROPE_DK = c32(14, 14, 18);
const BOX_T = c32(24, 16, 9), BOX_P = c32(9, 24, 12);

export const CORNER = { mashFrames: 300, maxHeal: 30, minFrames: 90, maxFrames: 900 };
// the hint's text box: 222 pixels wide, 5 lines a page
export const HINT_BOX = { w: 222, lines: 5 };

// The round is over: read it out and reset the log for the next one.
export function takeRoundLog(fight) {
  const log = fight.roundLog;
  fight.roundLog = { hits: {}, antis: [], superHits: {}, damage: 0, downs: 0, golden: [] };
  return log;
}

export class BetweenRounds {
  constructor(fight) {
    this.f = fight;
    this.t = 0;
    this.healed = 0;
    const log = takeRoundLog(fight);
    this.tips = cornerHints(fight, log);
    const call = championshipCall(fight); // (the first time the fight goes to championship rounds, and to sudden death)
    if (call) this.tips.unshift(call);
    // the handbook keeps what the corner told you about him
    const H = fight.opts.handbook;
    if (H) this.tips.forEach((t) => H.add(fight.d.scoutId || fight.d.id, t));
    const tp = trainerPortrait(fight.trainer.id);
    this.trainerArt = tp.sprite; this.trainerPal = tp.pal;
    this.box = new TextBox(this.tips.map((t) => `"${t}"`).join('\n\n'), { w: HINT_BOX.w, lines: HINT_BOX.lines });
  }

  // how much health the mash can bring back: the circuit's `cornerHeal` (the Underworld's is 15, the Void's 20), else the base 30
  maxHeal() { return this.f.d.cornerHeal ?? this.f.circuit.cornerHeal ?? CORNER.maxHeal; }
  // ...and what a perk (Grit) adds to it: never to a corner that gives nothing (the Will Shard's fight restores nothing between rounds)
  // (the championship rounds shrink it: data/difficulty.js CHAMPIONSHIP youHeal, down to nothing)
  healCap() { const base = this.maxHeal(); return base > 0 ? Math.round((base + this.f.perk.cornerHeal) * (this.f.nextEsc ? this.f.nextEsc.youHeal : 1)) : 0; }

  update() {
    this.t++;
    const f = this.f, P = f.player, I = f.input;
    if (this.t < CORNER.mashFrames && (I.pressed('a') || I.pressed('b')) && this.healed < this.healCap() && P.health < P.maxHealth) {
      P.health = Math.min(P.maxHealth, P.health + 1);
      this.healed++;
      f.sfx('mash');
    }
    this.box.update();
    const tapped = typeof I.takeTaps === 'function' && I.takeTaps().length > 0; // (a tap on the picture is START)
    if (I.pressed('start') || I.pressed('star') || tapped) {
      if (this.box.more) { this.box.next(); f.sfx('menu'); return false; } // (turn the hint's page)
      if (this.t >= CORNER.minFrames) return true;
    }
    return this.t >= CORNER.maxFrames;
  }

  render(fr) {
    const f = this.f, P = f.player, O = f.opp;
    fr.clear(BG);
    // the corner: post, pad and ropes behind everything
    fr.rect(214, 0, 18, 224, POST); fr.rect(218, 0, 4, 224, POST_HI);
    fr.rect(210, 20, 26, 120, PAD_DK); fr.rect(212, 22, 22, 116, PAD);
    for (const y of [40, 76, 112]) { fr.rect(0, y, 256, 3, ROPE); fr.rect(0, y + 3, 256, 1, ROPE_DK); }

    // an opponent's corner news (Doc Sutures stitching himself up) alternates with the header
    const note = O.mods.cornerNote;
    if (note && (this.t >> 6) & 1) drawLabel(fr, note, 4, 8, 248, COL.red, { align: 'center' });
    else drawTextCentered(fr, `END OF ROUND ${f.round}`, 128, 8, COL.yellow);

    // trainer + player in the corner
    fr.rect(10, 22, 138, 70, COL.white);
    fr.rect(12, 24, 66, 66, BOX_T);
    fr.rect(80, 24, 66, 66, BOX_P);
    fr.blit(this.trainerArt, 13, 27, this.trainerPal);
    fr.blit(f.portrait, 81, 27, f.portraitPal);

    panel(fr, 156, 24, 92, 66);
    drawLabel(fr, f.trainer.name, 160, 28, 84, COL.cyan, { mono: false });
    drawLabel(fr, f.trainer.title, 160, 38, 84, COL.grey, { mono: false });
    drawText(fr, 'POINTS', 160, 52, COL.cyan, { mono: false });
    const pts = String(Math.max(0, Math.floor(f.points)));
    drawText(fr, pts, 244 - textWidth(pts, false), 52, COL.white, { mono: false });
    drawText(fr, 'KD', 160, 64, COL.cyan, { mono: false });
    const kd = `${f.kdTotal.opp} - ${f.kdTotal.player}`;
    drawText(fr, kd, 244 - textWidth(kd, false), 64, COL.white, { mono: false });
    drawText(fr, 'OPP', 160, 77, COL.cyan, { mono: false });
    fr.rect(186, 78, 58, 6, COL.barBack);
    fr.rect(187, 79, Math.round(56 * O.health / O.maxHealth), 4, COL.yellow);

    // the hint, in a speech panel with a tail pointing at the trainer (the shared text box: ▼ when there's another page)
    const h = 12 + HINT_BOX.lines * 10;
    panel(fr, 10, 100, 236, h);
    for (let i = 0; i < 5; i++) fr.rect(34 + i, 96 + i, 9 - i * 2, 1, i ? COL.panel : COL.panelHi);
    this.box.draw(fr, 18, 106, COL.white, { t: f.clock, moreColor: COL.yellow });

    // recovery
    const y = Math.max(172, 104 + h + 6);
    const canMash = this.t < CORNER.mashFrames && this.healed < this.healCap();
    drawText(fr, canMash ? 'MASH A / B TO RECOVER!' : this.healCap() === 0 ? 'NO TIME TO RECOVER' : 'RECOVERED', 12, y, canMash && (f.clock >> 3) & 1 ? COL.yellow : COL.off, { mono: false });
    fr.rect(12, y + 10, 232, 8, COL.barBack);
    fr.rect(13, y + 11, Math.round(230 * P.health / P.maxHealth), 6, COL.off);
    fr.rect(13, y + 11, Math.round(230 * P.health / P.maxHealth), 1, COL.white);
    drawText(fr, `HEARTS RESET: ${f.maxHearts}`, 12, y + 22, COL.pink, { mono: false });
    if (this.t >= CORNER.minFrames && !this.box.more && (f.clock >> 4) & 1) drawText(fr, 'PUSH START', 244 - textWidth('PUSH START'), y + 22, COL.yellow);
  }
}
