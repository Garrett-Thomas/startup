import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthContext } from "./context/auth";
import { ToastContainer, toast } from "react-toastify";
import React, { useState, useContext, useEffect, useRef } from "react";

function Home() {

	const { accountName, country, isAuthenticated } = useContext(AuthContext);

	const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || localStorage.getItem("accountName"));

	const [colorPallete, setColorPallete] = useState([]);

	const [selectedColor, setSelectedColor] = useState(localStorage.getItem("selectedColor") || null);




	useEffect(() => {

		async function fetchColors() {

			try {

				const response = await fetch('/api/user-colors');

				if (!response.ok) throw new Error();


				const colors = (await response.json()).colors;
				setColorPallete(colors);

			}
			catch (err) {
				console.error(err);
			}


		}

		if (isAuthenticated && colorPallete.length == 0) {
			fetchColors();
		}

	}, [isAuthenticated, colorPallete]);


	/**
	 * Get the flag emoji for the country
	 * @link https://dev.to/jorik/country-code-to-flag-emoji-a21
	**/

	function getFlagEmoji(countryCode) {
		let codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
		return String.fromCodePoint(...codePoints);
	}



	function handleChange(e) {


		setPlayerName(e.target.value);
		localStorage.setItem('playerName', e.target.value);

	}


	function handleCustomMatch(e) {
		console.log(e.target.value);
		localStorage.setItem('roomName', e.target.value);
	}


	function handleColorPick(e) {

		if (e.target.value === selectedColor) {

			setSelectedColor(null);
			localStorage.removeItem('selectedColor');
		}

		else {

			setSelectedColor(e.target.value);
			localStorage.setItem('selectedColor', e.target.value);
		}
	}

	function submit(e) {

		if (
			(e.code === "Enter" || e.type === "click") &&
			playerName == "" ||
			playerName.length > 20
		) {
			toast("Please enter a name no longer than 20 characters");
			return;
		}
		debugger;
		if (!isAuthenticated || e.target.textContent == "Play" || localStorage.getItem("roomName") == "") {
			localStorage.removeItem("roomName");
		}

		localStorage.setItem("playerName", playerName);
		document.location.href = "/game.html";
	}


	return (
		<div className="gradient-home gradient">
			<Header />
			<ToastContainer />
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
										<input type="text" maxLength={20} minLength={1} className="form-control text-center" placeholder="Enter Name" aria-label="Recipient's username" onChange={handleChange} value={playerName} />
										<button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={submit}>Play</button>
									</div>
								</div>

							</div>
							{isAuthenticated ?
								<>
									<div className="row text-center">

										<div className="col-10">

											<div className="input-group mb-3">
												<input type="text" maxLength={20} minLength={1} className="form-control text-center" placeholder="Enter join code to join a match" aria-label="Recipient's username" aria-describedby="button-addon2" onChange={handleCustomMatch} />
												<button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={submit}>Join/Create</button>
											</div>
										</div>
									</div>


								</>
								: <></>

							}
							{isAuthenticated && colorPallete.length > 0 ?


								<>


									<div className="row text-center mt-3">
										<div className="col">
											<h6 className="fw-light" >Choose your color:</h6>


										</div>
										<div className="btn-group" role="group" aria-label="Basic example">

											{colorPallete.map((color, index) => {


												const elem = <button key={index} type="button" className={"btn btn-secondar p-4" + (color === selectedColor ? " active " : "")} value={color} style={{ backgroundColor: color }} onClick={handleColorPick} />

												return (

													elem


												)
											})}
										</div>




									</div>


								</>
								: <></>




							}
						</form>
					</div>
				</div>
			</main >
			<Footer />
		</div >
	);
}


export default Home;
