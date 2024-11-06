import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
//import { Line } from '@ant-design/charts';
import styles from "./HistoryPage.module.css";

const { TabPane } = Tabs;

interface CustomerData {
  date: string;
  count: number;
}

const HistoryPage: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<CustomerData[]>([]);
  const [weeklyData, setWeeklyData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*const fetchMonthlyData = async () => {
      try {
        const url = `http://127.0.0.1:5555/customer_count/get?startDate=${getStartDate(30)}&endDate=${getCurrentDate()}&t=${new Date().getTime()}`;
        console.log("Fetching URL:", url);
        const response = await fetch(url);
        console.log(response);
        const responseBody = await response.text(); 
        console.log('Response body:', responseBody); 
       //const response = await fetch(`/customer_count/get?startDate=${getStartDate(30)}&endDate=${getCurrentDate()}&t=${new Date().getTime()}`);
        if (!response.ok) {
          //throw new Error(`Failed to fetch monthly data: ${response.statusText}`);
          const errorText = await response.text(); // Read the response as text to get error message
          console.error(`Error fetching monthly data: ${response.status} ${response.statusText}`, errorText);
          return;
        }
        
        try {
          const data = await response.json();
          console.log("Fetched data:", data);
          
          // Process the data
          const processedMonthlyData = processMonthlyData(data);
          setMonthlyData(processedMonthlyData);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };*/
    const fetchMonthlyData = async () => {
      try {
        const url = `http://127.0.0.1:5555/customer_count/get?startDate=${getStartDate(30)}&endDate=${getCurrentDate()}&t=${new Date().getTime()}`;
        console.log("Fetching URL:", url);
    
        const response = await fetch(url);
    
        if (!response.ok) {
          const errorText = await response.text(); // Only read as text if there's an error
          console.error(`Error fetching monthly data: ${response.status} ${response.statusText}`);
          console.error("Error details:", errorText);
          return;
        }
    
        // Directly parse JSON if response is OK
        const data = await response.json();
        console.log("Fetched data:", data);
    
        // Process the data
        const processedMonthlyData = processMonthlyData(data);
        setMonthlyData(processedMonthlyData);
    
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    const fetchWeeklyData = async () => {
      try {
        const url = `http://127.0.0.1:5555/customer_count/get?startDate=${getStartDate(7)}&endDate=${getCurrentDate()}&t=${new Date().getTime()}`;
        console.log("Fetching weekly data URL:", url);
    
        const response = await fetch(url);
    
        if (!response.ok) {
          const errorText = await response.text(); // Only read as text if there's an error
          console.error(`Error fetching weekly data: ${response.status} ${response.statusText}`);
          console.error("Error details:", errorText);
          return;
        }
    
        // Directly parse JSON if response is OK
        const data = await response.json();
        console.log("Fetched weekly data:", data);
    
        // Process the data
        const processedWeeklyData = processDailyData(data);
        setWeeklyData(processedWeeklyData);
    
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      }
    };
    const fetchData = async() =>{
      await Promise.all([fetchMonthlyData(),fetchWeeklyData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getStartDate = (daysBack: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toISOString().split("T")[0];
  };

 /* const processMonthlyData = (data: any[]): CustomerData[] => {
    const monthlyCounts: { [month: string]: number } = {};
  
    data.forEach((entry) => {
      const month = entry.Timestamp.slice(0, 8); // Slice to "YYYY-MM" format for monthly grouping
      monthlyCounts[month] = (monthlyCounts[month] || 0) + entry.TotalCustomers;
    });
  
    return Object.entries(monthlyCounts).map(([month, count]) => ({ date: month, count }));
  };*/
  const processMonthlyData = (data: any[]): CustomerData[] => {
    const monthlyCounts: { [month: string]: number } = {};
  
    data.forEach((entry) => {
      // Extract "YYYY-MM" format for monthly grouping
      const month = new Date(entry.Timestamp).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  
      // Accumulate customers by month
      monthlyCounts[month] = (monthlyCounts[month] || 0) + entry.TotalCustomers;
    });
  
    // Convert the monthlyCounts object into an array for charting
    return Object.entries(monthlyCounts).map(([month, count]) => ({
      date: month,  // "Oct 2024" or "Nov 2024"
      count,
    }));
  };
  const processDailyData = (data: any[]): CustomerData[] => {
    // This will now return the original timestamp data for each entry
    return data.map((entry) => ({
      date: entry.Timestamp, // Keep the exact timestamp as the 'date'
      count: entry.TotalCustomers, // Keep the count for that timestamp
    }));
  };
  
  

  /*const processDailyData = (data: any[]): CustomerData[] => {
    const dailyCounts: { [date: string]: number } = {};

    data.forEach((entry) => {
      const date = entry.Timestamp.split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + entry.TotalCustomers;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  };*/

  const monthlyConfig = {
    data: monthlyData,
    xField: 'date',
    yField: 'count',
    point: { size: 5, shape: 'diamond' },
  };

  const dailyConfig = {
    data: weeklyData,
    xField: 'date',
    yField: 'count',
    point: { size: 5, shape: 'diamond' },
  };

  return (
    <div className={styles.historyContainer}>
      <h1 className={styles.pageTitle}>Customer Historical Data</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Day by Day" key="1">
          {loading ? (
            <Spin tip="Loading data..." />
          ) : (
            <Line {...dailyConfig} />
          )}
        </TabPane>
        <TabPane tab="Month by Month" key="2">
          {loading ? <Spin tip="Loading chart..." /> : <Line {...monthlyConfig} />}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HistoryPage;
