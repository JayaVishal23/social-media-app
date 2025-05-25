import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Userprofile = () => {
  const [fetched, setFetched] = useState(false);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(false);
  const [followingusers, setFollowingUsers] = useState(null);
  const [followerusers, setFollowerUsers] = useState(null);
  const { userId } = useParams();
  useEffect(() => {
    if (userId) {
      fetchUser();
      console.log(user);
    }
  }, [userId]);
  const fetchUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/getuser",
        { userId },
        {
          withCredentials: true,
        }
      );
      setFetched(true);
      setUser(response.data.user || response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
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
  return (
    <div className="profile-card">
      {!fetched && <p>Loading profile...</p>}
      {fetched && !user && <p>User not found.</p>}
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
              className={`follow-box ${followers ? "follow-box-selected" : ""}`}
              onClick={fetchfollowers}
            >
              <p className="follow-count">{user.followers?.length || 0}</p>
              <p className="follow-label">Followers</p>
            </div>
            <div
              className={`follow-box ${following ? "follow-box-selected" : ""}`}
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
  );
};

export default Userprofile;
