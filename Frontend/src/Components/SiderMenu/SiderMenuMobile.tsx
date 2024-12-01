// SiderMenuMobile.tsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, message, Drawer, Button } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MenuOutlined,
  DashboardOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import styles from "./SiderMenuMobile.module.css";

const SiderMenuMobile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn, isAdmin } = useAuth();
  const [selectedKey, setSelectedKey] = useState('1');
  const [visible, setVisible] = useState(false);

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

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleMenuClick = () => {
    onClose();
  };

  return (
    <>
      <Button className={styles.menuButton} type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={onClose}
        visible={visible}
        className={styles.darkDrawer}
      >
        <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline" onClick={handleMenuClick}>
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
          {isAdmin && (
            <Menu.Item key="6" icon={<SettingOutlined />}>
              <Link to="/settings">Settings</Link>
            </Menu.Item>
          )}
          <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Drawer>
    </>
  );
};

export default SiderMenuMobile;