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
  const { influxThreshold, influxTimeframe, setInfluxThreshold, setTimeframe} = useSettings();
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

  const handleThresholdChange = (value: number | null) => {
    setNewThreshold(value);
  };

  const handleCooldownChange = (value: number | null) => {
    setNewCooldown(value);
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
    if (selectedArea && newThreshold !== null) {
      setSavingThreshold(true);
      try {
        await updateCoordinates(selectedArea.ID, { Threshold: newThreshold });
        message.success("Queue threshold updated successfully!");
      } catch (err) {
        message.error("Failed to update threshold!");
      } finally {
        setSavingThreshold(false);
      }
    }
  };

  const handleSaveCooldown = async () => {
    if (selectedArea && newCooldown !== null) {
      setSavingCooldown(true);
      try {
        await updateCoordinates(selectedArea.ID, { CooldownTime: newCooldown });
        message.success("Queue cooldown updated successfully!");
      } catch (err) {
        message.error("Failed to update queue cooldown!");
      } finally {
        setSavingCooldown(false);
      }
    }
  };

  const handleSaveInfluxThreshold = async () => {
    setSavingInfluxThreshold(true);
    try {
      // Simulate save logic (e.g., show toast or console log)
      console.log(`Saved Influx Threshold: ${influxThreshold}`);
    } catch (err) {
      console.error("Failed to save influx threshold");
    } finally {
      setSavingInfluxThreshold(false);
    }
  };

  const handleSaveTimeframe = async () => {
    setSavingTimeframe(true);
    try {
      // Simulate save logic (e.g., show toast or console log)
      console.log(`Saved Timeframe: ${influxTimeframe}`);
    } catch (err) {
      console.error("Failed to save timeframe");
    } finally {
      setSavingTimeframe(false);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsContainer}>
        <h1 className={styles.header}>Settings</h1>
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
                    value={newThreshold !== null ? newThreshold : selectedArea?.Threshold}
                    onChange={handleThresholdChange}
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
                  <label>New cooldown time</label>
                  <InputNumber
                    min={1}
                    max={1000}
                    value={newCooldown !== null ? newCooldown : selectedArea?.CooldownTime}
                    onChange={handleCooldownChange}
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

          <Card title="Entry point settings" className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Change influx threshold</label>
              <InputNumber
                min={1}
                max={500}
                value={influxThreshold}
                onChange={(value) => setInfluxThreshold(value || 0)}
                placeholder="Enter influx threshold"
                style={{ width: "100%" }}
              />
              <Button
                onClick={handleSaveInfluxThreshold}
                className={styles.button}
                disabled={savingInfluxThreshold}
              >
                {savingInfluxThreshold ? "Saving..." : "Save Influx Threshold"}
              </Button>
            </div>
            <div className={styles.inputGroup}>
              <label>Change timeframe</label>
              <InputNumber
                min={1}
                max={1440}
                value={influxTimeframe}
                onChange={(value) => setTimeframe(value || 0)}
                placeholder="Enter timeframe in minutes"
                style={{ width: "100%" }}
              />
              <Button
                onClick={handleSaveTimeframe}
                className={styles.button}
                disabled={savingTimeframe}
              >
                {savingTimeframe ? "Saving..." : "Save Timeframe"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
