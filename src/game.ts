// @ts-ignore
import "./styles/style.css";
import {
  PlayerProperties,
  Position,
  PressedKeys,
  Size,
  Values,
  Velocity,
  InitialPlayerProperties,
} from "./models";
import { getRandomInt, createImage, formatNumber } from "./utils";
import platformImage from "./assets/platform.png";
import background from "./assets/background.png";
import floor from "./assets/floor.png";

const imgRight = createImage(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/160783/boy1.png",
  initGame
);
const imgLeft = createImage(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/160783/boy2.png",
  initGame
);
const backgroundImage = createImage(background, initGame);
const floorImage = createImage(floor, initGame);

let numOfLoadedImages = 0;
let numberOfFramesForDistance = 0;
let lastDistanceToIncreaseSpeed = 0;
let distance = 0;
let numberOfFrames = 0;
let platfromMovementXDiff = 4;

const canvas = document.querySelector("canvas");
const c = canvas?.getContext("2d");
class Canvas {
  private velocityXDiff: number = Values.X_DIFF;
  private velocityYDiff: number = Values.Y_DIFF;
  readonly gravity: number = 1;
  upCounter: number = 0;
  playerImage: HTMLImageElement = imgRight;
  counter: number = 0;
  imageCounter: number = 0;
  player: PlayerProperties;
  velocity: Velocity = {
    x: 0,
    y: 10,
  };
  keys: PressedKeys = {
    right: { isPressed: false },
    left: { isPressed: false },
  };
  platforms: Platform[] = [];
  genericObjects: GenericObject[] = [];

  constructor(player: PlayerProperties) {
    this.player = player;
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    this.animate();
    this.initObjects();
  }

  get bothKeysPressed() {
    return this.keys.right.isPressed && this.keys.left.isPressed;
  }

  get canGoLeft() {
    return this.keys.left.isPressed && this.player.position.x > 100;
  }

  get canGoRight() {
    return (
      canvas &&
      this.keys.right.isPressed &&
      this.player.position.x < canvas.width / 2 - this.player.size.width
    );
  }

  initObjects() {
    if (canvas) {
      this.platforms = this.getPlatforms() || [];

      this.genericObjects[0] = new GenericObject(
        { x: -1, y: -1 },
        { height: canvas.height, width: canvas.width },
        backgroundImage
      );
      this.genericObjects[1] = new GenericObject(
        { x: 0, y: canvas.height - 120 },
        { height: 120, width: canvas.width },
        floorImage
      );
    }
  }

  drawPlayer() {
    const {
      position: { x, y },
      size: { width, height },
    } = this.player;

    if (c && canvas) {
      if (this.bothKeysPressed || this.keys.right.isPressed) {
        this.playerImage = imgRight;??
      } else if (this.keys.left.isPressed) this.playerImage = imgLeft;

      c.drawImage(
        this.playerImage,
        this.imageCounter,
        0,
        89,
        103,
        x,
        y,
        89,
        103
      );
    }
    numberOfFrames++;

    if (
      /*  (this.keys.left.isPressed || this.keys.right.isPressed) &&
      !this.bothKeysPressed && */
      (this.velocity.y === 0 || this.velocity.y === 1) &&
      numberOfFrames > Values.NumberOfFramesToMovePlayerImage
    ) {
      this.handlePlayerImage();
      numberOfFrames = 0;
    }
  }

  update() {
    const {
      size: { width, height },
      position,
    } = this.player;

    position.y += this.velocity.y;
    position.x += this.velocity.x;

    if (
      canvas &&
      position.y + height + this.velocity.y >= canvas.height - 118
    ) {
      this.velocity.y = 0;
      this.upCounter = 0;
    } else {
      this.velocity.y += this.gravity;
    }
    this.drawPlayer();
  }

  handlePlatforms() {
    canvas &&
      this.platforms.forEach((platform, idx) => {
        if (platform.position.x + canvas.width < this.player.position.x) {
          setTimeout(() => {
            this.platforms.splice(idx, 1);
          }, 0);
        }
        platform.position.x -= platfromMovementXDiff;

        if (this.isOnPlatform(platform)) {
          this.velocity.y = 0;
          this.upCounter = 0;
        }
        if (this.canGoRight) {
          this.velocity.x = this.velocityXDiff;
        } else if (this.canGoLeft) {
          this.velocity.x = -this.velocityXDiff;
        } else this.velocity.x = 0;

        if (numberOfFramesForDistance > Values.NumberOfFramesToIncreaseDistance) {
          this.handleDistance();
        }

        const thirdFromLastPlatform = this.platforms[this.platforms.length - 3];
        if (
          thirdFromLastPlatform &&
          this.player.position.x >= thirdFromLastPlatform.position.x
        ) {
          const lastPlatform = this.platforms[this.platforms.length - 1];
          if (lastPlatform) {
            const posX = lastPlatform && lastPlatform.position.x;
            const platforms =
              this.getPlatforms(posX, posX + lastPlatform.size.width) || [];
            this.platforms.push(...platforms);
          }
        }
        platform.draw();
      });
  }

