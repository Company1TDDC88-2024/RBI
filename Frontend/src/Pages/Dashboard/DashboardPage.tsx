import React from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col } from "antd";
import "./DashboardPage.css";

// TODO: Implement the Dashboard here
const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Screen 1" bordered={false} className="dashboard-card">
            Screen content
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