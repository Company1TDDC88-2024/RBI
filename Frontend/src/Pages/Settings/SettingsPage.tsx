import React, { useState } from "react";
import { Card, InputNumber } from "antd";
import styles from "./SettingsPage.module.css";
import { useQueueThreshold } from "./QueueThresholdContext";
import "../../global.css";
import CreateUser from "./CreateUser";
import DeleteUser from "./DeleteUser";

const SettingsPage = () => {
  const { queueThreshold, setQueueThreshold } = useQueueThreshold();

  // Handler to update the threshold
  const handleThresholdChange = (value: number | null) => {
    if (value !== null) setQueueThreshold(value);
  };

  return (
    <div className={styles.settingsPage}>
      <h1>Settings</h1>
      <div className={styles.settingsContainer}>
        {/* Vänster kolumn */}
        <div className={styles.userManagement}>
          <Card title="Create a new user" className={styles.card}>
            <CreateUser />
          </Card>
          <Card title="Delete user" className={styles.card}>
            <DeleteUser />
          </Card>
        </div>

        {/* Höger kolumn */}
        <div className={styles.queueSettings}>
          <Card title="Change queue threshold" className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Select an area</label>
              {/* Lägg till select-komponent om det behövs */}
            </div>
            <div className={styles.inputGroup}>
              <label>New queue threshold</label>
              <InputNumber
                min={1}
                max={100}
                value={queueThreshold}
                onChange={handleThresholdChange}
                style={{ width: "100%" }}
              />
            </div>
            <button className={styles.button}>Save change</button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
