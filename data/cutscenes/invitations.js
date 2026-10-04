// The invitations (spec §19 G2): a mysterious scene when a secret circuit is unlocked. Each is written out in full:
// something slides under a door, the paper is opened, and the circuit is named.
export const INVITATIONS = [
  // ---- the Carnival: a striped envelope, a ringmaster's seal, confetti under the door
  {
    id: 'invite.carnival', title: 'INVITATION: CARNIVAL', zone: 'secret', music: 'invitation', world: [256, 224], circuit: 'carnival',
    layers: [
      { p: 'fill', color: [3, 2, 7] },
      { p: 'door', x: 128, y: 28, w: 76, h: 126, light: [31, 24, 10], group: 'door' },
      { p: 'ground', kind: 'planks', y: 160, group: 'door' },
      { p: 'drift', kind: 'spark', n: 20, group: 'door' },
      { p: 'fill', color: [8, 4, 14], group: 'letter', on: false },
      { p: 'paper', lines: ['YOU ARE CORDIALLY INVITED', 'TO THE GREATEST SHOW ON EARTH.', '', 'ONE NIGHT ONLY. THE BIG TOP', 'OPENS FOR CHAMPIONS WHO', 'NEVER LOST A FIGHT.', '', 'COME EARLY. STAY FOREVER.', '', '        THE RINGMASTER'], paper: [31, 29, 22], ink: [20, 3, 6], seal: [28, 5, 7], sealHi: [31, 24, 6], group: 'letter', on: false },
    ],
    actors: { env: { kind: 'prop', shape: 'envelope', x: 128, y: 158, w: 44, h: 28, paper: [31, 29, 22], stripe: [28, 5, 7], seal: [31, 24, 6], sealHi: [31, 30, 16], vis: false } },
    script: [
      { do: 'fade', to: 0, frames: 50 },
      { do: 'wait', frames: 90 },
      { do: 'sfx', name: 'chime' }, { do: 'caption', text: 'SOMETHING SLIDES UNDER THE GYM DOOR...' },
      { do: 'show', actor: 'env' }, { do: 'sfx', name: 'whoosh' },
      { do: 'move', actor: 'env', to: [128, 196], frames: 50 },
      { do: 'wait', frames: 70 }, { do: 'caption', text: '' },
      { do: 'par', par: [[{ do: 'tween', actor: 'env', to: { w: 132, h: 84, y: 152 }, frames: 50 }]] },
      { do: 'sfx', name: 'snap' }, { do: 'flash', frames: 5 },
      { do: 'hide', layer: 'door' }, { do: 'hide', actor: 'env' }, { do: 'show', layer: 'letter' },
      { do: 'wait', frames: 380 },
      { do: 'sfx', name: 'fanfare' },
      { do: 'card', title: 'THE CARNIVAL', sub: 'PICK IT ON THE MAP', small: 'SECRET CIRCUIT UNLOCKED', frames: 190, gold: true },
      { do: 'fade', to: 1, frames: 30 },
    ],
  },

  // ---- the Underground: a note with an address, a rattle of chain, a bulb swinging
  {
    id: 'invite.underground', title: 'INVITATION: UNDERGROUND', zone: 'secret', music: 'invitation', world: [256, 224], circuit: 'underground',
    layers: [
      { p: 'fill', color: [2, 2, 5] },
      { p: 'door', x: 128, y: 28, w: 76, h: 126, wood: [10, 10, 13], woodHi: [15, 15, 19], woodSh: [5, 5, 8], light: [31, 20, 5], group: 'door' },
      { p: 'ground', kind: 'stone', y: 160, group: 'door' },
      { p: 'fill', color: [4, 4, 7], group: 'letter', on: false },
      { p: 'paper', lines: ['NO SIGN. NO NUMBER.', '', 'WAREHOUSE ROW, THE DOOR', 'THAT WASN\'T THERE YESTERDAY.', '', 'NOBODY LOST A FIGHT IN THE', 'LEGENDS. WE NOTICED.', '', 'BRING YOUR HANDS.', 'LEAVE THE REFEREE.'], paper: [20, 20, 22], ink: [3, 3, 5], border: [12, 12, 14], seal: [10, 10, 12], group: 'letter', on: false },
    ],
    actors: { env: { kind: 'prop', shape: 'letter', x: 128, y: 158, w: 40, h: 26, paper: [20, 20, 22], edge: [12, 12, 14], vis: false } },
    script: [
      { do: 'fade', to: 0, frames: 50 },
      { do: 'wait', frames: 80 },
      { do: 'sfx', name: 'chainRattle' }, { do: 'caption', text: 'A RATTLE OF CHAIN. A NOTE UNDER THE DOOR.' },
      { do: 'show', actor: 'env' }, { do: 'sfx', name: 'whoosh' },
      { do: 'move', actor: 'env', to: [128, 194], frames: 40 },
      { do: 'wait', frames: 70 }, { do: 'caption', text: '' },
      { do: 'tween', actor: 'env', to: { w: 132, h: 96, y: 156 }, frames: 46 },
      { do: 'sfx', name: 'cellDoor' }, { do: 'flash', frames: 5 },
      { do: 'hide', layer: 'door' }, { do: 'hide', actor: 'env' }, { do: 'show', layer: 'letter' },
      { do: 'wait', frames: 360 },
      { do: 'sfx', name: 'siren' },
      { do: 'card', title: 'THE UNDERGROUND', sub: 'PICK IT ON THE MAP', small: 'SECRET CIRCUIT UNLOCKED', frames: 190, color: [31, 20, 5] },
      { do: 'fade', to: 1, frames: 30 },
    ],
  },

  // ---- the Nightmare: a black envelope that will not stay closed (it plays after the credits)
  {
    id: 'invite.nightmare', title: 'INVITATION: NIGHTMARE', zone: 'secret', music: 'invitation', world: [256, 224], circuit: 'nightmare',
    layers: [
      { p: 'fill', color: [1, 0, 3] },
      { p: 'drift', kind: 'dust', n: 30 },
      { p: 'fill', color: [4, 0, 8], group: 'letter', on: false },
      { p: 'paper', lines: ['YOU DID IT. YOU BEAT HIM.', 'NOW COME TO THE PLACE WHERE', 'THE SUN GOES WHEN IT DIES.', '', 'THE NIGHTMARE IS OPEN.', 'IT HAS BEEN OPEN THE WHOLE TIME.', '', 'DON\'T LOOK AT THE SKY.'], paper: [4, 1, 8], ink: [26, 20, 28], border: [16, 4, 20], seal: [20, 2, 8], sealHi: [28, 6, 14], eye: true, group: 'letter', on: false },
    ],
    actors: { env: { kind: 'prop', shape: 'envelope', x: 128, y: 120, w: 20, h: 12, paper: [3, 1, 6], edge: [10, 3, 14], ink: [16, 4, 20], seal: [20, 2, 8], sealHi: [28, 6, 14], eye: true, vis: false } },
    script: [
      { do: 'fade', to: 0, frames: 60 },
      { do: 'wait', frames: 100 },
      { do: 'sfx', name: 'whisper' }, { do: 'show', actor: 'env' },
      { do: 'tween', actor: 'env', to: { w: 44, h: 28, y: 132 }, frames: 90 },
      { do: 'caption', text: 'A BLACK ENVELOPE. IT WILL NOT STAY CLOSED.' }, { do: 'sfx', name: 'wail' },
      { do: 'tween', actor: 'env', to: { w: 132, h: 84, y: 154 }, frames: 90 },
      { do: 'caption', text: '' },
      { do: 'sfx', name: 'eclipseWarn' }, { do: 'flash', frames: 8, color: 'black' },
      { do: 'hide', actor: 'env' }, { do: 'show', layer: 'letter' },
      { do: 'wait', frames: 330 },
      { do: 'sfx', name: 'heartbeat' },
      { do: 'card', title: 'THE NIGHTMARE', sub: 'PICK IT ON THE MAP', small: 'SECRET CIRCUIT UNLOCKED', frames: 190, color: [26, 8, 24] },
      { do: 'fade', to: 1, frames: 40 },
    ],
  },
];
