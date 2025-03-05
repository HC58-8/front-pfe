import React from "react";
import { Link } from "react-router-dom"; // Assure-toi d'avoir installé react-router-dom

const SideBar = () => {
  return (
    <div className="ps-container sidebar-left rtl-ps-none ps scroll pt-24 open ps--active-y">
      <ul className="navigation-left">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-item active">
            <i className="nav-icon i-Bar-Chart fa-2x"></i>
            <span className="item-name">Dashboard</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
