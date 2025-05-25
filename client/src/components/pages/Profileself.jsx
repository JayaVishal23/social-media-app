import React from "react";
import Nav from "../Nav";
import Leftnav from "../Leftnav";
import Rightnav from "../Rightnav";
import Profile from "../Profile";

const Profileself = () => {
  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page">
          <Profile />
        </div>
        {/* <Rightnav /> */}
      </div>
    </div>
  );
};

export default Profileself;
