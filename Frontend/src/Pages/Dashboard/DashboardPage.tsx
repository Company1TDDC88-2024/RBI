import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Alert } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";  
import styles from "./DashboardPage.module.css";
import DateTimeDisplay from "../DateTimeDisplay";
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetCurrentQueues.ts";
import { useGetCoordinates } from "../Hooks/useGetCoordinates.ts";
import { useGetDailyCustomers } from "../Hooks/useGetDailyCustomers";
import { ExclamationCircleFilled } from "@ant-design/icons";
import moment from "moment";


const DashboardPage = () => {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("Never");
  const [lastNonErrorQueueData, setLastNonErrorQueueData] = useState<any>(null);
  const [lastNonErrorTodayData, setLastNonErrorTodayData] = useState<any>(null);


  const today = new Date();
  const todayDate = new Date().toISOString().split("T")[0];
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const {
    data: customerCountData,
    error: customerCountError,
    loading: customerCountLoading,
    refetch: refetchCustomerCount,
  } = useGetCustomerCount(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);

  const {
    data: todayData,
    loading: loadingToday,
    error: errorToday,
    refetch: refetchToday,
  } = useGetDailyCustomers(todayDate);

  const {
    data: queueData,
    loading: loadingQueue,
    error: errorQueue,
    refetch: refetchQueue,
  } = useGetQueueCount();

  const { data: coordinatesData, loading: loadingCoordinates } = useGetCoordinates();

  const queueDataMap: Record<number, { Threshold: number; Name: string }> =
    coordinatesData?.reduce((acc, { ID, Threshold, Name }) => {
      acc[ID] = { Threshold, Name };
      return acc;
    }, {} as Record<number, { Threshold: number; Name: string }>) || {};

  const queueCountsByROI =
    lastNonErrorQueueData && Array.isArray(lastNonErrorQueueData)
      ? lastNonErrorQueueData.reduce((acc, item) => {
          acc[item.ROI] = {
            NumberOfCustomers: item.NumberOfCustomers,
            Timestamp: item.Timestamp,
          };
          return acc;
        }, {} as Record<number, { NumberOfCustomers: number; Timestamp: Date }>)
      : {};

  useEffect(() => {
    const interval = setInterval(() => {
      refetchCustomerCount(monday.toISOString(), sunday.toISOString());
      refetchToday(todayDate);
      refetchQueue();
      setLastUpdated(moment().format("HH:mm:ss"));
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchCustomerCount, refetchQueue, monday, sunday]);

  useEffect(() => {
    if (queueData && !errorQueue) {
      setLastNonErrorQueueData(queueData);
    }
  }, [queueData, errorQueue]);

  useEffect(() => {
    if (todayData && !errorToday) {
      setLastNonErrorTodayData(todayData);
    }
  }, [todayData, errorToday]);
  

  useEffect(() => {
    if (customerCountData) {
      const processData = (data: any[]) => {
        const result = Array(7)
          .fill(0)
          .map((_, i) => ({
            day: moment(monday).add(i, "days").format("YYYY-MM-DD"),
            NumberOfCustomers: 0,  // Changed label to "NoCustomers"
          }));

        data.forEach((item) => {
          const date = moment(item.Timestamp).format("YYYY-MM-DD");
          const dayIndex = result.findIndex((d) => d.day === date);
          if (dayIndex !== -1) {
            result[dayIndex].NumberOfCustomers += item.EnteringCustomers || 0;
          }
        });

        return result;
      };

      setProcessedData(processData(customerCountData));

      const processHourlyData = (data: any[]) => {
        const result = Array(24)
          .fill(0)
          .map((_, i) => ({
            hour: `${i}:00`,
            NumberOfCustomers: 0,  // Changed label to "NoCustomers"
          }));
      
        // Filter data to include only today's entries
        data
          .filter((item) => moment(item.Timestamp).isSame(today, "day"))
          .forEach((item) => {
            let hour = moment(item.Timestamp).startOf("hour").hour();  // Normalize the timestamp to start of hour
      
            // Move the hour one back (shift left by 1 hour)
            hour = (hour - 1 + 24) % 24;  // Wrap around if hour is 0 (to handle midnight case)
            
            result[hour].NumberOfCustomers += item.EnteringCustomers || 0;  // Sum the customers
          });
      
        return result;
      };
      

      setHourlyData(processHourlyData(customerCountData.filter((item) => {
        return moment(item.Timestamp).isSame(today, "day");
      })));
    }
  }, [customerCountData, monday, sunday, today]);

  if (customerCountLoading || loadingToday || loadingQueue || loadingCoordinates) {
    return <Spin tip="Loading..." />;
  }

  if (customerCountError || errorToday || errorQueue) {
    return (
      <Alert
        message="Error"
        description={
          customerCountError?.message || errorQueue?.message || "An error occurred."
        }
        type="error"
        showIcon
      />
    );
  }

  const renderQueueCards = () => {
    return (
      <Row gutter={[16, 16]} style={{ width: "100%" }}>
        {Object.keys(queueCountsByROI).map((roi, index) => {
          const { Threshold, Name } = queueDataMap[+roi] || {
            Threshold: "-",
            Name: `Area ${index + 1}`,
          };
          const { NumberOfCustomers } = queueCountsByROI[+roi] || { NumberOfCustomers: "-" };
          const isOverThreshold = NumberOfCustomers >= Threshold;
  
          return (
            <Col
              key={roi}
              xs={24} 
              sm={24} 
              md={12} 
              lg={8} 
              xl={6} 
              xxl={6} 
            >
              <Card
                bordered={false}
                className={styles.dashboardCard}
                style={{
                  textAlign: "center",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* Area Title */}
                <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
                  {Name}
                  {isOverThreshold && (
                    <ExclamationCircleFilled
                      style={{ color: "red", fontSize: 20, marginLeft: 8 }}
                    />
                  )}
                </div>
  
                {/* Info Sections */}
                <Row gutter={[8, 8]} style={{ margin: "0" }}>
                  <Col span={12}>
                    <div
                      style={{
                        width: "100%",
                        height: "80px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #f0f0f0",
                        borderRadius: "4px",
                        padding: "8px",
                        background: "#fafafa",
                        boxSizing: "border-box",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "bold",
                          whiteSpace: "normal", // Allows text wrapping if necessary
                          wordBreak: "break-word", // Ensures text doesn't overflow
                        }}
                      >
                        Current queue:
                      </p>
                      <p style={{ margin: 0, fontSize: "18px" }}>{NumberOfCustomers}</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        width: "100%",
                        height: "80px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #f0f0f0",
                        borderRadius: "4px",
                        padding: "8px",
                        background: "#fafafa",
                        boxSizing: "border-box",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "bold",
                          whiteSpace: "normal", // Allows text wrapping if necessary
                          wordBreak: "break-word", // Ensures text doesn't overflow
                        }}
                      >
                        Queue threshold:
                      </p>
                      <p style={{ margin: 0, fontSize: "18px" }}>{Threshold}</p>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };
  

  return (
    <div className={styles.dashboardContainer}>
      <h1>Overview</h1>
      <DateTimeDisplay lastUpdated={lastUpdated} />
  
      {/* Wrapper Row for Queue Cards */}
      <Row gutter={[16, 16]} style={{ padding: "0 16px" }}>
        {renderQueueCards()}
      </Row>
  
      {/* Wrapper Row for Graphs */}
      <Row gutter={[16, 16]} style={{ padding: "16px" }}>
        {/* Left: No. customers per hour */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
              <Card bordered={false} className={styles["fixed-height-card"]}>
                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
                  Current customer count:
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {lastNonErrorTodayData
                    ? (lastNonErrorTodayData.totalEnteringCustomers ?? 0) -
                      (lastNonErrorTodayData.totalExitingCustomers ?? 0)
                    : "-"}
                </div>
              </Card>

              </Col>
              <Col span={12}>
              <Card bordered={false} className={styles["fixed-height-card"]}>
                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
                  No. of customers today:
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {hourlyData.reduce((total, hour) => total + hour.NumberOfCustomers, 0)}
                </div>
              </Card>

              </Col>
            </Row>
  
            <h3 style={{ textAlign: "center" }}>No. customers per hour</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="NumberOfCustomers" fill="#0088FE" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
  
        {/* Right: No. customers per day this week */}
        <Col span={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Card bordered={false} className={styles["fixed-height-card"]}>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
                No. of customers this week:
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {processedData.reduce((total, day) => total + day.NumberOfCustomers, 0)}
              </div>
            </Card>

  
            <h3 style={{ textAlign: "center" }}>No. customers per day this week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={(day) => moment(day).format("ddd")} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="NumberOfCustomers" fill="#0088FE" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
     
};

export default DashboardPage;
