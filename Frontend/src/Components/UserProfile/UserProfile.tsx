import React, { useState } from "react";
import { Dropdown, Menu, Avatar, message,Button } from "antd";
import { UserOutlined, LogoutOutlined,CloseOutlined} from "@ant-design/icons";
import { useAuth } from "../../AuthContext";  // Import the useAuth hook
import axios from "axios";
import { Spin } from "antd";
import { useNavigate } from "react-router-dom";



const UserProfile: React.FC = () => {
  const { user, setIsLoggedIn } = useAuth();  // Assuming user data is in AuthContext
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      // Assuming you have a logout API endpoint
      await axios.post("/login/logout", {}, { withCredentials: true });
      message.success("Logged out successfully");
      setIsLoggedIn(false);
      navigate("/login")  // Update the AuthContext to reflect that user is logged out
    } catch (error) {
      console.error("Logout error", error);
      message.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };
  const handleCloseDropdown = () => {
    // Additional logic for closing the dropdown can be added if necessary
  };

  // Create the dropdown menu
  const menu = (
    <Menu>
      <Menu.Item style={{textAlign:"right"}}onClick={handleCloseDropdown}>
        <CloseOutlined  style={{fontSize:"16px"}}/> 
      </Menu.Item>
      <Menu.Item>{user ? `Name: ${user.name}` : "Name: N/A"}</Menu.Item>
      <Menu.Item>{user ? `Email: ${user.email}` : "Email: N/A"}</Menu.Item>
      <Menu.Item>
        <Button 
          type="primary" 
          danger 
          icon={loading ? <Spin /> : <LogoutOutlined />} 
          onClick={handleLogout}
          block
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
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
