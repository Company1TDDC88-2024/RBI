import { createContext, useContext, ReactNode } from "react";
import { useInfluxSettings } from "../Hooks/useInfluxSettings"; // Ensure the correct import path
import { Spin } from "antd";

interface SettingsContextType {
  influxThreshold: number;
  influxTimeframe: number;
  setInfluxThreshold: (value: number) => Promise<void>;
  setTimeframe: (value: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const {
    settings,
    loading,
    error,
    updateInfluxThreshold,
    updateInfluxTimeframe,
  } = useInfluxSettings();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Loading settings..." />
      </div>
    );
  }

  if (error || !settings) {
    return <div>Error: {error}</div>;
  }

  return (
    <SettingsContext.Provider
      value={{
        influxThreshold: settings.influxThreshold,
        influxTimeframe: settings.influxTimeframe,
        setInfluxThreshold: updateInfluxThreshold,
        setTimeframe: updateInfluxTimeframe,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
