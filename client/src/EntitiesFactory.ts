import {
  PROPERTIES_TO_CALCULATE_SCALE_TO_SCREEN,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
} from './constants';
import { Position, Size } from './types';

export class EntitiesFactory {
  static canvas: HTMLCanvasElement;
  static createInstance<T extends new (...args: any[]) => any>(
    EntityClass: T,
    ...args: any[]
  ): InstanceType<T> {
    const instance: InstanceType<T> & {
      position: Position;
      size: Size;
    } = new EntityClass(...args);
    return this.addScalingProxy(instance);
  }

  static addScalingProxy<T>(entity: T): T {
    const handler = {
      get(target: any, property: string) {
        if (PROPERTIES_TO_CALCULATE_SCALE_TO_SCREEN.includes(property)) {
        }
        return target[property];
      },
    };
    return new Proxy(entity, handler);
  }
}
