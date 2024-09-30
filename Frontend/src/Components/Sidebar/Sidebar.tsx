import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="toggle-button" onClick={toggleSidebar}>
        <span className="hamburger-icon">&#9776;</span>
      </button>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <nav>
          <ul>
            <li><Link to="/dashboard" onClick={toggleSidebar}>Dashboard</Link></li>
            <li><Link to="/history" onClick={toggleSidebar}>Historical data</Link></li>
            <li><Link to="/livefeed" onClick={toggleSidebar}>Live Feed</Link></li>
            <li><Link to="#">Logout</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;