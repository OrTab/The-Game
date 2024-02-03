export type ModalArguments = {
  title?: string;
  buttons: {
    onClick: (event: MouseEvent) => void;
    content: string | HTMLElement;
  }[];
};

export class Modal {
  private static currentModal: Modal | null = null;
  private modalContainer: HTMLDivElement;
  private buttonsContainer: HTMLDivElement | undefined;

  constructor({ title, buttons }: ModalArguments) {
    if (Modal.currentModal) {
      Modal.currentModal.hide(true);
    }
    Modal.currentModal = this;
    this.modalContainer = document.createElement('div');
    this.modalContainer.classList.add('modal');
    if (title) {
      const titleElement = document.createElement('h4');
      titleElement.innerText = title;
      this.modalContainer.appendChild(titleElement);
    }
    this.updateButtons(buttons);
    document.body.appendChild(this.modalContainer);
    setTimeout(() => {
      this.modalContainer.classList.add('show');
    }, 50);
  }

  updateButtons(buttons: ModalArguments['buttons']) {
    const newButtonsContainer = document.createElement('div');
    buttons.forEach(({ content, onClick }) => {
      const button = document.createElement('button');
      button.addEventListener('click', onClick);
      button.classList.add('button');
      if (content instanceof HTMLElement) {
        button.appendChild(content);
      } else {
        button.innerText = content;
      }
      newButtonsContainer.appendChild(button);
    });
    if (this.buttonsContainer) {
      this.modalContainer.replaceChild(
        newButtonsContainer,
        this.buttonsContainer
      );
    } else {
      this.modalContainer.appendChild(newButtonsContainer);
    }
    this.buttonsContainer = newButtonsContainer;
  }

  hide(resetCurrentModal = false) {
    this.modalContainer?.classList.remove('show');
    const shouldHideNow = resetCurrentModal && Modal.currentModal === this;
    this.buttonsContainer?.childNodes.forEach((node) =>
      node.removeEventListeners({ shouldRemoveAll: true })
    );
    setTimeout(
      () => {
        if (this.modalContainer.parentElement === document.body) {
          document.body.removeChild(this.modalContainer);

          if (shouldHideNow) {
            Modal.currentModal = null;
          }
        }
      },
      shouldHideNow ? 0 : 500
    );
  }
}
