import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean; // Add isAdmin to track admin status
  loading: boolean;
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
  setIsAdmin: (status: boolean) => void; // Function to set isAdmin
  clearCookies: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false, // Default value for isAdmin
  loading: true,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
  setIsAdmin: () => {},
  clearCookies: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to store admin status
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      setIsLoggedIn(response.data.logged_in);

      if (response.data.logged_in) {
        setIsAdmin(response.data.is_admin || false); // Set isAdmin based on the response
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setIsAdmin(false); // Reset admin status in case of error
    } finally {
      setLoading(false);
    }
  };

  const clearCookies = async () => {
    try {
      await axios.post("/login/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      setIsAdmin(false); // Clear admin status when logging out
    } catch (error) {
      console.error("Error clearing session cookie:", error);
    }
  };

  useEffect(() => {
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
