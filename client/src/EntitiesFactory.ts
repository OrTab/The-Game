import { PROPERTIES_TO_CALCULATE_SCALE_TO_SCREEN } from './constants';
import { Position, Size } from './types';

export class EntitiesFactory {
  static createInstance<T extends new (...args: any[]) => any>(
    entity: T,
    ...args: any[]
  ): InstanceType<T> {
    const _entity: InstanceType<T> & {
      position: Position;
      size: Size;
    } = new entity(...args);
    return this.extendObject(_entity);
  }

  static extendObject<T>(_entity: T): T {
    const handler = {
      get(target: any, property: string) {
        if (PROPERTIES_TO_CALCULATE_SCALE_TO_SCREEN.includes(property)) {
          target[property].x = target[property].x;
          target[property].y = target[property].y;
        }
        return target[property];
      },
    };
    return new Proxy(_entity, handler);
  }
}
