import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin } from "antd";
import styles from "./LiveDataPage.module.css";
import "../../global.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGetDailyCustomers } from "../Hooks/useGetDailyCustomers.ts"; 
import { useGetQueueCount } from "../Hooks/useGetCurrentQueues.ts";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { addYears, setWeek, setDay, getWeek, getDay } from 'date-fns';
import DateTimeDisplay from "../DateTimeDisplay.tsx";
import moment from "moment";

const LiveDataPage = () => {
    const [lastUpdated, setLastUpdated] = useState<string>('Never');
    // Gets today's date and finds corresponding date (same week and weekday) from previous year.
    const todayDate = new Date().toISOString().split('T')[0]; // transforms Date into string
    const currentWeek = getWeek(todayDate);
    const currentDay = getDay(todayDate);
    const prevYear = addYears(todayDate, -1);
    const prevYearDate = setDay(setWeek(prevYear, currentWeek), currentDay).toISOString().split('T')[0];

    // Get data for today and last year
    const { data: todayData, loading: loadingToday, refetch: refetchToday } = useGetDailyCustomers(todayDate);
    const { data: lastYearData, refetch: refetchLastYear } = useGetDailyCustomers(prevYearDate);
    const { data: queueData, loading: loadingQueue, refetch: refetchQueue } = useGetQueueCount();

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
    

    const queueCountsByROI = queueData && Array.isArray(queueData) 
        ? queueData.reduce((acc, item) => {
            // For each ROI, store the latest number of customers and timestamp in a map, ROI is the key.
            acc[item.ROI] = {
                NumberOfCustomers: item.NumberOfCustomers
            };
            return acc;
        }, {} as Record<number, { NumberOfCustomers: number;}>) 
        : {};

    const comparisonData = [
        { label: prevYearDate, total: lastYearData?.totalEnteringCustomers || 0 }, // Comparing data, last year with the same week and weekday
        { label: todayDate , total: todayData?.totalEnteringCustomers || 0 } // Today's data
    ];

    


    return (
        <div className={styles.LiveDataPageContainer}>
            <h1>Live Data</h1>
            <DateTimeDisplay lastUpdated={lastUpdated} />
            <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                    <Card title="Total Customers graph, today and last year" bordered={false} className={styles.liveDataCard}>
                        <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                            Total customers today: {loadingToday ? <Spin tip="Loading..."/> : todayData?.totalEnteringCustomers}
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
                                {loadingToday ? <Spin tip="Loading..."/> : (todayData?.totalEnteringCustomers ?? 0) - (todayData?.totalExitingCustomers ?? 0)}
                                {/* This should be TotalCustomers */}
                        </p>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={6}>
    <Card title="Customers in queue" bordered={false} className={styles.liveQueueCountCard}>
        {loadingQueue ? (
            <Spin tip="Loading..." />
        ) : (
            Object.keys(queueCountsByROI).length > 0 ? (
                Object.keys(queueCountsByROI).map(roi => {
                    console.log(`Threshold for ROI ${roi}:`, thresholds[roi]); // Log the threshold for debugging
                    return (
                        <div key={roi} className={styles.queueCountText} style={{ display: "flex", alignItems: "center" }}>
                            <p> 
                                Queue {roi}: {queueCountsByROI[roi].NumberOfCustomers} customers
                                <div style={{ fontWeight: "bold", fontSize: "0.9em", marginTop: "4px" }}>
                                    Threshold: {thresholds[roi]}
                                </div>
                            </p>
                            {queueCountsByROI[roi].NumberOfCustomers >= thresholds[roi] && (
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
