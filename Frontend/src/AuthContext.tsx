// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean; // Add loading to the context
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  loading: true, // Set loading to true initially
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading as true

  const checkLoginStatus = async () => {
    try {
      console.log("Checking login status...");
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      console.log("Login status response:", response.data);
      setIsLoggedIn(response.data.logged_in);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false); // Set loading to false after the check
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, checkLoginStatus, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
