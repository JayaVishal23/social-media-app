import express from "express";
import dotenv from "dotenv";
import Post from "../db/Postschema.js";

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { title, text, media } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ autopost: false, message: "Invalid AI response" });
    }

    const newPost = new Post({
      user: req.user._id,
      title: title || "Agent Generated Post",
      text,
      media: media || [],
    });

    await newPost.save();

    res.status(201).json({
      autopost: true,
      message: "Post created successfully ",
      post: newPost,
    });
  } catch (err) {
    console.error("Error in autopost.js:", err);
    res.status(500).json({
      autopost: false,
      message: "Error in auto uploading",
      error: err.message,
    });
  }
});

export default router;
