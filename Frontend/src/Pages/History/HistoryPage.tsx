import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spin, Alert, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetQueueCount";
import { useGetDailyCustomers } from '../Hooks/useGetDailyCustomers';
import styles from "./HistoryPage.module.css";
import DateTimeDisplay from '../DateTimeDisplay';
import moment from 'moment';

const { RangePicker } = DatePicker;

const HistoryPage = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const formattedStartDate = startDate.toISOString().split("T")[0];

  const [dates, setDates] = useState(() => {
    const savedDates = localStorage.getItem('dates');
    return savedDates ? JSON.parse(savedDates) : [formattedStartDate, currentDate];
  });

  const [frequency, setFrequency] = useState('1day');
  const [processedData, setProcessedData] = useState([]);
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
    
    // Set endDate to 23:59:59 to include the entire end date, before it would be 00:00:00 and not show up
    endDate.setHours(23, 59, 59, 999);
  
    customerCountData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
  
      // Filter data within the selected date range, including the full end date
      if (timestamp >= startDate && timestamp <= endDate) {
        let key;
  
        if (frequency === '1hour') {
          // Only include data from startDate if frequency is hourly
          if (timestamp.toISOString().split("T")[0] === dates[0]) {
            key = moment(timestamp).format('YYYY-MM-DD HH:00'); // Group by hour for startDate only
            if (!result[key]) {
              result[key] = { Timestamp: key, TotalCustomers: 0 };
            }
            result[key].TotalCustomers += item.TotalCustomers;
          }
        } else if (frequency === '1day') {
          key = moment(timestamp).format('YYYY-MM-DD'); // Group by day
          if (!result[key]) {
            result[key] = { Timestamp: key, TotalCustomers: 0 };
          }
          result[key].TotalCustomers += item.TotalCustomers;
        } else {
          key = moment(timestamp).format('YYYY-MM'); // Group by month
          if (!result[key]) {
            result[key] = { Timestamp: key, TotalCustomers: 0 };
          }
          result[key].TotalCustomers += item.TotalCustomers;
        }
      }
    });
  
    return Object.values(result).sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
  };
  
  
  useEffect(() => {
    if (customerCountData) {
      setProcessedData(processData(customerCountData, frequency));
    }
  }, [customerCountData, frequency, dates]);

  if (cameraQueueDataLoading || dailyCustomerLoading || customerCountLoading) {
    return <Spin tip="Loading..." />;
  }

  const error = customerCountError || cameraQueueDataError || dailyCustomerError;
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Historic Data</h1>
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
          <Card title="Customer" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
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
                <Line type="monotone" dataKey="TotalCustomers" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Queue Alerts" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[]}>
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
