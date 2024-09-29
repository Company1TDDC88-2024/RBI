import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./Pages/Home/HomePage";
import Test from "./Pages/Test/Test";
import Layout from "./Components/Layout/Layout";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/test" element={<Test />} />
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
