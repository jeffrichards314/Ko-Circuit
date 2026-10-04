// The Theater (spec §19 G5), in the Extras hub: every cutscene, sorted by zone. Scenes you have seen are listed by title (and how many
// times); the others show as ???. A plays one: it runs on a throwaway copy of the career and ends back here.
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { theaterList, SCENES } from '../../data/cutscenes/index.js';
import { seenCount } from '../save/cutscenes.js';
import { Hits, scrollList } from '../engine/hits.js';

const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), GOLD = c32(30, 24, 6);
const VIS = 15;

export class TheaterScreen {
  constructor(game, args = {}) {
    this.g = game; this.t = 0;
    game.leaveSandbox && game.leaveSandbox(); // (coming back from a scene: the real career is the game's again)
    this.rows = [];
    for (const z of theaterList()) {
      const seen = z.scenes.filter((s) => seenCount(game.seen, s.id) > 0).length;
      this.rows.push({ header: z.name, count: `${seen}/${z.scenes.length}` });
      for (const s of z.scenes) this.rows.push({ id: s.id, title: s.title });
    }
    this.sel = Math.max(0, this.rows.findIndex((r) => r.id === args.sel));
    if (this.rows[this.sel] && this.rows[this.sel].header) this.sel = this.rows.findIndex((r) => !r.header);
    this.top = 0;
    this.hits = new Hits();
    this.note = null;
    this.fit();
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  fit() { if (this.sel < this.top + 1) this.top = Math.max(0, this.sel - 1); if (this.sel >= this.top + VIS) this.top = this.sel - VIS + 1; }
  move(d) { let s = this.sel; do { s = (s + d + this.rows.length) % this.rows.length; } while (this.rows[s].header); this.sel = s; this.fit(); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio;
    if (I.back()) { A.sfx('menu'); this.g.go('map'); return; }
    // touch: a tap on a title chooses it, and on the one chosen plays it; a swipe scrolls the list
    for (const h of this.hits.take(I)) { if (h.id === this.sel) I.fake('a'); else { this.sel = h.id; this.note = null; A.sfx('menu'); } }
    scrollList(I, this, this.rows.length, VIS, { pitch: 10, skip: (i) => this.rows[i].header });
    if (I.pressed('up')) { this.move(-1); A.sfx('menu'); this.note = null; }
    if (I.pressed('down')) { this.move(1); A.sfx('menu'); this.note = null; }
    if (I.pressed('left')) { for (let i = 0; i < 8; i++) this.move(-1); A.sfx('menu'); }
    if (I.pressed('right')) { for (let i = 0; i < 8; i++) this.move(1); A.sfx('menu'); }
    if (I.confirm() || I.pressed('star')) {
      const r = this.rows[this.sel];
      if (!r || r.header) return;
      if (!seenCount(this.g.seen, r.id)) { A.sfx('tired'); this.note = 'YOU HAVEN\'T SEEN THIS ONE YET'; return; }
      A.sfx('confirm');
      this.g.enterSandbox();
      const raw = SCENES[r.id];
      this.g.go('cutscene', { id: r.id, params: { replay: false, ...((raw.params && raw.params.circuit) ? { circuit: raw.params.circuit } : {}) }, theater: true, then: ['theater', { sel: r.id }] });
    }
  }
  render(f) {
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((this.t >> 3) & 7), 256, 2, STRIPE);
    drawTextBig(f, 'THEATER', 128, 5, GOLD, COL.black, 2);
    const total = this.rows.filter((r) => !r.header).length, seen = this.rows.filter((r) => r.id && seenCount(this.g.seen, r.id) > 0).length;
    drawTextCentered(f, `SEEN ${seen}/${total}`, 128, 24, COL.cyan, { mono: false });
    panel(f, 8, 34, 240, 166);
    this.hits.clear();
    this.rows.slice(this.top, this.top + VIS).forEach((r, k) => {
      const y = 39 + k * 10.6 | 0, i = this.top + k, on = i === this.sel;
      if (!r.header) this.hits.add(11, y - 3, 234, 11, i);
      if (r.header) { drawText(f, r.header, 14, y, COL.orange, { mono: false }); drawText(f, r.count, 240 - textWidth(r.count, false), y, COL.grey, { mono: false }); return; }
      const n = seenCount(this.g.seen, r.id);
      if (on) f.rect(11, y - 2, 234, 10, COL.panelHi);
      drawText(f, n ? r.title : '???', 20, y, n ? (on ? COL.white : COL.off) : COL.grey, { mono: false });
      if (n > 1) drawText(f, `X${n}`, 240 - textWidth(`X${n}`, false), y, COL.grey, { mono: false });
    });
    drawTextCentered(f, this.note || 'A: PLAY   B: BACK', 128, 208, this.note ? COL.pink : COL.grey, { mono: false });
  }
}
