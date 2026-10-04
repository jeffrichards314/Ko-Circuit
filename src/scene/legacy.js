// The hand-drawn scenes the engine hosts (spec §19 G5): The Sky Opens, The Fall, the Ferryman's landing, the deal, the door to the Void,
// a Hollowed freed, The Reforging, the true ending and the credits keep their own drawing and timing; the engine adds what every
// cutscene has (fades, skipping with START, the seen record, the Theater) and takes over where they go next.
import { AscendScreen } from '../screens/ascend.js';
import { FallScreen } from '../screens/fall.js';
import { DescendScreen } from '../screens/descend.js';
import { DealScreen } from '../screens/deal.js';
import { VoidDoorScreen, FreeScreen, ReforgeScreen, TrueEndingScreen } from '../screens/void.js';
import { EndingScreen } from '../screens/ending.js';
import { OriginIntroScreen, OriginVictoryScreen, OriginTrueVictoryScreen } from '../screens/originScenes.js';

export const LEGACY = { ascend: AscendScreen, fall: FallScreen, descend: DescendScreen, deal: DealScreen, voidDoor: VoidDoorScreen, free: FreeScreen, reforge: ReforgeScreen, trueEnding: TrueEndingScreen, ending: EndingScreen, originIntro: OriginIntroScreen, originVictory: OriginVictoryScreen, originTrueVictory: OriginTrueVictoryScreen };
