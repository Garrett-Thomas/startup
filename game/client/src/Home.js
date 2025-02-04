import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthContext } from "./context/auth";

import React, { useState, useContext, useEffect } from "react";

function Home() {

	const { accountName } = useContext(AuthContext);
	const [country, setCountry] = useState(null);

	const [gameData, setGameData] = useState({
		playerName: localStorage.getItem("playerName") || "unnamed",
	});





/**
 * Get the flag emoji for the country
 * @link https://dev.to/jorik/country-code-to-flag-emoji-a21
**/

function getFlagEmoji (countryCode) {
	let codePoints = countryCode.toUpperCase().split('').map(char =>  127397 + char.charCodeAt());
	return String.fromCodePoint(...codePoints);
}

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

	useEffect(() => {

		async function getCountry() {

			try {
				const response = await fetch("https://api.country.is/");

				if (!response.ok) return;
				setCountry((await response.json()).country);
			}
			catch (err) {
				console.error(err.message);
			}


		}
		if(country == null){
		getCountry();

		}
	}, []);








	return (
		<div className="gradient-home vh-100">
			<Header />
			<main>
				<div className="mt-5 container-fluid">

					<div className="row justify-content-center">
						<form className="card max-width-login p-5" action="/game.html">


							<div className="row text-center mb-3">

								<div className="col p-2">
									<h3>Welcome {accountName}{country == null ? "" : " " + getFlagEmoji(country)}</h3>
								</div>
							</div>

							<div className="row text-center">

								<div className="col ">

									<div className="input-group mb-3">
										<input type="text" maxLength={20} className="form-control text-center" placeholder="Enter Name" aria-label="Recipient's username" aria-describedby="button-addon2" />
										<button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={submit}>Play</button>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

export default Home;
