// Between-circuit cutscenes (§5), now scenes of the cutscene engine (spec §19):
//   BeltScreen  routes the belt ceremony (data/cutscenes/victories.js) and what follows it
//   drawRoadScene  the jogging road, still used by the road-run training drill (the jogging scene itself is the engine's 'jog' template)

import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32, makePalette, spritePalette } from '../engine/palette.js';
import { Mask, SpriteCanvas } from '../engine/sprites.js';
import { CIRCUITS, SHORT, isRival, zoneOf } from '../../data/circuits.js';
import { isSecret } from '../save/career.js';
import { SCENES } from '../../data/cutscenes/index.js';
import { playerPortrait } from '../../data/sprites/portraits.js';
import { jogFrames, bikeFrames } from '../../data/sprites/jog.js';
import { frontPalette, hairStyleOf, nicknameOf, trainerOf } from '../../data/customization.js';

// ---------------------------------------------------------------------------
// Belt ceremony
// ---------------------------------------------------------------------------
import { beltSprite } from '../scene/belts.js';
export { beltSprite };

const CONFETTI = [COL.yellow, COL.red, COL.cyan, COL.green, COL.pink, COL.white, COL.orange];

// The belt ceremony is a scene of the engine now (data/cutscenes/victories.js): this screen only decides what
// comes after it (the invitation of a secret circuit, the rival, the ending, the jogging or the Ferryman) and hands over.
export class BeltScreen {
  constructor(game, { circuit, next, replay = false, unlocked = null }) {
    this.g = game; this.circuit = circuit; this.nextCircuit = next; this.replay = replay; this.unlocked = unlocked;
  }
  enter() {
    const g = this.g, c = g.career, circuit = this.circuit, next = this.nextCircuit;
    let then;
    if (this.replay) then = ['map', {}];
    else if (circuit === 'dream') then = ['ending', { kind: 'main' }]; // the Dream Fight's belt is the end of the road: roll the credits
    else if (isRival(next)) then = ['rival', { id: next, phase: 'pre' }]; // he crashes the party (§11b)
    else then = [['underworld', 'void'].includes(zoneOf(next)) ? 'ferry' : 'jog', { from: circuit, to: next }];
    // a secret circuit unlocked by this belt: its invitation comes before anything else
    const f = c ? c.flags : {};
    const unlocked = this.replay ? this.unlocked : circuit === 'major' && f.carnivalUnlocked && !f.carnivalCleared ? 'carnival' : circuit === 'legends' && f.undergroundUnlocked && !f.undergroundCleared ? 'underground' : null;
    if (unlocked && SCENES[`invite.${unlocked}`] && !(c && c.flags.invited && c.flags.invited[unlocked])) {
      if (c && !this.replay) { c.flags.invited = c.flags.invited || {}; c.flags.invited[unlocked] = true; g.saveCareer(); }
      then = ['cutscene', { id: `invite.${unlocked}`, params: { circuit: unlocked }, then }];
    }
    g.go('cutscene', { id: `victory.${circuit}`, params: { circuit, replay: this.replay, unlocked }, then });
  }
  update() {}
  render(f) { f.clear(COL.black); }
}

// ---------------------------------------------------------------------------
// Jogging cutscene
// ---------------------------------------------------------------------------
const SKY = [c32(6, 5, 16), c32(11, 7, 21), c32(19, 10, 22), c32(26, 14, 18), c32(30, 20, 14), c32(31, 26, 17)];
const SUN = c32(31, 29, 16), SUN_HI = c32(31, 31, 25);
const HILL_FAR = c32(12, 8, 20), HILL = c32(7, 8, 14);
const TREE = c32(4, 10, 8), TREE_HI = c32(7, 15, 10), TRUNK = c32(8, 5, 3);
const HOUSE = c32(10, 8, 12), HOUSE_ROOF = c32(6, 4, 8), WINDOW = c32(29, 25, 12);
const TOWER = c32(8, 8, 15), TOWER_HI = c32(12, 12, 20);
const GRASS = c32(6, 13, 6), GRASS_HI = c32(10, 18, 8), CURB = c32(18, 18, 20), ROAD = c32(9, 9, 12), ROAD_SH = c32(7, 7, 10), LINE = c32(28, 26, 16);
const POST = c32(14, 9, 5), POST_HI = c32(20, 14, 8), WIRE = c32(5, 4, 6);

