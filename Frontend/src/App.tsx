// App.tsx
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Test from "./Pages/Test/Test";
import Layout from "./Components/Layout/Layout";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import HistoryPage from "./Pages/History/HistoryPage";
import LivefeedPage from "./Pages/Livefeed/LivefeedPage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import { AuthProvider, useAuth } from "./AuthContext"; // Import AuthProvider and useAuth

// PrivateRoute component to protect routes
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
    const { isLoggedIn } = useAuth(); // Get authentication status from context
    return isLoggedIn ? element : <Navigate to="/login" />; // Redirect to login if not logged in
};

function App() {
    return (
        <AuthProvider> {/* Wrap app with AuthProvider */}
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<LoginPage />} /> {/* Default route */}
                        <Route path="/test" element={<Test />} />
                        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} /> {/* Protected route */}
                        <Route path="/history" element={<PrivateRoute element={<HistoryPage />} />} /> {/* Protected route */}
                        <Route path="/livefeed" element={<PrivateRoute element={<LivefeedPage />} />} /> {/* Protected route */}
                        <Route path="/login" element={<LoginPage />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
