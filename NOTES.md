## Game

- Should step engine by delta time

- On a join event, players should just be put into a queue until there are two or more people waiting. I then send them a "room code" and they both join that game. Then I could
easily implement a custom room code that you could use to play others.

- Then for game management I have a hashmap that has a ROOM_ID -> GAME_DATA that stores everything

## LOG

- Still fighting jitter. Removed all client physics simulation to try and simplify process
- Should add direction property to player object on server side. This way on each
server heartbeat I can apply that direction and only change it in the update event

# BUGS
- Sometimes when the player's collide there is a large restitution. I suspect its because the client and the server are not synced so it causing "double hit" or something like that.