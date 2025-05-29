import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Profile from "../assets/profile-user-svgrepo-com.svg";
import dotenv from "dotenv";

const Commentbox = ({ postId, isfollowing }) => {
  const backend = import.meta.env.VITE_API_URL;
  const [commentText, setCommentText] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [follow, setFollow] = useState(isfollowing);

  useEffect(() => {
    const commentfunction = async () => {
      const res = await axios.post(
        `${backend}/api/posts/getpost`,
        { postid: postId },
        { withCredentials: true }
      );
      setPrevComments(res.data.comments || []);
      console.log(res.data.comments);
    };

    commentfunction();
  }, [postId]);

  const addCommment = async () => {
    try {
      const result = await axios.put(
        `${backend}/api/posts/addcomment`,
        { postId: postId, comment: commentText },
        { withCredentials: true }
      );
      setCommentText("");
      const res = await axios.post(
        `${backend}/api/posts/getpost`,
        { postid: postId },
        { withCredentials: true }
      );
      setPrevComments(res.data.comments || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="comment-main cmt-main-comments">
        {prevComments.length === 0 ? (
          <div className="cmt-main">No comments yet</div>
        ) : (
          prevComments.map((comment, ind) => {
            return (
              <div key={ind} className="cmt-main">
                <div className="post-header cmt-box-profile">
                  <img
                    src={comment.user.profile}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="profile-imgs cmt-profile-image"
                    onError={(e) => {
                      console.log("Image load error:", e.target.src);
                      e.target.onerror = null;
                      e.target.src = Profile;
                    }}
                  />
                  <div className="user-info-del cmt-user-info">
                    <div className="user-info cmt-user">
                      <h3>{comment.user?.username || "Unknown User"}</h3>
                      <p>{comment.user?.fullname || ""}</p>
                    </div>
                  </div>
                </div>
                <p className="cmt-text">{comment.text}</p>
              </div>
            );
          })
        )}
      </div>
      <div className="comment-foot">
        <input
          type="text"
          placeholder="write Comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="cmt-input"
        />
        <button onClick={addCommment} className="cmt-send">
          Send
        </button>
      </div>
    </div>
  );
};

export default Commentbox;
