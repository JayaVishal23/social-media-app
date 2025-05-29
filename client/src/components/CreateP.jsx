import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaVideo, FaTimes } from "react-icons/fa";
import "./css/createposts.css";
import dotenv from "dotenv";

const CreateP = () => {
  const backend = import.meta.env.VITE_API_URL;
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [edit, setEdit] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { postId } = useParams();

  useEffect(() => {
    if (postId) {
      console.log(postId);
      setEdit(true);
      getposttoedit();
    }
  }, [postId]);

  const getposttoedit = async () => {
    try {
      const post = await axios.post(
        `${backend}/api/posts/getpost`,
        { postid: postId },
        { withCredentials: true }
      );
      console.log(post.data);

      setText(post.data.text);
      setTitle(post.data.title);
      if (post.data.media && Array.isArray(post.data.media)) {
        const loadedMedia = post.data.media.map((item) => ({
          preview: typeof item === "string" ? item : item.url, // fallback
          type: (typeof item === "string" ? item : item.url)?.includes("video")
            ? "video"
            : "image",
          file: null,
        }));
        setMedia(loadedMedia);
      }
    } catch (err) {
      console.log("Error in getPost frontend" + err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + media.length > 5) {
      setError("You can upload a maximum of 5 files");
      return;
    }

    const newMedia = files.map((file) => ({
      file,
      type: file.type.startsWith("video") ? "video" : "image",
      preview: URL.createObjectURL(file),
    }));

    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);
      media.forEach((item) => {
        formData.append("media", item.file);
      });
      if (edit) {
        formData.append("postid", postId);
      }
      const url = edit
        ? `${backend}/api/posts/updatepost/${postId}`
        : `${backend}/api/posts/createpost`;

      const config = {
        method: edit ? "put" : "post",
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      };

      const response = await axios(config);
      setTitle("");
      setText("");
      setMedia([]);

      if (response.status === 201) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create New Post</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength="100"
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Content</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows="5"
          />
        </div>

        <div className="media-preview">
          {media.map((item, index) => (
            <div key={index} className="media-item">
              {item.type === "image" ? (
                <img src={item.preview} alt={`Preview ${index}`} />
              ) : (
                <video controls>
                  <source
                    src={item.preview}
                    type={item.file.type || "video/mp4"}
                  />
                  Your browser does not support the video tag.
                </video>
              )}
              <button
                type="button"
                className="remove-media"
                onClick={() => removeMedia(index)}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <FaImage /> Add Images/Videos
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
              style={{ display: "none" }}
            />
          </button>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !title || !text}
          >
            {isLoading ? "Posting..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateP;
