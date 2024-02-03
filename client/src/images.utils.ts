import platform from './assets/platform.png';
import background from './assets/background.png';
// import floor from './assets/floor.png';
import spriteRunRight from './assets/spriteRunRight.png';
import spriteRunLeft from './assets/spriteRunLeft.png';
import spriteStandRight from './assets/spriteStandRight.png';
import spriteStandLeft from './assets/spriteStandLeft.png';
import { createImage } from './utils';
import { initGame } from './game';

let numOfLoadedImages = 0;

export const PLAYER_IMAGES = {
  runRight: createImage(spriteRunRight, shouldInitGame),
  runLeft: createImage(spriteRunLeft, shouldInitGame),
  standLeft: createImage(spriteStandLeft, shouldInitGame),
  standRight: createImage(spriteStandRight, shouldInitGame),
} as const;

export const OBJECT_IMAGES = {
  background: createImage(background, shouldInitGame),
  platform: createImage(platform, shouldInitGame),
  // floor :createImage(floor, shouldInitGame)
};

const numberOfTotalImagesInGame =
  Object.keys(PLAYER_IMAGES).length + Object.keys(OBJECT_IMAGES).length;

function shouldInitGame() {
  numOfLoadedImages++;
  if (numOfLoadedImages === numberOfTotalImagesInGame) {
    initGame();
  }
}
