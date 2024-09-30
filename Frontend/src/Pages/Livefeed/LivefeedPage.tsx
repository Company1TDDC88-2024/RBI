import React from "react";
import { Card, Row, Col } from "antd";
import "./LivefeedPage.css";
import "../../global.css";

// TODO: Implement the Live Feed here. Connect to Backend/Cameras

const LivefeedPage = () => {
  return (
    <div className="page-container">
      <h1>Live Feed</h1>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Live Feed" bordered={false} className="livefeed-card">
            <div className="livefeed-content">
              {/* Placeholder for live feed content */}
              <p>Live feed content goes here...</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LivefeedPage;