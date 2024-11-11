// MonthlyAverageCustomerCount.tsx
import React, { useEffect, useState } from "react";

interface MonthlyAverageCustomerCountProps {
  months: number;  // Number of past months to average
}

const MonthlyAverageCustomerCount: React.FC<MonthlyAverageCustomerCountProps> = ({ months }) => {
  const [monthlyAverage, setMonthlyAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchDailyData = async () => {
      const startDate = getStartDate(months * 30);  // Roughly the start date for the past X months
      const endDate = getCurrentDate();
      console.log("Start date:", startDate, "End date:", endDate);

      try {
        const response = await fetch(`http://127.0.0.1:5555/customer_count/get_daily?startDate=${startDate}&endDate=${endDate}`);
       
        
        if (!response.ok) {
          console.error("Error fetching daily data:", response.statusText);
          return;
        }

        const data = await response.json();

        console.log("Fetched data in monthlyavgcount:", data); // Log the response to inspect its structure

        if (Array.isArray(data)) {
          // If the response is an array of daily data
          const monthlyData: { [month: string]: number[] } = {};
          data.forEach((entry: { Timestamp: string; TotalCustomers: number }) => {
            const month = entry.Timestamp.slice(0, 7);  // Extract "YYYY-MM" from the timestamp
            if (!monthlyData[month]) {
              monthlyData[month] = [];
            }
            monthlyData[month].push(entry.TotalCustomers);
          });

          const monthAverages = Object.values(monthlyData).map(
            (counts) => counts.reduce((sum, count) => sum + count, 0) / counts.length
          );
          const overallAverage = monthAverages.reduce((sum, avg) => sum + avg, 0) / monthAverages.length;

          setMonthlyAverage(Math.round(overallAverage));
        } else if (data.totalCustomers !== undefined) {
          // If the response contains aggregate data like {totalCustomers: 0}
          const totalCustomers = data.totalCustomers || 0;
          const average = totalCustomers / months;  // Divide the total by the number of months to get the average
          setMonthlyAverage(Math.round(average));  // Round the result for cleaner display
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching daily data:", error);
      }
    };

    fetchDailyData();
  }, [months]);

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getStartDate = (daysBack: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);  // Adjust the date to go back 'daysBack' days
    return date.toISOString().split("T")[0];
  };

  return (
    <div style={{ textAlign: "right" }}>
      <h3>Average Monthly Customers (Last {months} Months): {monthlyAverage !== null ? monthlyAverage : "Loading..."}</h3>
    </div>
  );
};

export default MonthlyAverageCustomerCount;
