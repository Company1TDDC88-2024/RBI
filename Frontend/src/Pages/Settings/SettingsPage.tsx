import React, { useState } from "react";
import { Card, InputNumber, Select, Spin, Input, message, Button } from "antd";
import styles from "./SettingsPage.module.css";
import "../../global.css";
import CreateUser from "./CreateUser";
import DeleteUser from "./DeleteUser";
import { useGetCoordinates } from "../Hooks/useGetCoordinates.ts";
import { useUpdateCoordinates } from "../Hooks/useUpdateCoordinates"; // Import the hook

const { Option } = Select;

const SettingsPage = () => {
    const [selectedArea, setSelectedArea] = useState<Coordinate | null>(null);
    const [newName, setNewName] = useState<string>("");
    const [newThreshold, setNewThreshold] = useState<number | null>(null);
    const { data, loading, error, refetch } = useGetCoordinates();
    const [savingName, setSavingName] = useState(false);
    const [savingThreshold, setSavingThreshold] = useState(false);

    const {
      updateCoordinates,
      loading: updating,
      error: updateError,
      success,
    } = useUpdateCoordinates();
  
    const handleAreaChange = (value: string) => {
      const area = data?.find((item) => item.Name === value);
      setSelectedArea(area || null);
      setNewName("");
      setNewThreshold(area?.Threshold || null);
    };
  
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewName(e.target.value);
    };
  
    const handleThresholdChange = (value: number | null) => {
      setNewThreshold(value);
    };
  
    const handleSaveName = async () => {
        if (selectedArea && newName.trim()) {
          setSavingName(true); // Indicate that the name save is in progress
          try {
            await updateCoordinates(selectedArea.ID, { Name: newName });
            message.success("Name updated successfully!");
          } catch (err) {
            message.error("Failed to update name!");
          } finally {
            setSavingName(false); // Reset the saving state
          }
        }
      };
      
      const handleSaveThreshold = async () => {
        if (selectedArea && newThreshold !== null) {
          setSavingThreshold(true); // Indicate that the threshold save is in progress
          try {
            await updateCoordinates(selectedArea.ID, { Threshold: newThreshold });
            message.success("Threshold updated successfully!");
          } catch (err) {
            message.error("Failed to update threshold!");
          } finally {
            setSavingThreshold(false); // Reset the saving state
          }
        }
      };
  
    return (
      <div className={styles.settingsPage}>
        <h1>Settings</h1>
        <div className={styles.settingsContainer}>
          <div className={styles.userManagement}>
            <Card title="Create a new user" className={styles.card}>
              <CreateUser />
            </Card>
            <Card title="Delete user" className={styles.card}>
              <DeleteUser />
            </Card>
          </div>
  
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
                      disabled={updating || !newName.trim()}
                    >
                      {updating ? "Saving..." : "Save Name"}
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
                      disabled={updating || newThreshold === null}
                    >
                      {updating ? "Saving..." : "Save Threshold"}
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