  isOnPlatform(platform: Platform) {
    const {
      size: { width, height },
      position,
    } = this.player;
    if (
      position.y >= platform.position.y + platform.size.height &&
      position.y <= platform.position.y + platform.size.height + height &&
      position.x + width >= platform.position.x &&
      position.x < platform.position.x + platform.size.width
    ) {
      // console.log('Touching with the head at the bottom of platform');
    }

    return (
      position.y + height <= platform.position.y &&
      position.y + height + this.velocity.y >= platform.position.y &&
      position.x + width >= platform.position.x &&
      position.x <= platform.position.x + platform.size.width
    );
  }

  getPlatforms(prevX = 100, maxX = 500) {
    const img = createImage(platformImage);
    return (
      canvas &&
      Array(5)
        .fill("")
        .map(() => {
          prevX = getRandomInt(prevX + Values.MinXDiffBetweenPlatfrom, maxX);
          maxX += 500;
          const platform = new Platform(
            {
              x: prevX,
              y: getRandomInt(320, canvas.height - 250),
            },
            { width: getRandomInt(150, 350), height: 30 },
            img
          );
          return platform;
        })
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    canvas && c && c.clearRect(0, 0, canvas.width, canvas.height);
    this.genericObjects.forEach((obj) => obj.draw());
    this.handlePlatforms();
    numberOfFramesForDistance++;
    this.update();
  }

  handleDistance() {
    distance++;
    numberOfFramesForDistance = 0;
    if (
      distance - Values.RangeToIncreaseSpeed ===
      lastDistanceToIncreaseSpeed
    ) {
      lastDistanceToIncreaseSpeed = distance;
      platfromMovementXDiff += 0.2;
      setTimeout(() => {
        platfromMovementXDiff += 0.5;
        setTimeout(() => {
          platfromMovementXDiff += 0.3;
        }, 500);
      }, 500);
    }
  }

  handleOnKey({ code, type }: KeyboardEvent) {
    let velocityY = this.velocityYDiff;
    switch (code) {
      case "ArrowUp":
      case "Space":
        if (this.upCounter >= Values.MaxJumpsWhileInAir) return;
        if (type === "keyup") {
          this.upCounter++;
          // console.log(`You have more ${Values.maxJumpsWhileInAir - this.upCounter} times to jump while air`);
        } else {
          if (this.upCounter > 0) {
            velocityY -= 5;
          }
          this.velocity.y = -velocityY;
        }
        break;
      case "ArrowDown":
        break;
      case "ArrowRight":
        if (type === "keyup") {
          this.keys.right.isPressed = false;
        } else {
          this.keys.right.isPressed = true;
        }
        break;
      case "ArrowLeft":
        if (type === "keyup") {
          this.keys.left.isPressed = false;
        } else {
          this.keys.left.isPressed = true;
        }
        break;
    }
  }

  handlePlayerImage() {
    this.imageCounter = this.counter * 89;
    this.counter++;
    if (this.counter === Values.NumberOfPlayerImageFrames) this.counter = 0;
  }

  resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
}

class DrawImagesOnCanvas {
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
    if (c) {
      c.drawImage(img, x, y, width, height);
    }
  }
}

class Platform extends DrawImagesOnCanvas {
  movementXDiff: number = Values.X_DIFF;
  readonly movementYDiff: number = Values.Y_DIFF;
  constructor(position: Position, size: Size, image: HTMLImageElement) {
    super(position, size, image);
  }
}

class GenericObject extends DrawImagesOnCanvas {
  constructor(position: Position, size: Size, image: HTMLImageElement) {
    super(position, size, image);
  }
}

export class Player extends Canvas {
  position: Position | undefined;
  size: Size;

  constructor(player: PlayerProperties) {
    super(player);
    this.position = player.position;
    this.size = player.size;
  }
}

function initGame() {
  numOfLoadedImages++;
  if (numOfLoadedImages === Values.NumberOfImages) {
    const player = new Player(InitialPlayerProperties);
    window.addEventListener("keydown", player.handleOnKey.bind(player));
    window.addEventListener("keyup", player.handleOnKey.bind(player));
  }
}
