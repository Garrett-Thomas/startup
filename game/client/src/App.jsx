import "./App.css";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import Register from "./Register.jsx";
import Stats from "./Stats.jsx";
import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Leaderboard from "./Leaderboard.jsx";
import { AuthContext } from "./context/auth.jsx";
import HowToPlay from "./HowToPlay.jsx";
function App() {



	const { isAuthenticated } = useContext(AuthContext);

	const ProtectedRoute = ({ children }) => {
		debugger;
		if (!isAuthenticated && isAuthenticated !== null) {
			return <Navigate to="/login" replace />; // Redirect to login if not authenticated
		}
		return children; // Render the protected component if authenticated
	};


	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/leaderboard" element={<Leaderboard />} />
				<Route path="/howtoplay" element={<HowToPlay />} />
				<Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
