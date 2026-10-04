// The tape shelf in the Home gym (spec §5): replay any circuit you have cleared, from the bottom of its ladder, with 2 lives of its own. Your
// career stays exactly as it was (career.js `replay`); medals and record times count; a replay of Major or Legends with no fight lost can still
// unlock the Carnival or the Underground if you missed them.
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, textWidth } from '../engine/font.js';
import { drawLabel, drawLabelCentered } from '../engine/textbox.js';
import { c32 } from '../engine/palette.js';
import { CIRCUITS, SHORT, RIVAL_AFTER } from '../../data/circuits.js';
import { replayable, startReplay, endReplay, replayOpponent, rivalWon } from '../save/career.js';
import { goIntro } from './introFlow.js';
import { Hits, scrollList } from '../engine/hits.js';

const ROW_W = 212; // a tape's label
const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), GOLD = c32(30, 24, 6);

export class ReplayScreen {
  constructor(game) {
    this.g = game; this.t = 0; this.sel = 0; this.top = 0; this.hits = new Hits();
    const c = game.career, R = c.replay;
    this.items = R
      ? [{ label: `CONTINUE: ${SHORT[R.circuit]} (${R.rival ? 'RIVAL' : `${R.beaten + 1}/${CIRCUITS[R.circuit].fighters.length}`})`, act: 'continue' }, { label: 'ABANDON THE REPLAY', act: 'abandon' }]
      : replayable(c).map((id) => {
        // (the circuit's full name when it fits the row, else its short one)
        const tail = RIVAL_AFTER[id] && rivalWon(c, RIVAL_AFTER[id]) ? ' + RIVAL' : '';
        return { label: textWidth(CIRCUITS[id].name + tail, false) <= ROW_W ? CIRCUITS[id].name + tail : SHORT[id] + tail, id };
      });
    this.note = null;
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, n = this.items.length, g = this.g, c = g.career;
    if (I.back()) { A.sfx('menu'); g.go('map'); return; }
    if (!n) return;
    this.hits.rows(I, this.sel, (i) => { this.sel = i; A.sfx('menu'); });
    scrollList(I, this, n, 9, { pitch: 15 });
    if (I.pressed('up')) { this.sel = (this.sel + n - 1) % n; A.sfx('menu'); }
    if (I.pressed('down')) { this.sel = (this.sel + 1) % n; A.sfx('menu'); }
    if (this.sel < this.top) this.top = this.sel;
    if (this.sel >= this.top + 9) this.top = this.sel - 8;
    if (!(I.confirm() || I.pressed('star'))) return;
    const it = this.items[this.sel];
    A.sfx('confirm');
    if (it.act === 'abandon') { endReplay(c); g.go('map'); return; }
    if (it.id) startReplay(c, it.id);
    const R = c.replay;
    if (R.rival) g.go('rival', { id: RIVAL_AFTER[R.circuit], phase: 'pre', replay: true });
    else goIntro(g, { fighter: replayOpponent(c), replay: true });
  }
  render(f) {
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((this.t >> 3) & 7), 256, 2, STRIPE);
    drawTextCentered(f, 'FIGHT TAPES', 128, 10, GOLD);
    drawLabelCentered(f, 'REPLAYS LEAVE YOUR CAREER BE', 128, 26, 244, COL.grey, { mono: false, where: 'replay help' });
    panel(f, 14, 38, 228, 150);
    this.hits.clear();
    this.items.slice(this.top, this.top + 9).forEach((it, i) => {
      const on = this.top + i === this.sel, y = 46 + i * 15;
      this.hits.add(18, y - 3, 220, 13, this.top + i);
      if (on) f.rect(18, y - 3, 220, 13, COL.panelHi);
      drawLabel(f, it.label, 24, y, ROW_W, on ? COL.white : COL.off, { mono: false, where: 'replay row' });
    });
    if (!this.items.length) drawTextCentered(f, 'WIN A BELT FIRST, THEN REPLAY IT.', 128, 100, COL.grey, { mono: false });
    drawTextCentered(f, 'A: PLAY   B: BACK', 128, 204, COL.grey, { mono: false });
  }
}
