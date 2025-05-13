import express from "express";
import Post from "../db/Postschema.js";
import upload from "../middleware/upload.js";
import User from "../db/Userschema.js";

const router = express.Router();

router.get("/allposts", async (req, res) => {
  try {
    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username fullname profile");
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error in postRoutes" + err);
  }
});

router.post("/createpost", upload.array("media", 5), async (req, res) => {
  try {
    const media = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));
    const newPost = new Post({
      user: req.body.userId,
      title: req.body.title,
      text: req.body.text,
      media,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.log("Error in postRoutes" + err);
    res.status(401).json("Error in uploading");
  }
});

router.post("/getuser", async (req, res) => {
  try {
    const Uid = req.body.userId;
    const result = await User.find({ _id: Uid }, { googleId: 0 });
    res.status(201).json(result);
  } catch (err) {
    console.log("Error" + err);
  }
});

export default router;
