const UPDATE_TIME = 1000 / 60;
const DEFAULT_TEXT_SIZE = 20;

let { Engine, Bodies, Body, World } = Matter;

let socket;
let ARENA_RADIUS;
let player = null;
let enemy = null;

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

let state = null;
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
			x: player.x,
			y: player.y,
			r: player.r,
			vector: {
				x: player.direction.x * boostSpeed,
				y: player.direction.y * boostSpeed,
			},
			gameId: player.gameId,
		};

		delay = Date.now() - delay;

		socket.emit("update", p);
	}

}, UPDATE_TIME);


function reset() {
	World.clear(world, true);
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

	return ((30 / player.r));
}

function sendPlayerData(name) {

	const color = localStorage.getItem('selectedColor') ? localStorage.getItem('selectedColor') : DEFAULT_COLOR
	socket.emit("join", { playerName: name, color: color, token: localStorage.getItem('token') });
}

function getPlayerData() {

	socket.once("init_data", (data) => {
		console.log(data.player.color);
		engine = Engine.create(data.WORLD_OPTIONS);
		world = engine.world;
		player = new Sumo(data.player.x, data.player.y, data.player.r, data.player.socketId, data.player.name, data.player.gameId, data.player.color);

		playerBody = Bodies.circle(data.player.x, data.player.y, data.player.r, data.PLAYER_OPTIONS);
		obstacles = data.obstacles;

		for (const ob of data.obstacles) {
			World.add(world, Bodies.circle(ob.x, ob.y, ob.r, data.OBSTACLE_OPTIONS));
		}

		World.add(world, playerBody);
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
		gameOverMsg = data.msg;

		setTimeout(() => {
			window.location.replace("/");
		}, 5000);
	});

	socket.on("heartbeat", (data) => {

		delay = Date.now();



		const playerList = data.players;
		// let timing = data.timing;

		if (player != null && world != null) {
			playerList.forEach((element) => {


				// This causes a lot of jerkiness. Need to find a way to really just lerp it.
				// Maybe the update data should be stored in an object attribute and I just continously lerp towards
				// it with an exponential decay function so that smaller steps are taken as the object gets closer.
				// This would remove a lot of jitter but would allow the client to be updated reasonably if big jumps are necessary

				if (element.socketId === player.socketId) {

					// player = new Sumo(element.x, element.y, element.r, element.socketId, element.name, element.gameId, element.color);
					player.x = element.x;
					player.y = element.y;
					updateQueue.push({ x: element.x, y: element.y, delay: Date.now() - data.time });

				}
				else {

					enemy = new Sumo(element.x, element.y, element.r, element.socketId, element.name, element.gameId, element.color);

				}
			});


		}
	});

	let name = localStorage.getItem("playerName");
	if (name == null || name.length > 20) {
		window.location.href = "/";

	}
	else {
		sendPlayerData(name);
		getPlayerData();

		frameRate(60);

	}
}

// Need to figure out how to scale by screen size too.
// View of world should remain the same regardless of screen size

function draw() {
	if (state === gameState.GAME_START_DISCONNECT) {
		screenDraw.drawGameOver(gameOverMsg);

	}
	if (state === gameState.WAITING) {
		// draw waiting screen
		screenDraw.drawWaitScreen(width / 2, height / 2);
		socket.emit('ping', { msg: state });

	}

	if (state === gameState.GAME_START) {
		// draw game start screen

		socket.emit('ping', { msg: state });
		screenDraw.drawGameStart(gameStartTime - Date.now());


	}
	if (state === gameState.GAME_OVER) {
		// draw game over screen and put user back to index.html/
		screenDraw.drawGameOver(gameOverMsg, player.x, player.y);
	}

	if (state === gameState.PLAYING && player !== null) {

		// screenDraw.drawGame(playerBody.position.x, playerBody.position.y, getScale(), ARENA_RADIUS);
		let x = mouseX;
		let y = mouseY;

		player.update(createVector(x - width / 2, y - height / 2));
		screenDraw.drawGame(player.x, player.y, getScale(), ARENA_RADIUS);
		screenDraw.drawObstacles(obstacles);

		player.draw();

		// Math to make the pointer line in the player
		let theta = Math.atan(player.direction.y / player.direction.x);
		theta += player.direction.x < 0 ? Math.PI : 0;
		line(player.x, player.y, player.x + Math.cos(theta) * player.r, player.y + Math.sin(theta) * player.r);

		if (enemy != null) {
			enemy.draw();
		}

		screenDraw.drawFPS(player.x, player.y, getScale());
		screenDraw.drawBoostGauge(player.x, player.y, getScale());

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
