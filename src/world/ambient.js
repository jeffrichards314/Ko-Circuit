// The life on each map (spec §19 G11): things that happen around the map while you walk it, drawn over the scenery and under the clouds.
// Everything is worked out from the frame counter and the world position (no state to save), anchored to the world so it scrolls with it.
//   AMBIENT[name] = { draw(f, cam, t, screen) }   name is a map's `ambient`
//   main: gulls, boats sailing, fish jumping          champ: searchlights, fireworks over the arena, a blimp, confetti
//   zero: lightning, debris rising, the picture glitching          pantheon: light beams, spirits rising, clouds rolling over
//   underworld: embers, falling ash, the ferry on the Styx          void: drifting debris, glitching tiles, silent white figures
import { c32 } from '../engine/palette.js';
import { VIEW_TOP, VIEW_BOT } from './paint.js';
import { decoImg, KIND_BY_ID } from './tiles.js';
import { drawImg, hash2 } from './img.js';
import { bayer } from '../scene/gfx.js';

const VH = VIEW_BOT - VIEW_TOP;
// the world cells (size px) that the view overlaps: fn(cellX, cellY) for each
function cells(cam, size, fn) {
  const x0 = Math.floor(cam.x / size) - 1, x1 = Math.floor((cam.x + 256) / size) + 1, y0 = Math.floor(cam.y / size) - 1, y1 = Math.floor((cam.y + VH) / size) + 1;
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) fn(cx, cy);
}
const sx = (cam, wx) => Math.round(wx - cam.x), sy = (cam, wy) => Math.round(wy - cam.y + VIEW_TOP);
const inView = (x, y) => x >= -40 && x < 296 && y >= VIEW_TOP - 40 && y < VIEW_BOT + 40;
const px = (f, x, y, col) => { if (y >= VIEW_TOP && y < VIEW_BOT) f.px(x, y, col); };
const rect = (f, x, y, w, h, col) => { const y0 = Math.max(VIEW_TOP, y), y1 = Math.min(VIEW_BOT, y + h); if (y1 > y0) f.rect(x, y0, w, y1 - y0, col); };
const kindAt = (S, wx, wy) => KIND_BY_ID[S.P.kindAt(Math.floor(wx / 16), Math.floor(wy / 16))];
const dimg = (f, img, x, y, o = {}) => drawImg(f, img, x, y, { clipY: VIEW_TOP, clipB: VIEW_BOT, ...o });

const WHITE = c32(31, 31, 31), GREY = c32(20, 21, 24), INK = c32(2, 2, 4);

