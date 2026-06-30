import axios from "axios";
import React, { useEffect, useState } from "react";
import Profile from "../assets/profile-user-svgrepo-com.svg";

const Commentbox = ({ postId }) => {
  const backend = import.meta.env.VITE_API_URL;
  const [commentText, setCommentText] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [me, setMe] = useState(null);

  // Load existing comments and the current user once, in parallel, when the
  // box opens. Knowing "me" up front lets us render new comments optimistically
  // (with the right avatar/name) instead of refetching the post after sending.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [postRes, meRes] = await Promise.all([
          axios.post(
            `${backend}/api/posts/getpost`,
            { postid: postId },
            { withCredentials: true }
          ),
          axios.get(`${backend}/auth/check`, { withCredentials: true }),
        ]);
        if (cancelled) return;
        setPrevComments(postRes.data.comments || []);
        setMe(meRes.data.user || null);
      } catch (err) {
        console.log(err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [postId, backend]);

  const addCommment = async () => {
    const text = commentText.trim();
    if (!text) return;

    // Optimistically show the comment immediately and clear the input.
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      text,
      user: {
        _id: me?._id,
        username: me?.username,
        fullname: me?.fullname,
        profile: me?.profile,
      },
    };
    setPrevComments((prev) => [...prev, optimistic]);
    setCommentText("");

    try {
      await axios.put(
        `${backend}/api/posts/addcomment`,
        { postId: postId, comment: text },
        { withCredentials: true }
      );
      // Saved — the optimistic comment already matches the persisted one,
      // so there's no need to refetch the whole post.
    } catch (err) {
      // Roll back and restore the text so the user can retry.
      setPrevComments((prev) => prev.filter((c) => c._id !== tempId));
      setCommentText(text);
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
              <div key={comment._id || ind} className="cmt-main">
                <div className="post-header cmt-box-profile">
                  <img
                    src={comment.user?.profile}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="profile-imgs cmt-profile-image"
                    onError={(e) => {
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
          onKeyDown={(e) => e.key === "Enter" && addCommment()}
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
