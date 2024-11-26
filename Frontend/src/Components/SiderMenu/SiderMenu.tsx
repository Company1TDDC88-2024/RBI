import React from "react";
import { Layout, Menu, message, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../AuthContext";

const { Sider } = Layout;

const SiderMenu: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, isAdmin } = useAuth(); // Get isAdmin from AuthContext

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post("/login/logout", {}, { withCredentials: true });
      message.success("Logout successful!");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      message.error("Failed to log out.");
    }
  };

  return (
    <Sider collapsible>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Overview</Link>
        </Menu.Item>
        {/* Render Historical Data menu item only for admins */}
        {isAdmin && (
          <Menu.Item key="2" icon={<HistoryOutlined />}>
            <Link to="/history">Historical Data</Link>
          </Menu.Item>
        )}
        {/* Render Live Feed menu item only for admins */}
        {isAdmin && (
          <Menu.Item key="3" icon={<VideoCameraOutlined />}>
            <Link to="/livefeed">Live Feed</Link>
          </Menu.Item>
        )}
        {/* <Menu.Item key="5" icon={<Badge color="red" dot />}>
          <Link to="/livedata">Live Data</Link>
        </Menu.Item> */}
        {/* Render Settings menu item only for admins */}
        {isAdmin && (
          <Menu.Item key="6" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
        )}
        <Menu.Item
          key="4"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SiderMenu;
