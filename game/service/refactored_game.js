import { Server } from 'socket.io';
import CONSTANTS from './constants.js';
import Matter from 'matter-js';

import { addGameWon, addGamePlayed, verifyAndDecodeToken } from './dbUtils.js';

const { Engine, Bodies, Body, World, Vector } = Matter;
import { v4 as uuidv4 } from 'uuid';
class Obstacle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

class Game {



    joinQueue = [];
    customGameQueue = [];

    roomIDToGameData = new Map();
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
            }
        });

        this.handlerSetup();
        setInterval(() => this.gameStep(), CONSTANTS.HEARTBEAT_TIME);

    }



    // Stolen off internet
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
        }
        // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure length is 7.
        return (hash >>> 0).toString(36).padStart(7, '0');
    };


    handlerSetup() {
        this.io.on("connection", (socket) => {
            socket.on("update", (data) => {
                try {
                    if (data.gameID) {
                        const gameObject = this.roomIDToGameData.get(data.gameID);
                        if (!gameObject) {
                            // client side still trying to send updates but their game no longer exists 
                            return socket.disconnect();
                        }
                        if (gameObject.status == CONSTANTS.GAME_STATUS.WAITING) {
                            gameObject.status = CONSTANTS.GAME_STATUS.PLAYING;
                        }

                        const playerBody = gameObject.physics_bodies.get(socket.id);
                        if (!playerBody) {
                            throw new Error(`No player exists in this game with ID: ${socket.id}`);
                        }

                        Body.applyForce(playerBody, { x: 0, y: 0 }, data.vector);
                    }

                }
                catch (err) {
                    console.error(err);
                }
            });

            socket.once("join", (data) => {

                if (!data.playerName || !data.color) {
                    console.error("Invalid input");
                    return;
                }

                const initData = { socket: socket, token: data.token, name: data.playerName, color: data.color, roomName: data.roomName };


                // handle case where user has put custom room name
                if (data.roomName) {


                    for (let i = this.customGameQueue.length - 1; i >= 0; i--) {

                        if (!this.customGameQueue[i].socket.connected) {
                            this.customGameQueue.splice(i, 1);
                        }
                        if (this.customGameQueue[i].roomName == data.roomName) {
                            const gameID = this.simpleHash(data.roomName);
                            this.handleTwoGameStart(gameID, this.customGameQueue[i], initData);
                            this.customGameQueue.splice(i, 1);
                            return;
                        }

                    }

                    this.customGameQueue.push(initData);
                    return;
                }

                // We can pair them with a person in the queue
                // Need to make sure this connection is still open
                if (this.joinQueue.length > 0) {

                    if (this.joinQueue[0].socket.connected) {
                        const player1 = this.joinQueue.shift();
                        const gameID = uuidv4()
                        this.handleTwoGameStart(gameID, player1, initData);
                    }

                    // if its not connected anymore we can just get rid of it
                    else {
                        this.joinQueue.shift();
                        this.joinQueue.push(initData);
                    }

                }
                else {
                    this.joinQueue.push(initData);

                }

            })



            console.log(`Queue Size: ${this.joinQueue.length} Player ID: ${socket.id}`);
        });

    }

    handleTwoGameStart(gameID, player1, player2) {
        setTimeout(() => {
            this.setupTwoUsers(gameID, player1, player2);

            // Have both players join same room
            player1.socket.join(gameID);
            player2.socket.join(gameID);

            this.sendPlayerInitData(gameID);
            this.sendRoomStartTime(gameID, Date.now() + CONSTANTS.START_TIME);


        }, CONSTANTS.JOIN_WAIT_TIME);

    }
    // create a game using map that maps gameID to gameobject
    setupTwoUsers(gameID, player1, player2) {

        const engine = Engine.create(CONSTANTS.WORLD_OPTIONS);
        const spawnSet = Math.round(Math.random());
        const spawnOptions = CONSTANTS.SPAWN_OPTIONS;
        let spwn = structuredClone(spawnOptions[spawnSet]);
        let randLoc = Math.round(Math.random());


        let gameObject = {
            engine: engine,
            client_bodies: [],
            physics_bodies: new Map(),
            idToToken: new Map(),
            obstacles: [],
            status: CONSTANTS.GAME_STATUS.WAITING,
            numPlayers: 2
        }

        let players = [player1, player2];

        players.forEach(player => {



            try {

                if (player.token) {
                    verifyAndDecodeToken(player.token);

                    gameObject.idToToken.set(player.socket.id, player.token);
                }
            } catch (err) {
                console.error(`Could not decode token: ${err}`);
            }

            let selectedLocation;

            if (randLoc.length > 1) {
                selectedLocation = spwn[randLoc];

                // Remove the location that was seleceted
                spwn = spwn.slice(randLoc);
            }

            else {
                selectedLocation = spwn.pop();
            }

            let playerX = (CONSTANTS.ARENA_RADIUS / 2) * selectedLocation[0];
            let playerY = (CONSTANTS.ARENA_RADIUS / 2) * selectedLocation[1];

            const body = Bodies.circle(playerX, playerY, CONSTANTS.DEFAULT_RADIUS, CONSTANTS.PLAYER_OPTIONS);

            // Don't need to transmit physics body data only updated coordinates so this data stays on server
            const position = { x: playerX, y: playerY };
            gameObject.client_bodies.push({ color: player.color, name: player.name, socketID: player.socket.id, position: position });
            gameObject.physics_bodies.set(player.socket.id, body);
            World.add(engine.world, body);

        });

        // Add objects to the game data
        for (let i = 0; i < 2; i++) {
            let xOb = (CONSTANTS.ARENA_RADIUS / 2) * CONSTANTS.SPAWN_OPTIONS[Math.abs(spawnSet - 1)][i][0];
            let yOb = (CONSTANTS.ARENA_RADIUS / 2) * CONSTANTS.SPAWN_OPTIONS[Math.abs(spawnSet - 1)][i][1];

            const obBody = Bodies.circle(xOb, yOb, CONSTANTS.OBSTACLE_RADIUS, { isStatic: true });
            World.add(engine.world, obBody);
            gameObject.obstacles.push(new Obstacle(xOb, yOb, CONSTANTS.OBSTACLE_RADIUS));
        }

        this.roomIDToGameData.set(gameID, gameObject);


    }

    sendPlayerInitData(gameID) {


        const gameData = this.roomIDToGameData.get(gameID);
        const dataPacket = {
            gameID: gameID,
            obstacles: gameData.obstacles,
            players: gameData.client_bodies,
            ARENA_RADIUS: CONSTANTS.ARENA_RADIUS,
            DEFAULT_RADIUS: CONSTANTS.DEFAULT_RADIUS,
            PLAYER_OPTIONS: CONSTANTS.PLAYER_OPTIONS,
            OBSTACLE_OPTIONS: CONSTANTS.OBSTACLE_OPTIONS,
            WORLD_OPTIONS: CONSTANTS.WORLD_OPTIONS,
        };

        this.io.to(gameID).emit("init_data", dataPacket);

    }


    sendRoomStartTime(gameID, time) {
        this.io.to(gameID).emit("game_start", { startTime: time });
    }


    getUpdateDataFromRoomID(gameID) {
        return (
            {
                gameID: gameID,
                players: this.roomIDToGameData.get(gameID).client_bodies,
            });

    }


    // Iterate over the games, step by delta time, figure out who lost, send updated info to client 
    heartbeat() {







        for (const [gameID, gameObject] of this.roomIDToGameData.entries()) {
            // If not playing then assuming it will be cleaned up somewhere else
            if (gameObject.status != CONSTANTS.GAME_STATUS.PLAYING) {
                continue;
            }

            Engine.update(gameObject.engine, gameObject.engine.deltaTime);


            let isGameOver = false;
            for (const [socketID, playerBody] of gameObject.physics_bodies.entries()) {
                // Limit highest speed

                if (Body.getSpeed(playerBody) > CONSTANTS.MAX_SPEED) {
                    Body.setSpeed(playerBody, CONSTANTS.MAX_SPEED);
                }



                // End game if two players and out of bounds


                // Disconnect player if out of bounds
                if (Vector.magnitude(playerBody.position) > CONSTANTS.ARENA_RADIUS) {
                    // Should convert client_bodies to a map for faster lookup 

                    const loserID = gameObject.client_bodies.find((player) => player.socketID == socketID).socketID;
                    if (gameObject.numPlayers <= 2) {
                        const winnerID = gameObject.client_bodies.find((player) => player.socketID != socketID).socketID;

                        const loserToken = gameObject.idToToken.get(loserID);
                        const winnerToken = gameObject.idToToken.get(winnerID);


                        try {
                            if (loserToken) {
                                addGamePlayed(loserToken);
                            }
                            if (winnerToken) {
                                addGameWon(winnerToken);
                                addGamePlayed(winnerToken);
                            }

                        }
                        catch (err) {
                            console.error(`Error on updating player stats: ${err}`);
                        }

                        this.endGame(gameID, loserID);

                        isGameOver = true;
                        break;
                    }
                }

                for (const clientBody of gameObject.client_bodies) {

                    if (clientBody.socketID === socketID) {
                        clientBody.position = playerBody.position;
                    }
                }
            }
            if (!isGameOver) {

                this.io.to(gameID).emit("heartbeat", this.getUpdateDataFromRoomID(gameID));
            }
        }
    }

    // Assume that client can handle figuring out if they lost or not
    endGame(gameID, loserSocketID) {
        this.io.to(gameID).emit("game_end", { loserID: loserSocketID });
        this.roomIDToGameData.delete(gameID);

    }
    // This function runs a single "game step"
    gameStep() {
        /*
        1. Award winners as needed
        2. Delete Games & Players as needed
        3. Send heartbeat to players
        4. If game stalled status != waiting && game.players == 1 
        
        * Now need to handle disconnect events when the status is waiting and game_start
        */
        this.heartbeat();

    }

}


export default Game;

