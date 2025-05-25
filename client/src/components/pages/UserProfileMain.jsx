import React from "react";
import Nav from "../Nav";
import Leftnav from "../Leftnav";
import Posts from "../Posts";
import Rightnav from "../Rightnav";
import Userprofile from "./Userprofile";
import "../css/posts.css";
import "../css/profile.css";
import "../../App.css";

const UserProfileMain = () => {
  return (
    <div>
      <Nav />
      <div className="home-page">
        <Leftnav />
        <div className="posts-page userProfile-page">
          <Userprofile />
        </div>
      </div>
    </div>
  );
};

export default UserProfileMain;
