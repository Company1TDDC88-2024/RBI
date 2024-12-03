import { useState } from "react";
import axios from "axios";

export const useGetEnteringCustomersWithinTimeframe = (influxTimeframe: number) => {
  const [enteringCustomerDuringTimeframe, setData] = useState<{ totalEnteringCustomers: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Calculate start timestamp with an hour added
  const getStartTimestamp = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - influxTimeframe);
    now.setHours(now.getHours() + 1); // Add one hour to the start timestamp
    return now.toISOString();
  };

  const refetchEnteringCustomers = async () => {
    // Add one hour to the end timestamp
    const startTimestamp = getStartTimestamp();
    const endTimestamp = new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(); // Add 1 hour to current time

    try {
      setError(null); // Reset any previous errors
      const response = await axios.get("/customer_count/get_customers", {
        params: { startTimestamp, endTimestamp },
        withCredentials: true,
      });

      if (response.status === 200) {
        const enteringCustomerDuringTimeframe = response.data.entering_customers; // Store the fetched data (totalEnteringCustomers)
        return enteringCustomerDuringTimeframe; // Allow chaining in the caller
      } else {
        throw new Error("Unexpected API response");
      }
    } catch (err) {
      setError(err as Error); // Set error if the request fails
      throw err; // Rethrow to let the caller handle it
    }
  };

  return { enteringCustomerDuringTimeframe, error, refetchEnteringCustomers };
};
