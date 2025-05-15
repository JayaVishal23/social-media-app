import React from "react";
import Nav from "../Nav";
import Leftnav from "../Leftnav";
import Rightnav from "../Rightnav";
import Posts from "../Posts";
import CreateP from "../CreateP";

const Createposts = () => {
  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page">
          <CreateP />
        </div>
        {/* <Rightnav /> */}
      </div>
    </div>
  );
};

export default Createposts;
