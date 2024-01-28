import { SOCKET_EVENTS } from './../../shared/socketEvents';
import './styles/style.css';
import {
  Position,
  PressedKeys,
  Size,
  GameSettings,
  Velocity,
  IPlayer,
  IObjectCreationParams,
  TGameObjectsType,
  TLastPressedKeys,
} from './types';
import { getRandomInt, createImage, sleep, runPolyfill } from './utils';
import platform from './assets/platform.png';
import background from './assets/background.png';
// import floor from './assets/floor.png';
import spriteRunRight from './assets/spriteRunRight.png';
import spriteRunLeft from './assets/spriteRunLeft.png';
import spriteStandRight from './assets/spriteStandRight.png';
import spriteStandLeft from './assets/spriteStandLeft.png';
import SocketService from './services/SocketService';
import { INITIAL_PLAYER_PROPERTIES, getInitialPlayerImage } from './constants';
import { Lobby } from './lobby';
import { Modal } from './components/Modal';

const PLAYER_IMAGES = {
  runRight: createImage(spriteRunRight, shouldInitGame),
  runLeft: createImage(spriteRunLeft, shouldInitGame),
  standLeft: createImage(spriteStandLeft, shouldInitGame),
  standRight: createImage(spriteStandRight, shouldInitGame),
} as const;

const OBJECT_IMAGES = {
  background: createImage(background, shouldInitGame),
  platform: createImage(platform, shouldInitGame),
  // floor :createImage(floor, shouldInitGame)
};

const numberOfTotalImagesInGame =
  Object.keys(PLAYER_IMAGES).length + Object.keys(OBJECT_IMAGES).length;
let numOfLoadedImages = 0;
let requestAnimationId = 0;

runPolyfill();
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

class Game {
  private velocityXDiff: number = GameSettings.VelocityXDiff;
  private velocityYDiff: number = GameSettings.VelocityYDiff;
  private gravity: number = GameSettings.Gravity;
  private jumpsCounter: number = 0;
  player: IPlayer;
  private velocity: Velocity = {
    x: 0,
    y: 10,
  };
  private keys: PressedKeys = {
    right: { isPressed: false },
    left: { isPressed: false },
  };
  private lastPressedKey: TLastPressedKeys = 'right';
  private platforms: GenericObject[] = [];
  private genericObjects: GenericObject[] = [];
  private floors: GenericObject[] = [];
  private numberOfFramesToIncreaseDistance = 0;
  private lastDistanceToIncreaseSpeed: number = 0;
  private distance: number = 0;
  private numberOfFramesToMovePlayerImage: number = 0;
  private platformMovementXDiff: number =
    GameSettings.InitialPlatformMovementXDiff;
  private floorMovementXDiff: number = GameSettings.InitialFloorMovementXDiff;
  private isMultiPlayerMatch: boolean = false;
  flow: (() => void | Promise<void>)[];

  constructor(player: IPlayer, isMultiPlayerMatch = false) {
    this.player = player;
    this.isMultiPlayerMatch = isMultiPlayerMatch;
    window.addEventListener('resize', () => {
      this.resize(false);
    });
    window.addEventListener('keydown', this.handleOnKey.bind(this));
    window.addEventListener('keyup', this.handleOnKey.bind(this));
    this.resize(true);
    this.initObjects();
    this.flow = [
      this.drawObjects,
      this.handleFloor,
      this.handlePlatforms,
      this.handleDistance,
      this.updateVelocity,
      this.updatePlayerPosition,
    ];
    this.animate();
  }

