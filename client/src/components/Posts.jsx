import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import PostCard from "./Postcard";

const Posts = () => {
  const backend = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState("explore"); // "explore" | "following"
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loaderRef = useRef(null);
  // Guards against the IntersectionObserver firing again while a page is
  // already in flight (it can re-trigger before isLoading state commits).
  const fetchingRef = useRef(false);

  const fetchPosts = useCallback(
    async ({ reset = false } = {}) => {
      if (fetchingRef.current) return;
      if (!reset && !hasMore) return;

      fetchingRef.current = true;
      setIsLoading(true);
      try {
        const params = { feed, limit: 10 };
        if (!reset && cursor) params.cursor = cursor;

        const { data } = await axios.get(`${backend}/api/posts/allposts`, {
          params,
          withCredentials: true,
        });

        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [backend, feed, cursor, hasMore]
  );

  // Reload from scratch whenever the active feed tab changes.
  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    fetchPosts({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  // Infinite scroll: load the next page when the sentinel enters the viewport.
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPosts();
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPosts]);

  return (
    <div className="posts-home">
      <div className="feed-tabs">
        <button
          className={`feed-tab ${feed === "explore" ? "active" : ""}`}
          onClick={() => setFeed("explore")}
        >
          Explore
        </button>
        <button
          className={`feed-tab ${feed === "following" ? "active" : ""}`}
          onClick={() => setFeed("following")}
        >
          Following
        </button>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post._id}
          title={post.title}
          text={post.text}
          images={post.media}
          user={post.user}
          postId={post._id}
          numlikes={post.numlikes}
          isliked={post.isliked}
          issaved={post.issaved}
          isowner={post.isowner}
          refreshposts={() => fetchPosts({ reset: true })}
          isfollowing={post.isfollowing}
        />
      ))}

      {isLoading && (
        <div className="spin-load">
          <span className="loader_"></span>
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <p className="feed-empty">
          {feed === "following"
            ? "No posts yet — follow some people to fill your feed."
            : "No posts yet."}
        </p>
      )}

      {/* Sentinel watched by the IntersectionObserver for infinite scroll. */}
      <div ref={loaderRef} style={{ height: 1 }} />

      {!hasMore && posts.length > 0 && (
        <p className="feed-end">You're all caught up.</p>
      )}
    </div>
  );
};

export default Posts;
