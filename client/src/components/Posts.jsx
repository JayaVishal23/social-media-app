import React from "react";
import axios from "axios";
import PostCard from "./Postcard";
import { useState, useEffect } from "react";

const Posts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/posts/allposts"
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  return (
    <div className="posts-home">
      {posts.map((post, index) => (
        <PostCard
          key={index}
          title={post.title}
          text={post.text}
          images={post.media}
          user={post.user}
        />
      ))}
    </div>
  );
};

export default Posts;
