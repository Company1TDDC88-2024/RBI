import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import styles from "./HistoryPage.module.css";
import ExpectedCustomerCount from "./ExpectedCustomerCount";

const { TabPane } = Tabs;

interface CustomerData {
  date: string;
  count: number;
}

const HistoryPage: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<CustomerData[]>([]);
  const [weeklyData, setWeeklyData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();  // Get today's date
  console.log("date from history:",currentDate);
  currentDate.setFullYear(currentDate.getFullYear() - 1); 
  console.log("Adjusted current date to last year:", currentDate); // Adjust the year to last year
  const selectedDate = currentDate.toISOString().split("T")[0];
  console.log("Formatted selected date:", selectedDate); 

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const url = `http://127.0.0.1:5555/customer_count/get?startDate=${getStartDate(30)}&endDate=${getCurrentDate()}&t=${new Date().getTime()}`;
        console.log("Fetching URL:", url);
    
        const response = await fetch(url);
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching monthly data: ${response.status} ${response.statusText}`);
          console.error("Error details:", errorText);
          return;
        }
    
        const data = await response.json();
        console.log("Fetched data:", data);
    
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
          const errorText = await response.text();
          console.error(`Error fetching weekly data: ${response.status} ${response.statusText}`);
          console.error("Error details:", errorText);
          return;
        }
    
        const data = await response.json();
        console.log("Fetched weekly data:", data);
    
        const processedWeeklyData = processDailyData(data);
        setWeeklyData(processedWeeklyData);
    
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      }
    };
    
    const fetchData = async () => {
      await Promise.all([fetchMonthlyData(), fetchWeeklyData()]);
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

  const processMonthlyData = (data: any[]): CustomerData[] => {
    const monthlyCounts: { [month: string]: number } = {};
  
    data.forEach((entry) => {
      const month = new Date(entry.Timestamp).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + entry.TotalCustomers;
    });
  
    return Object.entries(monthlyCounts).map(([month, count]) => ({
      date: month,
      count,
    }));
  };

  const processDailyData = (data: any[]): CustomerData[] => {
    return data.map((entry) => ({
      date: entry.Timestamp,
      count: entry.TotalCustomers,
    }));
  };

  

  return (
    <div className={styles.historyContainer}>
      <h1 className={styles.pageTitle}>Customer Historical Data</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Day by Day" key="1">
          {loading ? (
            <Spin tip="Loading data..." />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabPane>
        <TabPane tab="Month by Month" key="2">
          {loading ? (
            <Spin tip="Loading chart..." />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabPane>
      </Tabs>
      <ExpectedCustomerCount date={selectedDate} />
    </div>
  );
};

export default HistoryPage;
