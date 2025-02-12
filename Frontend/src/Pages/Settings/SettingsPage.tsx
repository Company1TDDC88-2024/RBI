import React, { useState } from "react";
import { Card, InputNumber, Select, Spin, Input, message, Button } from "antd";
import styles from "./SettingsPage.module.css";
import "../../global.css";
import CreateUser from "./CreateUser";
import DeleteUser from "./DeleteUser";
import { useGetCoordinates, Coordinate } from "../Hooks/useGetCoordinates.ts";
import { useUpdateCoordinates } from "../Hooks/useUpdateCoordinates";
import { useSettings } from "./InfluxSettingsContext.tsx";

const { Option } = Select;

const SettingsPage = () => {
  const [selectedArea, setSelectedArea] = useState<Coordinate | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newThreshold, setNewThreshold] = useState<number | null>(null);
  const [newCooldown, setNewCooldown] = useState<number | null>(null);
  const [newInfluxThreshold, setNewInfluxThreshold] = useState<number | null>(null); // New state for influx threshold
  const [newTimeframe, setNewTimeframe] = useState<number | null>(null); // New state for timeframe
  const [savingName, setSavingName] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savingCooldown, setSavingCooldown] = useState(false);
  const { influxThreshold, influxTimeframe, setInfluxThreshold, setTimeframe } = useSettings();
  const [savingInfluxThreshold, setSavingInfluxThreshold] = useState(false);
  const [savingTimeframe, setSavingTimeframe] = useState(false);

  const { data, loading, error, refetch } = useGetCoordinates();
  const { updateCoordinates } = useUpdateCoordinates();

  const handleAreaChange = (value: string) => {
    const area = data?.find((item) => item.Name === value);
    setSelectedArea(area || null);
    setNewName("");
    setNewThreshold(area?.Threshold || null);
    setNewCooldown(area?.CooldownTime || null);
    setNewInfluxThreshold(null); // Reset influx threshold
    setNewTimeframe(null); // Reset timeframe
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleThresholdChange = (value: string | number | null) => {
    if (value === null || value === "") {
      setNewThreshold(null);
    } else if (typeof value === "number" && value >= 1 && value <= 100) {
      setNewThreshold(value);
    } else {
      setNewThreshold(newThreshold);
    }
  };

  const handleCooldownChange = (value: string | number | null) => {
    if (value === null || value === "") {
      setNewCooldown(null);
    } else if (typeof value === "number" && value >= 1 && value <= 1000) {
      setNewCooldown(value);
    } else {
      setNewCooldown(newCooldown);
    }
  };

  const handleSaveName = async () => {
    if (selectedArea && newName.trim()) {
      setSavingName(true);
      try {
        await updateCoordinates(selectedArea.ID, { Name: newName });
        const updatedData = data?.map((area) =>
          area.ID === selectedArea.ID ? { ...area, Name: newName } : area
        );
        const updatedArea = updatedData?.find((area) => area.ID === selectedArea.ID);
        setSelectedArea(updatedArea || null);
        message.success("Queue name updated successfully!");
        refetch();
      } catch (err) {
        message.error("Failed to update queue name!");
      } finally {
        setSavingName(false);
      }
    }
  };

  const handleSaveThreshold = async () => {
    if (selectedArea && newThreshold !== null && newThreshold >= 1 && newThreshold <= 100) {
      setSavingThreshold(true);
      try {
        await updateCoordinates(selectedArea.ID, { Threshold: newThreshold });
        message.success("Queue threshold updated successfully!");
      } catch (err) {
        message.error("Failed to update threshold!");
      } finally {
        setSavingThreshold(false);
      }
    } else {
      message.error("Please enter a valid threshold (1-100).");
    }
  };

  const handleSaveCooldown = async () => {
    if (selectedArea && newCooldown !== null && newCooldown >= 1 && newCooldown <= 1000) {
      setSavingCooldown(true);
      try {
        await updateCoordinates(selectedArea.ID, { CooldownTime: newCooldown });
        message.success("Queue cooldown updated successfully!");
      } catch (err) {
        message.error("Failed to update queue cooldown!");
      } finally {
        setSavingCooldown(false);
      }
    } else {
      message.error("Please enter a valid cooldown time (1-1000).");
    }
  };

  const handleSaveInfluxThreshold = async () => {
    setSavingInfluxThreshold(true);
    try {
      await setInfluxThreshold(influxThreshold);
      message.success("Influx Threshold updated successfully!");
    } catch (err) {
      message.error("Failed to update influx threshold");
    } finally {
      setSavingInfluxThreshold(false);
    }
  };

  const handleSaveTimeframe = async () => {
    setSavingTimeframe(true);
    try {
      await setTimeframe(influxTimeframe);
      message.success("Timeframe updated successfully!");
    } catch (err) {
      message.error("Failed to update timeframe");
    } finally {
      setSavingTimeframe(false);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsContainer}>
        <h1 className={styles.header}>Settings</h1>
        {/* Left column */}
        <div className={styles.userManagement}>
          <Card title="Create a new user" className={styles.card}>
            <CreateUser />
          </Card>
          <Card title="Delete user" className={styles.card}>
            <DeleteUser />
          </Card>
        </div>

        {/* Right column */}
        <div className={styles.queueSettings}>
          <Card title="Queue settings" className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Select an area</label>
              {loading ? (
                <Spin />
              ) : error ? (
                <p>Error loading areas</p>
              ) : (
                <Select
                  placeholder="Select an area"
                  style={{ width: "100%" }}
                  onChange={handleAreaChange}
                  value={selectedArea?.Name || undefined}
                >
                  {data?.map((area) => (
                    <Option key={area.ID} value={area.Name}>
                      {area.Name}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
            {selectedArea && (
              <>
                <div className={styles.inputGroup}>
                  <label>New name</label>
                  <Input
                    value={newName}
                    onChange={handleNameChange}
                    placeholder="Enter new name"
                    style={{ width: "100%" }}
                  />
                  <Button
                    onClick={handleSaveName}
                    className={styles.button}
                    disabled={savingName || !newName.trim()}
                  >
                    {savingName ? "Saving..." : "Save Name"}
                  </Button>
                </div>
                <div className={styles.inputGroup}>
                  <label>New queue threshold</label>
                  <InputNumber
                    min={1}
                    max={100}
                    value={newThreshold !== null ? newThreshold : ""}
                    onChange={handleThresholdChange}
                    placeholder="Enter threshold"
                    style={{ width: "100%" }}
                  />
                  <Button
                    onClick={handleSaveThreshold}
                    className={styles.button}
                    disabled={savingThreshold || newThreshold === null}
                  >
                    {savingThreshold ? "Saving..." : "Save Threshold"}
                  </Button>
                </div>
                <div className={styles.inputGroup}>
                  <label>New cooldown time (Seconds)</label>
                  <InputNumber
                    min={1}
                    max={1000}
                    value={newCooldown !== null ? newCooldown : ""}
                    onChange={handleCooldownChange}
                    placeholder="Enter cooldown time"
                    style={{ width: "100%" }}
                  />
                  <Button
                    onClick={handleSaveCooldown}
                    className={styles.button}
                    disabled={savingCooldown || newCooldown === null}
                  >
                    {savingCooldown ? "Saving..." : "Save Cooldown"}
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card title="Entry Point Settings" className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Change Influx Threshold</label>
              <InputNumber
                min={0}
                max={500}
                value={influxThreshold}
                onChange={(value) => setInfluxThreshold(value || 0)}
                placeholder="Enter influx threshold"
                style={{ width: "100%" }}
              />
              <Button
                onClick={handleSaveInfluxThreshold}
                className={styles.button}
                loading={savingInfluxThreshold}
              >
                Save Influx Threshold
              </Button>
            </div>
            <div className={styles.inputGroup}>
              <label>Change Timeframe (Minutes) </label>
              <InputNumber
                min={1}
                max={1000000}
                value={influxTimeframe}
                onChange={(value) => setTimeframe(value || 0)}
                placeholder="Enter timeframe in minutes"
                style={{ width: "100%" }}
              />
              <Button
                onClick={handleSaveTimeframe}
                className={styles.button}
                loading={savingTimeframe}
              >
                Save Timeframe
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;