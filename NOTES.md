## Game
- 2 players per game, hashmap in the backend mapping gameid to to game engine

- Need to check edge case where I have a person joins as a new game is created. Could be possible that it returns an error even though there is a spot for them in the game. 


## LOG

- Added needed html and included all semantic tags
- Added playername placeholder



# BUGS
- Sometimes when the player's collide there is a large restitution. I suspect its because the client and the server are not synced so it causing "double hit" or something like that.