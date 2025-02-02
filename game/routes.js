import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import bcyrpt from 'bcrypt';

const AUTH_STRING = fs.readFileSync('./secret/db.txt', 'utf-8').trim();

const client = new MongoClient(AUTH_STRING, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const db = client.db('startup');
const userCollection = db.collection('user_data');


(async function testConnection() {
    await client.connect();
    await db.command({ ping: 1 });
})().catch((ex) => {
    console.log(
        `Unable to connect to database with ${url} because ${ex.message}`
    );
    process.exit(1);
});


function getLeaderboard(){
    const allUsers = userCollection.aggregate([
        {$sort: {gamesWon: -1}},
        {$limit: 10},
    ]).toArray();

    return allUsers;
}

async function registerUser(name, email, password){

    const passwdHash = await bcyrpt.hash(password, 10);

    const user = {
        name: name,
        email: email,
        password: passwdHash,
        gamesWon: 0,
        gamesPlayed: 0,
    };


return await userCollection.insertOne(user);

}


export {getLeaderboard, registerUser};
