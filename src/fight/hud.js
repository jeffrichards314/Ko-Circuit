// Fight HUD: stars + hearts, both health bars, points, clock and round.
import { UI, c32 } from '../../data/palette.js';
import { drawText, textWidth, PROBE } from '../engine/font.js';
import { ICONS } from '../../data/sprites/ui.js';
import { spritePalette } from '../engine/palette.js';
import { formatPoints } from './scoring.js';

const U = spritePalette(UI).u32;
export const COL = {
  black: U[UI.index.black], white: U[UI.index.white], off: U[UI.index.offwhite],
  grey: U[UI.index.grey], dark: U[UI.index.dark], panel: U[UI.index.panel], panelHi: U[UI.index.panelHi],
  red: U[UI.index.red], redDk: U[UI.index.redDk], yellow: U[UI.index.yellow], orange: U[UI.index.orange],
  green: U[UI.index.green], cyan: U[UI.index.cyan], pink: U[UI.index.pink], blue: U[UI.index.blue],
  barBack: c32(2, 3, 6),
};
export const UIPAL = U;

export function panel(frame, x, y, w, h) {
  if (PROBE.on) PROBE.boxes.push({ x, y, w, h, kind: 'panel', seq: PROBE.seq++ });
  frame.rect(x - 1, y - 1, w + 2, h + 2, COL.black);
  frame.rect(x, y, w, h, COL.panel);
  frame.frameRect(x, y, w, h, COL.panelHi);
}

function bar(frame, x, y, w, frac, fill, hi) {
  frame.rect(x, y, w, 6, COL.barBack);
  const n = Math.max(0, Math.round((w - 2) * frac));
  frame.rect(x + 1, y + 1, n, 4, fill);
  frame.rect(x + 1, y + 1, n, 1, hi);
}

// ZERO's last phase (Phase E): a pure white screen with a minimal HUD: the hearts, and the two health bars as bare lines. Nothing else.
function drawMinimalHUD(frame, f) {
  const p = f.player, o = f.opp;
  frame.blit(p.pink ? ICONS.heartPink : ICONS.heart, 6, 6, U);
  drawText(frame, String(p.hearts), 20, 7, COL.black);
  const line = (x, w, frac, col) => { frame.rect(x, 9, w, 3, COL.black); frame.rect(x + 1, 10, Math.max(0, Math.round((w - 2) * frac)), 1, col); };
  line(46, 90, p.health / p.maxHealth, COL.red);
  line(146, 90, o.health / o.maxHealth, COL.black);
  if (f.bossPhases > 1) for (let i = 0; i < f.bossPhases; i++) frame.rect(146 + i * 6, 14, 4, 2, i + 1 < f.bossPhase ? COL.grey : COL.black);
  if (p.stars > 0) frame.blit(ICONS.star, 240, 6, U);
}

export function drawHUD(frame, f) {
  if (f.minimalHud) return drawMinimalHUD(frame, f);
  const p = f.player, o = f.opp;
  // stars + hearts
  panel(frame, 4, 5, 62, 16);
  frame.blit(ICONS.star, 8, 9, U);
  drawText(frame, String(p.stars), 19, 10, COL.white);
  const blink = p.pink && (f.clock >> 3) & 1;
  frame.blit(p.pink ? ICONS.heartPink : ICONS.heart, 32, 9, U);
  drawText(frame, String(p.hearts).padStart(2, ' '), 44, 10, blink ? COL.pink : COL.white);

  // health bars + points
  panel(frame, 70, 5, 116, 24);
  const ph = p.health / p.maxHealth, oh = o.health / o.maxHealth;
  bar(frame, 73, 8, 54, ph, ph < 0.25 && (f.clock >> 3) & 1 ? COL.red : COL.off, COL.white);
  bar(frame, 129, 8, 54, oh, COL.yellow, COL.white);
  // a big boss's phases (spec §4): a pip each under his bar; spent ones dark, the one he's in bright, the ones to come white
  if (f.bossPhases > 1) for (let i = 0; i < f.bossPhases; i++) {
    const x = 129 + i * 6, col = i + 1 < f.bossPhase ? COL.dark : i + 1 === f.bossPhase ? COL.yellow : COL.white;
    frame.rect(x - 1, 14, 6, 4, COL.black); frame.rect(x, 15, 4, 2, col);
  }
  drawText(frame, 'POINTS', 73, 18, COL.cyan, { mono: false });
  const pts = formatPoints(f.points).trim();
  drawText(frame, pts, 183 - textWidth(pts), 18, COL.white);

  // knockdowns this round, each side (3 in one round is a TKO)
  if (f.kdRound) {
    // "KD 2-1": yours, then his
    panel(frame, 4, 23, 62, 10);
    let x = 7;
    const put = (t, c) => { drawText(frame, t, x, 25, c, { mono: false }); x += textWidth(t, false) + 1; };
    put('KD', COL.cyan); x += 3;
    put(String(f.kdRound.player), f.kdRound.player >= 2 ? COL.red : COL.white);
    put('-', COL.grey);
    put(String(f.kdRound.opp), f.kdRound.opp >= 2 ? COL.yellow : COL.white);
  }

  // clock + round (the game clock: 3:00 a round). From the championship rounds on a strip under the clock says CHAMPIONSHIP ROUND, and from
  // round 6 SUDDEN DEATH under it (steady: nothing in the fight flashes)
  panel(frame, 190, 5, 62, 24);
  const secs = Math.ceil(f.clockFrames / f.fps);
  const txt = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  drawText(frame, txt, 221 - textWidth(txt) / 2, 8, COL.white);
  const rt = `ROUND ${f.round}`;
  drawText(frame, rt, 221 - textWidth(rt, false) / 2, 18, COL.green, { mono: false });
  if (f.round > f.rounds) {
    panel(frame, 114, 31, 138, f.esc.sudden ? 22 : 12);
    drawText(frame, 'CHAMPIONSHIP ROUND', 183 - textWidth('CHAMPIONSHIP ROUND', false) / 2, 34, COL.yellow, { mono: false });
    if (f.esc.sudden) drawText(frame, 'SUDDEN DEATH', 183 - textWidth('SUDDEN DEATH', false) / 2, 44, COL.red, { mono: false });
  }
}
