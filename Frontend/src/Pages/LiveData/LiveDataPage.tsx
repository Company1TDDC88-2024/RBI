import React from "react";
import { Card, Row, Col, Spin } from "antd";
import styles from "./LiveDataPage.module.css";
import "../../global.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGetDailyCustomers } from "../Hooks/useGetDailyCustomers"; 
import { useGetQueueCount } from "../Hooks/useGetQueueCount";
import { addYears, setWeek, setDay, getWeek, getDay } from 'date-fns';

const LiveDataPage = () => {
    // Gets today's date and finds corresponding date (same week and weekday) from previous year.
    const todayDate = new Date().toISOString().split('T')[0]; // transforms Date into string
    const currentWeek = getWeek(todayDate);
    const currentDay = getDay(todayDate);
    const prevYear = addYears(todayDate, -1);
    const prevYearDate = setDay(setWeek(prevYear, currentWeek), currentDay).toISOString().split('T')[0];

    // Get data for today and last year
    const { data: todayData, loading: loadingToday } = useGetDailyCustomers(todayDate);
    const { data: lastYearData} = useGetDailyCustomers(prevYearDate);
    const { data: queueData, loading: loadingQueue } = useGetQueueCount();

    const queueCountsByROI = queueData && Array.isArray(queueData) 
        ? queueData.reduce((acc, item) => {
            // For each ROI, store the latest number of customers and timestamp in a map, ROI is the key.
            acc[item.ROI] = {
                NumberOfCustomers: item.NumberOfCustomers,
                Timestamp: item.Timestamp,  
            };
            return acc;
        }, {} as Record<number, { NumberOfCustomers: number; Timestamp: Date }>) 
        : {};

        const filteredQueueCounts = Object.keys(queueCountsByROI).reduce((acc, roi) => {
            const { NumberOfCustomers, Timestamp } = queueCountsByROI[roi];
            
            // Convert the Timestamp string to a Date object and get its time in milliseconds
            const timeStampInt = new Date(Timestamp).getTime();
            // Get the current time in milliseconds
            const now = Date.now();            
            // Check if the timestamp is within the desired range
            if (now - timeStampInt<= 259200000) { // Large threshold, should include all queues
                acc[roi] = { NumberOfCustomers, Timestamp: timeStampInt };
            }
            return acc;
        }, {} as Record<string, { NumberOfCustomers: number; Timestamp: number }>);
        
    

    const comparisonData = [
        { label: prevYearDate, total: lastYearData?.totalEnteringCustomers || 0 }, // Comparing data, last year with the same week and weekday
        { label: todayDate , total: todayData?.totalEnteringCustomers || 0 } // Today's data
    ];

    return (
        <div className={styles.LiveDataPageContainer}>
            <h1>Live Data</h1>
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
                            <Spin tip="Loading..."/>
                        ) : (
                            Object.keys(filteredQueueCounts).length > 0 ? (
                                Object.keys(filteredQueueCounts).map(roi => (
                                    <div key={roi} className={styles.queueCountText}>
                                        <p>Queue {roi}: {filteredQueueCounts[roi].NumberOfCustomers} customers</p>
                                    </div>
                                ))
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
