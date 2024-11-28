import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import styles from "./Layout.module.css";
import { useAuth } from "../../AuthContext";
import UserProfile from "../UserProfile/UserProfile"; // Import the UserProfile component

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {isLoggedIn && <SiderMenu />} {/* Show SiderMenu only if user is logged in */}
      <AntLayout className={styles.siteLayout}>
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
          {/* Use UserProfile component */}
          {isLoggedIn && <UserProfile />}
        </Header>
        <Content style={{ margin: "0 16px" }}>
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
