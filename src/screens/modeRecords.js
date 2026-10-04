// Mode records (§6): a page for each division of the Gauntlet (Classic, Pantheon, Underworld, Void, Combined: best streak, best clear
// time, the fighter who ended each recent run) and for each division of Title Defense (best defense, best clear time, the three medals,
// recent runs). LEFT / RIGHT turns the page. Opened from the records boards of the Gauntlet tower and the championship hall (one board for
// each division: src/screens/interior.js), which open on their own division's page (`page: 'td.void'` / 'g.void').
import { drawLabel } from '../engine/textbox.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { TD_LISTS, TD_NAMES } from '../../data/fighters/titleDefense.js';
import { DIVISIONS, DIVISION_LOCK } from '../../data/divisions.js';
import { GAUNTLETS, GAUNTLET_INFO, gauntletList, gauntletUnlocked, tdUnlocked, TD_PAR, clockText, fighterName } from '../save/records.js';
import { drawMedal } from './medalIcons.js';
import { Hits, swipeX } from '../engine/hits.js';

const BG = c32(3, 3, 8), STRIPE = c32(4, 7, 12), GOLD = c32(30, 24, 6);
export const RECORD_PAGES = [...GAUNTLETS.map((z) => ({ kind: 'gauntlet', id: z })), ...DIVISIONS.map((t) => ({ kind: 'td', id: t }))];

