import express from 'express';
import http from 'http';
import path from "path";

import leaderBoardRoute from './leaderboard.js';
import authRoute from './auth.js';
import Game from "./refactored_game.js";

const app = express();
const server = http.createServer(app);
const __dirname = path.resolve();
/*
Have a map structure that maps the "Game-ID" to the two players + physics engine
Better experience only two players to a game.

Game-ID will be generated by 
*/
// Allows for client to connect while orignally @ localhost:3000 or else CORS errors
const PORT = 5500;
const INDEX_PATH = process.env.NODE_ENV == "production" ? "public/index.html" : "../client/public/index.html";

app.use(express.json());

app.use('/api/leaderboard', leaderBoardRoute);
app.use('/api/', authRoute);

app.use(express.static('public'));

app.get("/*", (req, res)=>{
    res.sendFile(path.join(__dirname, INDEX_PATH), ()=>{
        res.status(500).send("Internal Error");
    })
})
const game = new Game(server);
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});