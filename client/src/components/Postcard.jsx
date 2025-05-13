import React, { useState } from "react";
import {
  FaRegHeart,
  FaHeart,
  FaComment,
  FaShare,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import "../components/css/posts.css";
import Profile from "../assets/profile-user-svgrepo-com.svg";

const PostCard = ({ title, text, images, user }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [extended, setExtend] = useState(false);

  const imageUrls =
    images?.filter((m) => m.type === "image").map((m) => m.url) || [];

  const previewText = text.split("\n").slice(0, 2).join(" ");
  const showMore = text.length > previewText.length || imageUrls.length > 1;

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={Profile} alt="profile" className="profile-imgs" />
        <div className="user-info">
          <h3>{user.username}</h3>
          <p>{user.fullname}</p>
        </div>
      </div>

      <div className="post-content">
        <h2 className="post-title">{title}</h2>

        {!extended ? (
          <p className="post-text">
            {previewText}
            {showMore && (
              <span
                className="more-text"
                onClick={() => setExtend(true)}
                style={{ color: "blue", cursor: "pointer" }}
              >
                {" "}
                ...more
              </span>
            )}
          </p>
        ) : (
          <p className="post-text">
            {text}
            <span
              className="more-text"
              onClick={() => setExtend(!extended)}
              style={{ color: "blue", cursor: "pointer" }}
            >
              {" "}
              ...less
            </span>
          </p>
        )}

        <div className="post-images">
          {!extended
            ? imageUrls
                .slice(0, 1)
                .map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Post ${index + 1}`}
                    className="post-image"
                  />
                ))
            : imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Post ${index + 1}`}
                  className="post-image"
                />
              ))}
        </div>

        <div className="post-actions">
          <button onClick={() => setLiked(!liked)} className="action-btn">
            {liked ? <FaHeart className="liked" /> : <FaRegHeart />}
            <span>Like</span>
          </button>
          <button className="action-btn">
            <FaComment />
            <span>Comment</span>
          </button>
          <button className="action-btn">
            <FaShare />
            <span>Share</span>
          </button>
          <button onClick={() => setSaved(!saved)} className="action-btn">
            {saved ? <FaBookmark /> : <FaRegBookmark />}
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
