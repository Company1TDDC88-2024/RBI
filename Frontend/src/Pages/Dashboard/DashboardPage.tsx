import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin, Alert, Table, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "./Hooks/useGetCustomerCount";
import { useGetDailyCustomers } from './Hooks/useGetDailyCustomers';
import styles from "./DashboardPage.module.css";
import DateTimeDisplay from './DateTimeDisplay'; // Adjust the path if necessary

const { RangePicker } = DatePicker;

const DashboardPage = () => {
  const [dates, setDates] = useState<[string, string]>(["", ""]);

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date

  // Set the default date range to the last 7 days
  useEffect(() => {
    const endDate = currentDate; // Use the current date
    const startDate = new Date();
    startDate.setDate(new Date().getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    setDates([formatDate(startDate), endDate]);
  }, [currentDate]); // Dependency on currentDate

  // Fetch customer count data
  const { data: customerCountData, error: customerCountError, loading: customerCountLoading } = useGetCustomerCount(dates[0], dates[1]);
  
  // Fetch daily customers data
  const { data: dailyCustomerData, error: dailyCustomerError, loading: dailyCustomerLoading } = useGetDailyCustomers(currentDate);

  const onDateChange = (dates: any, dateStrings: [string, string]) => {
    setDates(dateStrings);
  };

  // Handle loading and error states
  if (customerCountLoading || dailyCustomerLoading) {
    return <Spin tip="Loading..." />;
  }

  const error = customerCountError || dailyCustomerError; // Check for any errors
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
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

  console.log(customerCountData, dailyCustomerData); // Log both datasets

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      <DateTimeDisplay />
      <RangePicker onChange={onDateChange} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Count Data" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <Table dataSource={customerCountData || []} columns={columns} rowKey="Timestamp" pagination={{ pageSize: 5 }}/>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Customer Count Over Time" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerCountData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Timestamp" />
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
          <Card title="Daily customer count" bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            {dailyCustomerData?.totalEnteringCustomers}
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
