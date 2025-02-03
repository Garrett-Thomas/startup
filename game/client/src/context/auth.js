import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [accountName, setAccountName] = useState("Player");
  const [isAuthenticated, setAuthenticated] = useState(false);


  const fetchAccountName = async () => {

    try {
      const response = await fetch('http://localhost:4000/api/user-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },

      });

      if (!response.ok) {
        const errorData = await response.json();
        let err = new Error(errorData.msg);
        throw err;
      }
      setAccountName(response.json().name);
    }
    catch (err) {
      console.error(err);
    }

  }
  useEffect(() => {
    // Check for token in local storage on component mount
    const storedToken = localStorage.getItem('token');
debugger;
    if (storedToken) {
      console.log(storedToken);
      const decoded = jwtDecode(storedToken);

      if (decoded.exp < Date.now()) {
        setAuthenticated(true);
        setToken(storedToken);
      }
    }

    const storedAccName = localStorage.getItem('accountName');

    if (storedAccName) {
      setToken(storedAccName);
    }
    else if (storedToken && accountName == "Player") {
      fetchAccountName();
    }


  }, []);

  const login = (newToken) => {
    console.log(newToken);
    localStorage.setItem('token', newToken);
    setAuthenticated(true);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setToken(null);
  };

  const setName = (name) => (setAccountName(name));

  return (
    <AuthContext.Provider value={{ token, login, logout, accountName, setName, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };