import axios from "axios";
import { useEffect, useState } from "react";

// Define the type for the daily customer count data
interface IDailyCustomerCount {
    totalEnteringCustomers: number;
    totalExitingCustomers: number;
    totalCustomers: number;
}

interface IUseGetDailyCustomersReturn {
    data: IDailyCustomerCount | null;
    error: Error | null;
    loading: boolean;
    refetch: (date: string) => void;
}

export const useGetDailyCustomers = (date: string): IUseGetDailyCustomersReturn => {
    const [data, setData] = useState<IDailyCustomerCount | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = (date: string) => {
        setError(null); // Reset error state before fetching
        axios.get("/customer_count/get_daily", {
            params: {
                date,
            },
            withCredentials: true,
        })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data);
                }
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchData(date);
    }, [date]);

    return { data, error, loading, refetch: fetchData };

};
