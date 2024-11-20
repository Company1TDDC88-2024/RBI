import axios from "axios";
import { useEffect, useState } from "react";

interface Coordinate {
    ID: number;
    TopBound: number;
    BottomBound: number;
    LeftBound: number;
    RightBound: number;
    Threshold: number;
    CameraID: number;
    CooldownTime: number;
    Name: string;
}

interface IUseGetCoordinatesReturn {
    data: Coordinate[] | null; // Handles multiple rows of data
    error: Error | null;
    loading: boolean;
    refetch: () => void;
}

export const useGetCoordinates = (): IUseGetCoordinatesReturn => {
    const [data, setData] = useState<Coordinate[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = () => {
        setLoading(true); // Set loading state at the start of the request
        axios.get("/coordinates/get", { withCredentials: true })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data); // Expecting an array of Coordinate objects
                } else {
                    throw new Error(response.data.message || "Failed to fetch data");
                }
            })
            .catch((err) => {
                setError(err);
                setData(null); // Clear data if an error occurs
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData(); // Fetch data on mount
    }, []);

    return { data, error, loading, refetch: fetchData };
};
