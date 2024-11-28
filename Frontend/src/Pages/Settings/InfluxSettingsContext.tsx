import { createContext, useContext, useState, ReactNode } from "react";

interface SettingsContextType {
  influxThreshold: number;
  influxTimeframe: number;
  setInfluxThreshold: (value: number) => void;
  setTimeframe: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [influxThreshold, setInfluxThresholdState] = useState<number>(
    () => parseInt(localStorage.getItem("influxThreshold") || "50", 10) // Default to 50
  );
  const [influxTimeframe, setTimeframeState] = useState<number>(
    () => parseInt(localStorage.getItem("influxTimeframe") || "60", 10) // Default to 60
  );

  const setInfluxThreshold = (value: number) => {
    setInfluxThresholdState(value);
    localStorage.setItem("influxThreshold", value.toString());
  };

  const setTimeframe = (value: number) => {
    setTimeframeState(value);
    localStorage.setItem("influxTimeframe", value.toString());
  };

  return (
    <SettingsContext.Provider value={{ influxThreshold, influxTimeframe, setInfluxThreshold, setTimeframe }}>
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
