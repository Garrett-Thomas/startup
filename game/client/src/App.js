import "./App.css";
//import Bumper from "./components/gameName.js";

import React, {useState} from "react";

function App() {
	const [gameData, setGameData] = useState({
		playerName: localStorage.getItem("playerName") || "",
		gameStarted: false,
	});

	function nameChanged(e) {
		setGameData((prevData) => {
			return {...prevData, playerName: e.target.value};
		});

		localStorage.setItem("playerName", e.target.value);
	}

	function submit(e) {
		if (
			(e.code === "Enter" || e.type === "click") &&
			gameData.playerName !== "" &&
			gameData.playerName.length <= 10
		) {
			setGameData((prevData) => {
				return {...prevData, gameStarted: true};
			});

			document.location.href = "/game.html";
		}
	}

	return (
		<div className="App">
	{/*			<Bumper /> */}

			<div className="dataEntry">
				<input
					type="text"
					name="playerName"
					placeholder="Name"
					value={gameData.playerName}
					onChange={nameChanged}
					onKeyPress={submit}
					required={true}
					maxLength={10}
				/>

				<button type="button" onClick={submit}>Play</button>
			</div>
		</div>
	);
}

export default App;