  private set setKeyIsPressed({
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

  private get noKeysPressed() {
    return false;
    // return !this.keys.left.isPressed && !this.keys.right.isPressed;
  }

  private get canGoLeft() {
    return (
      this.keys.left.isPressed &&
      !this.bothKeysPressed &&
      this.player.position.x > 150
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
    this.platforms = this.getGameObjects({
      minX: 0,
      maxX: 500,
      img: OBJECT_IMAGES.platform,
      type: 'platform',
    });

    this.genericObjects[0] = new GenericObject(
      { x: -1, y: -1 },
      { height: canvas.height, width: canvas.width },
      OBJECT_IMAGES.background
    );
    this.floors = this.getGameObjects({
      minX: 0,
      img: OBJECT_IMAGES.platform,
      type: 'floor',
    });
  }

  //main function , control the flow
  private animate() {
    requestAnimationId = requestAnimationFrame(this.animate.bind(this));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.flow.forEach((fn) => fn.call(this));
  }

  private drawObjects() {
    this.genericObjects.forEach((obj) => obj.draw());
  }

  private handleFloor() {
    this.floors.forEach((floor, idx) => {
      if (
        floor.position.x + floor.size.width + canvas.width <
        this.player.position.x
      ) {
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
    this.shouldAddMoreFloors();
  }

  private getMovementDiff(diff: number) {
    if (this.bothKeysPressed) {
      return diff;
    }
    return this.keys.left.isPressed ? -diff : diff;
  }

  private shouldAddMoreFloors() {
    const secondFromLastFloor = this.floors.at(-2);
    console.log(this.floors);

    if (
      secondFromLastFloor &&
      this.player.position.x >= secondFromLastFloor.position.x
    ) {
      const lastFloor = this.floors.at(-1);
      if (lastFloor) {
        const floors =
          this.getGameObjects({
            minX:
              lastFloor.position.x +
              lastFloor.size.width +
              getRandomInt(120, 350),
            img: OBJECT_IMAGES.platform,
            type: 'floor',
          }) || [];
        this.floors.push(...floors);
      }
    }
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
    } else this.velocity.x = 0;
  }

  private handlePlayerImage() {
    const { playerImage } = this.player;
    if (this.noKeysPressed) {
      playerImage.stand.image =
        this.lastPressedKey === 'right' ? 'runRight' : 'runLeft';
    } else if (this.bothKeysPressed || this.keys.right.isPressed) {
      playerImage.run.image = 'runRight';
    } else if (this.keys.left.isPressed) playerImage.run.image = 'runLeft';
  }

  private updatePlayerPosition() {
    const {
      position,
      size: { width },
    } = this.player;
    position.y += this.velocity.y;
    position.x += this.velocity.x;

    if (position.y > canvas.height || position.x + width < 0) {
      handleGameOver();
    }
    if (this.isMultiPlayerMatch) {
      SocketService.emit('updatePlayer', this.player);
    }
    this.drawPlayer();
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
      x,
      y,
      currentImage.size.height,
      currentImage.size.width
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
      if (
        platform.position.x + platform.size.width + canvas.width <
        this.player.position.x
      ) {
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

    this.shouldAddMorePlatforms();
  }

  private shouldAddMorePlatforms() {
    const thirdFromLastPlatform = this.platforms.at(-3);
    if (
      thirdFromLastPlatform &&
      this.player.position.x >= thirdFromLastPlatform.position.x
    ) {
      const lastPlatform = this.platforms.at(-1);
      if (lastPlatform) {
        const { x: posX } = lastPlatform.position;
        const platforms =
          this.getGameObjects({
            minX: posX,
            maxX: posX + lastPlatform.size.width,
            img: OBJECT_IMAGES.platform,
            type: 'platform',
          }) || [];
        this.platforms.push(...platforms);
      }
    }
  }

  private getGameObjects({
    minX,
    maxX = 500,
    img,
    type,
  }: IObjectCreationParams) {
    const callbackPerType: {
      [type in TGameObjectsType]: () => GenericObject;
    } = {
      platform() {
        minX = getRandomInt(minX + GameSettings.MinXDiffBetweenPlatform, maxX);
        maxX += 500;
        return new GenericObject(
          {
            x: minX,
            y: getRandomInt(320, canvas.height - 250),
          },
          {
            width: getRandomInt(150, 350),
            height: 30,
          },
          img
        );
      },
      floor() {
        const widthOfFloor =
          minX === 0 ? canvas.width - 300 : getRandomInt(250, 450);
        const platform = new GenericObject(
          {
            x: minX,
            y: canvas.height - 80,
          },
          {
            width: widthOfFloor,
            height: 80,
          },
          img
        );
        minX += widthOfFloor + getRandomInt(120, 350);
        return platform;
      },
    };
    return Array(5).fill('').map(callbackPerType[type]);
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
      this.platformMovementXDiff += 0.2;
      this.floorMovementXDiff += 0.2;
      await sleep(500);
      this.platformMovementXDiff += 0.1;
      this.floorMovementXDiff += 0.1;
      await sleep(500);
      this.platformMovementXDiff += 0.2;
      this.floorMovementXDiff += 0.2;
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
          if (this.jumpsCounter > 0) velocityY -= 4;
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
        this.setKeyIsPressed = { side: 'right', isPressed: type === 'keydown' };
        break;
      case 'ArrowLeft':
        this.lastPressedKey = 'left';
        this.setKeyIsPressed = { side: 'left', isPressed: type === 'keydown' };
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

class MultiPlayerGame extends Game {
  players: IPlayer[] = [];
  constructor(player: IPlayer) {
    super(player, true);
    SocketService.on(
      SOCKET_EVENTS.UPDATE_PLAYER,
      this.updatePlayersState.bind(this)
    );

    this.flow.push(this.drawPlayers.bind(this));
  }

  updatePlayersState(player: IPlayer) {
    this.players = this.players.map((_player) =>
      _player._id === player._id ? player : _player
    );
  }

  drawPlayers() {
    this.players.forEach((player) => {
      this.drawPlayer(player);
    });
  }
}

export class GenericObject {
  position: Position;
  size: Size;
  img: HTMLImageElement;
  constructor(position: Position, size: Size, image: HTMLImageElement) {
    this.position = position;
    this.size = size;
    this.img = image;
  }

  draw() {
    const {
      position: { x, y },
      size: { width, height },
      img,
    } = this;
    ctx.drawImage(img, x, y, width, height);
  }
}
function shouldInitGame() {
  numOfLoadedImages++;

  if (numOfLoadedImages === numberOfTotalImagesInGame) {
    initGame();
  }
}

const initMultiPlayerGame = async () => {
  const playerProperties = window.structuredClone<IPlayer>(
    INITIAL_PLAYER_PROPERTIES
  );
  playerProperties.playerImage = getInitialPlayerImage();
  const lobby = new Lobby(playerProperties);
};

function initGame() {
  const isMultiPlayerGame = confirm('Multi Player match?');
  if (isMultiPlayerGame) {
    initMultiPlayerGame();
    return;
  }
  const playerProperties = window.structuredClone<IPlayer>(
    INITIAL_PLAYER_PROPERTIES
  );
  playerProperties.playerImage = getInitialPlayerImage();
  new Game(playerProperties);
}

function handleGameOver() {
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

  cancelAnimationFrame(requestAnimationId);

  SocketService.terminate();
}

function onRestart() {
  window.removeEventListeners({ shouldRemoveAll: true });
  initGame();
}
