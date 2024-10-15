import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Spin, Alert, Table, DatePicker } from "antd";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useGetCustomerCount } from "./Hooks/useGetCustomerCount";
import { useGetQueueCount } from "./Hooks/useGetQueueCount"; // Import the Queue Count hook
import { useGetDailyCustomers } from "./Hooks/useGetDailyCustomers"; // Import the Daily Customers hook
import styles from "./DashboardPage.module.css";
import DateTimeDisplay from "./DateTimeDisplay"; // Adjust the path if necessary

const { RangePicker } = DatePicker;

const formatTimestamp = (
    timestamp: string,
    frequency: "10min" | "1hour" | "1day"
) => {
    if (frequency === "1day") {
        return moment(timestamp).format("YYYY-MM-DD"); // Display only the date
    } else {
        return moment(timestamp).format("HH:mm"); // Display hours and minutes
    }
};

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
        console.log(dates);
        setDates(dateStrings);
    };

    if (loading) {
        return <Spin tip="Loading..." />;
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error.message}
                type="error"
                showIcon
            />
        );
    }

    const columns = [
        {
            title: "Timestamp",
            dataIndex: "Timestamp",
            key: "timestamp",
        },
        {
            title: "Total Customers",
            dataIndex: "TotalCustomers",
            key: "totalCustomers",
        },
    ];

    console.log(data);

    return (
        <div className={styles.dashboardContainer}>
            <h1>Dashboard</h1>
            <DateTimeDisplay />
            <RangePicker onChange={onDateChange} />
            <Row gutter={16}>
                <Col span={12}>
                    <Card
                        title="Customer Count Data"
                        bordered={false}
                        className={styles.dashboardCard}
                        style={{ marginBottom: "15px" }}
                    >
                        <Table
                            dataSource={data || []}
                            columns={columns}
                            rowKey="Timestamp"
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card
                        title="Customer Count Over Time"
                        bordered={false}
                        className={styles.dashboardCard}
                        style={{ marginBottom: "15px" }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="TotalCustomers"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Card
                        title="Screen 3"
                        bordered={false}
                        className={styles.dashboardCard}
                        style={{ marginBottom: "15px" }}
                    >
                        Screen content
                    </Card>
                </Col>
                <Col span={12}>
                    <Card
                        title="Screen 4"
                        bordered={false}
                        className={styles.dashboardCard}
                        style={{ marginBottom: "15px" }}
                    >
                        Screen content
                    </Card>
                </Col>
            </Row>
            <p>
                Click <Link to="/test">here</Link> to get a message from the
                backend
            </p>
        </div>
    );
};

export default DashboardPage;
