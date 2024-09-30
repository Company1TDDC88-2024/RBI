import React from "react";
import { Layout as AntLayout } from "antd";
import SiderMenu from "../SiderMenu/SiderMenu";
import "./Layout.css";

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <SiderMenu />
      <AntLayout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: "0 16px" }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Company 1 ©2024</Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;