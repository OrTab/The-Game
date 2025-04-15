import { OBJECT_IMAGES, PLAYER_IMAGES } from './images.utils';
import './styles/style.css';
import {
  PressedKeys,
  GameSettings,
  Velocity,
  IPlayer,
  TLastPressedKeys,
} from './types';
import { sleep, runPolyfill, toPercentage, fromPercentage } from './utils';
import { GenericObject } from './GenericObject';
import { EntitiesFactory } from './EntitiesFactory';
import { REFERENCE_HEIGHT, REFERENCE_WIDTH } from './constants';

let requestAnimationId = 0;

runPolyfill();
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const MAX_POSITION_X_TO_GO_LEFT = 10;

export abstract class BaseGame {
  player: IPlayer;
  platforms: GenericObject[] = [];
  floors: GenericObject[] = [];
  private velocityXDiff: number = GameSettings.VelocityXDiff;
  private velocityYDiff: number = GameSettings.VelocityYDiff;
  private gravity: number = GameSettings.Gravity;
  private jumpsCounter: number = 0;
  private velocity: Velocity = {
    x: 0,
    y: 10,
  };
  private keys: PressedKeys = {
    right: { isPressed: false },
    left: { isPressed: false },
  };
  private lastPressedKey: TLastPressedKeys = 'right';
  private genericObjects: GenericObject[] = [];
  private numberOfFramesToIncreaseDistance = 0;
  private lastDistanceToIncreaseSpeed: number = 0;
  private distance: number = 0;
  private numberOfFramesToMovePlayerImage: number = 0;
  private platformMovementXDiff: number =
    GameSettings.InitialPlatformMovementXDiff;
  private floorMovementXDiff: number = GameSettings.InitialFloorMovementXDiff;
  constructor(player: IPlayer) {
    GenericObject.ctx = ctx;
    GenericObject.canvas = canvas;
    EntitiesFactory.canvas = canvas;
    this.player = EntitiesFactory.addScalingProxy(player);
    window.addEventListener('resize', () => {
      this.resize(false);
    });
    window.addEventListener('keydown', this.handleOnKey.bind(this));
    window.addEventListener('keyup', this.handleOnKey.bind(this));
    this.resize(true);
    this.initObjects();
  }

  protected abstract handleSubclassLogic(): void;
  protected abstract onMount?(): void;
  protected abstract handleGameOverLogic(): void;

  private setIsKeyPressed({
    side,
    isPressed,
  }: {
    side: 'left' | 'right';
    isPressed: boolean;
  }) {
    this.keys[side].isPressed = isPressed;
    this.handlePlayerImage();
  }

  private get bothKeysPressed() {
    return this.keys.right.isPressed && this.keys.left.isPressed;
  }

  // private get isLeftOrRightPressed() {
  //   return this.keys.right.isPressed || this.keys.left.isPressed;
  // }

  start() {
    this.onMount?.();
  }

  private get noKeysPressed() {
    return false;
    // return !this.keys.left.isPressed && !this.keys.right.isPressed;
  }

  private get canGoLeft() {
    return (
      this.keys.left.isPressed &&
      !this.bothKeysPressed &&
      this.player.position.x > MAX_POSITION_X_TO_GO_LEFT
    );
  }

  private get atPositionToIncreaseSpeed() {
    return this.player.position.x >= canvas.width / 1 / 2.5;
  }

  private get canGoRight() {
    return (
      !this.bothKeysPressed &&
      this.keys.right.isPressed &&
      !this.atPositionToIncreaseSpeed
    );
  }

  private get isOnFloor() {
    return this.floors.some(this.checkIsOnObject.bind(this));
  }

  private get isOnPlatform() {
    return this.platforms.some(this.checkIsOnObject.bind(this));
  }

