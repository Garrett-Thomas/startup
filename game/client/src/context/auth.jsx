import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';


// const defaultStates = {
//   isAuthenticated: false, 
//   setIsAuthenticated: () => { }, 
//   token: null, setToken: () => { }, 
//   accountName: "Player", 
//   setAccountName: () => { },
//   login: login,
//   logout: logout
// }

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [accountName, setAccountName] = useState(token ? localStorage.getItem("accountName") : "Player");
  const [isAuthenticated, setAuthenticated] = useState(token ? true : false);
  const [country, setCountry] = useState(null);



  useEffect(() => {

async function getCountry() {

			try {
				const response = await fetch("/api/user-country");

        const country = (await response.json()).country

				if (!response.ok) return;
        if(country){

				setCountry(country);
        } 
			}
			catch (err) {
				console.error(err.message);
			}


		}
		if(country == null){
		getCountry();

		}



    // Check for token in local storage on component mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = jwtDecode(storedToken);

      if (decoded.exp > Math.floor(Date.now() / 1000)) {
        setAuthenticated(true);
        setToken(storedToken);
        localStorage.setItem("accountName", jwtDecode(token).name);
        localStorage.setItem('isAuthenticated', true);
      }
      else {
        return logout;
      }

    }

    else{

      logout();
    }


  }, []);

  const login = (newToken) => {
    console.log(newToken);
    localStorage.setItem('accountName', jwtDecode(newToken).name);
    localStorage.setItem('token', newToken);
    setAuthenticated(true);
    localStorage.setItem('isAuthenticated', true);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('accountName', 'Player');
    localStorage.setItem('isAuthenticated', false);
    setAuthenticated(false);
    setToken(null);
    setAccountName("Player");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, accountName, setAccountName, isAuthenticated, setAuthenticated, login, logout, country }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };