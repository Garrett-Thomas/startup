class Tank {
    constructor(x, y, r, id = -1, name = "" , gameId, pColor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.socketId = id;
        this.gameId = gameId;
        this.mass = this.r / 3;
        this.scale = 1;
        this.name = name;
        this.pColor = color(pColor);
        this.direction = createVector(0, 0);
    }

    getDirection() {
        return this.direction;
    }

    update(vec) {
        this.direction.lerp(vec, 0.9);
        this.direction.limit(10);
        this.direction.mult(0.6 * this.r);
    }

    draw() {
        push();
        fill(this.pColor);
        ellipse(this.x, this.y, this.r * 2);

        fill(255, 0, 0);
        textSize(100);
        text(this.name, this.x, this.y);
        pop();
    }
}