// ---------------------------------------------------------------------------------------------------------------- the circuit road
const main = {
  draw(f, cam, t, S) {
    // gulls: a few crossing the whole map on long loops, wings flapping
    for (let i = 0; i < 6; i++) {
      const span = S.W.px[0] + 200, wx = ((hash2(i, 1, 41) * span + t * (0.35 + hash2(i, 2, 41) * 0.3)) % span) - 100, wy = hash2(i, 3, 41) * S.W.px[1] + Math.sin(t / 50 + i) * 12;
      const x = sx(cam, wx), y = sy(cam, wy); if (!inView(x, y)) continue;
      const up = ((t >> 3) + i) & 1;
      px(f, x, y, WHITE); px(f, x - 1, y - up, WHITE); px(f, x + 1, y - up, WHITE); px(f, x - 2, y - 1 + up, GREY); px(f, x + 2, y - 1 + up, GREY);
    }
    // boats sailing the sea: each on its own row, turning back at land
    for (let i = 0; i < 10; i++) {
      const wy = (0.08 + hash2(i, 4, 43) * 0.9) * S.W.px[1], span = S.W.px[0], ph = (hash2(i, 5, 43) * span + t * 0.2) % (span * 2), wx = ph < span ? ph : span * 2 - ph;
      if (!kindAt(S, wx, wy).water || !kindAt(S, wx + 10, wy).water || !kindAt(S, wx - 10, wy).water) continue;
      const x = sx(cam, wx), y = sy(cam, wy); if (!inView(x, y)) continue;
      dimg(f, decoImg('sailboat', t >> 4, 0), x - 8, y - 16, { flip: ph >= span });
      if ((t >> 3) & 1) { px(f, x - 9, y, WHITE); px(f, x + 8, y, WHITE); }
    }
    // a whale now and then: a back, a spout, a tail going under
    cells(cam, 320, (cx, cy) => {
      const per = 700, ph = (t + Math.floor(hash2(cx, cy, 47) * per)) % per; if (ph > 140) return;
      const wx = cx * 320 + 40 + hash2(cx, cy, 48) * 240 + ph * 0.3, wy = cy * 320 + 40 + hash2(cx, cy, 49) * 240;
      if (!kindAt(S, wx, wy).water || !kindAt(S, wx + 20, wy).water || !kindAt(S, wx - 10, wy).water) return;
      const x = sx(cam, wx), y = sy(cam, wy), back = c32(6, 9, 18), backH = c32(12, 16, 26);
      if (ph < 100) { rect(f, x - 10, y - 2, 20, 3, back); rect(f, x - 8, y - 3, 14, 1, backH); if (ph > 20 && ph < 60) for (let k = 0; k < 6; k++) { px(f, x - 6 - (k & 1), y - 4 - k, WHITE); px(f, x - 6 + (k >> 1) - 1, y - 9, WHITE); } }
      else { rect(f, x + 8, y - 6, 2, 6, back); rect(f, x + 5, y - 8, 4, 2, back); rect(f, x + 9, y - 8, 4, 2, back); }
      px(f, x - 12, y + 1, WHITE); px(f, x + 12, y + 1, WHITE);
    });
    // fish jumping: a splash on the water here and there
    cells(cam, 96, (cx, cy) => {
      const per = 240, ph = (t + Math.floor(hash2(cx, cy, 44) * per)) % per; if (ph > 24) return;
      const wx = cx * 96 + hash2(cx, cy, 45) * 96, wy = cy * 96 + hash2(cx, cy, 46) * 96; if (!kindAt(S, wx, wy).water) return;
      const x = sx(cam, wx), y = sy(cam, wy), h = Math.round(Math.sin((ph / 24) * Math.PI) * 6);
      px(f, x, y - h, c32(29, 20, 8)); px(f, x + 1, y - h, c32(29, 20, 8)); if (ph < 4 || ph > 20) { px(f, x - 2, y, WHITE); px(f, x + 3, y, WHITE); px(f, x, y + 1, WHITE); }
    });
  },
};

