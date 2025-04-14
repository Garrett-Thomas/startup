const UPDATE_TIME = 1000 / 60;
const DEFAULT_TEXT_SIZE = 20;

let { Engine, Bodies, Body, World } = Matter;

let socket;
let ARENA_RADIUS;
let player = null;
let enemies = new Map();

let boosting = false;
let canBoost = true;
let boostTimer = null;
let elapsedTime = 0;
let gameStartTimerId = null;

const BOOST_TIME = 3000;
const BOOST_RECOVERY_TIME = 1000;
const BOOST_AMOUNT = 0.5;
const DEFAULT_COLOR = "#B4B4B4";

let canv = null;
let engine = null
let world = null;
let delay = 0;
let playerBody;
let deathDone = false;
let gameStartTime = 0;

let updateQueue = [];


let gameState = {
	WAITING: "waiting",
	GAME_START: "game_start",
	PLAYING: "playing",
	GAME_OVER: "game_over",
	GAME_START_DISCONNECT: "game_start_disconnect"
}

let state = gameState.WAITING;
let gameOverMsg = "";
let obstacles = null;

// Hash function,  stole off of stackoverflow
// Use it go get a color based off of players name
// Continues the simulation but the text takes the players body so the text
// will move in the direction that the player was last moving


setInterval(() => {
	if (state === gameState.PLAYING) {

		let boostSpeed = boosting ? BOOST_AMOUNT / getScale() : 1;
		let p = {
			position: player.position,
			r: player.r,
			vector: {
				x: player.direction.x * boostSpeed,
				y: player.direction.y * boostSpeed,
			},
			gameID: player.gameID,
		};

		socket.emit("update", p);
	}

}, UPDATE_TIME);


function reset() {
	playerBody = null;
	socket = null;
	timer = null;
	deathDone = false;
	boosting = false;
	elapsedTime = 0;
}

function getWidthHeight() {
	return {
		canvW:
			window.innerWidth ||
			document.documentElement.clientWidth ||
			document.body.clientWidth,
		canvH:
			window.innerHeight ||
			document.documentElement.clientHeight ||
			document.body.clientHeight,
	};
}

function windowResized() {
	let { canvW, canvH } = getWidthHeight();
	let aspectRatio = canvW / canvH;
	if (aspectRatio != width / height) {
		resizeCanvas(800, 800 * (1 / aspectRatio));
	}
	canvas.style.width = canvW + "px";
	canvas.style.height = canvH + "px";
}

document.addEventListener("keydown", () => {
	if (keyCode == 32 && canBoost && !boosting && state === gameState.PLAYING) {
		boostTimer = Date.now() - elapsedTime;
		boosting = true;
	}
});
document.addEventListener("keyup", () => {
	if (keyCode == 32) {
		boosting = false;
	}
});
document.addEventListener("keypress", () => {
	if (keyCode == 13 && deathDone) {
		reset();
		setup();
		loop();
	}
});
window.addEventListener('beforeunload', (event) => {
	socket.disconnect();
	event.preventDefault();
})

function getScale() {
	// TODO: Replace 50 w/ a const from server

	// return 1;
	return ((30 / player.r));
}

function sendPlayerData(name) {

	const color = localStorage.getItem('selectedColor') ? localStorage.getItem('selectedColor') : DEFAULT_COLOR
	socket.emit("join", { playerName: name, color: color, token: localStorage.getItem('token'), roomName: localStorage.getItem("roomName") });
}

function getPlayerData() {

	socket.once("init_data", (data) => {
		obstacles = data.obstacles;
		for (const wrestler of data.players) {

			if (wrestler.socketID == socket.id) {
				player = new Sumo(wrestler.position, data.DEFAULT_RADIUS, wrestler.socketID, wrestler.name, data.gameID, wrestler.color);
			}
			else {
				enemies.set(wrestler.socketID, new Sumo(wrestler.position, data.DEFAULT_RADIUS, wrestler.socketID, wrestler.name, data.gameID, wrestler.color));
			}
		}

		ARENA_RADIUS = data.ARENA_RADIUS;
		state = gameState.WAITING;
		loop();

	});

}

