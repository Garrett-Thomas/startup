import "./App.css";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Stats from "./Stats";
import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Leaderboard from "./Leaderboard";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./context/auth";
function App() {



	const { isAuthenticated} = useContext(AuthContext);
	
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
				<Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
