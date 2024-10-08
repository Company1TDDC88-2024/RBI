
// DateTimeDisplay.tsx

import React, { useEffect, useState } from 'react';
import moment from 'moment';

const DateTimeDisplay: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>(moment().format('LTS'));
    const [currentDate, setCurrentDate] = useState<string>(moment().format('LL'));
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(moment().format('LTS'));
            setCurrentDate(moment().format('LL'));
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const updateLastUpdated = () => {
        setLastUpdated(moment().format('LTS'));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1em 0' }}>
            <div>
                <span>Current Date: {currentDate}</span> | <span>Current Time: {currentTime}</span>
            </div>
            <div>
                Last Updated: {lastUpdated || 'Never'}
                <button onClick={updateLastUpdated} style={{ marginLeft: '1em' }}>
                    Update Time
                </button>
            </div>
        </div>
    );
};

export default DateTimeDisplay;
