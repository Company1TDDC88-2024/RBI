// ExpectedCustomerCount.tsx
import React, { useEffect, useState } from "react";

interface ExpectedCustomerCountProps {
  date: string;  // current date in "YYYY-MM-DD" format
}

const ExpectedCustomerCount: React.FC<ExpectedCustomerCountProps> = ({ date }) => {
  const [expectedCount, setExpectedCount] = useState<number>(0);

  useEffect(() => {
    console.log("Current date:", date);
    const fetchLastYearCount = async () => {
        const formattedDate = date;  // Use the passed date directly

        console.log("Fetching data for:", formattedDate);

      try {
        const response = await fetch(`http://127.0.0.1:5555/customer_count/get_daily?date=${formattedDate}`);
        
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          return;
        }

        const data = await response.json();
        console.log("Fetched data in expected:",data);

        if (Array.isArray(data)) {
            // Calculate expected customer count based on array of data entries
            const totalCustomers = data.reduce((sum: number, entry: { TotalCustomers: number }) => sum + entry.TotalCustomers, 0);
            const expected = totalCustomers / data.length;  // Average count for last year’s data
            setExpectedCount(Math.round(expected)); // Round for cleaner display
          } else if (data && data.totalCustomers !== undefined) {
            // If data is an object, directly use the totalCustomers field
            setExpectedCount(data.totalCustomers);
          } else {
            console.error("Unexpected data format:", data);
          }

        
      } catch (error) {
        console.error("Error fetching last year's data:", error);
      }
    };

    fetchLastYearCount();
  }, [date]);

  return (
    <div>
      <h3>Expected Customers (Same Time Last Year): {expectedCount !== null ? expectedCount : "Loading..."}</h3>
    </div>
  );
};

export default ExpectedCustomerCount;
