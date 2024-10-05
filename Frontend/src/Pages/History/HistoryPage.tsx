import React from "react";
import { Table, Card, Row, Col } from "antd";
import styles from "./HistoryPage.module.css";
import "../../global.css";

//TODO: Connect to backend. Example data not connected to backend yet
const dataSource = [
  {
    key: '1',
    date: '2023-01-01',
    event: 'Event 1',
    details: 'Details of event 1',
  },
  {
    key: '2',
    date: '2023-01-02',
    event: 'Event 2',
    details: 'Details of event 2',
  },
  // Add more data as needed
];

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Event',
    dataIndex: 'event',
    key: 'event',
  },
  {
    title: 'Details',
    dataIndex: 'details',
    key: 'details',
  },
];

const HistoryPage = () => {
  return (
    <div className={styles.historyPageContainer}>
      <h1>Historical Data</h1>
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Historical Events" bordered={false} className={styles.historyCard}>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HistoryPage;