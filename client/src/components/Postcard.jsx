import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
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
import CreateP from "./CreateP";
import Commentbox from "./Commentbox";
import dotenv from "dotenv";

const PostCard = ({
  title,
  text,
  images,
  user,
  postId,
  numlikes,
  isliked,
  issaved,
  isowner,
  refreshposts,
  isfollowing,
}) => {
  const backend = import.meta.env.VITE_API_URL;
  const [liked, setLiked] = useState(isliked);
  const [saved, setSaved] = useState(issaved);
  const [extended, setExtend] = useState(false);
  const [likeCount, setLikeCount] = useState(numlikes);
  const [follow, setFollow] = useState(isfollowing);
  const [commentBoxOpn, setCommentBoxOpn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLiked(isliked);
    setSaved(issaved);
    setFollow(isfollowing);
  }, [isliked, issaved, isfollowing]);

  const imageUrls =
    images?.filter((m) => m.type === "image").map((m) => m.url) || [];

  const previewText = text.split("\n").slice(0, 2).join(" ");
  const showMore = text.length > previewText.length || imageUrls.length > 1;

  const likeunlikeit = async () => {
    try {
      const result = await axios.post(
        `${backend}/api/posts/likeunlikeit`,
        { postId: postId },
        { withCredentials: true }
      );
      if (result.data.liked) {
        setLikeCount((prev) => prev + 1);
        setLiked(true);
      } else if (!result.data.liked) {
        setLikeCount((prev) => Math.max(prev - 1, 0));
        setLiked(false);
      }
    } catch (err) {
      console.error("Failed to like/unlike post Frontend:", err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      }
    }
  };

  const saveunsaveit = async () => {
    try {
      const result = await axios.post(
        `${backend}/api/posts/saveunsaveit`,
        { postId: postId },
        { withCredentials: true }
      );
      if (result.data.saved) {
        setSaved(true);
      } else if (!result.data.saved) {
        setSaved(false);
      }
    } catch (err) {
      console.error("Failed to save/unsave post Frontend:", err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      }
    }
  };
  const followunfollow = async () => {
    try {
      const result = await axios.post(
        `${backend}/api/users/followunfollow`,
        { userId: user._id },
        { withCredentials: true }
      );
      if (result.data.follow) {
        setFollow(true);
      } else if (!result.data.follow) {
        setFollow(false);
      }
      refreshposts();
    } catch (err) {
      console.error("Failed to follow/unfollow post Frontend:", err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      }
    }
  };

  const editpost = async () => {
    navigate(`/edit/${postId}`);
  };

  const handledelete = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmDelete) return;
      const result = await axios.post(
        `${backend}/api/posts/deletepost`,
        { postId: postId },
        { withCredentials: true }
      );
      if (result.data.deleted) {
        alert("Post deleted");
        refreshposts();
      } else if (!result.data.deleted) {
        alert("Post not deleted");
      }
    } catch (err) {
      console.error("Failed to save/unsave post Frontend:", err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      }
    }
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Here's a cool post you should see:",
          url: window.location.href, // or custom post URL
        });
        console.log("Post shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing is not supported in your browser.");
    }
  };

  const commentbox = async () => {
    setCommentBoxOpn(!commentBoxOpn);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={user.profile}
          alt="profile"
          className="profile-imgs"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = Profile;
          }}
        />
        <div className="user-info-del">
          <div className="user-info">
            <h3>{user?.username || "Unknown User"}</h3>
            <p>{user?.fullname || ""}</p>
          </div>
          {isowner ? (
            <div className="edit-delete">
              <button className="edit-btn" onClick={editpost}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
              <button className="delete-btn" onClick={handledelete}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button className="follow-unfollow" onClick={followunfollow}>
              {!follow ? (
                <p className="follow-btn fuf-btn">Follow</p>
              ) : (
                <p className="follow-btn fuf-btn">UnFollow</p>
              )}
            </button>
          )}
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
          <button onClick={likeunlikeit} className="action-btn">
            {liked ? <FaHeart className="liked" /> : <FaRegHeart />}
            <span>Like</span>
            <span>{likeCount}</span>
          </button>
          <button className="action-btn" onClick={commentbox}>
            <FaComment />
            <span>Comment</span>
          </button>
          <button className="action-btn" onClick={handleShare}>
            <FaShare />
            <span>Share</span>
          </button>
          <button onClick={saveunsaveit} className="action-btn">
            {saved ? <FaBookmark className="saved" /> : <FaRegBookmark />}
            <span>Save</span>
          </button>
        </div>
      </div>
      {commentBoxOpn && <Commentbox postId={postId} follow={isfollowing} />}
    </div>
  );
};

export default PostCard;
