import React from "react";
import { Outlet } from "react-router-dom";
import "../index.css";
import Header from "./Header";
import Menu from "./Menu";

const AnonymousLayout = () => {
  return (
    <div>
	  <Menu />
      <Header />
      <Outlet />
    </div>
  );
};

export default AnonymousLayout;
