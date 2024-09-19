import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./Pages/Home/HomePage";
import Test from "./Pages/Test/Test";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="*" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default App;
