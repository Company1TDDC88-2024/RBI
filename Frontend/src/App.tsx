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
const PrivateRoute = ({
  element,
  adminOnly = false,
  redirectTo = "/login",
}: {
  element: JSX.Element;
  adminOnly?: boolean;
  redirectTo?: string;
}) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return element;
};

// Inactivity handler component
const InactivityHandler = () => {
  const navigate = useNavigate(); // Get navigate function here

  const handleTimeout = () => {
    navigate("/login"); // Redirect to login when timeout occurs
  };

  useInactivityTimeout(300000, handleTimeout); // Call inactivity timeout with 5 minute

  return null; // This component does not render anything
};

function App() {
  return (
    <AuthProvider>
        <Router>
          <InactivityHandler />
          <Layout>
            <Routes>
            <Route path="/" element={
               <PrivateRoute
                element={<Navigate to="/dashboard" replace />}
                redirectTo="/login"
              />
             }
              />      
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
