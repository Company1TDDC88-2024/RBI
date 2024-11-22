import { Route, BrowserRouter as Router, Routes, Navigate, useNavigate } from "react-router-dom";
import Test from "./Pages/Test/Test";
import Layout from "./Components/Layout/Layout";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import HistoryPage from "./Pages/History/HistoryPage";
import SettingsPage from "./Pages/Settings/SettingsPage";
import LivefeedPage from "./Pages/Livefeed/LivefeedPage";
import LoginPage from "./Pages/LoginPage/LoginPage";
import LiveDataPage from "./Pages/LiveData/LiveDataPage";
import { AuthProvider, useAuth } from "./AuthContext"; 
import useInactivityTimeout from "./Hooks/useIdleTimer"; 

// PrivateRoute component to protect routes
const PrivateRoute = ({ element, adminOnly = false }: { element: JSX.Element, adminOnly?: boolean }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (localStorage.getItem("isLoggedIn") == "true") {
    return element;
  }
  if (!isLoggedIn || !(localStorage.getItem("isLoggedIn") == "true")) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />; // Redirect if not admin

  return element;
};

// Inactivity handler component
const InactivityHandler = () => {
  const navigate = useNavigate(); // Get navigate function here

  const handleTimeout = () => {
    navigate("/login"); // Redirect to login when timeout occurs
  };

  useInactivityTimeout(3000000, handleTimeout); // Call inactivity timeout with 1 minute

  return null; // This component does not render anything
};

function App() {
  return (
    <AuthProvider>
        <Router>
          <InactivityHandler />
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/test" element={<PrivateRoute element={<Test />} />} />
              <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
              <Route path="/history" element={<PrivateRoute element={<HistoryPage />} adminOnly={true} />} />
              <Route path="/livefeed" element={<PrivateRoute element={<LivefeedPage />} adminOnly={true} />} />
              <Route path="/livedata" element={<PrivateRoute element={<LiveDataPage />} />} />
              <Route path="/settings" element={<PrivateRoute element={<SettingsPage />} adminOnly={true} />} />
            </Routes>
          </Layout>
        </Router>
    </AuthProvider>
  );
}


export default App;
