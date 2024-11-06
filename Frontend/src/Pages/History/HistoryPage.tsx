import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spin, Alert, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount"; // Hook to fetch customer count data
import { useGetQueueCount } from "../Hooks/useGetQueueCount"; // Hook to fetch queue count data
import { useGetDailyCustomers } from '../Hooks/useGetDailyCustomers'; // Hook to fetch daily customers data
import styles from "./HistoryPage.module.css"; // Importing styles
import DateTimeDisplay from '../DateTimeDisplay'; // Component to display the last updated time
import moment from 'moment'; // Library for date formatting

const { RangePicker } = DatePicker; // DatePicker component from antd

// Function to format timestamp based on the given frequency
const formatTimestamp = (timestamp: string, frequency: '10min' | '1hour' | '1day') => {
  if (frequency === '1day') {
    return moment(timestamp).format('YYYY-MM-DD'); // Display only the date for daily frequency
  } else {
    return moment(timestamp).format('HH:mm'); // Display hours and minutes for 10min and hourly frequency
  }
};

const HistoryPage = () => {
  const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Start date set to 7 days before the current date
  const formattedStartDate = startDate.toISOString().split("T")[0]; // Start date in YYYY-MM-DD format

  // State to manage the selected date range
  const [dates, setDates] = useState<[string, string]>(() => {
    const savedDates = localStorage.getItem('dates');
    return savedDates ? JSON.parse(savedDates) : [formattedStartDate, currentDate];
  });

  // State to manage the frequency of data aggregation
  const [frequency, setFrequency] = useState<'10min' | '1hour' | '1day'>('10min'); 
  const [processedData, setProcessedData] = useState<any[]>([]); // State to store processed data for the chart
  const [lastUpdated, setLastUpdated] = useState<string>('Never'); // State to track the last updated time

  // Set the default date range to the last 7 days if not already set
  useEffect(() => {
    const endDate = new Date().toISOString().split("T")[0]; // Current date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days before the current date
    const formatDate = (date: Date) => date.toISOString().split("T")[0]; // Function to format date
    setDates([formatDate(startDate), endDate]);
  }, [currentDate]); // Empty dependency array to run only on initial render

  // Save dates to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('dates', JSON.stringify(dates));
  }, [dates]);

  // Fetch customer count data and daily customers data
  const { data: customerCountData, error: customerCountError, loading: customerCountLoading } = useGetCustomerCount(dates[0], dates[1]);
  const { data: dailyCustomerData, error: dailyCustomerError, loading: dailyCustomerLoading } = useGetDailyCustomers(currentDate);
  const { data: cameraQueueData, error: cameraQueueDataError, loading: cameraQueueDataLoading } = useGetQueueCount();

  // Update the last updated time when the data changes
  useEffect(() => {
    if (customerCountData || dailyCustomerData || cameraQueueData) {
      setLastUpdated(moment().format('HH:mm:ss'));
    }
  }, [customerCountData, dailyCustomerData, cameraQueueData]);

  // Handle date range change
  const onDateChange = (dates: any, dateStrings: [string, string]) => {
    setDates(dateStrings);
  };

  // Process customer count data based on the frequency
  const processData = (customerCountData: any[], frequency: '10min' | '1hour' | '1day') => {
    const result: any = {};
    customerCountData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
      let key: string;

      // Round down the timestamp to the nearest interval based on the frequency
      if (frequency === '10min') {
        key = new Date(Math.floor(timestamp.getTime() / 600000) * 600000).toISOString(); // Round down to nearest 10 minutes
      } else if (frequency === '1hour') {
        key = new Date(Math.floor(timestamp.getTime() / 3600000) * 3600000).toISOString(); // Round down to nearest hour
      } else {
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`; // Format date as YYYY-MM-DD
      }

      if (!result[key]) {
        result[key] = { Timestamp: key, TotalCustomers: 0 }; // Initialize the result object if it doesn't exist
      }
      result[key].TotalCustomers += item.TotalCustomers; // Increment the total customers count
    });
    return Object.values(result); // Return the processed data as an array
  };



// Process queue count data and return an array of processed data
const processQueueData = (queueData: any[], frequency: '10min' | '1hour' | '1day') => {
  const result: any = {};

  queueData.forEach(item => {
    const timestamp = new Date(item.Timestamp); // Assume Timestamp exists in the item
    let key: string;

    // Round down the timestamp to the nearest interval based on the frequency
    if (frequency === '10min') {
      key = new Date(Math.floor(timestamp.getTime() / 600000) * 600000).toISOString(); // Round down to nearest 10 minutes
    } else if (frequency === '1hour') {
      key = new Date(Math.floor(timestamp.getTime() / 3600000) * 3600000).toISOString(); // Round down to nearest hour
    } else {
      key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`; // Format date as YYYY-MM-DD
    }

    if (!result[key]) {
      result[key] = { Timestamp: key, TotalCustomers: 0 }; // Initialize the result object if it doesn't exist
    }
    result[key].TotalCustomers += item.NumberOfCustomers; // Increment the total customers count
  });

  return Object.values(result); // Return the processed data as an array of objects
};

  // Process the customer count data whenever it or the frequency changes
  useEffect(() => {
    if (customerCountData) {
      setProcessedData(processData(customerCountData, frequency));
    }
  }, [customerCountData, frequency]);

  useEffect(() => {
    if (cameraQueueData) {
      console.log(processQueueData);
      setProcessedData(processQueueData(cameraQueueData, frequency));
    }
  }, [cameraQueueData, frequency]);

  // Display loading spinner if any of the data is still loading
  if (cameraQueueDataLoading || dailyCustomerLoading || customerCountLoading) {
    return <Spin tip="Loading..." />;
  }

  // Display error message if there is an error in fetching any data
  const error = customerCountError || cameraQueueDataError || dailyCustomerError;
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      <DateTimeDisplay lastUpdated={lastUpdated} /> {/* Display the last updated time */}

      <Row gutter={16} align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <RangePicker onChange={onDateChange} />
        </Col>
        <Col>
          <Button 
            onClick={() => setFrequency('1hour')} 
            type={frequency === '1hour' ? 'primary' : 'default'}
            style={{ marginRight: '10px' }}
          >
            Every Hour
          </Button>
          <Button 
            onClick={() => setFrequency('1day')} 
            type={frequency === '1day' ? 'primary' : 'default'}
          >
            Per Day
          </Button>
        </Col>
      </Row>
      <Row gutter={16} align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <RangePicker onChange={onDateChange} /> {/* Date range picker for selecting date range */}
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
        
          <Card title="Customer" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData || []}> {/* Line chart for displaying customer data */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" tickFormatter={(timestamp) => formatTimestamp(timestamp, frequency)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="TotalCustomers" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Queue Alerts" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]}> {/* Line chart for displaying queue data */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" tickFormatter={(timestamp) => formatTimestamp(timestamp, frequency)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="TotalCustomers" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistoryPage;
