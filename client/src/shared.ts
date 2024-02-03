import { initGame } from './game';

export const onRestart = () => {
  window.removeEventListeners({ shouldRemoveAll: true });
  initGame();
};
