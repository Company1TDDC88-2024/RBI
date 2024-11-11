import axios from "axios";
import { useEffect, useState } from "react";
import { ICustomerCount } from "./../../Types/Customer-data-types";

// Define the type for the customer count data

interface IUseGetCustomerCountReturn {
    data: ICustomerCount[] | null;
    error: Error | null;
    loading: boolean;
    refetch: (startDate: string, endDate: string) => void;
}

export const useGetCustomerCount = (startDate: string, endDate: string): IUseGetCustomerCountReturn => {
    const [data, setData] = useState<ICustomerCount[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = (startDate: string, endDate: string) => {
        axios.get("/customer_count/get", {
            params: {
                startDate,
                endDate
            },
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
    };

    useEffect(() => {
        fetchData(startDate, endDate);
    }, [startDate, endDate]);

    return { data, error, loading, refetch: fetchData };
};