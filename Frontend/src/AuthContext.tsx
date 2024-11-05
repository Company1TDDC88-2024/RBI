import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
  clearCookies: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
  clearCookies: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      setIsLoggedIn(response.data.logged_in);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const clearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    setIsLoggedIn(false); // Optionally set login status to false
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, checkLoginStatus, setIsLoggedIn, clearCookies }}>
      {children}
    </AuthContext.Provider>
  );
};
