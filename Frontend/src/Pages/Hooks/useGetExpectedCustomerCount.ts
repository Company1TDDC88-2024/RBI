import { useState, useEffect } from "react";
import axios from "axios";
import { ICustomerCount } from "../../Types/Customer-data-types";

// Define the type for the customer count data
interface IUseGetExpectedCustomerCountReturn {
  data: ICustomerCount[] | null;
  error: Error | null;
  loading: boolean;
}

export const useGetExpectedCustomerCount = (selectedDate: string): IUseGetExpectedCustomerCountReturn => {
  const [data, setData] = useState<ICustomerCount[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Construct the API call to fetch data for the same date last year
    axios
      .get("/customer_count/get", {
        params: {
          startDate: selectedDate, // Use the adjusted date for last year
          endDate: selectedDate, // Same date for both start and end
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
  }, [selectedDate]);

  return { data, error, loading };
};
