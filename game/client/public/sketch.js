const UPDATE_TIME = 1000 / 60;
const DEFAULT_TEXT_SIZE = 20;

var { Engine, Bodies, Body, World } = Matter;
var socket;
var ARENA_RADIUS;
var players = [];
var player = null;
var enemy = null;

var p5Canvas = null;

var boosting = false;
var canBoost = true;
var boostTimer = null;
var elapsedTime = 0;

const BOOST_TIME = 3000;
const BOOST_RECOVERY_TIME = 100;
const BOOST_AMOUNT = 0.5;
const GRID_SIZE = 100;

let worldOptions = {
	gravity: { x: 0, y: 0 },
};

let canv = null;
let engine = Engine.create(worldOptions);
let world = engine.world;
let playerBody;
let deathDone = false;
let gameStartTime = 0;
let gameState = {
	WAITING: "waiting",
	GAME_START: "game_start",
	PLAYING: "playing",
	GAME_OVER: "game_over"
}

let state = null;
let gameOverMsg = "";

// let leaderboard = new Leaderboard();

// Hash function,  stole off of stackoverflow
// Use it go get a color based off of players name
// Continues the simulation but the text takes the players body so the text
// will move in the direction that the player was last moving

function reset() {
	World.clear(world, true);
	players.length = 0;
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
window.addEventListener('beforeunload', (event)=>{
	socket.disconnect();
	event.preventDefault();
})

function getScale() {
	// TODO: Replace 50 w/ a const from server

	return ((10 / player.r));
}

function sendPlayerData(name){

	socket.emit("join", {playerName: name, color: 0});
}

function getPlayerData(){

	socket.once("init_data", (data) => {
		player = new Tank(data.player.x, data.player.y, data.player.r, data.player.socketId, data.player.name, data.player.gameId);

		playerBody = Bodies.circle(data.player.x, data.player.y, data.player.r, data.playerOptions);
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
		document.location.replace(`http://${window.location.hostname}:3000`);
	}

	// Fancy way of passing the name in on init connection
	socket = io(`http://${window.location.hostname}:4000`);

	if (canv == null) {
		let { canvW, canvH } = getWidthHeight();
		canv = createCanvas(800, 800 * (1 / (canvW / canvH)));
		windowResized();

	}
	
		socket.once('game_start', (data)=> {
			state = gameState.GAME_START
			gameStartTime = data.startTime;
			setTimeout(()=>{
				state = gameState.PLAYING;
				
			}, gameStartTime - Date.now());

		});
	socket.once("game_end", (data) =>{

		state = gameState.GAME_OVER;
		gameOverMsg = data.msg;	

		// setTimeout(()=>{
		// 	window.location.href = "./index.html"
		// }, 5000);
	});

	socket.on("heartbeat", (data) => {

		if(player != null){
		players.length = 0;
		data.forEach((element) => {
			
			if (element.socketId == player.socketId) {
				player = new Tank(element.x, element.y, element.r, element.socketId, element.name, element.gameId);


			} 
			else {
				enemy = new Tank(element.x, element.y, element.r, element.socketId, element.name, element.gameId);
			}
		});

		// Step it 16ms + deltaTime
		Engine.update(engine, UPDATE_TIME);

		// Move physics body to position given on server
		// translation start is relative to body which is why
		// old.x - current.x

		Body.translate(playerBody, {
			x: player.x - playerBody.position.x,
			y: player.y - playerBody.position.y,
		});
		
		Body.applyForce(playerBody, { x: 0, y: 0 }, data.filter((element) => element.socketId == player.socketId)[0].vector);

	}});

	sendPlayerData("temp");
	getPlayerData();

	frameRate(60);
}

// Need to figure out how to scale by screen size too.
// View of world should remain the same regardless of screen size

function draw() {
	if(state === gameState.WAITING){
		// draw waiting screen
		screenDraw.drawWaitScreen(playerBody.position.x, playerBody.position.y);
		socket.emit('ping', {msg: state});
	
	}

	if(state === gameState.GAME_START){
		// draw game start screen
		
		socket.emit('ping', {msg: state});
		screenDraw.drawGameStart(gameStartTime - Date.now());


	}
	if (state === gameState.GAME_OVER){
		// draw game over screen and put user back to index.html/
		screenDraw.drawGameOver(gameOverMsg);
	}

	if (state === gameState.PLAYING) {

		screenDraw.drawGame(playerBody.position.x, playerBody.position.y, getScale(), ARENA_RADIUS, GRID_SIZE);
	

		let x = mouseX;
		let y = mouseY;
		console.log(x, y);
		player.update(createVector(x - width / 2, y - height / 2));
		player.draw();

		// Math to make the pointer line in the player
		let theta = Math.atan(player.direction.y / player.direction.x);
		theta += player.direction.x < 0 ? Math.PI : 0;

		let x2 = Math.cos(theta) * player.r;
		let y2 = Math.sin(theta) * player.r;

		x2 += playerBody.position.x;
		y2 += playerBody.position.y;

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
