import { Modal } from './components/Modal';
import { BaseGame } from './BaseGame';
import { onRestart } from './shared';
import { INITIAL_PLAYER_PROPERTIES } from './constants';
import { IPlayer } from './types';
import { GenericObject } from './GenericObject';
import { OBJECT_IMAGES } from './images.utils';
import { getRandomInt } from './utils';

export class SinglePlayerGame extends BaseGame {
  constructor() {
    const playerProperties = window.structuredClone<IPlayer>(
      INITIAL_PLAYER_PROPERTIES
    );
    super(playerProperties, SinglePlayerGame.handleGameOver);
    super.animate();
  }

  protected handleSubclassLogic() {
    this._shouldAddMoreFloors();
    this._shouldAddMorePlatforms();
  }

  private _shouldAddMoreFloors() {
    const secondFromLastFloor = this.floors.at(-2);

    if (
      secondFromLastFloor &&
      this.player.position.x >= secondFromLastFloor.position.x
    ) {
      const lastFloor = this.floors.at(-1);
      if (lastFloor) {
        const floors =
          GenericObject.getGameObjects({
            minX:
              lastFloor.position.x +
              lastFloor.size.width +
              getRandomInt(80, 100),
            img: OBJECT_IMAGES.platform,
            type: 'floor',
          }) || [];
        this.floors.push(...floors);
      }
    }
  }

  private _shouldAddMorePlatforms() {
    const thirdFromLastPlatform = this.platforms.at(-3);
    if (
      thirdFromLastPlatform &&
      this.player.position.x >= thirdFromLastPlatform.position.x
    ) {
      const lastPlatform = this.platforms.at(-1);
      if (lastPlatform) {
        const { x: posX } = lastPlatform.position;
        const platforms =
          GenericObject.getGameObjects({
            minX: posX,
            maxX: posX + lastPlatform.size.width,
            img: OBJECT_IMAGES.platform,
            type: 'platform',
          }) || [];
        this.platforms.push(...platforms);
      }
    }
  }

  static handleGameOver() {
    const modal = new Modal({
      title: 'Game Over',
      buttons: [
        {
          onClick: () => {
            modal.hide();
            onRestart();
          },
          content: 'Restart',
        },
      ],
    });
  }
}
