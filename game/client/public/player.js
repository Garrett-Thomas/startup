class Sumo {
    constructor(x, y, r, id = -1, name = "", gameId, pColor) {
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
        this.newX = x;
        this.newY = y;
        this.currCompensation = 0.5;
        this.oldCompensation = 1;
    }

    getDirection() {
        return this.direction;
    }

    update(vec) {

        this.direction = vec;
        this.direction.limit(100);
        this.direction.mult(10);
    }

    draw() {
        push();

        fill(this.pColor);
        ellipse(this.x, this.y, this.r * 2);
        push();
        fill(20, 20, 20)


        fill(20, 20, 20);
        textSize(this.r);
        textAlign(CENTER);
        text(this.name, this.x, this.y + this.r * 2);
        pop();
    }
}

