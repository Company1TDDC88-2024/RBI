import React from "react";
import { Layout, Menu, Badge } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  HistoryOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dot } from "recharts";

const { Sider } = Layout;

const SiderMenu: React.FC = () => {
  return (
    <Sider collapsible>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<HistoryOutlined />}>
          <Link to="/history">Historical Data</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<VideoCameraOutlined />}>
          <Link to="/livefeed">Live Feed</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<Badge color="red" dot />}>
          <Link to="/livedata">Live Data</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<LogoutOutlined />}>
          <Link to="#">Logout</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SiderMenu;