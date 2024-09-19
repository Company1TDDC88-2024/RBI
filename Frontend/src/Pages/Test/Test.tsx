import { useGetBackendMsg } from "./Hooks/useGetBackendMsg";
import styles from "./styles/Test.module.css";

const Test = () => {
    const { data, error, loading } = useGetBackendMsg();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Test page!</h1>
            <p>Data from backend:</p>
            <span className={styles.BackendText}>
                {data.firstWord} {data.secondWord}
            </span>
        </div>
    );
};

export default Test;
