Client and Server need to coordinate their corresponding states.
The issue I am facing right now is what Data do I need to pass back and forth between the client and the server

Architecture:

I'm now thinking that I should implement a rounds functionality as the last thing.



On "init" connection:

* Need to first see if there is room for user in a game by iterating through all of my
games and selecting one that has a player count of 1

* If no room then create a game and add that player to it

* Instanstiate the map of gameIds to games
* Game object contains the player data and game data
* Send a copy of the player(s) data back to the client

Architecture:
* Game loop that manages game state, heartbeat, and deletion of players. This will
simplify the need for having various methods of controlling access to game variables

* Single update event listener that pushes new players onto a queue. This queue will
be emptied on each run of the game loop.

BUGS:
* I need to be able to gurantee that I delete one player at a time and don't double delete him
* This goes for modifying the state of any game. This is tricky to do because my game is
driven by events currently and there is no way to gurantee this timing.
* 