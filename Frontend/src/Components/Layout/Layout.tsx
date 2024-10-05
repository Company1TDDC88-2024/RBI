import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import styles from "./Layout.module.css";

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <SiderMenu />
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