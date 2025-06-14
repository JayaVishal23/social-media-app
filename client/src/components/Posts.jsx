import React from "react";
import axios from "axios";
import PostCard from "./Postcard";
import { useState, useEffect } from "react";
import dotenv from "dotenv";

const Posts = () => {
  const backend = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [curUser, setCurUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backend}/api/posts/allposts`, {
        withCredentials: true,
      });
      const curr = await axios.get(`${backend}/auth/check`, {
        withCredentials: true,
      });
      setCurUser(curr.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="posts-home">
      {isLoading && (
        <div className="spin-load">
          <span className="loader_"></span>
        </div>
      )}
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
          isfollowing={post.isfollowing}
        />
      ))}
    </div>
  );
};

export default Posts;
