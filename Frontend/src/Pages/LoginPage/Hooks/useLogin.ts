import axios from "axios";
import { useState } from "react";

interface ILoginResponse {
    message: string;
}

interface IUseLoginReturn {
    login: (email: string, password: string) => Promise<boolean>;
    error: Error | null;
    loading: boolean;
}

export const useLogin = (): IUseLoginReturn => {
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post<ILoginResponse>(
                '/login/login', // Ensure this matches your route
                { email, password },
                {
                    withCredentials: true // Include credentials if needed
                }
            );

            if (response.status === 200) {
                // alert(response.data.message || 'Login successful!'); // Remove this line to prevent pop-up
                return true; // Indicate successful login
            }
            
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(new Error(err.response.data.message)); // Set specific backend error message
            } else {
                setError(new Error("An error occurred during login."));
            }
            return false; // Indicate failed login
        } finally {
            setLoading(false);
        }

        return false; // Fallback
    };

    return { login, error, loading };
};