import React, { useState } from "react";
import { Dropdown, Menu, Avatar, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../../AuthContext";  // Import the useAuth hook
import axios from "axios";
import { Spin } from "antd";



const UserProfile: React.FC = () => {
  const { user, setIsLoggedIn } = useAuth();  // Assuming user data is in AuthContext
  const [loading, setLoading] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      // Assuming you have a logout API endpoint
      await axios.post("/login/logout", {}, { withCredentials: true });
      message.success("Logged out successfully");
      setIsLoggedIn(false);  // Update the AuthContext to reflect that user is logged out
    } catch (error) {
      console.error("Logout error", error);
      message.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  // Create the dropdown menu
  const menu = (
    <Menu>
      <Menu.Item>{user ? `Name: ${user.name}` : "Name: N/A"}</Menu.Item>
      <Menu.Item>{user ? `Email: ${user.email}` : "Email: N/A"}</Menu.Item>
      <Menu.Item onClick={handleLogout} icon={loading ? <Spin /> : <LogoutOutlined />}>
      {loading ? "Logging out..." : "Logout"}
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["hover"]}>
      <Avatar icon={<UserOutlined />} />
    </Dropdown>
  );
};

export default UserProfile;
