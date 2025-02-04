import { createContext, useState, useEffect } from 'react';
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
  const [accountName, setAccountName] = useState(localStorage.getItem("accountName") || "Player");
  const [isAuthenticated, setAuthenticated] = useState(null);

  useEffect(() => {
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
      // If no token then this acts as a reset for all of the values
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
    localStorage.setItem('isAuthenticated', false);
    setAuthenticated(false);
    setToken(null);
    setAccountName("Player");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, accountName, setAccountName, isAuthenticated, setAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };