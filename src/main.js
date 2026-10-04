// Boot: display, input, audio, fixed-step loop and a tiny screen manager.
// The game (spec §19 G4): the title screen (Continue / New Game / Password / Options) opens the WORLD MAP (`map`), and everything else is a place on
// it that you walk to and enter: a circuit's podium hall (`interior`: the next fighter is the career fight, a beaten one an instant rematch), Dash's
// night gym, the Title Defense belt hall, the Gauntlet tower, and the Home gym whose stations open the screens that used to be menus (training,
// practice, locker, index, gallery, trophy case, medal shop, theater, jukebox, desk).
// Career flow:
//   title -> (new: customize) -> map -> [walk] -> interior -> podium -> [arrival / boss intro / entrance] -> intro card -> fight -> results
//         -> back to the podium  (a belt: belt ceremony -> jogging -> training camp -> the map, which draws the next path and walks you to it)
// `game.loc` is where you are ({ area: 'world' } or { area: 'interior', args }): go('map') takes you back to it, wherever a screen was opened from.
// Ascension: the sky gate on the map -> (first time) the sky opens (ascend) -> the climb is a stairway on the same map; the Fall (fall, descend)
//   opens a chasm in it, and after Vorgath (deal, voidDoor) a tear opens at its edge (the Void: free, reforge, trueEnding).
// Phase 7: jogging -> training camp (a drill, perks) -> map; Title Defense and the Gauntlet: their halls on the map -> run -> fight -> run.
import { Display } from './engine/renderer.js';
import { Input } from './engine/input.js';
import { Audio } from './engine/audio.js';
import { startLoop } from './engine/loop.js';
import { SONGS } from '../data/music/index.js';
import { load, save } from './save/storage.js';
import { saveCareer, newCareer } from './save/career.js';
import { saveRecords, syncRecords } from './save/records.js';
import { openSave } from './save/session.js';
import { normalizeProfile } from '../data/customization.js';
import { TitleScreen } from './screens/title.js';
import { IntroScreen } from './screens/intro.js';
import { FightScreen } from './screens/fight.js';
import { ResultsScreen } from './screens/results.js';
import { ControlsScreen } from './screens/controls.js';
import { WorldMapScreen } from './screens/worldMap.js';
import { InteriorScreen } from './screens/interior.js';
import { TravelScreen } from './screens/travel.js';
import { BlimpScreen } from './screens/blimp.js';
import { DeskScreen } from './screens/desk.js';
import { ReplayScreen } from './screens/replay.js';
import { installTouch } from './engine/touch.js';
import { CustomizeScreen } from './screens/customize.js';
import { PasswordScreen } from './screens/passwordEntry.js';
import { SavesScreen } from './screens/saves.js';
import { BeltScreen } from './screens/cutscenes.js';
import { CutsceneScreen } from './screens/cutscene.js';
import { TheaterScreen } from './screens/theater.js';
import { RunScreen, PracticeScreen } from './screens/modes.js';
import { ModeRecordsScreen } from './screens/modeRecords.js';
import { OptionsScreen, DEFAULT_OPTIONS, CRT_NAMES, applyOptions } from './screens/options.js';
import { TrainingScreen, PerksScreen } from './screens/training.js';
import { JogRoute, FerryRoute, RivalRoute, AscendRoute, FallRoute, DescendRoute, DealRoute, VoidDoorRoute, FreeRoute, ReforgeRoute, TrueEndingRoute, EndingRoute, OriginEnterRoute } from './screens/routers.js';
import { HandbookScreen } from './screens/handbook.js';
import { RecordsScreen, MedalsScreen, GalleryScreen, SoundTestScreen, UnlocksScreen } from './screens/extras.js';
import { startSpriteWorker } from './engine/spriteCache.js';

// `map` is wherever you are: inside a hall (game.loc), or out on the world map
function MapEntry(game, args = {}) { return game.loc && game.loc.area === 'interior' && !args.world ? new InteriorScreen(game, game.loc.args) : new WorldMapScreen(game, args); }
const SCREENS = {
  title: TitleScreen, intro: IntroScreen, fight: FightScreen, results: ResultsScreen, controls: ControlsScreen,
  map: MapEntry, interior: InteriorScreen, travel: TravelScreen, blimp: BlimpScreen, desk: DeskScreen, replay: ReplayScreen, customize: CustomizeScreen, password: PasswordScreen, saves: SavesScreen, belt: BeltScreen, jog: JogRoute,
  ending: EndingRoute, modeRecords: ModeRecordsScreen, run: RunScreen, practice: PracticeScreen, options: OptionsScreen,
  training: TrainingScreen, perks: PerksScreen, rival: RivalRoute,
  ascend: AscendRoute, fall: FallRoute, descend: DescendRoute, ferry: FerryRoute, deal: DealRoute,
  voidDoor: VoidDoorRoute, free: FreeRoute, reforge: ReforgeRoute, trueEnding: TrueEndingRoute, originEnter: OriginEnterRoute,
  cutscene: CutsceneScreen, theater: TheaterScreen,
  records: RecordsScreen, medals: MedalsScreen, gallery: GalleryScreen, handbook: HandbookScreen, soundtest: SoundTestScreen, unlocks: UnlocksScreen,
};

// Screens where a tap anywhere on the picture (or beside it) is a press of A: the text boxes, cards and cutscenes. (The rest read their own taps:
// the menus choose the row under the finger, the maps and halls walk to it, and the fights ignore the picture, where A is a punch.)
const TAP_ADVANCE = new Set(['intro', 'results', 'belt', 'cutscene', 'rival', 'jog', 'ferry', 'ascend', 'fall', 'descend', 'deal', 'voidDoor', 'free', 'reforge', 'trueEnding', 'ending', 'travel']);

