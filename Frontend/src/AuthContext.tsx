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
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
  setIsAdmin: () => {},
  clearCookies: () => {},
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      const { logged_in, is_admin, user } = response.data;

      setIsLoggedIn(logged_in);
      setIsAdmin(is_admin || false);
      setUser(user || { name: 'N/A', email: 'N/A' });
      sessionStorage.setItem("isLoggedIn", JSON.stringify(logged_in));
      sessionStorage.setItem("isAdmin", JSON.stringify(is_admin || false));
      sessionStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUser(null);
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isAdmin");
      sessionStorage.removeItem("user");
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
      sessionStorage.removeItem("user");
    } catch (error) {
      console.error("Error clearing session cookie:", error);
    }
  };

  useEffect(() => {
    const storedIsLoggedIn = sessionStorage.getItem("isLoggedIn");
    const storedIsAdmin = sessionStorage.getItem("isAdmin");
    const storedUser = sessionStorage.getItem("user");

    if (storedIsLoggedIn && storedIsLoggedIn !== "undefined") {
      setIsLoggedIn(JSON.parse(storedIsLoggedIn));
    }

    if (storedIsAdmin && storedIsAdmin !== "undefined") {
      setIsAdmin(JSON.parse(storedIsAdmin));
    }

    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }

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
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};