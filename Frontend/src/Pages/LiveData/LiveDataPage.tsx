import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Alert } from "antd";
import styles from "./LiveDataPage.module.css";
import "../../global.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGetDailyCustomers } from "../Hooks/useGetDailyCustomers.ts"; 
import { useGetQueueCount } from "../Hooks/useGetCurrentQueues.ts";
import { useGetCoordinates } from "../Hooks/useGetCoordinates.ts";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { addYears, setWeek, setDay, getWeek, getDay } from 'date-fns';
import DateTimeDisplay from "../DateTimeDisplay.tsx";
import moment from "moment";


const LiveDataPage = () => {
    const [lastUpdated, setLastUpdated] = useState<string>('Never');
    const [lastNonErrorTodayData, setLastNonErrorTodayData] = useState<any>(null);
    const [lastNonErrorLastYearData, setLastNonErrorLastYearData] = useState<any>(null);
    const [lastNonErrorQueueData, setLastNonErrorQueueData] = useState<any>(null);
    const [showError, setShowError] = useState<boolean>(false);

    // Gets today's date and finds corresponding date (same week and weekday) from previous year.
    const todayDate = new Date().toISOString().split('T')[0]; // transforms Date into string
    const currentWeek = getWeek(todayDate);
    const currentDay = getDay(todayDate);
    const prevYear = addYears(todayDate, -1);
    const prevYearDate = setDay(setWeek(prevYear, currentWeek), currentDay).toISOString().split('T')[0];

    // Get data for today and last year
    const { data: todayData, loading: loadingToday, error: errorToday, refetch: refetchToday } = useGetDailyCustomers(todayDate);
    const { data: lastYearData, error: errorLastYear, refetch: refetchLastYear } = useGetDailyCustomers(prevYearDate);
    const { data: queueData, loading: loadingQueue, error: errorQueue, refetch: refetchQueue } = useGetQueueCount();
    const { data: coordinatesData, loading: loadingCoordinates } = useGetCoordinates();

    const queueDataMap: Record<number, { Threshold: number; Name: string }> =
    coordinatesData?.reduce((acc, { ID, Threshold, Name }) => {
        acc[ID] = { Threshold, Name }; 
        return acc;
    }, {} as Record<number, { Threshold: number; Name: string }>) || {};




    useEffect(() => {
        const interval = setInterval(() => {
            refetchToday(todayDate);
            refetchLastYear(prevYearDate);
            refetchQueue();
            setLastUpdated(moment().format('HH:mm:ss'));
            console.log('Data refetched');
        }, 30000); // 30 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [refetchToday, refetchLastYear, refetchQueue, todayDate, prevYearDate]);

    // Update the last updated time when the data changes
    useEffect(() => {
        if (todayData || lastYearData || queueData) {
            setLastUpdated(moment().format('HH:mm:ss'));

        }
    }, [todayData, lastYearData, queueData]);

    // Update last non-error data when data is successfully fetched
    useEffect(() => {
        if (todayData && !errorToday) {
            setLastNonErrorTodayData(todayData);
        }
        if (lastYearData && !errorLastYear) {
            setLastNonErrorLastYearData(lastYearData);
        }
        if (queueData && !errorQueue) {
            setLastNonErrorQueueData(queueData);
        }
        if (!errorToday && !errorLastYear && !errorQueue) {
            setShowError(false); // Close the error alert if all data fetching operations succeed
        }
    }, [todayData, lastYearData, queueData, errorToday, errorLastYear, errorQueue]);

    // Combine error states
    const error = errorToday || errorLastYear || errorQueue;

    // Show error popup if an error occurs
    useEffect(() => {

        if (error) {
            setShowError(true);
        } else {
            setShowError(false);
        }
   
    }, [error]);

    useEffect(() => {
        if (error) {
            setShowError(true);
            console.log("Error occurred:", error);
        }
    }, [error]);

    if (loadingToday || loadingQueue) {
        return <Spin tip="Loading..." />;
    }

    const queueCountsByROI = lastNonErrorQueueData && Array.isArray(lastNonErrorQueueData) 
        ? lastNonErrorQueueData.reduce((acc, item) => {
            // For each ROI, store the latest number of customers and timestamp in a map, ROI is the key.
            acc[item.ROI] = {
                NumberOfCustomers: item.NumberOfCustomers,
                Timestamp: item.Timestamp,  
            };
            return acc;
        }, {} as Record<number, { NumberOfCustomers: number; Timestamp: Date }>) 
        : {};



    

    const comparisonData = [
        { label: prevYearDate, total: lastNonErrorLastYearData?.totalEnteringCustomers || 0 }, // Comparing data, last year with the same week and weekday
        { label: todayDate , total: lastNonErrorTodayData?.totalEnteringCustomers || 0 } // Today's data
    ];

    return (
        <div className={styles.LiveDataPageContainer}>
            <h1>Live Data</h1>
            <DateTimeDisplay lastUpdated={lastUpdated} />
            {showError && (
                <Alert
                    message="Error"
                    description="An error occurred while fetching data. Displaying last available data."
                    type="error"
                    showIcon
                />
            )}
            <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                    <Card title="Total Customers graph, today and last year" bordered={false} className={styles.liveDataCard}>
                        <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                            Total customers today: {loadingToday ? <Spin tip="Loading..."/> : lastNonErrorTodayData?.totalEnteringCustomers}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#8884d8" fillOpacity={1} name=" Total Customer Count"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                
                <Col span={6}>
                    <Card title="Customers in store" bordered={false} className={styles.liveCustomerCountCard}>
                        <ResponsiveContainer>
                        <p className={styles.customerCountText}>
                                {loadingToday ? <Spin tip="Loading..."/> : (lastNonErrorTodayData?.totalEnteringCustomers ?? 0) - (lastNonErrorTodayData?.totalExitingCustomers ?? 0)}
                                {/* This should be TotalCustomers */}
                        </p>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card title="Customers in queue" bordered={false} className={styles.liveQueueCountCard}>
                        {loadingQueue || loadingCoordinates ? (
                            <Spin tip="Loading..." />
                        ) : (
                            Object.keys(queueCountsByROI).length > 0 ? (
                                Object.keys(queueCountsByROI).map(roi => {
                                    const { Threshold, Name } = queueDataMap[+roi]; // Get threshold and name from the map
                                    return (
                                        <div key={roi} className={styles.queueCountText} style={{ display: "flex", alignItems: "center" }}>
                                            <p> 
                                                {Name}: {queueCountsByROI[+roi].NumberOfCustomers} customers
                                                <div style={{ fontWeight: "bold", fontSize: "0.9em", marginTop: "4px" }}>
                                                    Threshold: {Threshold}
                                                </div>
                                            </p>
                                            {queueCountsByROI[+roi].NumberOfCustomers > Threshold && (
                                                <ExclamationCircleFilled style={{ color: "red", marginLeft: 8, fontSize: 24 }} />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className={styles.queueCountText}>No queues in store</p>
                            )
                        )}
                    </Card>
                </Col>

            </Row>
        </div>
    );
};

export default LiveDataPage;
