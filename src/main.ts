import { InitialPlayerProperties } from "./models";
import { Player } from "./game";
import "./styles/style.css";

const player = new Player(InitialPlayerProperties);

window.addEventListener("keydown", player.movePlayer.bind(player));
window.addEventListener("keyup", player.movePlayer.bind(player));
