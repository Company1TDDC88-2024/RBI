// Layout.tsx
import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import styles from "./Layout.module.css";
import { useAuth } from "../../AuthContext"; // Importera useAuth

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isLoggedIn } = useAuth(); // Hämta isLoggedIn från AuthContext

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {isLoggedIn && <SiderMenu />} {/* Visa SiderMenu endast om användaren är inloggad */}
      <AntLayout className={styles.siteLayout}>
        <Header className={styles.siteLayoutBackground} style={{ padding: 0 }} />
        <Content style={{ margin: "0 16px" }}>
          <div className={styles.siteLayoutBackground} style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Company1 © {new Date().getFullYear()}</Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
