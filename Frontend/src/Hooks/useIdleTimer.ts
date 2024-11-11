import { useEffect } from "react";
import { useAuth } from "../AuthContext";

const useInactivityTimeout = (timeout: number, onTimeout: () => void) => {
  const { clearCookies } = useAuth();

  useEffect(() => {
    const handleActivity = () => {
      // Reset or keep track of user activity if needed
    };

    const handleInactivity = () => {
      clearCookies(); // Clear cookies
      onTimeout(); // Execute timeout action
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);

    const timeoutId = setTimeout(handleInactivity, timeout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, [timeout, clearCookies, onTimeout]);
};

export default useInactivityTimeout;
