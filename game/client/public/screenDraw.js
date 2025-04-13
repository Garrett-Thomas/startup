class screenDraw {



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

		textAlign(CENTER, CENTER);
		text("Waiting for player to join...", playerX, playerY);
		pop();

	}


	static drawGameOver(msg, playerX, playerY) {

		push();
		background(200);



		textSize(20);
		textAlign(CENTER, CENTER);
		text(msg + "\nRedirecting to home page in a few seconds...", width / 2, height / 2);
		pop();



	}
	static getScale(radius) {
		return 10 / radius
	}
	static drawObstacles(obstacles) {

		push();
		for (const ob of obstacles) {
			fill(122, 122, 0);
			circle(ob.x, ob.y, ob.r * 2);
		}
		pop();
	}
	static drawGame(playerX, playerY, scle, arenaSize) {
		background(30, 30, 30);


		// (0, 0) now at center of the screen
		translate(width / 2, height / 2);

		// This scales all the elements so that they can appear bigger or smaller
		// without having to modify their actual size
		scale(scle);

		// This ensures that (0, 0) is as far away from the player as possible	
		translate(-playerX, -playerY);
		push();

		push();
		fill(200, 205, 180);

		const blockWidth = (arenaSize * 2.5);
		square(-blockWidth / 2, -blockWidth / 2, blockWidth, arenaSize / 5);
		pop();

		fill(233, 224, 201);
		for (var i = 1; i < 4; i++) {
			circle(0, 0, (arenaSize * 2) / i);
		}

		pop();
	}

	static drawBoostGauge(playerX, playerY, scale) {

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
		textAlign(CENTER, CENTER);
		text(`Game starts in ${Math.floor(time / 1000) + 1}`, width / 2, height / 2);

		pop();
	}

	static drawFPS(playerX, playerY, scale) {
		// scale = 1 / player.r;
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

