import express from 'express';
const router = express.Router();
import {getLeaderboard} from './dbUtils.js';

router.get("/", async (req, res) => {

    const data = await getLeaderboard();
    res.json(data);

});

export default router;