function setup() {
	noLoop();

	if (
		!document.referrer.includes(window.location.hostname) ||
		localStorage.getItem("playerName") == null
	) {
		document.location.replace(`/`);
	}
	socket = io();

	if (canv == null) {
		let { canvW, canvH } = getWidthHeight();
		canv = createCanvas(800, 800 * (1 / (canvW / canvH)));
		windowResized();

	}

	socket.once('game_start', (data) => {
		state = gameState.GAME_START
		gameStartTime = data.startTime;

		gameStartTimerId = setTimeout(() => {
			state = gameState.PLAYING;

		}, gameStartTime - Date.now());

	});

	socket.once("game_start disconnect", (data) => {
		state = gameState.GAME_START_DISCONNECT;
		gameOverMsg = data.msg;
		clearInterval(gameStartTimerId);
		setTimeout(() => {
			window.location.replace("/");
		}, 5000);

	})
	socket.once("game_end", (data) => {

		state = gameState.GAME_OVER;

		gameOverMsg = "You won";

		if (socket.id == data.loserID) {
			gameOverMsg = "You lost";
		}

		setTimeout(() => {
			window.location.replace("/");
		}, 5000);
	});

	socket.on("heartbeat", (data) => {

		const playerBodies = data.players;

		playerBodies.forEach((body) => {

			debugger;

			if (body.socketID === socket.id) {
				player.position = body.position
			}

			else {
				const enemy = enemies.get(body.socketID);
				enemy.position = body.position;

			}

		});


	});

	let name = localStorage.getItem("playerName");
	if (name == null || name.length > 20) {
		window.location.href = "/";

	}
	else {
		state === gameState.WAITING;
		sendPlayerData(name);
		getPlayerData();
		frameRate(60);

	}
}

// Need to figure out how to scale by screen size too.
// View of world should remain the same regardless of screen size

function draw() {
	// if (state === gameState.GAME_START_DISCONNECT) {
	// 	screenDraw.drawGameOver(gameOverMsg);

	// }
	if (state === gameState.WAITING) {
		// draw waiting screen
		screenDraw.drawWaitScreen(width / 2, height / 2);

	}
	if (state === gameState.GAME_START) {
		// draw game start screen

		screenDraw.drawGameStart(gameStartTime - Date.now());

	}
	if (state === gameState.GAME_OVER) {
		// draw game over screen and put user back to index.html/
		screenDraw.drawGameOver(gameOverMsg);
	}

	if (state === gameState.PLAYING && player !== null) {


		let x = mouseX;
		let y = mouseY;

		const playerX = player.position.x;
		const playerY = player.position.y;

		player.update(createVector(x - width / 2, y - height / 2));

		screenDraw.drawGame(playerX, playerY, getScale(), ARENA_RADIUS);
		screenDraw.drawObstacles(obstacles);

		player.draw();
		// Math to make the pointer line in the player
		let theta = Math.atan(player.direction.y / player.direction.x);

		theta += player.direction.x < 0 ? Math.PI : 0;

		line(playerX, playerY, playerX + Math.cos(theta) * player.r, playerY + Math.sin(theta) * player.r);


		for (const enemy of enemies.values()) {
			enemy.draw();
		}

		screenDraw.drawFPS(playerX, playerY, getScale());
		screenDraw.drawBoostGauge(playerX, playerY, getScale());

		// Responsible for managing when the player can boost
		if (boosting) {
			elapsedTime = Date.now() - boostTimer;

			if (elapsedTime >= BOOST_TIME) {
				boosting = false;
				canBoost = false;
				elapsedTime = BOOST_TIME;

				const interval = setInterval(() => {
					// Makes gauge look like its filling up
					elapsedTime -= BOOST_TIME / (BOOST_RECOVERY_TIME / UPDATE_TIME);
				}, UPDATE_TIME);

				setTimeout(() => {
					canBoost = true;
					clearInterval(interval);
					elapsedTime = 0;
				}, BOOST_RECOVERY_TIME);
			}
		}
	}
}
