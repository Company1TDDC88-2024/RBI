import React, { useState } from "react";
import { Card, InputNumber } from "antd";
import styles from "./SettingsPage.module.css";
import { useQueueThreshold } from "./QueueThresholdContext";
import "../../global.css";

const SettingsPage = () => {
  
  const { queueThreshold, setQueueThreshold } = useQueueThreshold();

  // Handler to update the threshold
  const handleThresholdChange = (value: number | null) => {
    if (value !== null) setQueueThreshold(value);
  };

  return (
    <div className={styles.settingsPage}>
        <Card title="Settings" style={{ textAlign: "center"}}>
            <p>
                <strong>Queue Threshold:</strong> <strong>{queueThreshold}</strong>
            </p>
            <InputNumber
                min={1}
                max={100}
                value={queueThreshold}
                onChange={(value) => value !== null && setQueueThreshold(value)}
                style={{ marginTop: 10 }}
            />
        </Card>
    </div>
  );
};

export default SettingsPage;