const canvas = document.getElementById('screen');
const display = new Display(canvas);
const input = new Input();
const audio = new Audio();

const game = {
  input, audio, display,
  songs: SONGS,
  // career, records, medals, handbook, scouting, seen: all of it belongs to the open save and is read by openSave below (src/save/session.js)
  slot: 1,
  // (older saves only had a mute flag)
  options: { ...DEFAULT_OPTIONS, sound: !load('muted', false), ...(load('options', null) || {}) },
  timeScale: 1, // Practice slow motion
  screen: null,
  next: null,
  // in the Theater a scene runs on a throwaway copy of the career: nothing it does is kept (spec §19 G5), and wherever it would go next, it returns to the Theater
  go(name, args) { if (this.sandbox && !['cutscene', 'theater'].includes(name)) { name = 'theater'; args = {}; } this.next = [name, args]; },
  enterSandbox() { if (this.sandbox) return; this.sandbox = { career: this.career, saveCareer: this.saveCareer }; this.career = structuredClone(this.career || newCareer()); this.saveCareer = () => {}; },
  leaveSandbox() { if (!this.sandbox) return; this.career = this.sandbox.career; this.saveCareer = this.sandbox.saveCareer; this.sandbox = null; },
  // the profile lives in the career once one exists; before that, in 'profile'
  get profile() { return this.career ? this.career.profile : normalizeProfile(load('profile', null)); },
  // (the mode unlocks and Practice list follow the career: a password can unlock them too)
  saveCareer() { if (this.career) { saveCareer(this.career); save('profile', this.career.profile); saveRecords(syncRecords(this.records, this.career)); } },
};
applyOptions(game);
openSave(game, load('slot', 1)); // (the save that was open last time)
const touch = game.touch = installTouch(game, canvas, display); // (the on-screen pad, taps and swipes: src/engine/touch.js)

function switchScreen() {
  const [name, args] = game.next;
  game.next = null;
  game.timeScale = 1;
  if (game.screen && game.screen.exit) game.screen.exit();
  game.screen = new SCREENS[name](game, args || {});
  if (game.screen.tapAdvance === undefined) game.screen.tapAdvance = TAP_ADVANCE.has(name); // (a tap on the picture is a press of A)
  input.clearDrag(); input.takeTaps();
  window.dispatchEvent(new CustomEvent('ko:screen', { detail: name }));
  game.screen.enter && game.screen.enter();
}

// Browsers only allow audio after a user gesture (iOS Safari: on the touch ending, not starting; touch.js unlocks there too).
const unlock = () => { if (!suspended()) audio.unlock(); };
for (const ev of ['keydown', 'pointerdown', 'pointerup', 'touchend', 'click']) window.addEventListener(ev, unlock, { passive: true });

// Leaving the game (another tab, another app, the lock screen, a notification shade) or holding the phone upright pauses it; a fight shows its own pause
// menu, everything else freezes behind a card until the player taps or presses a key. The sound is held too, and comes back with the player.
let away = false, awayHandled = false;
const suspended = () => away && !awayHandled;
function leave() {
  if (away) return;
  away = true; touch.releaseAll(); input.keys.clear(); input.virtual = {};
  awayHandled = !!(game.screen && game.screen.autoPause && game.screen.autoPause());
  audio.suspend();
  if (!awayHandled) touch.pausedEl.classList.add('on');
}
function wake() {
  if (!away) return;
  away = false; awayHandled = false;
  touch.pausedEl.classList.remove('on');
  input.keys.clear();
  audio.resume();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); else if (awayHandled) wake(); });
window.addEventListener('pagehide', () => { audio.suspend(); leave(); }); // (the sound is faded out before the page goes)
document.addEventListener('freeze', () => audio.suspend());
window.addEventListener('blur', leave);
window.addEventListener('focus', () => { if (awayHandled) wake(); });
window.addEventListener('pageshow', () => { if (awayHandled) wake(); });
for (const ev of ['keydown', 'pointerdown', 'touchend']) window.addEventListener(ev, () => { if (away && !document.hidden) wake(); }, { passive: true });
let wasSuspended = false;
// F2: cycle the CRT filter from anywhere
window.addEventListener('keydown', (e) => {
  if (e.code !== 'F2') return;
  e.preventDefault();
  game.options.crt = (game.options.crt + 1) % CRT_NAMES.length;
  save('options', game.options);
  applyOptions(game);
});

startSpriteWorker(); // (the poses of a fight are composed off the main thread: spriteCache.js)
game.go('title');
switchScreen();

startLoop({
  update() {
    const sus = suspended();
    if (sus !== wasSuspended) { wasSuspended = sus; if (sus) audio.suspend(); else audio.resume(); if (!sus) input.clearDrag(); }
    if (sus) return;
    input.update();
    if (game.screen.tapAdvance && input.takeTaps().length) input.fake('a'); // (a tap on a text box, a card or a cutscene is a press of A)
    game.screen.update();
    if (game.next) switchScreen();
  },
  render() {
    if (suspended()) return;
    game.screen.render(display.frame);
    const [sx, sy] = game.screen.shake ? game.screen.shake() : [0, 0];
    display.present(sx, sy);
  },
  timeScale: () => game.timeScale,
});

if (new URLSearchParams(location.search).has('dev') && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) window.KO = game; // handy in the console (?dev), on your own machine only
