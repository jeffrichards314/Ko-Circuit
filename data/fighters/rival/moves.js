// Dash Maddox's move set (§11b), shared by his four data files. Every version
// keeps the moves he had before and adds one signature move; `w` is his tell
// for that fight (the tell window of that fight's §9 row), so each version is
// the same fighter, tighter.
//
//   base kit        Showboat Jab (anything works), Smart Cross (slip or block),
//                   Cheap Shot (low: block or duck)
//   I   Minor       KNOW-IT-ALL: throw the same punch twice in a row and he
//                   catches the second and fires this hook back (comboReader,
//                   single-punch mode). Slip LEFT or duck.
//   II  Major       FLASHBULB UPPERCUT: a camera-flash glint on his glove, then
//                   an uppercut. One-hit knockdown. Slip it.
//   III World       HIGHLIGHT REEL: he points at the big screen, then three
//                   hits, each with its own defense: slip RIGHT, BLOCK, DUCK.
//   IV  Grand Prix  GRAND FINALE: gloves up, sparks falling; he streaks left
//                   and hits from there, streaks right and hits from there,
//                   then the fireworks haymaker straight down. Slip, slip, slip.

const r = (n) => Math.max(2, Math.round(n));

export function baseMoves(w) {
  return {
    showJab: {
      name: 'SHOWBOAT JAB',
      windupFrames: w + 2, activeFrames: 6, recoveryFrames: 20,
      damage: 8,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [r(w * 0.4), w],
      starWindow: null,
      sfx: { tell: 'heh', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    smartCross: {
      name: 'SMART CROSS',
      windupFrames: w, activeFrames: 6, recoveryFrames: 22,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [r(w * 0.4), w - 2],
      starWindow: [r(w * 0.4), r(w * 0.6)],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabRTell', 'idle1'] },
    },
    cheapShot: {
      name: 'CHEAP SHOT',
      windupFrames: w, activeFrames: 6, recoveryFrames: 24,
      damage: 10,
      height: 'low',
      avoidBy: ['block', 'duck'],
      counterWindow: [r(w * 0.4), w - 2],
      starWindow: null,
      punishStar: ['ducked'],
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
  };
}

// I: the read. He throws it from his patterns too (and as his super in fight I).
export function knowItAll(w) {
  return {
    knowItAll: {
      name: 'KNOW-IT-ALL',
      windupFrames: w + 2, activeFrames: 8, recoveryFrames: 28,
      damage: 13,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [r(w * 0.4), w],
      starWindow: [r(w * 0.4), r(w * 0.65)],
      kdWindow: [r(w * 0.7), r(w * 0.7) + 3],
      sfx: { tell: 'whip', swing: 'swingHeavy' },
      animation: { windup: ['knowTell'], active: ['hook'], recovery: ['knowTell', 'idle1'] },
    },
  };
}

// II: the flashbulb. The glint is on the glove for the whole tell.
export function flashbulb(w) {
  return {
    flashbulb: {
      name: 'FLASHBULB UPPERCUT',
      knockdown: true,
      windupFrames: w + 4, activeFrames: 8, recoveryFrames: 44,
      damage: 26,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [r(w * 0.3), w + 1],
      starWindow: [r(w * 0.3), r(w * 0.5)],
      kdWindow: [r(w * 0.75), r(w * 0.75) + 3],
      noFake: true,
      punishStar: ['dodged'],
      sfx: { tell: 'flashbulb', swing: 'swingHeavy' },
      animation: { windup: ['flashTell'], active: ['upper'], recovery: ['upper', 'overheadRecover', 'idle1'] },
    },
  };
}

// III: the highlight reel. The point is the call; the three hits follow it.
export function highlightReel(w) {
  return {
    reelCall: {
      name: 'HIGHLIGHT REEL',
      feint: true, call: true,
      windupFrames: w * 2, activeFrames: 0, recoveryFrames: 4,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, w * 2 - 3],
      starWindow: [2, r(w * 0.5)],
      kdWindow: [r(w * 1.2), r(w * 1.2) + 3],
      cancels: 3,
      sfx: { tell: 'crowd' },
      animation: { windup: ['reelPoint1', 'reelPoint2'], windupRate: r(w * 0.6), active: ['reelPoint2'], recovery: ['reelPoint2'] },
    },
    reel1: {
      name: 'REEL: HOOK',
      windupFrames: w, activeFrames: 6, recoveryFrames: 4,
      damage: 13,
      avoidBy: ['dodgeR'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { tell: 'zip', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] },
    },
    reel2: {
      name: 'REEL: BODY',
      windupFrames: w, activeFrames: 6, recoveryFrames: 4,
      damage: 13,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: null, starWindow: null,
      noFake: true,
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyR'] },
    },
    reel3: {
      name: 'REEL: SWEEP',
      windupFrames: w + 4, activeFrames: 8, recoveryFrames: 42,
      damage: 16,
      avoidBy: ['duck'],
      counterWindow: null, starWindow: null,
      noFake: true,
      punishStar: ['ducked'],
      sfx: { tell: 'whoosh', swing: 'swingHeavy' },
      animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'overheadRecover', 'idle1'] },
    },
  };
}

// IV: the grand finale. Streak left, streak right (afterimages: `dash`), then the haymaker.
export function grandFinale(w) {
  const streak = (n, side, windup) => ({
    name: `GRAND FINALE ${n}`,
    dash: side, noFake: true,
    windupFrames: windup, activeFrames: 5, recoveryFrames: 3,
    damage: 13,
    avoidBy: [side < 0 ? 'dodgeR' : 'dodgeL'],
    counterWindow: null, starWindow: null,
    sfx: { tell: 'zip', swing: 'whiff' },
    animation: side < 0
      ? { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookL'] }
      : { windup: ['hookTell'], active: ['hook'], recovery: ['hook'] },
  });
  return {
    finaleCall: {
      name: 'GRAND FINALE',
      feint: true, call: true,
      windupFrames: w * 3, activeFrames: 0, recoveryFrames: 4,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, w * 3 - 3],
      starWindow: [2, r(w * 0.6)],
      kdWindow: [r(w * 1.8), r(w * 1.8) + 3],
      cancels: 3,
      sfx: { tell: 'firework' },
      animation: { windup: ['finaleTell1', 'finaleTell2'], windupRate: r(w), active: ['finaleTell2'], recovery: ['finaleTell2'] },
    },
    finale1: streak(1, -1, w + 4),
    finale2: streak(2, 1, w + 2),
    finale3: {
      name: 'FIREWORKS',
      knockdown: true, noFake: true,
      windupFrames: w + 6, activeFrames: 10, recoveryFrames: 46,
      damage: 30,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: null, starWindow: null,
      punishStar: ['dodged'],
      sfx: { tell: 'firework', swing: 'swingHeavy' },
      animation: { windup: ['finaleTell2'], active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  };
}

// ---------------------------------------------------------------------------
// The knowledge layer every Dash shares (knowledge spec K3, and the Dash row of K6).
//
// HIS FILE ON YOU: after each fight against him the strategy you leaned on most is saved
// (src/save/rivalRecord.js), and in the next one he opens with the answer to it. Each answer
// is a full anti-strategy of its own (src/fight/knowledge.js `grudge`), switched on at the bell
// for the first 25 seconds of the fight, and all four versions share them: they only use moves
// every Dash has.
export function dashGrudge() {
  return {
    id: 'fileOnYou', type: 'grudge', name: 'HIS FILE ON YOU', span: 1500, demo: 'turtle', say: 'I WATCHED THE TAPE!',
    scout: 'HE KEEPS A FILE ON YOU. HE OPENS EACH FIGHT WITH THE ANSWER TO WHATEVER YOU LEANED ON MOST IN YOUR LAST FIGHT AGAINST HIM: TURTLING, JAB SPAM, EARLY DODGES, ONE-SIDED SLIPS, HOARDED STARS, ONE-ZONE PUNCHING, WAITING, RUSHING OR REPEATED COMBOS.',
    answers: {
      jab: { type: 'jabSpam', streak: 3, counter: 'knowItAll', say: 'PARRIED!' },
      turtle: { type: 'turtling', response: 'unblockable', moves: ['smartCross', 'cheapShot'], cue: 'NO BLOCK!', say: 'NO BLOCK!' },
      early: { type: 'earlyDodge', response: 'hold', moves: ['smartCross', 'knowItAll'], say: 'HELD IT!' },
      bias: { type: 'dodgeBias', moves: ['showJab'], min: 6, share: 0.75, say: 'YOUR FAVORITE SIDE!' },
      hoard: { type: 'starHoard', moves: ['showJab', 'smartCross', 'cheapShot'], say: 'STAR STOLEN!' },
      zone: { type: 'zoneBias', frames: 480, say: 'I KNOW WHERE YOU PUNCH!' },
      passive: { type: 'passivity', response: 'snack', frames: 300, limit: 1, say: 'FIXING HIS HAIR...', step: { open: 50, anim: 'taunt', id: 'hair', heal: 0.03, star: [0, 50], interrupt: true, stunOnInterrupt: 30 } },
      rush: { type: 'rushing', span: 150, count: 2, counter: ['knowItAll'], say: 'TOO EAGER!' },
      repeat: { type: 'comboRepeat', gap: 45, counter: ['knowItAll'], say: 'SAME AGAIN?' },
    },
  };
}
// Trash talk: land a hit on you and at the end of his combo he stops to gloat (K6). That's the
// taunt `trashTalkExploit` waits for.
export const trashTalk = () => ({ id: 'trashTalk', name: 'TRASH TALK', on: 'landed', cooldown: 600, do: { steps: [{ taunt: 44 }], mark: 'trash' } });
export function trashTalkExploit({ stun, hits, frames }) {
  return {
    id: 'gloat', type: 'tauntWindow', name: 'GLOATING',
    trigger: { state: 'taunt', mark: { name: 'trash', frames: [0, 200] }, frames },
    effect: { stun, hits, star: true, say: 'HE TALKED TOO LONG!', sfx: 'heh' },
    hint: { kind: 'quote', text: 'I TOLD YOU I WAS BETTER!' },
    scout: 'AFTER HE LANDS A PUNCH ON YOU HE STOPS TO GLOAT: A PUNCH DURING IT STUNS HIM, AND GIVES YOU A STAR.',
  };
}
// (the same taunt after a punch that missed you isn't trash talk: it only marks a hit that landed)
export const readsYou = () => ({
  id: 'knowsItAll', type: 'comboRepeat', name: 'KNOW-IT-ALL', builtIn: 'read', say: 'I KNOW YOUR MOVES!',
  scout: 'THROW THE SAME PUNCH TWICE IN A ROW AND HE CATCHES THE SECOND AND FIRES THE KNOW-IT-ALL HOOK STRAIGHT BACK.',
});

export const DASH_ANIMS = {
  idle: { frames: ['idle1', 'idle2'], rate: 18 },
  block: ['block'],
  hitHigh: ['hitHigh'],
  hitLow: ['hitLow'],
  stunned: { frames: ['stunned1', 'stunned2'], rate: 16 },
  knockdown: ['kd1', 'kd2', 'kd3'],
  down: ['down'],
  getup: ['getup'],
  taunt: { frames: ['beckon1', 'beckon2'], rate: 12 },
  victory: { frames: ['showboat', 'beckon1', 'beckon2'], rate: 24 },
};

// What every Dash shares on his card.
export const DASH_CARD = { age: 22, hometown: 'THE EASTSIDE GYM' };
