import axios from "axios";
import { useEffect, useState } from "react";

// Define the type for the queue count data
interface IQueueCount {
    ID: number;
    NumberOfCustomers: number; // Number of customers as a number
    ROI: number; // Return on investment or similar metric as a number
    Timestamp: Date; // Timestamp as a string

}

interface IUseGetQueueCountReturn {
    data: IQueueCount[] | null; // Now returning an array of IQueueCount
    error: Error | null;
    loading: boolean;
    refetch: () => void;
}

export const useGetQueueCount = (): IUseGetQueueCountReturn => {
    const [data, setData] = useState<IQueueCount[] | null>(null); // Changed to an array
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = () => {
        setError(null); // Reset error state before fetching
        axios.get("/queue_count/get", {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data); // Expecting an array here
                } else {
                    setError(new Error(`Unexpected response status: ${response.status}`));
                }
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, error, loading, refetch: fetchData };
};