import { TALK, SECRET_TALK, SIGN_OFF } from '../../data/cutscenes/talk.js';

// The jogging road (sky, hills, town or city, poles, road), scrolling with t.
// Shared with the road-run training drill.
export function drawRoadScene(f, t, city) {
  // sky bands + sun
  SKY.forEach((col, i) => f.rect(0, i * 18, 256, 18, col));
  f.rect(0, 108, 256, 20, SKY[SKY.length - 1]);
  for (let y = -18; y <= 0; y++) { const w = Math.round(Math.sqrt(18 * 18 - y * y)); f.rect(190 - w, 112 + y, w * 2, 1, y > -8 ? SUN_HI : SUN); }
  // far hills (slow parallax)
  const s1 = (t * 0.2) % 256;
  for (let x = 0; x < 256; x++) {
    const X = x + s1;
    const hgt = 100 + Math.round(Math.sin(X * 0.03) * 6 + Math.sin(X * 0.071) * 4);
    f.rect(x, hgt, 1, 130 - hgt, HILL_FAR);
  }
  // midground: trees and houses (town) or towers (city)
  const s2 = (t * 0.6) % 320;
  if (city) {
    for (let i = 0; i < 12; i++) {
      const x = ((i * 37 - s2) % 320 + 320) % 320 - 32;
      const hgt = 20 + ((i * 53) % 34);
      f.rect(x, 128 - hgt, 22, hgt, TOWER); f.rect(x, 128 - hgt, 2, hgt, TOWER_HI);
      for (let y = 128 - hgt + 4; y < 124; y += 6) for (let wx = x + 5; wx < x + 20; wx += 5) if ((wx + y + i) % 3) f.rect(wx, y, 2, 2, WINDOW);
    }
  } else {
    for (let i = 0; i < 10; i++) {
      const x = ((i * 41 - s2) % 320 + 320) % 320 - 32;
      if (i % 3 === 1) {
        f.rect(x, 110, 26, 20, HOUSE);
        for (let k = 0; k < 8; k++) f.rect(x - 2 + k * 2, 110 - k * 1.5, 30 - k * 4, 2, HOUSE_ROOF);
        f.rect(x + 5, 116, 4, 4, WINDOW); f.rect(x + 16, 116, 4, 4, WINDOW);
      } else {
        f.rect(x + 9, 112, 3, 18, TRUNK);
        for (let y = -12; y <= 12; y++) { const w = Math.round(Math.sqrt(144 - y * y) * 0.85); f.rect(x + 10 - w, 104 + y * 0.8, w * 2, 1, y < -3 ? TREE_HI : TREE); }
      }
    }
  }
  // near: grass, telephone poles, curb, road with a moving center line
  f.rect(0, 128, 256, 20, GRASS);
  for (let x = 0; x < 256; x += 4) f.px((x + ((t * 2) | 0)) % 256, 128 + ((x * 7) % 6), GRASS_HI);
  const s3 = (t * 2) % 96;
  for (let x = -s3; x < 256; x += 96) {
    f.rect(x + 40, 70, 4, 76, POST); f.rect(x + 40, 70, 1, 76, POST_HI); f.rect(x + 32, 76, 20, 3, POST);
  }
  for (let x = 0; x < 256; x++) { const X = (x + s3) % 96; f.px(x, 78 + Math.round(((X - 48) / 48) ** 2 * 6), WIRE); }
  f.rect(0, 148, 256, 4, CURB);
  f.rect(0, 152, 256, 48, ROAD);
  f.rect(0, 200, 256, 24, CURB); f.rect(0, 202, 256, 22, GRASS);
  for (let y = 154; y < 200; y += 3) for (let x = (y * 7) % 5; x < 256; x += 9) f.px(x, y, ROAD_SH);
  const s4 = (t * 2) % 40;
  for (let x = -s4; x < 256; x += 40) f.rect(x, 176, 20, 2, LINE);
}
