import React, { useEffect, useState } from "react";
import { Table, Tabs, Spin } from "antd";
import styles from "./HistoryPage.module.css";
import "../../global.css";
import { Line } from '@ant-design/charts';




const { TabPane } = Tabs;

interface DailyData {
  date: string;
  count: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

const HistoryPage: React.FC = () => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyResponse, monthlyResponse] = await Promise.all([
          fetch('/customer_count/get_daily'),
          fetch('/api/monthly-customer-data')
        ]);
        const dailyData = await dailyResponse.json();
        const monthlyData = await monthlyResponse.json();
        setDailyData(dailyData);
        setMonthlyData(monthlyData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const monthlyConfig = {
    data: monthlyData,
    xField: 'month',
    yField: 'count',
    point: { size: 5, shape: 'diamond' },
  };

  return (
    <div className={styles.historyContainer}>
      <h1 className={styles.pageTitle}>Customer Historical Data</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Day by Day" key="1">
          {loading ? (
            <Spin tip="Loading data..." />
          ) : (
            <Table
              dataSource={dailyData}
              columns={[
                { title: 'Date', dataIndex: 'date', key: 'date' },
                { title: 'Customer Count', dataIndex: 'count', key: 'count' },
              ]}
              rowKey="date"
            />
          )}
        </TabPane>
        <TabPane tab="Month by Month" key="2">
          {loading ? <Spin tip="Loading chart..." /> : <Line {...monthlyConfig} />}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HistoryPage;
