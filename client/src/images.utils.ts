import platform from './assets/platform.png';
import background from './assets/background.png';
// import floor from './assets/floor.png';
import spriteRunRight from './assets/spriteRunRight.png';
import spriteRunLeft from './assets/spriteRunLeft.png';
import spriteStandRight from './assets/spriteStandRight.png';
import spriteStandLeft from './assets/spriteStandLeft.png';
import { createImage } from './utils';

let numOfLoadedImages = 0;

export const PLAYER_IMAGES = {
  runRight: createImage(spriteRunRight, updateLoadedImagesNumber),
  runLeft: createImage(spriteRunLeft, updateLoadedImagesNumber),
  standLeft: createImage(spriteStandLeft, updateLoadedImagesNumber),
  standRight: createImage(spriteStandRight, updateLoadedImagesNumber),
} as const;

export const OBJECT_IMAGES = {
  background: createImage(background, updateLoadedImagesNumber),
  platform: createImage(platform, updateLoadedImagesNumber),
  // floor :createImage(floor, shouldInitGame)
};

export const NUMBER_OF_TOTAL_IMAGES_IN_GAME =
  Object.keys(PLAYER_IMAGES).length + Object.keys(OBJECT_IMAGES).length;

function updateLoadedImagesNumber() {
  numOfLoadedImages++;
}

export const isAllGameImagesLoaded = () =>
  NUMBER_OF_TOTAL_IMAGES_IN_GAME === numOfLoadedImages;
