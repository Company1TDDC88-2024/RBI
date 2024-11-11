import axios from "axios";
import { useState } from "react";

interface IUseSignUpReturn {
    signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    error: string | null;
    loading: boolean;
    success: boolean;
}

export const useSignUp = (): IUseSignUpReturn => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const signUp = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post('/login/create_account', {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                setSuccess(true);  // Endast sätt success till true om kontot skapades
            }
        } catch (err: any) {
            setSuccess(false);  // Säkerställ att success är false om ett fel inträffade
            if (err.response && err.response.status === 400) {
                setError(err.response.data.message);  // Sätt backend-felmeddelandet
            } else {
                setError("An error occurred during sign-up.");
            }
        } finally {
            setLoading(false);
        }
    };

    return { signUp, error, loading, success };
};