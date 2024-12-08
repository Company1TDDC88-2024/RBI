import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Spin, Alert, DatePicker, Select } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetCustomerCount } from "../Hooks/useGetCustomerCount";
import { useGetQueueCount } from "../Hooks/useGetQueueCount";
import { useGetDailyCustomers } from '../Hooks/useGetDailyCustomers';
import { useGetExpectedCustomerCount } from '../Hooks/useGetExpectedCustomerCount';
import { useGetMonthlyAverageCustomerCount } from '../Hooks/useGetMonthlyAverageCustomerCount';
import styles from "./HistoryPage.module.css";
import DateTimeDisplay from '../DateTimeDisplay';
import moment from 'moment';
import { useGetCoordinates } from "../Hooks/useGetCoordinates";

const { RangePicker } = DatePicker;
const { Option } = Select;

const HistoryPage = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const todaysDate = new Date();  // Get today's date
  todaysDate.setFullYear(todaysDate.getFullYear() - 1); // Adjust the year to last year
  const selectedDate = todaysDate.toISOString().split("T")[0];

  const [dates, setDates] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(2); // Set to the first day of the month
    startDate.setMonth(startDate.getMonth() - 2); // Set to last 3 months
    return [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]];
  });
  
  const [frequency, setFrequency] = useState(() => {
    // Default to '1month' if no frequency is set
    if (!localStorage.getItem('frequency')) {
      return '1month'; // Automatically set frequency to '1month' when dates are for 12 months
    } else {
      return localStorage.getItem('frequency') || '1month'; // Fallback to '1day' if not set
    }
  });

  const [selectedWeekday, setSelectedWeekday] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [processedQueueData, setProcessedQueueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Never');
  const [rangePickerValue, setRangePickerValue] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(2);
    startDate.setMonth(startDate.getMonth() - 2);
    setDates([startDate.toISOString().split("T")[0], endDate]);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('dates', JSON.stringify(dates));
  }, [dates]);

  const { data: customerCountData, error: customerCountError, loading: customerCountLoading, refetch: refetchCustomerCount } = useGetCustomerCount(dates[0], dates[1]);
  const { data: dailyCustomerData, error: dailyCustomerError, loading: dailyCustomerLoading, refetch: refetchDailyCustomer } = useGetDailyCustomers(currentDate);
  const { data: cameraQueueData, error: cameraQueueDataError, loading: cameraQueueDataLoading, refetch: refetchCameraQueueData } = useGetQueueCount();
  const { data: monthlyAverageData, loading: monthlyAverageLoading, error: monthlyAverageError } = useGetMonthlyAverageCustomerCount(6);
  const { data: expectedCustomerCountData, error: expectedCustomerCountError, loading: expectedCustomerCountLoading } = useGetExpectedCustomerCount(selectedDate);
  const { data: coordinatesData, loading: loadingCoordinates } = useGetCoordinates();

  const queueDataMap: Record<number, { Name: string }> =
    coordinatesData?.reduce((acc, { ID, Name }) => {
      acc[ID] = { Name };
      return acc;
    }, {} as Record<number, { Name: string }>) || {};

  const graphColors = ['#8884d8', '#B77F2A', '#2C6B46', '#8B2C3C'];

  console.log("queueDataMap", queueDataMap);

  console.log("CAMERA QUEUE DATA", cameraQueueData);
  // Combined error state
  const combinedError = customerCountError || cameraQueueDataError || dailyCustomerError || expectedCustomerCountError || monthlyAverageError;

  // useEffect to handle combined errors
  useEffect(() => {
    if (combinedError) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [combinedError]);

  useEffect(() => {
    const interval = setInterval(() => {
        refetchCustomerCount(dates[0], dates[1]);
        refetchDailyCustomer(currentDate);
        refetchCameraQueueData();
        setLastUpdated(moment().format('HH:mm:ss'));
    }, 30000); // 30 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
}, [refetchCustomerCount, refetchDailyCustomer, refetchCameraQueueData, dates, currentDate]);

  useEffect(() => {
    if (customerCountData || dailyCustomerData || cameraQueueData) {
      setLastUpdated(moment().format('HH:mm:ss'));
    }
  }, [customerCountData, dailyCustomerData, cameraQueueData]);

  const onDateChange = (dates, dateStrings) => {
  // Check if the dates are cleared (both start and end dates are null)
  if (!dates || !dates[0] || !dates[1]) {
    // Reset to the default date range (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12); // 12 months ago

    // Set dates back to the default range and frequency to '1month'
    setDates([startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]);
    setFrequency('1month');
  } else {
    // Otherwise, update the selected dates
    setDates(dateStrings);
  }
};

  // Process data to aggregate based on frequency within the selected date range
  const processData = (customerCountData, frequency, dates, selectedWeekday) => {
    const result = {};
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);

    // Set endDate to 23:59:59 to include the entire end date
    endDate.setHours(23, 59, 59, 999);

    // Filter data based on the selected date range
    const filteredData = customerCountData.filter(item => {
        const timestamp = new Date(item.Timestamp);
        return timestamp >= startDate && timestamp <= endDate;
    });

    filteredData.forEach(item => {
        const timestamp = new Date(item.Timestamp);
        let key;

        // Group data based on selected frequency
        if (frequency === '1hour') {
            key = moment(timestamp).format('YYYY-MM-DD HH:00'); // Group by hour
        } else if (frequency === '1day') {
            if (selectedWeekday !== null && timestamp.getDay() !== selectedWeekday) return;
            key = moment(timestamp).format('YYYY-MM-DD'); // Group by day
        } else if (frequency === '1week') {
            key = moment(timestamp).format('YYYY-[W]WW'); // Group by week
        } else if (frequency === '1month') {
            key = moment(timestamp).format('YYYY-MM'); // Group by month
        }

        // Initialize the key if it doesn't exist
        if (!result[key]) {
            result[key] = { Timestamp: key, EnteringCustomers: 0 };
        }

        // Aggregate EnteringCustomers by the formatted key
        result[key].EnteringCustomers += item.EnteringCustomers;
    });

    // Return the results sorted by timestamp
    return Object.values(result).sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
  };

  const processQueueData = (cameraQueueData, frequency, dates, selectedWeekday, threshold = 1) => {
    const result = {};
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);
  
    // Set endDate to 23:59:59 to include the entire end date, before it would be 00:00:00 and not show up
    endDate.setHours(23, 59, 59, 999);
  
    cameraQueueData.forEach(item => {
      const timestamp = new Date(item.Timestamp);
  
      // Filter data within the selected date range
      if (timestamp >= startDate && timestamp <= endDate) {
        // Skip items that do not meet the ROI criteria or have customers below the threshold
        if (![1, 4, 5, 6].includes(item.ROI) || item.NumberOfCustomers < threshold) return;
        if (selectedWeekday !== null && timestamp.getDay() !== selectedWeekday) return;
  
        let key;
  
        // Format the timestamp based on the frequency
        if (frequency === '1hour') {
          key = moment(timestamp).format('YYYY-MM-DD HH:00'); // Group by hour
        } else if (frequency === '1day') {
          key = moment(timestamp).format('YYYY-MM-DD'); // Group by day
        } else if (frequency === '1week') {
          key = moment(timestamp).format('YYYY-[W]WW'); // Group by week
        } else if (frequency === '1month') {
          key = moment(timestamp).format('YYYY-MM'); // Group by month
        }
  
        if (!result[key]) {
          result[key] = { Timestamp: key, ROI_1: 0, ROI_4: 0, ROI_5: 0, ROI_6: 0 };
        }
  
        // Increment the count for the specific ROI
        result[key][`ROI_${item.ROI}`] += 1;
      }
    });
  
    const groupedData = Object.values(result);
  
    // If monthly, ensure we limit the data to the last month(s) in the range
    return frequency === '1month' ? groupedData : groupedData;
  };
  
  const getTitle = (baseTitle) => {
    if (frequency === '1hour') return `${baseTitle} per hour`;
    if (frequency === '1day') return `${baseTitle} per day`;
    if (frequency === '1week') return `${baseTitle} per week`;
    if (frequency === '1month') return `${baseTitle} per month`;
    return baseTitle;
  };

  useEffect(() => {
    if (customerCountData) {
      setProcessedData(processData(customerCountData, frequency, dates, selectedWeekday));
    }
  }, [customerCountData, frequency, dates, selectedWeekday]);

  useEffect(() => {
    if (cameraQueueData) {
      setProcessedQueueData(processQueueData(cameraQueueData, frequency, dates, selectedWeekday));
    }
  }, [cameraQueueData, frequency, dates, selectedWeekday]);
  

  if (cameraQueueDataLoading || dailyCustomerLoading || customerCountLoading||expectedCustomerCountLoading) {
    return <Spin tip="Loading..." />;
  }

  const error = customerCountError || cameraQueueDataError || dailyCustomerError||expectedCustomerCountError;
  if (error) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Historical Data</h1>
      <DateTimeDisplay lastUpdated={lastUpdated} />

      {showError && (
        <Alert
          message="Error"
          description={
            combinedError?.message || "An error occurred while fetching data."
          }
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      <Row gutter={16} align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <RangePicker 
            onChange={(dates, dateStrings) => {
              onDateChange(dates, dateStrings);
              setRangePickerValue(dates);
            }}
            value={rangePickerValue}
          />
        </Col>
        <Col>
        <Button 
            onClick={() => {
              setFrequency('1hour');
              setSelectedWeekday(null);
            }} 
            type={frequency === '1hour' ? 'primary' : 'default'}
            style={{ marginRight: '10px' }}
          >
            Per Hour
          </Button>
          <Button 
            onClick={() => {
              setFrequency('1day');
              setSelectedWeekday(null);
            }}
            type={frequency === '1day' ? 'primary' : 'default'}
            style={{ marginRight: '10px' }}
          >
            Per Day
          </Button>
          <Button 
            onClick={() => {
              setFrequency('1week');
              setSelectedWeekday(null);
            }}
            type={frequency === '1week' ? 'primary' : 'default'}
            style={{ marginRight: '10px' }}
          >
            Per Week
          </Button>
          <Button 
            onClick={() => {
              setFrequency('1month');
              setSelectedWeekday(null);
            }} 
            type={frequency === '1month' ? 'primary' : 'default'}
          >
            Per Month
          </Button>
        </Col>
        <Col>
          <Select
            disabled={frequency !== '1day'}
            placeholder="Select weekday"
            onChange={value => setSelectedWeekday(value)}
            value={selectedWeekday}
            style={{ width: 145 }}
          >
            <Option value={1}>Monday</Option>
            <Option value={2}>Tuesday</Option>
            <Option value={3}>Wednesday</Option>
            <Option value={4}>Thursday</Option>
            <Option value={5}>Friday</Option>
            <Option value={6}>Saturday</Option>
            <Option value={0}>Sunday</Option>
          </Select>
        </Col>
        <Col>
        <Button 
          onClick={() => {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            const startDate = new Date();
            startDate.setDate(2); // Set to the first day of the month
            startDate.setMonth(startDate.getMonth() - 2); // Set to last 3 months
            setDates([startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]);
            setFrequency('1month');
            setSelectedWeekday(null);
            setRangePickerValue(null); // Reset RangePicker value
          }}
        >
          Reset Filters
        </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title={getTitle("Number of customers")} bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            {customerCountLoading ? (
              <Spin tip="Loading..." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tickFormatter={timestamp => {
                      if (frequency === '1hour') return moment(timestamp).format('HH:00, DD MMM');
                      if (frequency === '1day') return moment(timestamp).format('DD MMM');
                      if (frequency === '1week') return `Week ${moment(timestamp).week()}`;
                      return moment(timestamp).format('MMM YYYY');
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="EnteringCustomers" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Total number of customers" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title={getTitle("Number of queue alerts")} bordered={false} className={styles.dashboardCard} style={{ marginBottom: '15px' }}>
            {cameraQueueDataLoading ? (
              <Spin tip="Loading..." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedQueueData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tickFormatter={timestamp => {
                      if (frequency === '1hour') return moment(timestamp).format('HH:00, DD MMM');
                      if (frequency === '1day') return moment(timestamp).format('DD MMM');
                      if (frequency === '1week') return `Week ${moment(timestamp).week()}`;
                      return moment(timestamp).format('MMM YYYY');
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.entries(queueDataMap).map(([id, { Name }], index) => (
                    <Line 
                      key={id}
                      type="monotone" 
                      dataKey={`ROI_${id}`} 
                      stroke={graphColors[index]}
                      activeDot={{ r: 8 }} 
                      name={Name} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            title="Average number of daily customers last 6 months"
            bordered={false}
            className={styles.dashboardCard}
          >
            {monthlyAverageLoading ? (
              <Spin tip="Loading..." />
            ) : monthlyAverageData && monthlyAverageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyAverageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(month) => moment(month, "YYYY-MM").format("MMM YYYY")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => moment(label, "YYYY-MM").format("MMMM YYYY")}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageCustomers"
                    stroke="#82ca9d"
                    name="Avg Customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div>No data available for the last 6 months</div>
            )}
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default HistoryPage;