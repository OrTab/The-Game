import { Modal } from './components/Modal';
import { BaseGame } from './BaseGame';
import { onRestart } from './shared';
import { INITIAL_PLAYER_PROPERTIES } from './constants';
import { IPlayer } from 'types';

export class SinglePlayer extends BaseGame {
  constructor() {
    const playerProperties = window.structuredClone<IPlayer>(
      INITIAL_PLAYER_PROPERTIES
    );
    super(playerProperties, SinglePlayer.handleGameOver);
    super.animate();
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
