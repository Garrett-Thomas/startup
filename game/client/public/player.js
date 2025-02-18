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
        this.newX = x;
        this.newY = y;
        this.currCompensation = 0.5;
        this.oldCompensation = 1;
    }

    getDirection() {
        return this.direction;
    }

    update(vec) {

        // this.direction.lerp(vec, 0.9);

        // this.direction.limit(10);

        // this.direction.mult(0.6 * this.r);
        // console.log(vec.limit(10));

        this.direction = vec;
        this.direction.limit(100);
        this.direction.mult(10);


        this.x = this.newX;
        this.y = this.newY;
        // The idea is that I render the user image a little bit behind the server
        // so that any jumps will be smoothed out by lerping
        // let distance = constrain(dist(this.x, this.y, this.newX, this.newY), 0, 100);

        // let compensation = map(distance, 0, 100, 0.8, 1);

        // this.x += constrain(lerp(0, this.newX -this.x, compensation), -100, 100);
        // this.y += constrain(lerp(0, this.newY - this.y, compensation), -100, 100);

    }

    draw() {
        push();

        fill(this.pColor);
        ellipse(this.x, this.y, this.r * 2);

        // fill(color(255, 0, 0));
        // ellipse(this.newX, this.newY, this.r * 2);
        push();
        fill(20, 20, 20)


        fill(20, 20, 20);
        textSize(this.r);
        textAlign(CENTER);
        text(this.name, this.x, this.y + this.r * 2);
        pop();
    }
}

