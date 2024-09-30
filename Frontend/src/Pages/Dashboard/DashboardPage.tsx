import { Link } from "react-router-dom";
import "./DashboardPage.css";
import "../../global.css";

//Implement Dashboard page here
const DashboardPage = () => {
    return (
        <div className="page-container">
            <h1>Implement Dashboard here</h1>
            <p>
                Click <Link to="/test">here</Link> to get a message from the
                backend
            </p>
        </div>
    );
};

export default DashboardPage;