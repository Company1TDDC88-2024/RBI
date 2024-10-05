import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin, Alert, Table, DatePicker } from "antd";
import { useGetCustomerCount } from "./Hooks/useGetCustomerCount";
import "./DashboardPage.css";

const { RangePicker } = DatePicker;

const DashboardPage = () => {
  const [dates, setDates] = useState<[string, string]>(["", ""]);

  // set the default date range to the last 7 days
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

  if (loading) {
    return <Spin tip="Loading..." />;
  }

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
      title: 'Number of Customers',
      dataIndex: 'NumberOfCustomers',
      key: 'numberOfCustomers',
    },
  ];

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <RangePicker onChange={onDateChange} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Count Data" bordered={false} className="dashboard-card">
            <Table dataSource={data || []} columns={columns} rowKey="Timestamp" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Screen 2" bordered={false} className="dashboard-card">
            Screen content
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Screen 3" bordered={false} className="dashboard-card">
            Screen content
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Screen 4" bordered={false} className="dashboard-card">
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