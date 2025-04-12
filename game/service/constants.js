const CONSTANTS = {

    "ARENA_RADIUS": 2000,
    "HEARTBEAT_TIME": 1000 / 60,
    "DEFAULT_RADIUS": 100,
    "PLAYER_TIMEOUT": 1000,
    "OBSTACLE_RADIUS": 200,
    "MAX_SPEED": 15,
    "GAME_STATUS": {
        "WAITING": "waiting",
        "PLAYING": "playing",
        "WON": "won",
        "GAME_START": "game_start"
    },
    "SPAWN_OPTIONS": [
        [
            [
                -1,
                0
            ],
            [
                1,
                0
            ]
        ],
        [
            [
                0,
                1
            ],
            [
                0,
                -1
            ]
        ]
    ],
    "START_TIME": 3000,
    "PLAYER_OPTIONS": {
        "friction": 0,
        "density": 100,
        "restitution": 0,
        "frictionAir": 0,
        "slop": -1
    },
    "OBSTACLE_OPTIONS": {
        "isStatic": true,
        "restitution": 0,
        "friction": 0,
        "slop": -1
    },
    "WORLD_OPTIONS": {
        "gravity": {
            "x": 0,
            "y": 0
        }
    }
}

export default CONSTANTS;

