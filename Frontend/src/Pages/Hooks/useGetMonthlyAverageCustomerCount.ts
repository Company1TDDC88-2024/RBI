import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

interface MonthlyAverageData {
  month: string;
  averageCustomers: number;
}

const useGetMonthlyAverageCustomerCount = (months: number) => {
  const [data, setData] = useState<MonthlyAverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMonthlyAverageData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const response = await axios.get("/customer_count/get", {
          params: {
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          },
          withCredentials: true,
        });

        if (response.status === 200) {
          console.log("Raw API Response:", response.data);

          // Aggregate data by month
          const monthlyData = response.data.reduce((acc: any, item: any) => {
            const monthKey = moment(item.Timestamp).format("YYYY-MM"); // Format as "YYYY-MM"
            if (!acc[monthKey]) {
              acc[monthKey] = { total: 0 };
            }
            acc[monthKey].total += item.TotalCustomers;
            return acc;
          }, {});

          console.log("Aggregated Monthly Data:", monthlyData);

          // Calculate average customers per day for each month
          const monthlyAverage = Object.entries(monthlyData).map(([month, values]) => {
            const daysInMonth = moment(month, "YYYY-MM").daysInMonth(); // Calculate number of days in the month
            return {
              month,
              averageCustomers: Math.round(values.total / daysInMonth), // Divide total by days in month
            };
          }).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

          console.log("Monthly Average Data:", monthlyAverage);

          setData(monthlyAverage);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyAverageData();
  }, [months]);

  return { data, loading, error };
};

export { useGetMonthlyAverageCustomerCount };
