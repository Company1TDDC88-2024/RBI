import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import SiderMenuMobile from "../SiderMenu/SiderMenuMobile";
import styles from "./Layout.module.css";
import { useAuth } from "../../AuthContext";
import UserProfile from "../UserProfile/UserProfile"; // Import the UserProfile component
import { useMediaQuery } from "react-responsive";

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const isMobile = useMediaQuery({ maxWidth: 768 }); // Använd useMediaQuery för att kolla om skärmen är mindre än 768px
  const topMargin = 50;
  const siderWidth = isMobile ? 0 : 200; // Sätt sidomenyn till 0 om skärmen är mindre än 768px

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {isLoggedIn && (isMobile ? <SiderMenuMobile /> :
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
            position: "absolute",
            width: "100vw",
            display: "flex",
            justifyContent: "flex-end", // Align items to the right
            alignItems: "center",
            backgroundColor: "#001529", // Set header background to match the sidebar (blackish)
            padding: "0",
            zIndex: 999,
            left: 0,
          }}
        >
          {isLoggedIn && <UserProfile />}
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div
            className={styles.siteLayoutBackground}
            style={{ padding: 24, minHeight: 360, marginTop: topMargin}}
          > {children}
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
