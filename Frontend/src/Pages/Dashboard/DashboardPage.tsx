import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin, Alert, Table, DatePicker, Button } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "./Hooks/useGetCustomerCount";
import { useGetQueueCount } from "./Hooks/useGetQueueCount"; // Import the Queue Count hook
import styles from "./DashboardPage.module.css";
import DateTimeDisplay from './DateTimeDisplay'; 
import moment from 'moment';

const { RangePicker } = DatePicker;

const formatTimestamp = (timestamp: string, frequency: '10min' | '1hour' | '1day') => {
  if (frequency === '1day') {
    return moment(timestamp).format('YYYY-MM-DD'); // Display only the date
  } else {
    return moment(timestamp).format('HH:mm'); // Display hours and minutes
  }
};

const DashboardPage = () => {
  const [dates, setDates] = useState<[string, string]>(["", ""]);
  const [frequency, setFrequency] = useState<'10min' | '1hour' | '1day'>('10min'); 
  const [processedData, setProcessedData] = useState<any[]>([]); 

  // Fetch customer count data
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    setDates([formatDate(startDate), formatDate(endDate)]);
  }, []);

  const { data, error, loading } = useGetCustomerCount(dates[0], dates[1]);

  const onDateChange = (dates: any, dateStrings: [string, string]) => {
    setDates(dateStrings);
  };

  const processData = (data: any[], frequency: '10min' | '1hour' | '1day') => {
    const result: any = {};
    data.forEach(item => {
      const timestamp = new Date(item.Timestamp);
      let key: string;

      if (frequency === '10min') {
        key = new Date(Math.floor(timestamp.getTime() / 600000) * 600000).toISOString(); // Round down to nearest 10 minutes
      } else if (frequency === '1hour') {
        key = new Date(Math.floor(timestamp.getTime() / 3600000) * 3600000).toISOString(); // Round down to nearest hour
      } else {
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`;
      }

      if (!result[key]) {
        result[key] = { Timestamp: key, TotalCustomers: 0 };
      }
      result[key].TotalCustomers += item.TotalCustomers;
    });
    return Object.values(result);
  };

  useEffect(() => {
    if (data) {
      setProcessedData(processData(data, frequency));
    }
  }, [data, frequency]);

  // Fetch queue count data
  const { data: queueData, loading: queueLoading, error: queueError } = useGetQueueCount(); // Fetch queue data

  if (loading || queueLoading) {
    return <Spin tip="Loading..." />;
  }

  if (error || queueError) {
    return <Alert message="Error" description={error?.message || queueError?.message} type="error" showIcon />;
  }

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'Timestamp',
      key: 'timestamp',
    },
    {
      title: 'Total Customers',
      dataIndex: 'TotalCustomers',
      key: 'totalCustomers',
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      <DateTimeDisplay />
      <Row gutter={16} align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <RangePicker onChange={onDateChange} />
        </Col>
        <Col>
          <Button 
            onClick={() => setFrequency('10min')} 
            type={frequency === '10min' ? 'primary' : 'default'} 
            style={{ marginRight: '10px' }}
          >
            Every 10 Minutes
          </Button>
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
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Count Data" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <Table
              dataSource={processedData || []}
              columns={columns}
              rowKey="Timestamp"
              pagination={{ pageSize: 5 }} 
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Customer Count Over Time" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData || []}>
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
      
      <Row gutter={16}>
  <Col span={12}>
    <Card title="Queue Count" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
      <h2>Current Number of Customers in Queue: {queueData?.NumberOfCustomers || 0}</h2>
    </Card>
  </Col>
</Row>


      <Row gutter={16}>
        <Col span={12}>
          <Card title="Screen 3" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            Screen content
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Screen 4" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            Screen content
          </Card>
        </Col>
      </Row>

      <p>
        Click <Link to="/test">here</Link> to get a message from the backend
      </p>
    </div>
  );
};

export default DashboardPage;
