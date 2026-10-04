// Points: landed hits, stars and knockdowns, shown on the HUD and in the results. There are no judges (§4): no decision.

export const POINTS = {
  bodyHit: 10,
  headHit: 20,
  counterBonus: 30,
  starEarned: 100,
  starPunch: 300,
  knockdown: 500,
  perfectHit: 500,     // on top of the knockdown
};

// Player punch damage against the opponent.
export const PUNCH_DAMAGE = {
  body: 4,
  head: 5,
  star: 22,
  counterMult: 1.5,
};

export function formatPoints(n) {
  return String(Math.max(0, Math.floor(n))).padStart(6, ' ');
}
