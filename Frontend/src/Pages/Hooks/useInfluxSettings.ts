// src/hooks/useInfluxSettings.ts
import { useState, useEffect } from "react";
import axios from "axios";

interface InfluxSettings {
  influxThreshold: number;
  influxTimeframe: number;
}

interface UseInfluxSettingsReturn {
  settings: InfluxSettings | null;
  loading: boolean;
  error: string | null;
  updateInfluxThreshold: (value: number) => Promise<void>;
  updateInfluxTimeframe: (value: number) => Promise<void>;
}

export const useInfluxSettings = (): UseInfluxSettingsReturn => {
  const [settings, setSettings] = useState<InfluxSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from the backend
  const fetchSettings = async () => {
    try {
      const response = await axios.get("/customer_influx/CustomerInflux"); // Removed '/api'
      const data = response.data;

      if (data.length > 0) {
        setSettings({
          influxThreshold: data[0].influx_threshold,
          influxTimeframe: data[0].influx_timeframe,
        });
      } else {
        setError("No settings found.");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Failed to fetch settings.");
    } finally {
      setLoading(false);
    }
  };

  // Update influxThreshold
  const updateInfluxThreshold = async (value: number) => {
    if (!settings) {
      setError("Settings not loaded.");
      return;
    }

    try {
      await axios.put(`/customer_influx/CustomerInflux/1`, { influx_threshold: value }); // Removed '/api'
      setSettings((prev) => (prev ? { ...prev, influxThreshold: value } : prev));
    } catch (err) {
      console.error("Failed to update influx threshold:", err);
      setError("Failed to update influx threshold.");
    }
  };

  // Update influxTimeframe
  const updateInfluxTimeframe = async (value: number) => {
    if (!settings) {
      setError("Settings not loaded.");
      return;
    }

    try {
      await axios.put(`/customer_influx/CustomerInflux/1`, { influx_timeframe: value }); // Removed '/api'
      setSettings((prev) => (prev ? { ...prev, influxTimeframe: value } : prev));
    } catch (err) {
      console.error("Failed to update influx timeframe:", err);
      setError("Failed to update influx timeframe.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateInfluxThreshold,
    updateInfluxTimeframe,
  };
};