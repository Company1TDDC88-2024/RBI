import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Alert, notification } from "antd"; // Removed Modal and added notification
import {
  BarChart,
  ComposedChart,
  Line, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";  
import styles from "./DashboardPage.module.css";
import DateTimeDisplay from "../DateTimeDisplay.tsx";
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetCurrentQueues.ts";
import { useGetCoordinates } from "../Hooks/useGetCoordinates.ts";
import { useGetDailyCustomers } from "../Hooks/useGetDailyCustomers";
import { useGetEnteringCustomersWithinTimeframe } from "../Hooks/useGetCustomersWithinTimestamp.ts";
import { useSettings } from "../Settings/InfluxSettingsContext.tsx";
import { ExclamationCircleFilled, ExclamationCircleOutlined, FilterFilled } from "@ant-design/icons";
import moment from "moment";

//Test

const DashboardPage = () => {
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("Never");
  const [lastNonErrorQueueData, setLastNonErrorQueueData] = useState<any>(null);
  const [lastNonErrorTodayData, setLastNonErrorTodayData] = useState<any>(null);
  const [lastNonErrorCustomerCountData, setLastNonErrorCustomerCountData] = useState<any>(null);
  const [enteringCustomers, setEnteringCustomers] = useState<number>(0);
  const [fetchingError, setFetchingError] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false); // Added state for error handling
  const { influxTimeframe, influxThreshold } = useSettings();
  const { enteringCustomerDuringTimeframe: enteringCustomerData, error, refetchEnteringCustomers } = useGetEnteringCustomersWithinTimeframe(influxTimeframe);

  const [today] = useState(new Date());
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [monday] = useState(() => {
    const date = new Date(today);
    date.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [sunday] = useState(() => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + 6);
    date.setHours(23, 59, 59, 999);
    return date;
  });

  const {
    data: customerCountData,
    error: customerCountError,
    loading: customerCountLoading,
    refetch: refetchCustomerCount,
  } = useGetCustomerCount(monday.toISOString().split("T")[0], sunday.toISOString().split("T")[0]);

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
      refetchCustomerCount(monday.toISOString().split('T')[0], sunday.toISOString().split('T')[0]);
      refetchToday(todayDate);
      refetchQueue();
      refetchEnteringCustomers();
      setLastUpdated(moment().format("HH:mm:ss"));
      
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchCustomerCount, refetchQueue, monday, sunday, todayDate, refetchToday, refetchEnteringCustomers]);

  const fetchAndSetEnteringCustomers = async () => {
    try {
      const enteringCustomers = await refetchEnteringCustomers(); // Fetch data from the hook
      setEnteringCustomers(enteringCustomers); // Update local state

    } catch (err) {
      console.error("Error fetching entering customers:", err);
      setFetchingError("Failed to fetch entering customers.");
    }
  };

  type HourlyData = {
    hour: string;
    HistoricalNumberOfCustomers: number;
  };
  
  const [hourlyAverageData, setHourlyAverageData] = useState<HourlyData[]>([]);

  const fiveWeeksAgo = new Date(today);
  fiveWeeksAgo.setDate(today.getDate() - 27); // Subtract 35 days for 5 weeks ago
  fiveWeeksAgo.setHours(0, 0, 0, 0);

  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 6); // Subtract 7 to get last week
  lastWeek.setHours(0, 0, 0, 0);

  const {
    data: historicalData,
    error: historicalDataError,
    loading: historicalDataLoading,
    refetch: refetchHistoricalData,
  } = useGetCustomerCount(
    fiveWeeksAgo.toISOString().split("T")[0],  // Convert Monday 5 weeks ago to string
    lastWeek.toISOString().split("T")[0]  // Convert Sunday last week to string
  ); 

  // This useEffect will process the data for tomorrow and calculate the hourly average
  useEffect(() => {
    if (historicalData) {
      const todayWeekday = (moment(today).day() + 1) % 7; // Get today's weekday
  
      const filteredHistoricalData = historicalData.filter((item) => {
        const itemWeekday = moment(item.Timestamp).day();
        return itemWeekday === todayWeekday; // Compare weekdays
      });
  
      const uniqueDays = new Set(
        filteredHistoricalData.map((item) => moment(item.Timestamp).format("YYYY-MM-DD"))
      );
      const uniqueDaysCount = uniqueDays.size;
  
      const processHistoricalHourlyData = (data: any[]) => {
        const result = Array(24).fill(0).map((_, i) => ({
          hour: `${i}:00`,
          HistoricalNumberOfCustomers: 0,
        }));
  
        // Group data by hour, collecting the first and last `TotalCustomers` for each hour
        const groupedData = data.reduce((acc, item) => {
          const hour = moment(item.Timestamp).startOf("hour").hour();
          if (!acc[hour]) {
            acc[hour] = { first: item, last: item }; // Initialize with the first item for the hour
          } else {
            // Update last item in the hour if the timestamp is later
            if (moment(item.Timestamp).isAfter(acc[hour].last.Timestamp)) {
              acc[hour].last = item;
            }
          }
          return acc;
        }, {});
  
        // Process the grouped data for each hour
        Object.entries(groupedData).forEach(([hour, { first, last }]) => {
          const hourIndex = parseInt(hour, 10);
  
          // Calculate the average of the first and last TotalCustomers
          const averageCustomers = (first.TotalCustomers + last.TotalCustomers) / 2;
  
          // Add the calculated average to HistoricalNumberOfCustomers for this hour
          result[hourIndex].HistoricalNumberOfCustomers += averageCustomers;
  
          // Log the first, last, and average TotalCustomers for the hour
        
        });
  
        // Divide by the number of unique days and round up as needed
        return result.map((item) => ({
          ...item,
          HistoricalNumberOfCustomers:
            item.HistoricalNumberOfCustomers / uniqueDaysCount >= 0.5
              ? Math.ceil(item.HistoricalNumberOfCustomers / uniqueDaysCount) // Round up
              : Math.floor(item.HistoricalNumberOfCustomers / uniqueDaysCount), // Round down
        }));
      };
  
      const hourlyData = processHistoricalHourlyData(filteredHistoricalData);
      setHourlyAverageData(hourlyData);
    }
  }, [historicalData, today]);
    
  // Automatically fetch entering customers on component mount or when timeframe changes
  useEffect(() => {
    fetchAndSetEnteringCustomers();
  }, [influxTimeframe]);

  useEffect(() => {
    if (enteringCustomers >= influxThreshold) {
      
      notification.warning({
        message: "Threshold Exceeded",
        description: `The number of entering customers (${enteringCustomers}) has exceeded the defined threshold of ${influxThreshold}.`,
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        placement: "topRight",
        duration: 5, // Duration in seconds
      });
    }
  }, [enteringCustomers, influxThreshold]);

  useEffect(() => {
    if (customerCountData || todayData || queueData) {
      setLastUpdated(moment().format('HH:mm:ss'));
    }
  }, [customerCountData, todayData, queueData]);

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
    if (customerCountData && !customerCountError) {
      setLastNonErrorCustomerCountData(customerCountData);
    }
  }, [customerCountData, customerCountError]);

  useEffect(() => {
    if (customerCountData) {
      const processData = (data: any[]) => {
        const result = Array(7)
          .fill(0)
          .map((_, i) => ({
            day: moment(monday).add(i, "days").format("YYYY-MM-DD"),
            NumberOfCustomers: 0,
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
            NumberOfCustomers: 0,  
          }));
      
        data
          .filter((item) => moment(item.Timestamp).isSame(today, "day"))
          .forEach((item) => {
            let hour = moment(item.Timestamp).startOf("hour").hour();  
      
            result[hour].NumberOfCustomers += item.EnteringCustomers || 0;
          });
      
        return result;
      };

      setHourlyData(processHourlyData(customerCountData.filter((item) => {
        return moment(item.Timestamp).isSame(today, "day");
      })));
    }
  }, [customerCountData, monday, sunday, today]);

  // Combined error state
  const combinedError = customerCountError || errorToday || errorQueue || historicalDataError;

  // useEffect to handle combined errors
  useEffect(() => {
    if (combinedError) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [combinedError]);

  if (customerCountLoading || loadingToday || loadingQueue || loadingCoordinates || historicalDataLoading) {
    return <Spin tip="Loading..." />;
  }

  const renderQueueCards = () => {
    return (
      <Row gutter={[16, 16]} style={{ width: "100%", margin: 0 }}>
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
                          whiteSpace: "normal",
                          wordBreak: "break-word",
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
                          whiteSpace: "normal",
                          wordBreak: "break-word",
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

      {/* Error Alert */}
      {showError && (
        <Alert
          message="Error"
          description={
            customerCountError?.message || errorToday?.message || errorQueue?.message || historicalDataError?.message || "An error occurred while fetching data. Displaying last available data"
          }
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      {/* Wrapper Row for Queue Cards */}
      <Row gutter={[16, 16]} style={{ padding: "0 16px", margin: 0 }}>
        {renderQueueCards()}
      </Row>

      {/* Wrapper Row for Graphs */}
      <Row gutter={[16, 16]} style={{ padding: "16px", margin: 0 }}>
        {/* Left: No. customers per hour */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
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
              <Col xs={24} md={12}>
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
              <ComposedChart
                data={hourlyData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis domain={[0, Math.max(
                  ...hourlyData.map(d => d.NumberOfCustomers),
                  ...hourlyAverageData.map(d => d.HistoricalNumberOfCustomers)
                )]} />
                <Tooltip />
                <Legend />
                
                {/* Bar for NumberOfCustomers */}
                <Bar 
                  dataKey="NumberOfCustomers" 
                  fill="#0088FE" 
                  barSize={30} 
                  name="Number of customers"
                />
                
                {/* Dotted Line for HistoricalNumberOfCustomers with pastel red stroke */}
                <Line
                  type="monotone"
                  data={hourlyAverageData}
                  dataKey="HistoricalNumberOfCustomers"
                  stroke="#FF6F61"  // Pastel red stroke color
                  strokeWidth={3}
                  dot={false}  // Disable the dots on the line
                  strokeDasharray="5 5"  // Make the line dotted
                  name="4-week average for this weekday"
                />
              </ComposedChart>
            </ResponsiveContainer>

          </Card>
        </Col>

        {/* Right: No. customers per day this week */}
        <Col xs={24} md={12}>
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
                <Bar 
                  dataKey="NumberOfCustomers" 
                  fill="#0088FE" 
                  barSize={30}
                  name="Number of customers" 
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
      </Row>
    </div>
  );
};

export default DashboardPage;