export class ModeRecordsScreen {
  constructor(game, { back = 'map', page = 0 } = {}) {
    this.g = game; this.t = 0; this.back = back; this.hits = new Hits();
    // a board opens on its own division's page ('td.void', 'g.void'); a bare 'td' or 'gauntlet' on the first one
    const [k, id] = typeof page === 'string' ? page.split('.') : [];
    const kind = k === 'g' || k === 'gauntlet' ? 'gauntlet' : k === 'td' ? 'td' : null;
    this.page = kind ? Math.max(0, RECORD_PAGES.findIndex((p) => p.kind === kind && (!id || p.id === id))) : page;
  }
  enter() { this.g.audio.play(this.g.songs.modes); }
  update() {
    this.t++;
    const I = this.g.input, A = this.g.audio, n = RECORD_PAGES.length;
    if (I.pressed('pause') || I.pressed('b')) { A.sfx('menu'); this.g.go(this.back); return; }
    // touch: a tap on the left half of the page goes back a page, the right half on; so does a swipe
    for (const h of this.hits.take(I)) I.fake(h.x < h.w / 2 ? 'left' : 'right');
    const sx = swipeX(I, 30);
    if (sx) I.fake(sx > 0 ? 'right' : 'left');
    const d = I.pressed('left') ? -1 : I.pressed('right') ? 1 : 0;
    if (d) { this.page = (this.page + d + n) % n; A.sfx('menu'); }
  }
  render(f) {
    f.clear(BG);
    for (let y = 0; y < 224; y += 8) f.rect(0, y + ((this.t >> 3) & 7), 256, 2, STRIPE);
    const P = RECORD_PAGES[this.page], R = this.g.records, td = P.kind === 'td';
    drawTextBig(f, td ? 'DEFENSE' : 'GAUNTLET', 128, 4, td ? GOLD : COL.red, COL.black, 2);
    const title = td ? `${TD_NAMES[P.id]} DEFENSE` : GAUNTLET_INFO[P.id].name;
    drawTextCentered(f, title, 128, 24, COL.white, { mono: false });
    // the pages: one square each, the gauntlets then the defenses
    RECORD_PAGES.forEach((q, i) => {
      const x = 128 - (RECORD_PAGES.length * 10) / 2 + i * 10, on = i === this.page, open = q.kind === 'td' ? tdUnlocked(R, q.id) : gauntletUnlocked(R, q.id);
      f.rect(x, 34, 8, 6, on ? (this.t >> 3) & 1 ? COL.yellow : COL.white : open ? COL.off : COL.dark);
    });
    drawText(f, '<', 6, 33, COL.cyan, { mono: false }); drawText(f, '>', 244, 33, COL.cyan, { mono: false });
    panel(f, 8, 46, 240, 164);
    this.hits.clear(); this.hits.add(0, 0, 256, 224, 'page');
    let y = 53;
    const row = (a, b, col = COL.white) => { drawText(f, a, 16, y, COL.cyan, { mono: false }); drawText(f, b, 240 - textWidth(b, false), y, col, { mono: false }); y += 11; };
    const open = td ? tdUnlocked(R, P.id) : gauntletUnlocked(R, P.id);
    if (!open) { drawText(f, 'LOCKED', 16, y, COL.red, { mono: false }); y += 11; } // (its own row: the stats start under it)
    if (td) {
      const T = R.td[P.id], n = TD_LISTS[P.id].length;
      row('FIGHTERS', String(n));
      row('BEST DEFENSE', `${T.best} OF ${n}`, COL.yellow);
      row('FULL DEFENSES', String(T.clears));
      row('BEST CLEAR TIME', T.bestTime == null ? '--:--' : clockText(T.bestTime), T.bestTime == null ? COL.grey : COL.yellow);
      y += 2;
      [['speed', 'bronze', 'DEFEND THE TITLE'], ['flawless', 'silver', 'NO FIGHT LOST'], ['signature', 'gold', `NO FIGHT LOST, UNDER ${clockText(TD_PAR[P.id])}`]].forEach(([k, m, txt], i) => {
        drawMedal(f, 16, y - 2, k, T.medals[m]);
        drawText(f, txt, 30, y + 2, T.medals[m] ? COL.white : COL.grey, { mono: false });
        y += 14;
      });
      y += 2;
      drawText(f, 'RECENT DEFENSES', 16, y, COL.orange, { mono: false }); y += 10;
      T.runs.slice(0, 4).forEach((r) => {
        drawText(f, `${r.defenses}/${r.of}`, 16, y, COL.white, { mono: false });
        drawLabel(f, r.clear ? 'DEFENDED' : r.by ? `LOST TO ${fighterName(r.by)}` : 'GAVE UP', 58, y, 120, r.clear ? COL.green : r.by ? COL.pink : COL.grey, { mono: false, where: 'td run' });
        const t = clockText(r.seconds); drawText(f, t, 240 - textWidth(t, false), y, COL.grey, { mono: false }); y += 9;
      });
      if (!T.runs.length) drawText(f, 'NONE YET', 16, y, COL.dark, { mono: false });
    } else {
      const G = R.gauntlet[P.id], n = gauntletList(P.id).length;
      row('FIGHTERS', String(n));
      row('BEST STREAK', `${G.bestStreak} OF ${n}`, COL.yellow);
      row('STREAK TIME', G.bestStreakTime == null || !G.bestStreak ? '--:--' : clockText(G.bestStreakTime), COL.off);
      row('CLEARS', String(G.clears || 0));
      row('BEST CLEAR TIME', G.bestTime == null ? '--:--' : clockText(G.bestTime), G.bestTime == null ? COL.grey : COL.yellow);
      y += 4;
      drawText(f, 'RECENT RUNS', 16, y, COL.orange, { mono: false }); y += 10;
      G.runs.slice(0, 7).forEach((r) => {
        const who = r.by ? `LOST TO ${fighterName(r.by)}` : r.streak >= r.of ? 'CLEARED' : 'WALKED OUT';
        drawText(f, `${r.streak} WINS`, 16, y, COL.white, { mono: false });
        drawLabel(f, who, 82, y, 120, r.by ? COL.pink : r.streak >= r.of ? COL.green : COL.grey, { mono: false, where: 'gauntlet run' });
        const t = clockText(r.seconds); drawText(f, t, 240 - textWidth(t, false), y, COL.grey, { mono: false }); y += 9;
      });
      if (!G.runs.length) drawText(f, 'NONE YET', 16, y, COL.dark, { mono: false });
    }
    drawTextCentered(f, open ? 'LEFT / RIGHT: PAGE   B: BACK' : DIVISION_LOCK[P.id], 128, 214, COL.grey, { mono: false });
  }
}
