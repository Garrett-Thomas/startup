import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import bcyrpt from 'bcrypt';
import jwt from 'jsonwebtoken';

const {mongoURI, jwtSecret} = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

const client = new MongoClient(mongoURI, {
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


function generateJWT(payload){


return jwt.sign(payload, jwtSecret, {expiresIn: 3600});

}




async function getUserByEmail(email){


    return await userCollection.findOne({email: email});
}

async function loginUser(email, password){

const user = await userCollection.findOne({email: email});
// const passwdHash = await bcyrpt.hash(password, 10);


const areSamePassword = await bcyrpt.compare(password, user.password);
if(user == null || !areSamePassword) return null;


return user;


}


// Throws error if invalid
function verifyAndDecodeToken(token) {

      const decoded = jwt.verify(token, jwtSecret); // Verify the token
      return decoded; // If verification is successful, return the decoded payload
  }


function addGameWon(jwtToken){

    const decoded = jwt.verify(jwtToken, jwtSecret);

    const update = { $inc: {gamesWon: 1}};
    userCollection.updateOne({email: decoded.email}, update);

}

function addGamePlayed(jwtToken){

    const decoded = jwt.verify(jwtToken, jwtSecret);
    const update = {$inc: {gamesPlayed: 1}}
    userCollection.updateOne({email: decoded.email}, update);
}

async function registerUser(name, email, password){

    const existingUser = await userCollection.findOne({email});

    if(existingUser != null){
        let err = new Error("User already exists");
        err.cause = "duplicate";
        throw err;
    }

    const passwdHash = await bcyrpt.hash(password, 10);

    const user = {
        name: name,
        email: email,
        password: passwdHash,
        gamesWon: 0,
        gamesPlayed: 0,
    };


await userCollection.insertOne(user);
return user;
}


export {getLeaderboard, registerUser, generateJWT, loginUser, verifyAndDecodeToken, getUserByEmail, addGamePlayed, addGameWon};
