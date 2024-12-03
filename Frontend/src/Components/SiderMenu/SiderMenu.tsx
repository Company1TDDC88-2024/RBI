import React, { useEffect, useState,CSSProperties } from "react";
import { Layout, Menu, message, Badge } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
  //LogoutOutlined,
  SettingOutlined
  
} from "@ant-design/icons";
//import axios from "axios";
import { useAuth } from "../../AuthContext";



const { Sider } = Layout;
interface SiderMenuProps {
  style?: CSSProperties; // Add style prop
}

const SiderMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn, isAdmin } = useAuth();
  const [selectedKey, setSelectedKey] = useState('1');

  /*const handleLogout = async () => {
    try {
      await axios.post("/login/logout", {}, { withCredentials: true });
      message.success("Logout successful!");
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      message.error("Failed to log out.");
    }
  };*/

  const getMenuKey = (path) => {
    switch (path) {
      case '/dashboard':
        return '1';
      case '/history':
        return '2';
      case '/livefeed':
        return '3';
      case '/livedata':
        return '5';
      case '/settings':
        return '6';
      default:
        return '1';
    }
  };

  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKey(getMenuKey(currentPath));
  }, [location.pathname]);

  const fixedSiderStyle = {
    position: "fixed",
    height: "100vh",
    left: 0,
    zIndex: 1000,
    width: 200, // Adjust as per your layout width
  };



  return (
    <Sider style={fixedSiderStyle} collapsible>
      <div className="logo" />
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Overview</Link>
        </Menu.Item>
        {isAdmin && (
          <Menu.Item key="2" icon={<HistoryOutlined />}>
            <Link to="/history">Historical Data</Link>
          </Menu.Item>
        )}
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
        
      </Menu>
    </Sider>
  );
};

export default SiderMenu;