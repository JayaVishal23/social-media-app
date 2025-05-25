import React from "react";
import Leftnav from "../Leftnav";
import Nav from "../Nav";

const Settings = () => {
  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page">
          <button>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
