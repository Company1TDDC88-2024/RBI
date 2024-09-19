import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div>
            <h1>Home Page</h1>
            <p>
                Click <Link to="/test">here</Link> to get a message from the
                backend
            </p>
        </div>
    );
};

export default HomePage;
