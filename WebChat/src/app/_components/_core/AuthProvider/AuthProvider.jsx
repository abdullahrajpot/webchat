import React from "react";
import { AuthContext } from "./AuthContext";
import { eraseCookie, getCookie, setCookie } from "@jumbo/utilities/cookies";

const iAuthService = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "demo@example.com" && password === "zab#723") {
        resolve({ token: "auth-user", email: email, password: password });
      } else {
        reject("Invalid email or password");
      }
    }, 3000);
  });
};

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = React.useState(false);
//   const [loading, setLoading] = React.useState(true);

//  const login = async (user, token) => {
//   setLoading(true);
//   try {
//     const authData = { token, user };
//     setCookie("auth-user", encodeURIComponent(JSON.stringify(authData)), 1);
//     setIsAuthenticated(true);
//   } catch (error) {
//     console.error("Login failed", error);
//     setIsAuthenticated(false);
//   } finally {
//     setLoading(false);
//   }
// };


//   const logout = () => {
//     eraseCookie("auth-user");
//     setIsAuthenticated(false);
//   };

//   React.useEffect(() => {
//     let authUserSr = getCookie("auth-user");
//     if (authUserSr) {
//       setIsAuthenticated(true);
//     }
//     setLoading(false);
//   }, []);
//   return (
//     <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }



export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);

  const login = (userData, userToken) => {
    const authData = { token: userToken, user: userData };
    localStorage.setItem("auth-user", JSON.stringify(authData));
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth-user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("auth-user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
