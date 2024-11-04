import axios from "axios";
import { useState } from "react";

// Define the type for the sign-up response (if any)
interface ISignUpResponse {
    message: string; // Adjust this based on your API response
}

// Define the type for the hook return value
interface IUseSignUpReturn {
    signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    error: Error | null;
    loading: boolean;
    success: boolean;
}

export const useSignUp = (): IUseSignUpReturn => {
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const signUp = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post<ISignUpResponse>('/login/create_account', {
                first_name: firstName,
                last_name: lastName,
                email,
                password
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                setSuccess(true);
                //alert(response.data.message || 'Sign-up successful!');
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { signUp, error, loading, success };
};
