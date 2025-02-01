import "./App.css";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Leaderboard from "./Leaderboard";

function App() {

	return(
		<BrowserRouter>
      <Routes> 
        <Route path="/login" element={<Login/>} /> 
        <Route path="/register" element={<Register/>} /> 
		<Route path="/leaderboard" element={<Leaderboard/>}/>
        <Route path="*" element={<Home />} /> 
      </Routes>
    </BrowserRouter>




	);
}

export default App;
