import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spin, Alert, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetQueueCount";
import { useGetDailyCustomers } from '../Hooks/useGetDailyCustomers';
import { useGetExpectedCustomerCount } from '../Hooks/useGetExpectedCustomerCount';
import { useGetMonthlyAverageCustomerCount } from "../Hooks/useGetMonthlyAverageCustomerCount";
import styles from "./HistoryPage.module.css";
import DateTimeDisplay from '../DateTimeDisplay';
import moment from 'moment';

const { RangePicker } = DatePicker;

const HistoryPage = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const todaysDate = new Date();  // Get today's date
  todaysDate.setFullYear(todaysDate.getFullYear() - 1); // Adjust the year to last year
  const selectedDate = todaysDate.toISOString().split("T")[0]; // Get last year's date as string

  const [dates, setDates] = useState(() => {
    const savedDates = localStorage.getItem('dates');
    return savedDates ? JSON.parse(savedDates) : [formattedStartDate, currentDate];
  });

  const [frequency, setFrequency] = useState('1day');
  const [processedData, setProcessedData] = useState([]);
  const [processedQueueData, setProcessedQueueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Never');

  useEffect(() => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    setDates([startDate.toISOString().split("T")[0], endDate]);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dates', JSON.stringify(dates));
  }, [dates]);

  const { data: customerCountData, error: customerCountError, loading: customerCountLoading } = useGetCustomerCount(dates[0], dates[1]);
  const { data: dailyCustomerData, error: dailyCustomerError, loading: dailyCustomerLoading } = useGetDailyCustomers(currentDate);
  const { data: cameraQueueData, error: cameraQueueDataError, loading: cameraQueueDataLoading } = useGetQueueCount();

  // Hook to fetch expected customer count for the same day last year
  const { data: expectedCustomerCountData, error: expectedCustomerCountError, loading: expectedCustomerCountLoading } = useGetExpectedCustomerCount(selectedDate);
  const { data: monthlyAverageData, loading: monthlyAverageLoading, error: monthlyAverageError } = useGetMonthlyAverageCustomerCount(6);


  useEffect(() => {
    if (customerCountData || dailyCustomerData || cameraQueueData) {
      setLastUpdated(moment().format('HH:mm:ss'));
    }
  }, [customerCountData, dailyCustomerData, cameraQueueData]);

  const onDateChange = (dates, dateStrings) => {
    setDates(dateStrings);
  };

  // Process data to aggregate based on frequency within the selected date range
  const processData = (customerCountData, frequency) => {
    const result = {};
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);
    endDate.setHours(23, 59, 59, 999);
  
    customerCountData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
  
      if (timestamp >= startDate && timestamp <= endDate) {
        let key;
  
        if (frequency === '1hour') {
          if (timestamp.toISOString().split("T")[0] === dates[0]) {
            key = moment(timestamp).format('YYYY-MM-DD HH:00');
            if (!result[key]) {
              result[key] = { Timestamp: key, TotalCustomers: 0 };
            }
            result[key].TotalCustomers += item.TotalCustomers;
          }
        } else if (frequency === '1day') {
          key = moment(timestamp).format('YYYY-MM-DD');
          if (!result[key]) {
            result[key] = { Timestamp: key, TotalCustomers: 0 };
          }
          result[key].TotalCustomers += item.TotalCustomers;
        } else {
          key = moment(timestamp).format('YYYY-MM');
          if (!result[key]) {
            result[key] = { Timestamp: key, TotalCustomers: 0 };
          }
          result[key].TotalCustomers += item.TotalCustomers;
        }
      }
    });
  
    return Object.values(result).sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
  };

  const processQueueData = (cameraQueueData, frequency, numberOfMonths, threshold = 3) => {
    const result = {};
  
    cameraQueueData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
      let key;
  
      if (frequency === '1hour') {
        key = moment(timestamp).format('YYYY-MM-DD HH:00');
      } else if (frequency === '1day') {
        key = moment(timestamp).format('YYYY-MM-DD');
      } else {
        key = moment(timestamp).format('YYYY-MM');
      }
  
      if (item.NumberOfCustomers >= threshold) {
        if (!result[key]) {
          result[key] = { Timestamp: key, NumberOfCustomers: 0 };
        }
        result[key].NumberOfCustomers += 1;
      }
    });
  
    const groupedData = Object.values(result);
    return frequency === '1month' ? groupedData.slice(-numberOfMonths) : groupedData;
  };

  useEffect(() => {
    if (customerCountData) {
      setProcessedData(processData(customerCountData, frequency));
    }
  }, [customerCountData, frequency, dates]);

  useEffect(() => {
    if (cameraQueueData) {
      setProcessedQueueData(processQueueData(cameraQueueData, frequency, dates));
    }
  }, [cameraQueueData, frequency, dates]);

  if (cameraQueueDataLoading || dailyCustomerLoading || customerCountLoading || expectedCustomerCountLoading) {
    return <Spin tip="Loading..." />;
  }

  const error = customerCountError || cameraQueueDataError || dailyCustomerError || expectedCustomerCountError;
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Historical Data</h1>
      <DateTimeDisplay lastUpdated={lastUpdated} />

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
            Per Hour
          </Button>
          <Button 
            onClick={() => setFrequency('1day')} 
            type={frequency === '1day' ? 'primary' : 'default'}
            style={{ marginRight: '10px' }}
          >
            Per Day
          </Button>
          <Button 
            onClick={() => setFrequency('1month')} 
            type={frequency === '1month' ? 'primary' : 'default'}
          >
            Per Month
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Number of customers" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Timestamp" 
                  tickFormatter={timestamp => {
                    if (frequency === '1hour') return moment(timestamp).format('HH:00, DD MMM');
                    if (frequency === '1day') return moment(timestamp).format('DD MMM');
                    return moment(timestamp).format('MMM YYYY');
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="TotalCustomers" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Total number of customers" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Number of queue alerts" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedQueueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Timestamp" 
                  tickFormatter={timestamp => {
                    if (frequency === '1hour') return moment(timestamp).format('HH:00, DD MMM');
                    if (frequency === '1day') return moment(timestamp).format('DD MMM');
                    return moment(timestamp).format('MMM YYYY');
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="NumberOfCustomers" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                  name="Queue alerts" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Expected Customer Count (Last Year)" bordered={false} className={styles.dashboardCard}>
            {expectedCustomerCountData && expectedCustomerCountData.length > 0 ? (
              <div>Expected Customer Count for {selectedDate}: {expectedCustomerCountData.reduce((sum, item) => sum + item.TotalCustomers, 0)}</div>
            ) : (
              <div>No data available for the selected date last year</div>
            )}
          </Card>
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyAverageData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tickFormatter={(month) => moment(month, "YYYY-MM").format("MMM YYYY")}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(label) => moment(label, "YYYY-MM").format("MMMM YYYY")}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="averageCustomers" 
          stroke="#82ca9d" 
          name="Avg Customers" 
        />
      </LineChart>
      </ResponsiveContainer>

      

    </div>
  );
};

export default HistoryPage;
