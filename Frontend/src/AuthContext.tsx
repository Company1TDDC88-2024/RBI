import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
  setIsAdmin: (status: boolean) => void;
  clearCookies: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
  setIsAdmin: () => {},
  clearCookies: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      const { logged_in, is_admin } = response.data;

      setIsLoggedIn(logged_in);
      setIsAdmin(is_admin || false);
      sessionStorage.setItem("isLoggedIn", JSON.stringify(logged_in)); // Store as JSON string
      sessionStorage.setItem("isAdmin", JSON.stringify(is_admin || false));
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isAdmin");
    } finally {
      setLoading(false);
    }
  };

  const clearCookies = async () => {
    try {
      await axios.post("/login/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      setIsAdmin(false);
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isAdmin");
    } catch (error) {
      console.error("Error clearing session cookie:", error);
    }
  };

  useEffect(() => {
    // Initialize state from sessionStorage
    const storedIsLoggedIn = JSON.parse(sessionStorage.getItem("isLoggedIn") || "false");
    const storedIsAdmin = JSON.parse(sessionStorage.getItem("isAdmin") || "false");

    setIsLoggedIn(storedIsLoggedIn);
    setIsAdmin(storedIsAdmin);

    // Always verify login status on page load
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        loading,
        checkLoginStatus,
        setIsLoggedIn,
        setIsAdmin,
        clearCookies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};