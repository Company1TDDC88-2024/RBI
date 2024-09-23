import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;