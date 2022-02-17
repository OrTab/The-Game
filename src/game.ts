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
import { getRandomInt, createImage } from "./utils";
import platformImage from "./assets/platform.png";
import background from "./assets/background.png";

const imgRight = createImage(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/160783/boy1.png",
  initGame
);
const imgLeft = createImage(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/160783/boy2.png",
  initGame
);
const backgroundImage = createImage(background, initGame);

let numOfLoadedImages = 0;
let distance = 0;
let numberOfFrames = 0;

const canvas = document.querySelector("canvas");
const c = canvas?.getContext("2d");
class Canvas {
  private velocityXDiff: number = Values.X_DIFF;
  private velocityYDiff: number = Values.Y_DIFF;
  readonly gravity: number = 1;
  upCounter = 0;
  playerImage: HTMLImageElement = imgRight;
  counter = 0;
  imageCounter = 0;
  player: PlayerProperties;
  velocity: Velocity = {
    x: 0,
    y: 10,
  };
  keys: PressedKeys = {
    right: { pressed: false },
    left: { pressed: false },
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
    return this.keys.right.pressed && this.keys.left.pressed;
  }

  initObjects() {
    if (canvas) {
      const img = createImage(platformImage);
      let prevX = 100;
      let maxX = 500;
      this.platforms = Array(50)
        .fill("")
        .map(() => {
          prevX = getRandomInt(prevX + Values.minXDiffBetweenPlatfrom, maxX);
          maxX += 500;
          const platform = new Platform(
            {
              x: prevX,
              y: getRandomInt(500, canvas.height - 200),
            },
            { width: 350, height: 30 },
            img
          );
          return platform;
        });

      this.genericObjects[0] = new GenericObject(
        { x: -1, y: -1 },
        { height: canvas.height, width: canvas.width },
        backgroundImage
      );
    }
  }

  drawPlayer() {
    const {
      position: { x, y },
      size: { width, height },
      color,
    } = this.player;

    if (c && canvas) {
      c.fillStyle = color;
      if (this.bothKeysPressed || this.keys.right.pressed) {
        this.playerImage = imgRight;
      } else if (this.keys.left.pressed) this.playerImage = imgLeft;

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
      (this.keys.left.pressed || this.keys.right.pressed) &&
      !this.bothKeysPressed &&
      (this.velocity.y === 0 || this.velocity.y === 1) &&
      numberOfFrames > Values.numberOfFramesToMoveImage
    ) {
      this.handleImage();
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

    if (canvas && position.y + height + this.velocity.y >= canvas.height) {
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

        if (this.isOnPlatform(platform)) {
          this.velocity.y = 0;
          this.upCounter = 0;
        }
        if (!this.bothKeysPressed) {
          if (
            this.keys.right.pressed &&
            this.player.position.x < canvas.width / 2 - 100
          ) {
            this.velocity.x = this.velocityXDiff;
          } else if (this.keys.left.pressed && this.player.position.x > 100) {
            this.velocity.x = -this.velocityXDiff;
          } else this.velocity.x = 0;

          if (this.keys.right.pressed) {
            platform.position.x -= platform.movementXDiff;
            distance += 1;
          } else if (this.keys.left.pressed) {
            platform.position.x += platform.movementXDiff;
            distance -= 1;
          }
          if (distance >= Values.DISTANCE_TO_WIN) {
          }
        } else this.velocity.x = 0;
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
      // console.log("Touching with the head at the bottom of platform");
    }

    return (
      position.y + height <= platform.position.y &&
      position.y + height + this.velocity.y >= platform.position.y &&
      position.x + width >= platform.position.x &&
      position.x <= platform.position.x + platform.size.width
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    canvas && c && c.clearRect(0, 0, canvas.width, canvas.height);
    this.genericObjects.forEach((obj) => obj.draw());
    this.handlePlatforms();
    this.update();
  }

  handleOnKey({ code, type }: KeyboardEvent) {
    switch (code) {
      case "ArrowUp":
        if (this.upCounter >= Values.maxJumpsWhileInAir) return;
        if (type === "keyup") {
          this.upCounter++;
          // console.log(`You have more ${Values.maxJumpsWhileInAir - this.upCounter} times to jump while air`);
        }
        this.velocity.y = -this.velocityYDiff;
        break;
      case "ArrowDown":
        break;
      case "ArrowRight":
        if (type === "keyup") {
          this.keys.right.pressed = false;
        } else {
          this.keys.right.pressed = true;
        }
        break;
      case "ArrowLeft":
        if (type === "keyup") {
          this.keys.left.pressed = false;
        } else {
          this.keys.left.pressed = true;
        }
        break;
    }
  }

  handleImage() {
    this.imageCounter = this.counter * 89;
    this.counter++;
    if (this.counter === Values.numberOfPictureFrames) this.counter = 0;
  }

  resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.drawPlayer();
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
  readonly movementXDiff: number = Values.X_DIFF;
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
  if (numOfLoadedImages === Values.numOfImages) {
    const player = new Player(InitialPlayerProperties);
    window.addEventListener("keydown", player.handleOnKey.bind(player));
    window.addEventListener("keyup", player.handleOnKey.bind(player));
  }
}
