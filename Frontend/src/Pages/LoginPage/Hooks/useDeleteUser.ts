import axios from "axios";
import { useState } from "react";

interface IDeleteResponse {
    message: string;
}

interface IUseDeleteUserReturn {
    deleteUser: (email: string) => Promise<boolean>;
    error: Error | null;
    loading: boolean;
    success: boolean;
}

export const useDeleteUser = (): IUseDeleteUserReturn => {
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const deleteUser = async (email: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post<IDeleteResponse>(
                '/login/delete', // Ensure this matches your route
                { email },
                {
                    withCredentials: true // Include credentials if needed
                }
            );

            if (response.status === 200) {
                setSuccess(true);
                return true; // Indicate successful deletion
            }
            
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(new Error(err.response.data.message)); // Set specific backend error message
            } else {
                setError(new Error("An error occurred during account deletion."));
            }
            return false; // Indicate failed deletion
        } finally {
            setLoading(false);
        }

        return false; // Fallback
    };

    return { deleteUser, error, loading, success };
};
