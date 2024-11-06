import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spin, Alert, DatePicker, Select } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetQueueCount";
import { useGetDailyCustomers } from '../Hooks/useGetDailyCustomers';
import styles from "./HistoryPage.module.css";
import DateTimeDisplay from '../DateTimeDisplay';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [processedQueueData, setProcessedQueueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Never');
  const [numberOfMonths, setNumberOfMonths] = useState(3);

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

  // Modify processData to aggregate based on the frequency and number of months
  const processData = (customerCountData, frequency, numberOfMonths) => {
    const result = {};

    customerCountData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
      let key;

      if (frequency === '1hour') {
        key = moment(timestamp).format('YYYY-MM-DD HH:00'); // Group by hour
      } else if (frequency === '1day') {
        key = moment(timestamp).format('YYYY-MM-DD'); // Group by day
      } else {
        key = moment(timestamp).format('YYYY-MM'); // Group by month
      }

      if (!result[key]) {
        result[key] = { Timestamp: key, TotalCustomers: 0 };
      }
      result[key].TotalCustomers += item.TotalCustomers;
    });

    const groupedData = Object.values(result);

    // If monthly, limit to the last `numberOfMonths`
    return frequency === '1month' ? groupedData.slice(-numberOfMonths) : groupedData;
  };

  const processQueueData = (cameraQueueData, frequency, numberOfMonths, threshold = 3) => {
    const result = {};
  
    cameraQueueData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
      let key;
  
      // Format the timestamp based on the frequency
      if (frequency === '1hour') {
        key = moment(timestamp).format('YYYY-MM-DD HH:00'); // Group by hour
      } else if (frequency === '1day') {
        key = moment(timestamp).format('YYYY-MM-DD'); // Group by day
      } else {
        key = moment(timestamp).format('YYYY-MM'); // Group by month
      }
  
      // Only process if the NumberOfCustomers is greater than or equal to the threshold
      if (item.NumberOfCustomers >= threshold) {
        if (!result[key]) {
          result[key] = { Timestamp: key, NumberOfCustomers: 0 };
        }
        result[key].NumberOfCustomers += 1;
      }
    });
  
    const groupedData = Object.values(result);
  
    // If monthly, limit to the last `numberOfMonths`
    return frequency === '1month' ? groupedData.slice(-numberOfMonths) : groupedData;
  };
  

  useEffect(() => {
    if (customerCountData) {
      setProcessedData(processData(customerCountData, frequency, numberOfMonths));
    }
  }, [customerCountData, frequency, numberOfMonths]);

  useEffect(() => {
    if (cameraQueueData) {
      setProcessedQueueData(processQueueData(cameraQueueData, frequency, numberOfMonths));
    }
  }, [customerCountData, frequency, numberOfMonths]);

  if (cameraQueueDataLoading || dailyCustomerLoading || customerCountLoading) {
    return <Spin tip="Loading..." />;
  }

  const error = customerCountError || cameraQueueDataError || dailyCustomerError;
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
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
        <Col>
          <Select
            defaultValue={3}
            onChange={value => setNumberOfMonths(value)}
            style={{ width: 120 }}
            disabled={frequency !== '1month'} // Enable only for monthly frequency
          >
            {[...Array(12)].map((_, i) => (
              <Option key={i + 1} value={i + 1}>
                Last {i + 1} {i + 1 === 1 ? "Month" : "Months"}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Count" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
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
          <Card title="Queue Alerts from Area1 & Area2" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
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
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Number of alerts" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistoryPage;