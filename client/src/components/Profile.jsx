import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import "../components/css/profile.css";
import p_photo from "../assets/profile.png";
import dotenv from "dotenv";

const Profile = () => {
  const backend = import.meta.env.VITE_API_URL;
  const [fetched, setFetched] = useState(false);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(false);
  const [followingusers, setFollowingUsers] = useState(null);
  const [followerusers, setFollowerUsers] = useState(null);
  const [follow, setFollow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setchanged] = useState({
    username: "",
    email: "",
    fullname: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setchanged({
        username: user.username || "",
        email: user.email || "",
        fullname: user.fullname || "",
        bio: user.bio || "",
        skills: user.skills || "",
      });
    }
  }, [user]);
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backend}/api/users/getuserself`, {
        withCredentials: true,
      });
      setFetched(true);
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchfollowing = async () => {
    try {
      console.log(user);
      setFollowingUsers(user.following);
      setFollowing(true);
      setFollowers(false);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };
  const fetchfollowers = () => {
    try {
      setFollowerUsers(user.followers);
      setFollowers(true);
      setFollowing(false);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const editprofile = () => {
    setEdit(!edit);
  };

  const editprofilebackend = async () => {
    try {
      const response = await axios.put(
        `${backend}/api/users/updateuser/${user._id}`,
        {
          username: changed.username,
          email: user.email,
          fullname: changed.fullname,
          bio: changed.bio,
          skills: changed.skills,
        },
        {
          withCredentials: true,
        }
      );
      setFetched(true);
      fetchUser();
      alert("Done");
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setEdit(!edit);
  };
  return (
    <div className="full-profile-container">
      {edit ? (
        <div className="edit-container">
          <label>
            <span>Username:</span>
            <input
              type="text"
              name="username"
              value={changed.username}
              onChange={(e) =>
                setchanged({ ...changed, username: e.target.value })
              }
            />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={user.email} />
          </label>
          <label>
            FullName:
            <input
              type="text"
              name="fullname"
              value={changed.fullname}
              onChange={(e) =>
                setchanged({ ...changed, fullname: e.target.value })
              }
            />
          </label>
          <label>
            Bio:
            <input
              type="text"
              name="bio"
              value={changed.bio}
              onChange={(e) => setchanged({ ...changed, bio: e.target.value })}
            />
          </label>
          <label>
            Skills:
            <input
              type="text"
              name="skills"
              value={changed.skills}
              onChange={(e) =>
                setchanged({ ...changed, skills: e.target.value })
              }
            />
          </label>
          <button onClick={editprofilebackend} className="done-btn-edit">
            Done
          </button>
        </div>
      ) : (
        <div className="profile-card">
          {isLoading && (
            <div className="spin-load">
              <span className="loader_"></span>
            </div>
          )}
          {fetched && user && (
            <>
              <div className="profile-main-info">
                <div className="profile-edt">
                  <img
                    src={user.profile}
                    alt="Profile"
                    className="profile-pic"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = p_photo;
                    }}
                  />
                  <button className="edit-btn-profile" onClick={editprofile}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 svg-edt"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="profile-details">
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Full Name:</strong> {user.fullname}
                  </p>
                  <p>
                    <strong>Bio:</strong> {user.bio}
                  </p>
                  <p>
                    <strong>Skills:</strong> {user.skills}
                  </p>
                </div>
              </div>

              <div className="profile-follow-stats">
                <div
                  className={`follow-box ${
                    followers ? "follow-box-selected" : ""
                  }`}
                  onClick={fetchfollowers}
                >
                  <p className="follow-count">{user.followers?.length || 0}</p>
                  <p className="follow-label">Followers</p>
                </div>
                <div
                  className={`follow-box ${
                    following ? "follow-box-selected" : ""
                  }`}
                  onClick={fetchfollowing}
                >
                  <p className="follow-count">{user.following?.length || 0}</p>
                  <p className="follow-label">Following</p>
                </div>
              </div>
              <div className="follow-list">
                {followers &&
                  followerusers &&
                  followerusers.map((user, index) => (
                    <div key={index} className="follower-item f-t">
                      <div className="profile-user">
                        <img
                          src={user.profile}
                          alt="avatar"
                          className="avatar-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = p_photo;
                          }}
                        />
                        <span>{user.username}</span>
                      </div>
                      {/* <button className="follow-unfollow">
                      {!follow ? (
                        <p className="follow-btn fuf-btn">Follow</p>
                      ) : (
                        <p className="follow-btn fuf-btn">UnFollow</p>
                      )}
                    </button> */}
                    </div>
                  ))}

                {following &&
                  followingusers &&
                  followingusers.map((user, index) => (
                    <div key={index} className="follower-item">
                      <img
                        src={user.profile}
                        alt="avatar"
                        className="avatar-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = p_photo;
                        }}
                      />
                      <span>{user.username}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
