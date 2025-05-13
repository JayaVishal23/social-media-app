import React from "react";
import Profile from "../assets/profile-user-svgrepo-com.svg";

const Nav = () => {
  return (
    <div className="container">
      <ul className="nav">
        <li className="logo">Logo</li>
        <input
          type="text"
          className="inp-search"
          placeholder="Search for People"
        />
        <li>
          <img src={Profile} alt="profile" className="profile-img" />
        </li>
      </ul>
    </div>
  );
};

export default Nav;