  private initObjects() {
    // TODO: define game world
    this.genericObjects[0] = new GenericObject(
      {
        x: -1,
        y: -1,
      },
      {
        height: canvas.height,
        width: canvas.width,
      },
      OBJECT_IMAGES.background,
      'background'
    );

    this.platforms = GenericObject.getGameObjects({
      minX: 0,
      maxX: 40,
      img: OBJECT_IMAGES.platform,
      type: 'platform',
    });

    this.floors = GenericObject.getGameObjects({
      minX: 0,
      img: OBJECT_IMAGES.platform,
      type: 'floor',
    });
  }

  //main function , control the flow
  animate() {
    requestAnimationId = requestAnimationFrame(this.animate.bind(this));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawObjects();
    this.handleFloor();
    this.handlePlatforms();
    this.handleDistance();
    this.updateVelocity();
    this.updatePlayerPosition();
    this.handleSubclassLogic();
  }

  private drawObjects() {
    this.genericObjects.forEach((obj) => obj.draw());
  }

  private handleFloor() {
    this.floors.forEach((floor, idx) => {
      if (floor.position.x + floor.size.width + canvas.width < 0) {
        setTimeout(() => {
          this.floors.splice(idx, 1);
        }, 0);
      }

      if (this.checkIsOnObject(floor) && !this.keys.right.isPressed) {
        this.player.position.x -= this.floorMovementXDiff;
      }

      floor.position.x -= this.getMovementDiff(this.floorMovementXDiff);
      floor.draw();
    });
  }

  private getMovementDiff(diff: number) {
    if (this.bothKeysPressed) {
      return diff;
    }
    return this.keys.left.isPressed ? -diff : diff;
  }

  private updateVelocity() {
    if (this.isOnFloor || this.isOnPlatform) {
      this.velocity.y = 0;
      this.jumpsCounter = 0;
    } else {
      this.velocity.y += this.gravity;
    }
    if (this.canGoRight) {
      this.velocity.x = this.velocityXDiff;
    } else if (this.canGoLeft) {
      this.velocity.x = -this.velocityXDiff;
    } else {
      this.velocity.x = 0;
    }
  }

  private handlePlayerImage() {
    const { playerImage } = this.player;
    if (this.noKeysPressed) {
      playerImage.stand.image =
        this.lastPressedKey === 'right' ? 'runRight' : 'runLeft';
    } else if (this.bothKeysPressed || this.keys.right.isPressed) {
      playerImage.run.image = 'runRight';
    } else if (this.keys.left.isPressed) {
      playerImage.run.image = 'runLeft';
    }
  }

  private updatePlayerPosition() {
    const {
      position,
      size: { width },
    } = this.player;
    position.y += this.velocity.y;
    position.x += this.velocity.x;

    if (position.y > canvas.height || position.x + width < 0) {
      this.handleGameOver();
    }

    this.drawPlayer();
  }

  handleGameOver() {
    cancelAnimationFrame(requestAnimationId);
    window.removeEventListeners({ shouldRemoveAll: true });
    this.handleGameOverLogic();
  }

  drawPlayer(player?: IPlayer) {
    const {
      position: { x, y },
      playerImage,
    } = player || this.player;

    const currentImage = this.noKeysPressed
      ? playerImage.stand
      : playerImage.run;

    ctx.drawImage(
      PLAYER_IMAGES[currentImage.image] || PLAYER_IMAGES.runRight,
      currentImage.currPlayerImageFramePosition,
      0,
      this.noKeysPressed
        ? GameSettings.PlayerStandImageFrameWidth
        : GameSettings.PlayerRunImageFrameWidth,
      this.noKeysPressed
        ? GameSettings.PlayerStandImageFrameHeight
        : GameSettings.PlayerRunImageFrameHeight,
      fromPercentage(x, canvas.width),
      fromPercenvntage(y, canvas.height),
      playerImage.size.height,
      playerImage.size.width
    );
    if (!player) {
      this.updatePlayerImageFrames();
    }
  }

  private updatePlayerImageFrames() {
    this.numberOfFramesToMovePlayerImage++;
    if (
      this.numberOfFramesToMovePlayerImage >
      GameSettings.NumberOfFramesToMovePlayerImage
    ) {
      this.handlePlayerImageFrame();
      this.numberOfFramesToMovePlayerImage = 0;
    }
  }

