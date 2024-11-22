import { useState } from "react";
import axios from "axios";

export const useUpdateCoordinates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateCoordinates = async (
    id: number,
    data: Partial<{
      TopBound: number;
      BottomBound: number;
      LeftBound: number;
      RightBound: number;
      Threshold: number;
      CameraID: number;
      Name: string;
      CooldownTime: number;
    }>
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.put(`/coordinates/upload/${id}`, data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccess(true);
      } else {
        setError(response.data.message || "Failed to update coordinates");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating coordinates");
    } finally {
      setLoading(false);
    }
  };

  return { updateCoordinates, loading, error, success };
};
