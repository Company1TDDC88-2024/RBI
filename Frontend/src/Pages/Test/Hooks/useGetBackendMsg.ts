import axios from "axios";
import { useEffect, useState } from "react";
import { ITest } from "../../../Types/Test-types";

interface IUseGetBackendMsgReturn {
    data: any;
    error: Error | null;
    loading: boolean;
}

export const useGetBackendMsg = (): IUseGetBackendMsgReturn => {
    const [data, setData] = useState<ITest | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/example/test", { withCredentials: true })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data);
                }
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { data, error, loading };
};