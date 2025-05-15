import React from "react";
import axios from "axios";
import PostCard from "./Postcard";
import { useState, useEffect } from "react";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [curUser, setCurUser] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/posts/allposts",
        {
          withCredentials: true,
        }
      );
      const curr = await axios.get("http://localhost:5000/auth/check", {
        withCredentials: true,
      });
      setCurUser(curr.data);
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
          postId={post._id}
          numlikes={post.numlikes}
          isliked={post.isliked}
          issaved={post.issaved}
          isowner={post.isowner}
          refreshposts={fetchPosts}
        />
      ))}
    </div>
  );
};

export default Posts;
