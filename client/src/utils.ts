import { TListenersPerEvent } from './types';

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomColor = (): string => {
  return '#' + Math.random().toString(16).substr(-6);
};

export const createImage = (
  imgSrc: string,
  onLoadFunc?: () => void
): HTMLImageElement => {
  const img = new Image();
  img.src = imgSrc;
  if (onLoadFunc) img.onload = onLoadFunc;
  return img;
};

export const formatNumber = (
  number: number | string,
  sepNum: number = 3,
  separator: string = ','
) => {
  number = number.toString();
  let formattedNumber = '';
  let counter = number.length - 1;

  for (let i = 0; i < number.length; i++) {
    formattedNumber += number[i];
    if (counter % sepNum === 0 && counter !== 0) {
      formattedNumber += separator;
    }
    counter--;
  }
  return formattedNumber;
};

export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const runPolyfill = () => {
  EventTarget.prototype.addEventListenerBase =
    EventTarget.prototype.addEventListener;
  EventTarget.prototype.removeEventListenerBase =
    EventTarget.prototype.removeEventListener;
  const listenersMap = new WeakMap<EventTarget, TListenersPerEvent>();
  EventTarget.prototype.addEventListener = function (
    eventType: keyof WindowEventMap,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions | undefined
  ) {
    let listenersOfTarget = listenersMap.get(this);
    if (listenersOfTarget) {
      if (listenersOfTarget[eventType]) {
        listenersOfTarget[eventType] = [
          ...listenersOfTarget[eventType],
          listener,
        ];
      } else {
        listenersOfTarget[eventType] = [listener];
      }
      listenersMap.set(this, listenersOfTarget);
    } else {
      listenersMap.set(this, {
        [eventType]: [listener],
      });
    }
    this.addEventListenerBase(eventType, listener, options);
  };
  EventTarget.prototype.removeEventListener = function (
    type: string,
    callback: EventListener,
    options?: boolean | EventListenerOptions | undefined
  ) {
    listenersMap.delete(this);
    this.removeEventListenerBase(type, callback, options);
  };
  EventTarget.prototype.removeEventListeners = function ({
    type = null,
    shouldRemoveAll = false,
  }) {
    const handleRemoveListeners = (type: string, target: EventListener[]) => {
      target.forEach((listener: EventListener) => {
        this.removeEventListener(type, listener);
      });
    };

    const listenersOfTarget = listenersMap.get(this);

    if (listenersOfTarget) {
      if (shouldRemoveAll && !type) {
        for (const type in listenersOfTarget) {
          handleRemoveListeners(type, listenersOfTarget[type]);
        }
        listenersMap.delete(this);
      } else if (type && listenersOfTarget[type]) {
        handleRemoveListeners(type, listenersOfTarget[type]);
        const newListenersOfType = Object.keys(listenersOfTarget).reduce(
          (acc: TListenersPerEvent, currType) => {
            if (currType === type) return acc;
            acc[currType] = listenersOfTarget[currType];
            return acc;
          },
          {}
        );
        listenersMap.set(this, newListenersOfType);
      }
    }
  };

  if (!Array.prototype.at) {
    Array.prototype.at = function (idx) {
      if (idx < 0) return this[this.length + idx];
      return this[idx];
    };
  }

  if (!window.structuredClone) {
    window.structuredClone = <T>(obj: T) => JSON.parse(JSON.stringify(obj));
  }
};

export const toPercentage = (value: number, max: number) => (value / max) * 100;
export const fromPercentage = (percentage: number, max: number) =>
  percentage / max;
