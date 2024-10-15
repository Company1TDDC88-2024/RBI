import axios from "axios";
import { useEffect, useState } from "react";

// Define the type for the queue count data
interface IQueueCount {
    ID: number;
    NumberOfCustomers: number;
}

interface IUseGetQueueCountReturn {
    data: IQueueCount | null;
    error: Error | null;
    loading: boolean;
}

export const useGetQueueCount = (): IUseGetQueueCountReturn => {
    const [data, setData] = useState<IQueueCount | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/queue_count/get", {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data);
                }
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { data, error, loading };
};