// ---------------------------------------------------------------------------------------------------------------- the city of champions
const LIGHT = c32(31, 30, 20), GOLD = c32(31, 24, 5);
const FIRE = [c32(31, 12, 18), c32(31, 28, 9), c32(8, 26, 31), c32(31, 31, 31), c32(26, 10, 31)];
const champ = {
  draw(f, cam, t, S) {
    const A = S.W.nodes.dream;
    // two searchlights from behind the arena sweeping the sky
    for (let k = 0; k < 2; k++) {
      const a = -Math.PI / 2 + Math.sin(t / 90 + k * 2.2) * 0.7, ox = A.x + (k ? 26 : -26), oy = A.y - 30;
      for (let d = 8; d < 150; d += 1) {
        const wx = ox + Math.cos(a) * d, wy = oy + Math.sin(a) * d, x = sx(cam, wx), y = sy(cam, wy), w = Math.round(d * 0.12);
        for (let j = -w; j <= w; j++) { const xx = x + j; if (bayer(xx, y) < 0.22 - d / 900) px(f, xx, y, LIGHT); }
      }
    }
    // fireworks over the arena: a burst every couple of seconds somewhere above it
    for (let k = 0; k < 2; k++) {
      const per = 110, ph = (t + k * 55) % per, n = Math.floor((t + k * 55) / per), bx = A.x + (hash2(n, k, 51) - 0.5) * 140, by = A.y - 90 - hash2(n, k, 52) * 60, col = FIRE[(n + k) % FIRE.length];
      if (ph < 20) { const y = sy(cam, by + (20 - ph) * 5), x = sx(cam, bx); px(f, x, y, GOLD); px(f, x, y + 2, c32(20, 13, 2)); continue; }
      const r = Math.min(26, (ph - 20) * 0.9), fade = ph > 70;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, x = sx(cam, bx + Math.cos(a) * r), y = sy(cam, by + Math.sin(a) * r + (ph - 20) * 0.15); if (!fade || ((t + i) & 1)) { px(f, x, y, col); if (ph < 50) px(f, x + 1, y, WHITE); } }
    }
    // a blimp crossing the city
    {
      const span = S.W.px[0] + 160, wx = ((t * 0.25) % span) - 80, wy = 22 * 16, x = sx(cam, wx), y = sy(cam, wy);
      if (inView(x, y)) {
        for (let j = -6; j <= 6; j++) { const w = Math.round(22 * Math.sqrt(1 - (j * j) / 49)); rect(f, x - w, y + j, w * 2, 1, j < -2 ? c32(29, 29, 30) : j > 2 ? c32(17, 18, 22) : c32(24, 24, 27)); }
        rect(f, x - 6, y + 7, 12, 3, c32(12, 12, 16)); rect(f, x - 14, y - 1, 12, 2, c32(26, 5, 7)); rect(f, x + 2, y - 1, 10, 2, GOLD);
        rect(f, x + 20, y - 5, 4, 10, c32(17, 18, 22));
        if ((t >> 4) & 1) px(f, x - 23, y, c32(31, 8, 8));
      }
    }
    // confetti drifting down over Victory Plaza
    const P = S.W.nodes.plaza;
    for (let i = 0; i < 24; i++) {
      const wx = P.x + (hash2(i, 1, 53) - 0.5) * 200 + Math.sin(t / 20 + i) * 4, wy = P.y - 110 + ((t * (0.4 + hash2(i, 2, 53) * 0.4) + hash2(i, 3, 53) * 150) % 150);
      px(f, sx(cam, wx), sy(cam, wy), FIRE[i % FIRE.length]);
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------- ZERO's world
const PURP = c32(27, 10, 31), PURP2 = c32(14, 4, 22);
const zero = {
  draw(f, cam, t, S) {
    // debris rising out of the rifts
    cells(cam, 64, (cx, cy) => {
      for (let i = 0; i < 2; i++) {
        const per = 300, ph = (t + hash2(cx, cy + i, 61) * per) % per, wx = cx * 64 + hash2(cx, cy, 62 + i) * 64 + Math.sin(ph / 20) * 3, wy = cy * 64 + 64 - ph * 0.5;
        const x = sx(cam, wx), y = sy(cam, wy); const c = i ? PURP2 : c32(10, 8, 17);
        rect(f, x, y, 2, 2, c); if ((ph >> 3) & 1) px(f, x + 2, y + 1, PURP);
      }
    });
    // lightning: now and then a bolt from the top of the view to the ground, and the picture jumps
    const per = 200, ph = t % per, n = Math.floor(t / per);
    if (ph < 10) {
      let x = 30 + Math.floor(hash2(n, 1, 63) * 196), y = VIEW_TOP; const bot = VIEW_TOP + 60 + Math.floor(hash2(n, 2, 63) * 100);
      while (y < bot) { const nx = x + Math.floor((hash2(n, y, 64) - 0.5) * 8); for (let k = 0; k < 4; k++) { rect(f, x + Math.round(((nx - x) * k) / 4), y + k, 2, 1, ph < 4 ? WHITE : PURP); } x = nx; y += 4; }
      if (ph < 3) for (let yy = VIEW_TOP; yy < VIEW_BOT; yy++) for (let xx = (yy & 1); xx < 256; xx += 7) f.px(xx, yy, PURP2);
    }
    // glitch: a band of the picture slips sideways for a few frames
    if ((t % 97) < 4) {
      const y0 = VIEW_TOP + Math.floor(hash2(Math.floor(t / 97), 3, 65) * (VH - 12)), h = 4 + ((t >> 1) & 7), d = ((t & 2) ? 6 : -5), B = f.buf;
      for (let y = y0; y < Math.min(VIEW_BOT, y0 + h); y++) { const row = B.slice(y * 256, y * 256 + 256); for (let x = 0; x < 256; x++) B[y * 256 + x] = row[(x - d + 256) % 256]; }
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------- the Pantheon
const pantheon = {
  draw(f, cam, t, S) {
    // light beams falling through the clouds, slowly brightening and fading
    for (let i = 0; i < 4; i++) {
      const wx = (i + 0.5) * (S.W.px[0] / 4) + Math.sin(i * 3.1) * 40, x = sx(cam, wx), k = Math.max(0, Math.sin(t / 90 + i * 1.7)) * 0.7;
      if (x < -30 || x > 286) continue;
      for (let y = VIEW_TOP; y < VIEW_BOT; y++) { const wy = y - VIEW_TOP + cam.y, sway = Math.round((wy / 400) * 20); for (let j = -9; j <= 9; j++) { const xx = x + j + sway; if (bayer(xx, y) < k * 0.12 * (1 - Math.abs(j) / 10)) f.px(xx, y, c32(31, 30, 18)); } }
    }
    // spirits: little lights that rise and sway, a pale tail behind each
    cells(cam, 80, (cx, cy) => {
      const per = 360, ph = (t + hash2(cx, cy, 71) * per) % per, wx = cx * 80 + hash2(cx, cy, 72) * 80 + Math.sin(ph / 18) * 6, wy = cy * 80 + 80 - ph * 0.35;
      const x = sx(cam, wx), y = sy(cam, wy);
      rect(f, x, y, 2, 2, WHITE); px(f, x, y + 3, c32(31, 29, 16)); px(f, x + 1, y + 5, c32(29, 23, 6)); if ((t >> 2) & 1) px(f, x - 1, y, c32(31, 29, 16));
    });
    // clouds rolling over the map, drawn in a dither so the ground shows through
    for (let i = 0; i < 5; i++) {
      const span = S.W.px[0] + 240, wx = ((hash2(i, 1, 73) * span + t * (0.15 + i * 0.03)) % span) - 120, wy = (i + 0.5) * (S.W.px[1] / 5) + Math.sin(i) * 60;
      const x = sx(cam, wx), y = sy(cam, wy);
      if (x < -80 || x > 330 || y < VIEW_TOP - 40 || y > VIEW_BOT + 40) continue;
      for (const [dx, dy, rx, ry] of [[0, 0, 40, 12], [-24, 4, 22, 9], [26, 3, 24, 10], [4, -8, 20, 9]]) {
        for (let yy = -ry; yy <= ry; yy++) { const w = Math.round(rx * Math.sqrt(1 - (yy * yy) / (ry * ry))); const Y = y + dy + yy; if (Y < VIEW_TOP || Y >= VIEW_BOT) continue; for (let xx = -w; xx <= w; xx++) { const X = x + dx + xx; if (X >= 0 && X < 256 && bayer(X, Y) < 0.5) f.px(X, Y, yy > ry / 2 ? c32(24, 26, 31) : WHITE); } }
      }
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------- the Underworld
const EMB = [c32(31, 18, 4), c32(29, 8, 3), c32(31, 28, 10)];
const underworld = {
  draw(f, cam, t, S) {
    // embers rising
    cells(cam, 48, (cx, cy) => {
      for (let i = 0; i < 2; i++) {
        const per = 200, ph = (t + hash2(cx, cy + i * 7, 81) * per) % per, wx = cx * 48 + hash2(cx, cy, 82 + i) * 48 + Math.sin(ph / 12 + i) * 4, wy = cy * 48 + 48 - ph * 0.6;
        px(f, sx(cam, wx), sy(cam, wy), EMB[(i + (ph >> 4)) % 3]);
      }
    });
    // ash falling
    cells(cam, 64, (cx, cy) => {
      const per = 300, ph = (t + hash2(cx, cy, 83) * per) % per, wx = cx * 64 + hash2(cx, cy, 84) * 64 + Math.sin(ph / 25) * 8, wy = cy * 64 + ph * 0.3;
      px(f, sx(cam, wx), sy(cam, wy), c32(14, 12, 13));
    });
    // the ferry on the Styx: a black boat, a hooded ferryman with a pole, a lantern; across and back
    const dock = S.W.nodes.styxDock, u1 = S.W.nodes.u1;
    if (dock && u1) {
      const span = 150, per = 900, ph = t % per, u = ph < per / 2 ? ph / (per / 2) : 2 - ph / (per / 2), wx = dock.x - 90 + (Math.sin(u * Math.PI - Math.PI / 2) + 1) / 2 * span, wy = (dock.y + u1.y) / 2 - 2;
      const x = sx(cam, wx), y = sy(cam, wy);
      if (inView(x, y) && !(S.walker && S.walker.edge && S.walker.edge.type === 'boat')) {
        rect(f, x - 12, y, 24, 3, c32(4, 3, 5)); rect(f, x - 14, y - 2, 3, 3, c32(4, 3, 5)); rect(f, x + 11, y - 2, 3, 3, c32(4, 3, 5)); rect(f, x - 10, y + 3, 20, 1, c32(2, 1, 3));
        rect(f, x - 3, y - 11, 6, 11, c32(6, 5, 8)); rect(f, x - 2, y - 13, 4, 3, c32(6, 5, 8)); px(f, x, y - 11, c32(18, 29, 24));
        for (let k = 0; k < 16; k++) px(f, x + 4 + (k >> 2), y - 14 + k, c32(14, 10, 6));
        rect(f, x + 8, y - 8, 2, 3, (t >> 3) & 1 ? c32(31, 28, 10) : c32(29, 14, 3));
        if ((t >> 4) & 1) { px(f, x - 15, y + 2, c32(18, 29, 24)); px(f, x + 15, y + 2, c32(18, 29, 24)); }
      }
    }
  },
};

// ---------------------------------------------------------------------------------------------------------------- the Void
const FRAG = [[c32(8, 22, 8), c32(14, 28, 10)], [c32(28, 27, 26), c32(31, 31, 30)], [c32(13, 14, 18), c32(18, 19, 23)], [c32(9, 6, 8), c32(29, 14, 3)]];
const voidAmb = {
  draw(f, cam, t, S) {
    // debris drifting through: little pieces of the other worlds, turning
    cells(cam, 90, (cx, cy) => {
      const per = 600, ph = (t + hash2(cx, cy, 91) * per) % per, wx = cx * 90 + hash2(cx, cy, 92) * 90 + ph * 0.15, wy = cy * 90 + hash2(cx, cy, 93) * 90 - ph * 0.1 + Math.sin(ph / 30) * 6;
      const x = sx(cam, wx), y = sy(cam, wy), [a, b] = FRAG[Math.floor(hash2(cx, cy, 94) * 4)], turn = (ph >> 4) & 3, w = turn & 1 ? 4 : 6, h = turn & 1 ? 6 : 4;
      rect(f, x, y + 8, w, 1, INK); rect(f, x, y, w, h, a); rect(f, x, y, w, 1, b);
    });
    // tiles glitching: a few squares of the floor go white or slip, for a moment
    cells(cam, 16, (cx, cy) => {
      const per = 400, ph = (t + hash2(cx, cy, 95) * per) % per; if (ph > 5 || hash2(cx, cy, 96) > 0.18) return;
      const x = sx(cam, cx * 16), y = sy(cam, cy * 16);
      if (hash2(cx, cy, 97) < 0.5) { for (let j = 0; j < 16; j += 2) rect(f, x, y + j, 16, 1, (ph & 1) ? WHITE : INK); }
      else { rect(f, x + 3, y, 16, 16, INK); rect(f, x + 3, y + 7, 16, 1, WHITE); }
    });
    // silent white figures, far off the path: fading in, standing, fading out
    cells(cam, 200, (cx, cy) => {
      if (hash2(cx, cy, 101) > 0.55) return;
      const per = 640, ph = (t + hash2(cx, cy, 98) * per) % per; if (ph > 300) return;
      const wx = cx * 200 + 20 + hash2(cx, cy, 99) * 160, wy = cy * 200 + 30 + hash2(cx, cy, 100) * 150;
      let near = false; for (const n of Object.values(S.W.nodes)) if (Math.abs(n.x - wx) < 40 && Math.abs(n.y - wy) < 40) near = true; if (near) return;
      const K = kindAt(S, wx, wy); if (!K || !K.land) return;
      const k = ph < 60 ? ph / 60 : ph > 240 ? (300 - ph) / 60 : 1, x = sx(cam, wx), y = sy(cam, wy), img = decoImg('hollowStatue', 0, 0);
      for (let j = 0; j < img.h; j++) for (let i = 0; i < img.w; i++) { const v = img.buf[j * img.w + i], X = x - 5 + i, Y = y - img.h + j; if (v && Y >= VIEW_TOP && Y < VIEW_BOT && X >= 0 && X < 256 && bayer(X, Y) < k * 0.9) f.px(X, Y, v); }
    });
  },
};

export const AMBIENT = { main, champ, zero, pantheon, underworld, void: voidAmb };
