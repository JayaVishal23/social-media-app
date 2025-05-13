import React from "react";
import Nav from "./Nav";
import Leftnav from "./Leftnav";
import Posts from "./Posts";
import Rightnav from "./Rightnav";

const Home = () => {
  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page">
          <Posts />
        </div>
        <Rightnav />
      </div>
    </div>
  );
};

export default Home;
