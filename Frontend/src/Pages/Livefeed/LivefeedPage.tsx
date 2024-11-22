import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'antd';
import CameraFeed from '../../Components/CameraFeed/CameraFeed';
import styles from './LivefeedPage.module.css';
import DateTimeDisplay from '../DateTimeDisplay';
import moment from 'moment';

const LivefeedPage: React.FC = () => {  
  const [camera1Available, setCamera1Available] = useState<boolean>(true);   // State to track camera availability, not really working as expected
  const [camera2Available, setCamera2Available] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Never');

  // Update the last updated time when the data changes
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (camera1Available || camera2Available) {
        interval = setInterval(() => {
            setLastUpdated(moment().format('HH:mm:ss'));
        }, 1000); // Update every second
    } else {
        setLastUpdated('Offline');
    }

    return () => {
        if (interval) {
            clearInterval(interval);
        }
    };
}, [camera1Available, camera2Available]);

  return (    // Render the live feed page, the two cameras are hardcoded in the CameraFeed component. Not the best way to do it, but it works for this application
    <div className={styles.pageContainer}>
      <h1>Live feed from the store</h1>
      <DateTimeDisplay lastUpdated={lastUpdated} />
      <Row gutter={16}>
        {/* First camera */}
        <Col span={12}>
          <Card title="Camera 1" bordered={false} className={styles.livefeedCard}>
            {camera1Available ? (
              <CameraFeed
                //cameraUrl="http://192.168.1.162/axis-cgi/mjpg/video.cgi"
                cameraUrl='http://localhost:4000/camera_feed_1'
                width="100%"
                height="auto"
                onCameraError={() => setCamera1Available(false)}  // Set camera unavailable on error
                onCameraSuccess={() => setCamera1Available(true)}  // Set camera available on success
              />
            ) : (
              <p>Camera 1 Unavailable</p>  // Fallback message if camera 1 is unavailable
            )}
          </Card>
        </Col>

        {/* Second camera */}
        <Col span={12}>
          <Card title="Camera 2" bordered={false} className={styles.livefeedCard}>
            {camera2Available ? (
              <CameraFeed
                //cameraUrl="http://192.168.1.156/axis-cgi/mjpg/video.cgi"
                cameraUrl='http://localhost:4000/camera_feed_2'
                width="100%"
                height="auto"
                onCameraError={() => setCamera2Available(false)}  // Set camera unavailable on error
                onCameraSuccess={() => setCamera2Available(true)}  // Set camera available on success
              />
            ) : (
              <p>Camera 2 Unavailable</p>  // Fallback message if camera 2 is unavailable
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LivefeedPage;
