const UPDATE_TIME = 1000 / 60;
const DEFAULT_TEXT_SIZE = 20;

let { Engine, Bodies, Body, World } = Matter;
let socket;
let ARENA_RADIUS;
let player = null;
let enemy = null;

let p5Canvas = null;

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
let playerBody;
let deathDone = false;
let gameStartTime = 0;
let gameState = {
	WAITING: "waiting",
	GAME_START: "game_start",
	PLAYING: "playing",
	GAME_OVER: "game_over",
	GAME_START_DISCONNECT: "game_start_disconnect"
}
let oldTime = 0;

let state = null;
let gameOverMsg = "";
let obstacles = null;

// let leaderboard = new Leaderboard();

// Hash function,  stole off of stackoverflow
// Use it go get a color based off of players name
// Continues the simulation but the text takes the players body so the text
// will move in the direction that the player was last moving

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

	return ((30 /  player.r));
}

function sendPlayerData(name) {

	const color = localStorage.getItem('selectedColor') ? localStorage.getItem('selectedColor'): DEFAULT_COLOR 
	socket.emit("join", { playerName: name, color: color,  token: localStorage.getItem('token') });
}

function getPlayerData() {

	socket.once("init_data", (data) => {
		debugger;
		console.log(data.player.color);
		engine = Engine.create(data.WORLD_OPTIONS);
		world = engine.world;
		player = new Tank(data.player.x, data.player.y, data.player.r, data.player.socketId, data.player.name, data.player.gameId, data.player.color);

		playerBody = Bodies.circle(data.player.x, data.player.y, data.player.r, data.PLAYER_OPTIONS);
		obstacles = data.obstacles;

		for(const ob of data.obstacles){
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

	// Fancy way of passing the name in on init connection
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

	socket.once("game_start disconnect", (data)=>{
		state = gameState.GAME_START_DISCONNECT;
		gameOverMsg = data.msg;
		clearInterval(gameStartTimerId);
		setTimeout(() => {
			window.location.href = "/"
		}, 5000);

	})
	socket.once("game_end", (data) => {

		state = gameState.GAME_OVER;
		gameOverMsg = data.msg;

		setTimeout(() => {
			window.location.href = "/"
		}, 5000);
	});

	socket.on("heartbeat", (data) => {
		
		const playerList = data.players;
		let timing = data.timing;

		console.log(data.timing.timestamp);
		if (player != null && world != null) {
			playerList.forEach((element) => {

				if (element.socketId == player.socketId) {
					player = new Tank(element.x, element.y, element.r, element.socketId, element.name, element.gameId, element.color);


				}
				else {
					enemy = new Tank(element.x, element.y, element.r, element.socketId, element.name, element.gameId, element.color);
				}
			});

			// Step it 16ms + deltaTime
			Engine.update(engine, timing - oldTime);
			oldTime = timing;
			// Move physics body to position given on server
			// translation start is relative to body which is why
			// old.x - current.x

			Body.translate(playerBody, {
				x: player.x - playerBody.position.x,
				y: player.y - playerBody.position.y,
			});

			// Body.applyForce(playerBody, { x: 0, y: 0 }, playerList.filter((element) => element.socketId === player.socketId)[0].vector);

		}
	});

	let name = localStorage.getItem("playerName");
	if (name == null || name.length > 20) {
		window.location.href = "/";
		
	}
	else{
	sendPlayerData(name);
	getPlayerData();

	frameRate(60);
	}
}

// Need to figure out how to scale by screen size too.
// View of world should remain the same regardless of screen size

function draw() {

	if (state === gameState.GAME_START_DISCONNECT){
		screenDraw.drawGameOver(gameOverMsg);

	}
	if (state === gameState.WAITING) {
		// draw waiting screen
		screenDraw.drawWaitScreen(playerBody.position.x, playerBody.position.y);
		socket.emit('ping', { msg: state });

	}

	if (state === gameState.GAME_START) {
		// draw game start screen

		socket.emit('ping', { msg: state });
		screenDraw.drawGameStart(gameStartTime - Date.now());


	}
	if (state === gameState.GAME_OVER) {
		// draw game over screen and put user back to index.html/
		screenDraw.drawGameOver(gameOverMsg);
	}

	if (state === gameState.PLAYING) {

		screenDraw.drawGame(playerBody.position.x, playerBody.position.y, getScale(), ARENA_RADIUS);
		screenDraw.drawObstacles(obstacles);	

		let x = mouseX;
		let y = mouseY;
		player.update(createVector(x - width / 2, y - height / 2));
		player.draw();

		// Math to make the pointer line in the player
		let theta = Math.atan(player.direction.y / player.direction.x);
		theta += player.direction.x < 0 ? Math.PI : 0;

		let x2 = Math.cos(theta) * player.r;
		let y2 = Math.sin(theta) * player.r;

		x2 += playerBody.position.x;
		y2 += playerBody.position.y;
		Body.applyForce(playerBody, {x: 0, y:0}, {x: x2, y: y2});	

		line(playerBody.position.x, playerBody.position.y, x2, y2);

		if (enemy != null) {
			enemy.draw();
		}

		screenDraw.drawFPS(playerBody.position.x, playerBody.position.y, getScale());
		screenDraw.drawBoostGauge(playerBody.position.x, playerBody.position.y, getScale());

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

		// Boost amount is scaled, but not proportional to mass
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

		socket.emit("update", p);

	}
}
