// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isLoggedIn: boolean;
  checkLoginStatus: () => void;
  setIsLoggedIn: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  checkLoginStatus: () => {},
  setIsLoggedIn: () => {},
});

// Hook för att använda context
export const useAuth = () => useContext(AuthContext);

// AuthProvider-komponent
export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Funktion för att kontrollera inloggningsstatus
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/login/is_logged_in", { withCredentials: true });
      setIsLoggedIn(response.data.logged_in);
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
    }
  };

  // Kontrollera inloggningsstatus när komponenten mountas
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, checkLoginStatus, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
