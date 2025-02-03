import Header from "./components/Header";
import Footer from "./components/Footer";
import {AuthContext} from "./context/auth";

import React, { useState, useContext} from "react";

function Home() {

	const {accountName} = useContext(AuthContext);
	const [gameData, setGameData] = useState({
		playerName: localStorage.getItem("playerName") || "unnamed",
	});

	function nameChanged(e) {
		setGameData((prevData) => {
			return { ...prevData, playerName: e.target.value };
		});

		localStorage.setItem("playerName", e.target.value);
	}

	function submit(e) {
		if (
			(e.code === "Enter" || e.type === "click") &&
			gameData.playerName !== "" &&
			gameData.playerName.length <= 10
		) {
			localStorage.setItem("playerName", gameData.playerName);
			// setGameData((prevData) => {
			// 	return {...prevData, gameStarted: true};
			// });
			document.location.href = "/game.html";
		}
	}

	return (
		<div className="gradient-home vh-100">
			<Header />
			<main>
			<div class="mt-5 container-fluid">

				<div class="row justify-content-center">
					<form class="card max-width-login p-5" action="/game.html">


						<div class="row text-center mb-3">

							<div class="col p-2">
								<h3>Welcome {accountName} 🇺🇸</h3>
							</div>
						</div>

						<div class="row text-center">

							<div class="col ">

								<div class="input-group mb-3">
									<input type="text" class="form-control text-center" placeholder="Enter Name" aria-label="Recipient's username" aria-describedby="button-addon2" />
									<button class="btn btn-outline-secondary" type="button" id="button-addon2" onClick={submit}>Play</button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
</main>
<Footer/>
		</div>
	);
}

export default Home;
