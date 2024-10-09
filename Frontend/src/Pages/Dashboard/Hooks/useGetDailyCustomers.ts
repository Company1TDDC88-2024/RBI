import axios from "axios";
import { useEffect, useState } from "react";

// Define the type for the daily customer count data
interface IDailyCustomerCount {
    totalEnteringCustomers: number;
}

interface IUseGetDailyCustomersReturn {
    data: IDailyCustomerCount | null;
    error: Error | null;
    loading: boolean;
}

export const useGetDailyCustomers = (date: String): IUseGetDailyCustomersReturn => {
    const [data, setData] = useState<IDailyCustomerCount | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!date) return; // Prevent fetching if date is not provided

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
    }, [date]);

    return { data, error, loading };
};
