import { useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";

const useInactivityTimeout = (timeout: number, onTimeout: () => void) => {
  const { clearCookies } = useAuth();
  const timeoutIdRef = useRef<number | null>(null); // Use 'number' instead of 'NodeJS.Timeout'

  useEffect(() => {
    const resetTimeout = () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = window.setTimeout(() => {
        clearCookies(); // Clear cookies
        onTimeout(); // Execute timeout action
      }, timeout);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    // Set up initial timeout
    resetTimeout();

    // Add event listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keypress", handleActivity);

    return () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, [timeout, clearCookies, onTimeout]);

  return null;
};

export default useInactivityTimeout;
