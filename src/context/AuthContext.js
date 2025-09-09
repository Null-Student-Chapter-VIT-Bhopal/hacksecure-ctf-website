"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const isTokenValid = (token) => {
  if (!token) {
    console.log("no token provided");
    return null;
  }
  try {
    const decoded = jwtDecode(token);

    return decoded.exp * 1000 > Date.now() ? decoded : null;
  } catch (e) {
    console.log("error occured..");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const decodeRole = (token) => {
    try {
      const decoded = jwtDecode(token);

      return decoded.role;
    } catch (e) {
      console.log("error occurred..");
      return null;
    }
  };

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    setRole(decodeRole(token));
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const decoded = isTokenValid(savedToken);

    if (decoded && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setRole(decodeRole(savedToken));

      if (decoded.exp) {
        const timeout = decoded.exp * 1000 - Date.now();
        if (timeout > 0) {
          setTimeout(() => logout(), timeout);
        } else {
          logout();
        }
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        role,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
