class Sumo {
    constructor(pos, r, id = -1, name = "", gameID, pColor) {
        this.position = pos;
        this.r = r;
        this.socketID = id;
        this.gameID = gameID;
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

        this.direction = vec;
        this.direction.limit(100);
        this.direction.mult(10);
    }

    draw() {
        push();

        fill(this.pColor);
        ellipse(this.position.x, this.position.y, this.r * 2);
        push();
        fill(20, 20, 20)


        fill(20, 20, 20);
        textSize(this.r);
        textAlign(CENTER);
        text(this.name, this.position.x, this.position.y + this.r * 2);
        pop();
    }
}

