import { startGameFlow } from './game';

export const onRestart = () => {
  window.removeEventListeners({ shouldRemoveAll: true });
  startGameFlow();
};
