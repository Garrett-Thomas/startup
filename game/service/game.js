import { Server } from 'socket.io';
import CONSTANTS from './constants.js';
import pkg from 'matter-js';
const { Engine, Bodies, Body, World, Vector } = pkg;
import { v4 as uuidv4 } from 'uuid';
class Obstacle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

class Player {
    constructor(x, y, r, socketId, name = "", color = {}, gameId) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vector = { x: 0, y: 0 };
        this.socketId = socketId;
        this.name = name;
        this.color = color;
        this.score = Date.now();
        this.gameId = gameId;
        this.numWins = 0;
    }
}

class Game {
    idToSocket = new Map();
    gameIDToGame = new Map();
    sockToGame = new Map();
    socketLastSeen = new Map();
    playerBodies = new Map();
    idToToken = new Map();
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
            }
        });

        this.handlerSetup();
        setInterval(() => {
            // cannot pass this.game direclty as callback
            this.game()
        }, CONSTANTS.HEARTBEAT_TIME);

    }


    handlerSetup() {


        this.io.on("connection", (socket) => {

            socket.on("update", (data) => {
                try {
                    if (this.socketLastSeen.has(socket.id)) {
                        this.socketLastSeen.set(socket.id, Date.now());
                        const player = this.playerBodies.get(socket.id);


                        Body.applyForce(player, { x: 0, y: 0 }, data.vector);

                    }
                }
                catch (err) {
                    console.error(err);
                }


            });

            socket.on("ping", () => {
                this.socketLastSeen.set(socket.id, Date.now());
            });


            socket.once("join", (data) => {


                if (data.token) {

                    // Easiest to make a new data structure to store this
                    this.idToToken.set(socket.id, data.token);
                }
                this.userSetup(socket, data.playerName, data.color);
            })



            console.log(`Player joined: ${socket.id}`);
        });







    }


    userSetup(socket, name, color) {

        /*
        2 cases to check when a new player joins
        No games / All Games full -> Create a new game and add player to it
        Games and one w/ open spot -> add player to it
        */

        let playerAdded = false;
        let gameId = "";

        this.idToSocket.set(socket.id, socket);
        this.socketLastSeen.set(socket.id, Date.now());

        for (const [key, value] of this.gameIDToGame.entries()) {
            // Player can join this game
            if (value.players.length == 1) {
                gameId = key;
                playerAdded = true;
                let x = (CONSTANTS.ARENA_RADIUS / 2) * value.spawnLocations[Math.abs(value.spawnChosen - 1)][0];
                let y = (CONSTANTS.ARENA_RADIUS / 2) * value.spawnLocations[Math.abs(value.spawnChosen - 1)][1];

                const body = Bodies.circle(x, y, CONSTANTS.DEFAULT_RADIUS, CONSTANTS.PLAYER_OPTIONS);

                World.add(value.engine.world, body);

                const p = new Player(x, y, CONSTANTS.DEFAULT_RADIUS, socket.id, name, color, key);

                value.players.push(p);


                this.playerBodies.set(socket.id, body);

                this.sockToGame.set(socket.id, gameId);

                break;
            }
        }

        if (!playerAdded) {
            gameId = uuidv4();

            const engine = Engine.create(CONSTANTS.WORLD_OPTIONS);
            const spawnSet = Math.round(Math.random());
            let spwn = CONSTANTS.SPAWN_OPTIONS[spawnSet];
            let randLoc = Math.round(Math.random());


            let gameObject = {
                engine: engine,
                players: [],
                obstacles: [],
                status: CONSTANTS.GAME_STATUS.WAITING,
                gameStartTimerId: null,
                spawnLocations: spwn,
                spawnChosen: randLoc,
                lastTime: -1
            }


            let xPlayer = (CONSTANTS.ARENA_RADIUS / 2) * spwn[randLoc][0];
            let yPlayer = (CONSTANTS.ARENA_RADIUS / 2) * spwn[randLoc][1];
            const body = Bodies.circle(xPlayer, yPlayer, CONSTANTS.DEFAULT_RADIUS, CONSTANTS.PLAYER_OPTIONS);

            gameObject.players.push(new Player(xPlayer, yPlayer, CONSTANTS.DEFAULT_RADIUS, socket.id, name, color, gameId));
            World.add(engine.world, body);
            this.playerBodies.set(socket.id, body);
            this.sockToGame.set(socket.id, gameId);



            for (let i = 0; i < 2; i++) {
                let xOb = (CONSTANTS.ARENA_RADIUS / 2) * CONSTANTS.SPAWN_OPTIONS[Math.abs(spawnSet - 1)][i][0];
                let yOb = (CONSTANTS.ARENA_RADIUS / 2) * CONSTANTS.SPAWN_OPTIONS[Math.abs(spawnSet - 1)][i][1];
                const obBody = Bodies.circle(xOb, yOb, CONSTANTS.OBSTACLE_RADIUS, { isStatic: true });
                World.add(engine.world, obBody);
                gameObject.obstacles.push(new Obstacle(xOb, yOb, CONSTANTS.OBSTACLE_RADIUS));
            }

            this.gameIDToGame.set(gameId, gameObject);

        }


        this.sendPlayerInitData(socket.id, this.gameIDToGame.get(gameId));

    }

    sendPlayerInitData(socketId, game) {

        this.idToSocket.get(socketId).emit("init_data", {
            player: game.players.filter((player) => player.socketId === socketId)[0],
            obstacles: game.obstacles,
            ARENA_RADIUS: CONSTANTS.ARENA_RADIUS,
            "PLAYER_OPTIONS": CONSTANTS.PLAYER_OPTIONS,
            "OBSTACLE_OPTIONS": CONSTANTS.OBSTACLE_OPTIONS,
            "WORLD_OPTIONS": CONSTANTS.WORLD_OPTIONS,
        });

    }



    game() {


        /*
        1. Award winners as needed
        2. Delete Games & Players as needed
        3. Send heartbeat to players
        4. If game stalled status != waiting && game.players == 1 
        
        * Now need to handle disconnect events when the status is waiting and game_start
        */

        let winners = this.heartbeat();

        this.makeLosers(winners);
        this.deleteGames(winners);
        this.deleteSockets();

    }


    deleteSockets() {


        // Although I'm iterating over stuff I'm deleting there doesn't seem to be an issue
        for (const [sockId, time] of this.socketLastSeen.entries()) {

            if (!this.sockToGame.has(sockId)) continue;

            const currGame = this.gameIDToGame.get(this.sockToGame.get(sockId));
            const currGameStatus = currGame.status;

            if (Date.now() - time > CONSTANTS.PLAYER_TIMEOUT && currGameStatus == CONSTANTS.GAME_STATUS.WAITING) {
                // There might be an issue with this call happening at the same time
                // that a new client is looking for a game
                this.deleteGames(this.gameIDToGame.get(this.sockToGame.get(sockId)).players);

            }

            // We have 2 players guranteed connected
            else if (Date.now() - time > CONSTANTS.PLAYER_TIMEOUT && (currGameStatus == CONSTANTS.GAME_STATUS.GAME_START || currGameStatus == GAME_STATUS.GAME_START.PLAYING)) {
                const activePlayer = this.gameIDToGame.get(this.sockToGame.get(sockId)).players.filter((player) => sockId != player.socketId)[0];
                this.idToSocket.get(activePlayer.socketId).emit('game_start disconnect', { msg: "Opponent disconnected" });

                this.deleteGames(this.gameIDToGame.get(activePlayer.gameId).players.filter((player) => player.socketId == sockId));

            }


        }

    }

    makeLosers(winners) {

        for (const loser of winners) {

            const gameId = loser.gameId;
            const game = this.gameIDToGame.get(gameId);

            const winner = game.players.filter((player) => loser.socketId != player.socketId)[0];
            const winnerToken = this.idToToken.get(winner.socketId);
            const loserToken = this.idToToken.get(loser.socketId);
            if (loser != null) {
                this.idToSocket.get(loser.socketId).emit('game_end', { msg: "You Lost!" });
                this.idToSocket.get(winner.socketId).emit('game_end', { msg: "You Won!" });

                if (loserToken) {
                    this.addGamePlayed(loserToken);
                }
            }

            else {
                this.idToSocket.get(winner.socketId).emit('game_end', { msg: "Opponnent disconnected" });
            }

            if (winnerToken) {

                console.log(winnerToken);
                this.addGameWon(winnerToken);
                this.addGamePlayed(winnerToken);

            }

        }


    }
    getMagnitude(x, y) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    deleteGames(winners) {

        for (const winner of winners) {
            const game = this.gameIDToGame.get(winner.gameId);

            if (game.gameStartTimerId != null) {
                clearInterval(game.gameStartTimerId);
            }
            game.players.forEach((p) => {
                this.deletePlayer(p.socketId);
            });

            this.gameIDToGame.delete(winner.gameId);
        }
    }


    // TYPE: SocketID string
    deletePlayer(socketId) {

        let game = this.gameIDToGame.get(this.sockToGame.get(socketId))
        game.players = game.players.filter((player) => player.socketId != socketId);

        try {

            this.playerBodies.delete(socketId);
            this.socketLastSeen.delete(socketId);
            this.idToSocket.get(socketId).disconnect(true);
            this.idToSocket.delete(socketId);
            this.idToToken.delete(socketId);
        }
        catch (err) {

            console.error(`Error deleting player: ${err}`);
        }
        console.log(`Removing Player ${socketId}`);
    }

    heartbeat() {

        // Iterate through each game object to step the physics engine and
        // send the client updated data
        let losers = [];

        this.gameIDToGame.forEach((value, key) => {


            if (value.players.length == 2 && value.status == CONSTANTS.GAME_STATUS.WAITING) {
                value.status = CONSTANTS.GAME_STATUS.GAME_START;

                let currTime = Date.now();
                value.players.forEach((player) => {

                    // Get each to start after a 3 second delay at the same time
                    this.idToSocket.get(player.socketId).emit('game_start', { startTime: CONSTANTS.START_TIME + currTime });
                });


                // I think this is causing issues because players may disconnect during the Game_start phase, but this event still happens
                value.gameStartTimerId = setTimeout(() => {
                    value.status = CONSTANTS.GAME_STATUS.PLAYING;
                }, (CONSTANTS.START_TIME+ currTime) - Date.now());

            }
            else if (value.players.length == 2 && value.status === CONSTANTS.GAME_STATUS.PLAYING) {

                if (value.lastTime === -1) {
                    value.lastTime = Date.now();

                    Engine.update(value.engine, CONSTANTS.HEARTBEAT_TIME);
                }
                else {

                    Engine.update(value.engine, Date.now() - value.lastTime);
                    value.lastTime = Date.now();
                }

                value.players.forEach((player, index) => {

                    if (this.getMagnitude(player.x, player.y) > CONSTANTS.ARENA_RADIUS) {
                        value.status = CONSTANTS.GAME_STATUS.WON;
                        losers.push(player);
                    }

                    const playerBody = this.playerBodies.get(player.socketId);
                    const { x, y } = playerBody.position;
                    player.x = x;
                    player.y = y;
                    if (Vector.magnitude(playerBody.velocity) > CONSTANTS.MAX_SPEED) {
                        playerBody.velocity = Vector.mult(Vector.normalise(playerBody.velocity), CONSTANTS.MAX_SPEED);
                    }

                });
            }


            value.players.forEach((player) => {

                this.idToSocket.get(player.socketId).emit('heartbeat', { players: value.players, time: Date.now() });
            });
        });


        return losers;

    }



}


export default Game;





