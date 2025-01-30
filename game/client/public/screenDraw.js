class screenDraw {


static _constrainStart(startPoint) {
	if (startPoint < 0) return 0;
	else {
		return startPoint;
	}
}

static _constrainEnd(endPoint, arenaSize, gridSize) {
	if (endPoint > arenaSize / gridSize) return arenaSize / gridSize;
	else {
		return endPoint;
	}
}
	static drawWaitScreen(playerX, playerY) {
		push();

		background(200);
		// Ensures that the dimensions will always be a seventh of the canvas width
		let leaderDimensions = width * (1 / 7);
		leaderDimensions /= scale;

		// Want x and y to be relative to player position and position away from the
		// screen a scaled 10 pixels
		let x =
			playerX +
			(width / 2 - (leaderDimensions * scale + 10)) / getScale();
		let y = playerY - (height / 2 - 10) / scale;

		let c = color(52);

		// ALlows for transparency
		c.setAlpha(126);
		textSize(20);
		text("Waiting for player to join...", width / 2, height / 2);
		pop();

	}


	static drawGameOver(msg){

		push();
		background(200);



		textSize(20);
		text(msg, width / 2, height / 2);
		pop();



	}
	static getScale(radius){
		return 10 / radius
	}

	static drawGame(playerX, playerY, scle, arenaSize, gridSize){
		background(30, 30, 30);

		translate(width / 2, height / 2);
		scale(scle);
		translate(-playerX, -playerY);

		console.log(playerX, playerY);

		// This codeblock ensures that only visible blocks on the
		// grid are drawn. Speeds up rendering
		let startX = Math.floor(
			(playerX - width / scle / 2) / gridSize
		);

		// StartY is determined by how many blocks can fit between
		// the center of the screen and y = 0.
		// That number is floored to ensure that the
		// player doesnt see a gap
		let startY = Math.floor(
			(playerY - height / scle / 2) / gridSize
		);

		let endX = Math.ceil(
			(playerX + width / scle / 2) / gridSize
		);

		let endY = Math.ceil(
			(playerY + height / scle / 2) / gridSize
		);

		// Constrain so that boundaries are defined
		startX = this._constrainStart(startX);
		startY = this._constrainStart(startY);
		endX = this._constrainEnd(endX, arenaSize, gridSize);
		endY = this._constrainEnd(endY, arenaSize, gridSize);

		push();
		fill(233, 224, 201);

		// Draws all blocks on grid at appropriate places should
		// any blocks be visibel
		// for (var i = startY; i < endY; ++i) {
		// 	for (var j = startX; j < endX; ++j) {
		// 		rect(j * gridSize, i * gridSize, gridSize, gridSize);
		// 	}

		for(var i = 1; i < 10; i++){
			circle(startX + endX / 2, startY + endY / 2, (arenaSize * 2) / i);
		}

		pop();
	}

	static drawBoostGauge(playerX, playerY, scale){

	push();

	let c = color(102, 255, 0);

	// ALlows for transparency
	c.setAlpha(126);
	fill(c);

	let boostW = (((BOOST_TIME - elapsedTime) / BOOST_TIME) * 100) / scale;
	let boostH = 50 / scale;
	let x = playerX - (width / 2 - 5) / scale;
	let y = playerY + (height / 2 - 55) / scale;

	rect(x, y, boostW, boostH);
	pop();

	}

	static drawGameStart(time) {



		push();
		background(200);
		textSize(20);

		text(`Game starts in ${Math.floor(time / 1000) + 1}`, width / 2, height / 2);

		pop();
	}

	static drawFPS(playerX, playerY, scale){
			textSize(DEFAULT_TEXT_SIZE / scale);
			push();
			fill(102, 255, 0);
		
			text(
				Math.round(frameRate()),
				playerX - (width / 2 - 10) / scale,
				playerY - (height / 2 - 30) / scale 
			);
		
			pop();
	}
}

