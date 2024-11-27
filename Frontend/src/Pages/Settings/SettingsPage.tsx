import React, { useState } from "react";
import { Card, InputNumber, Select, Spin, Input, message, Button } from "antd";
import styles from "./SettingsPage.module.css";
import "../../global.css";
import CreateUser from "./CreateUser";
import DeleteUser from "./DeleteUser";
import { useGetCoordinates, Coordinate} from "../Hooks/useGetCoordinates.ts";
import { useUpdateCoordinates } from "../Hooks/useUpdateCoordinates"; // Import the hook

const { Option } = Select;

const SettingsPage = () => {
  const [selectedArea, setSelectedArea] = useState<Coordinate | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [newThreshold, setNewThreshold] = useState<number | null>(null);
  const [newCooldown, setNewCooldown] = useState<number | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savingCooldown, setSavingCooldown] = useState(false); // Fixed missing state

  const { data, loading, error, refetch } = useGetCoordinates();
  const { updateCoordinates } = useUpdateCoordinates();

  const handleAreaChange = (value: string) => {
    const area = data?.find((item) => item.Name === value);
    setSelectedArea(area || null);
    setNewName("");
    setNewThreshold(area?.Threshold || null);
    setNewCooldown(area?.CooldownTime || null); // Initialize cooldown value
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
        // Perform the name update
        await updateCoordinates(selectedArea.ID, { Name: newName });

        // Update the `data` to reflect the new name in the dropdown
        const updatedData = data?.map(area =>
          area.ID === selectedArea.ID ? { ...area, Name: newName } : area
        );

        // Update the selectedArea with the new name immediately
        const updatedArea = updatedData?.find((area) => area.ID === selectedArea.ID);
        setSelectedArea(updatedArea || null); // This will update the selected value in the dropdown

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
                  value={selectedArea?.Name || undefined} // Use the updated selected name here
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
                  <label>New cooldown time</label>
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