  private checkIsOnObject(object: GenericObject) {
    const {
      size: { width, height },
      position,
    } = this.player;

    return (
      Math.floor(position.y + height) <= object.position.y &&
      Math.floor(position.y + height + this.velocity.y) >= object.position.y &&
      Math.floor(position.x + width / 2) <=
        object.position.x + object.size.width &&
      Math.floor(position.x + width / 2) >= object.position.x
    );
  }

  private handlePlatforms() {
    this.platforms.forEach((platform, idx) => {
      if (platform.position.x + platform.size.width + canvas.width < 0) {
        setTimeout(() => {
          this.platforms.splice(idx, 1);
        }, 0);
      }
      platform.position.x -= this.getMovementDiff(this.platformMovementXDiff);

      if (this.checkIsOnObject(platform) && !this.keys.right.isPressed) {
        this.player.position.x -= this.platformMovementXDiff;
      }

      platform.draw();
    });
  }

  private async handleDistance() {
    this.numberOfFramesToIncreaseDistance++;
    if (
      this.numberOfFramesToIncreaseDistance <
        GameSettings.NumberOfFramesToIncreaseDistance ||
      !this.atPositionToIncreaseSpeed
    ) {
      return;
    }
    this.distance++;
    this.numberOfFramesToIncreaseDistance = 0;
    if (
      this.distance - GameSettings.RangeToIncreaseSpeed ===
      this.lastDistanceToIncreaseSpeed
    ) {
      this.lastDistanceToIncreaseSpeed = this.distance;
      this.platformMovementXDiff += 0.02;
      this.floorMovementXDiff += 0.02;
      await sleep(500);
      this.platformMovementXDiff += 0.01;
      this.floorMovementXDiff += 0.01;
      this.gravity += 0.01;
    }
  }

  private handlePlayerImageFrame() {
    const { playerImage } = this.player;
    switch (this.noKeysPressed) {
      case false:
        playerImage.run.currPlayerImageFramePosition =
          playerImage.run.currPlayerImageFrame *
          GameSettings.PlayerRunImageFrameWidth;
        playerImage.run.currPlayerImageFrame++;
        if (
          playerImage.run.currPlayerImageFrame ===
          GameSettings.NumberOfFramesInPlayerRunImage
        ) {
          playerImage.run.currPlayerImageFrame = 0;
        }
        break;
      case true:
        playerImage.stand.currPlayerImageFramePosition =
          playerImage.stand.currPlayerImageFrame *
          GameSettings.PlayerStandImageFrameWidth;
        playerImage.stand.currPlayerImageFrame++;
        if (
          playerImage.stand.currPlayerImageFrame ===
          GameSettings.NumberOfFramesInPlayerStandImage
        ) {
          playerImage.stand.currPlayerImageFrame = 0;
        }
        break;
    }
  }

  private handleOnKey({ code, type }: KeyboardEvent) {
    let velocityY = this.velocityYDiff;
    switch (code) {
      case 'ArrowUp':
      case 'Space':
        if (this.jumpsCounter >= GameSettings.MaxJumpsWhileInAir) return;
        if (type === 'keydown') {
          this.jumpsCounter++;
          if (this.jumpsCounter > 0) {
            velocityY -= 4;
          }
          this.velocity.y = -velocityY;
        }
        break;
      case 'ArrowDown':
        if (type === 'keydown') {
          this.velocity.y += this.velocityYDiff;
        }
        break;
      case 'ArrowRight':
        this.lastPressedKey = 'right';
        this.setIsKeyPressed({ side: 'right', isPressed: type === 'keydown' });
        break;
      case 'ArrowLeft':
        this.lastPressedKey = 'left';
        this.setIsKeyPressed({ side: 'left', isPressed: type === 'keydown' });
        break;
    }
  }

  private resize(isStartGame: boolean) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!isStartGame) {
      this.genericObjects[0].size.height = canvas.height;
      this.genericObjects[0].size.width = canvas.width;
      this.drawObjects();
    }
  }
}
