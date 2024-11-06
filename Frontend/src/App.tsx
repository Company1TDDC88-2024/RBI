import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Test from "./Pages/Test/Test";
import Layout from "./Components/Layout/Layout";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import HistoryPage from "./Pages/History/HistoryPage";
import LivefeedPage from "./Pages/Livefeed/LivefeedPage";
import LiveDataPage from "./Pages/LiveData/LiveDataPage";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/test" element={<Test />} />
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/livefeed" element={<LivefeedPage />} />
                    <Route path="/livedata"element={<LiveDataPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
