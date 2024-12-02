import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
  setIsAdmin: (status: boolean) => void;
  clearCookies: () => void;
  user: User | null;  // Add user to the context
  setUser: (user: User | null) => void;  // Add function to set user
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
  setIsAdmin: () => {},
  clearCookies: () => {},
  user: null,  // Default to null
  setUser: () => {},  // Default function
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);  // Initialize user state
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      console.log("API Response:",response.data);
      const { logged_in, is_admin, user } = response.data;

      setIsLoggedIn(logged_in);
      setIsAdmin(is_admin || false);
      setUser(user || {name:'N/A',email:'N/A'});  // Set the user data
      localStorage.setItem("isLoggedIn", logged_in);
      localStorage.setItem("isAdmin", is_admin || false);
      localStorage.setItem("user", JSON.stringify(user));  // Store user in localStorage if needed
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUser(null);  // Reset user data on error
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const clearCookies = async () => {
    try {
      await axios.post("/login/logout", {}, { withCredentials: true }); // This sends a request to clear cookies server-side
      setIsLoggedIn(false);  // Update local state
      setIsAdmin(false);     // Clear admin status
      localStorage.removeItem("isLoggedIn");  // Clean up local storage
      localStorage.removeItem("isAdmin");
    } catch (error) {
      console.error("Error clearing session cookie:", error);
    }
  };

  useEffect(() => {
    const storedIsLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn") || "false");
    const storedIsAdmin = JSON.parse(localStorage.getItem("isAdmin") || "false");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    
    setIsLoggedIn(storedIsLoggedIn);
    setIsAdmin(storedIsAdmin);
    setUser(storedUser);  // Set the user from localStorage if available
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
        user,  // Provide user data in context
        setUser,  // Provide setUser function in context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
