## Game
- 2 players per game, hashmap in the backend mapping gameid to to game engine


- Want to revert back to simulation running on client side w/ delta time

- Client -> delay -> server -> client

- If I use prediction on the client then get the update from the server, the info will
be ~20-100ms old.

- I should just send all information to the server then render what I get back. Some packets
will be lost but should just lerp if no update

## LOG

- Still fighting jitter. Removed all client physics simulation to try and simplify process
- Should add direction property to player object on server side. This way on each
server heartbeat I can apply that direction and only change it in the update event

# BUGS
- Sometimes when the player's collide there is a large restitution. I suspect its because the client and the server are not synced so it causing "double hit" or something like that.