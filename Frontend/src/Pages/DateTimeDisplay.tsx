
// DateTimeDisplay.tsx

import React, { useEffect, useState } from 'react';
import moment from 'moment';

interface DateTimeDisplayProps {
    lastUpdated: string;
  }

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({ lastUpdated }) => {
    const [currentTime, setCurrentTime] = useState<string>(moment().format('HH:mm:ss'));
    const [currentDate, setCurrentDate] = useState<string>(moment().format('LL'));

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(moment().format('HH:mm:ss'));
            setCurrentDate(moment().format('LL'));
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1em 0' }}>
            <div>
                <span>Current Date: {currentDate}</span> | <span>{currentTime}</span>
            </div>
            <div>
                Last Updated: {lastUpdated || 'Never'}
            </div>
        </div>
    );
};

export default DateTimeDisplay;
