import axios from "axios";
import { useState } from "react";

interface IUseSignUpReturn {
    signUp: (firstName: string, lastName: string, email: string, password: string, isAdmin: boolean) => Promise<void>;
    error: string | null;
    loading: boolean;
    success: boolean;
}

export const useSignUp = (): IUseSignUpReturn => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const signUp = async (firstName: string, lastName: string, email: string, password: string, isAdmin: boolean): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post('/login/create_account', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                is_admin: isAdmin  
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                setSuccess(true);  
                setError(null);
            }
        } catch (err: any) {
            setSuccess(false);  
            if (err.response && err.response.status === 400) {
                setError(err.response.data.message); 
            } else {
                setError("An error occurred during sign-up.");
            }
        } finally {
            setLoading(false);
        }
    };

    return { signUp, error, loading, success };
};
