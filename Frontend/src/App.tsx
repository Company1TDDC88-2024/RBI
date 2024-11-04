import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Test from "./Pages/Test/Test";
import Layout from "./Components/Layout/Layout";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import HistoryPage from "./Pages/History/HistoryPage";
import LivefeedPage from "./Pages/Livefeed/LivefeedPage";
import LoginPage from "./Pages/LoginPage/LoginPage"; // Import the LoginPage

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<LoginPage />} /> {/* Set LoginPage as the default route */}
                    <Route path="/test" element={<Test />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/livefeed" element={<LivefeedPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
