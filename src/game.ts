import {
  PlayerProperties,
  Position,
  PressedKeys,
  Size,
  Velocity,
} from "./constsAndInterfaces";

const canvas = document.querySelector("canvas");
const c = canvas?.getContext("2d");

export class Canvas {
  readonly velocityXDiff: number = 8;
  readonly velocityYDiff: number = 12;
  readonly gravity: number = 0.8;

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

  constructor(player: PlayerProperties) {
    this.player = player;
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
    this.animate();
    this.initPlatforms();
  }

  initPlatforms() {
    this.platforms = Array(1)
      .fill("")
      .map(() => new Platform({ x: 100, y: 200 }, { width: 100, height: 40 }));
  }

  draw() {
    const {
      position: { x, y },
      size: { width, height },
      color,
    } = this.player;

    if (c && canvas) {
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.fillStyle = color;
      c.fillRect(x, y, width, height);
    }
  }

  update() {
    const {
      size: { height },
      position,
    } = this.player;

    position.y += this.velocity.y;
    position.x += this.velocity.x;

    if (this.keys.right.pressed) this.velocity.x = this.velocityXDiff;
    else if (this.keys.left.pressed) this.velocity.x = -this.velocityXDiff;
    else this.velocity.x = 0;

    if (canvas && position.y + height >= canvas.height) this.velocity.y = 0;
    else this.velocity.y += this.gravity;

    this.draw();
  }

  movePlayer({ code, type }: KeyboardEvent) {
    switch (code) {
      case "ArrowUp":
        this.velocity.y = -this.velocityYDiff;
        break;
      case "ArrowDown":
        break;
      case "ArrowRight":
        this.keys.right.pressed = type === "keydown";
        break;
      case "ArrowLeft":
        this.keys.left.pressed = type === "keydown";
        break;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.update();
    this.platforms.forEach((platform) => platform.draw());
  }

  resize() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.draw();
    }
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

export class Platform {
  position: Position;
  size: Size;
  constructor(position: Position, size: Size) {
    this.position = position;
    this.size = size;
  }

  draw() {}
}
