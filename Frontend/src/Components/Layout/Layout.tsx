import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import styles from "./Layout.module.css";
import { useAuth } from "../../AuthContext";
import UserProfile from "../UserProfile/UserProfile"; // Import the UserProfile component

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const siderWidth = 200; // Define a consistent width for the sidebar

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {isLoggedIn && (
        <SiderMenu
          style={{
            position: "fixed",
            height: "100vh",
            left: 0,
            zIndex: 1000,
            width: siderWidth,
          }}
        />
      )}
      <AntLayout
        className={styles.siteLayout}
        style={{
          marginLeft: isLoggedIn ? siderWidth : 0, // Add left margin to account for the sidebar
          transition: "margin-left 0.3s ease", // Smooth transition
        }}
      >
        <Header
          className={styles.siteLayoutBackground}
          style={{
            display: "flex",
            justifyContent: "flex-end", // Align items to the right
            alignItems: "center",
            backgroundColor: "#001529", // Set header background to match the sidebar (blackish)
            padding: "0 16px",
          }}
        >
          {isLoggedIn && <UserProfile />}
        </Header>
        <Content style={{ margin: "24px 16px" }}>
          <div
            className={styles.siteLayoutBackground}
            style={{ padding: 24, minHeight: 360 }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Company1 © {new Date().getFullYear()}
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
