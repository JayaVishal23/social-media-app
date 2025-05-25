import express from "express";
import Post from "../db/Postschema.js";
import upload from "../middleware/upload.js";
import User from "../db/Userschema.js";
import isAuthenticated from "../middleware/isAuth.js";

const router = express.Router();

router.get("/allposts", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "_id username fullname profile");
    const newPosts = posts.map((post) => {
      const isliked = user.likedposts.includes(post._id);
      const issaved = user.savedposts.includes(post._id);
      const isowner = post.user._id.toString() === req.user._id.toString();
      const isfollowing = user.following.includes(post.user._id.toString());
      return {
        ...post.toObject(),
        isliked,
        issaved,
        isowner,
        isfollowing,
        numlikes: post.likes.length,
      };
    });

    res.status(200).json(newPosts);
  } catch (err) {
    console.log("Error in postRoutes" + err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/getpost", isAuthenticated, async (req, res) => {
  try {
    const postId = req.body.postid.toString();
    let post = await Post.findById(postId)
      .populate("user", "_id username fullname profile")
      .populate("comments.user", "_id username fullname profile");
    res.status(200).json(post);
  } catch (err) {
    console.log("Error in getPost" + err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/addcomment", async (req, res) => {
  try {
    const postId = req.body.postId.toString();
    const comment = req.body.comment;
    let post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const cmt = {
      text: comment,
      user: req.user._id,
    };

    post.comments.push(cmt);

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log("Error in add Comment" + err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/createpost", upload.array("media", 5), async (req, res) => {
  try {
    const media = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));
    const newPost = new Post({
      user: req.user._id,
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

router.put("/updatepost/:id", upload.array("media", 5), async (req, res) => {
  try {
    const postId = req.params.id;
    const media = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
    }));

    let post = await Post.findById(postId);
    post.title = req.body.title;
    post.text = req.body.text;

    const combinedMedia = [...post.media, ...media];

    post.media = combinedMedia;
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.log("Error in postRoutes" + err);
    res.status(401).json("Error in uploading");
  }
});

router.post("/deletepost", isAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const postId = req.body.postId;
  const post = await Post.findById(postId);
  try {
    if (!post) {
      return res.status(200).json({ deleted: false, message: "Not Deleted" });
    }
    if (userId.toString() === post.user._id.toString()) {
      await post.deleteOne();
      return res.status(200).json({ deleted: true, message: "Deleted" });
    } else {
      return res.status(200).json({ deleted: false, message: "Not Deleted" });
    }
  } catch (err) {
    console.log("Error in delete post backend " + err);
  }
});

router.post("/likeunlikeit", isAuthenticated, async (req, res) => {
  try {
    const postid = req.body.postId;
    const userId = req.user._id;
    const user = req.user;
    const result = await Post.findById(postid);
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }
    // console.log(userId);
    const likedPostIds = user.likedposts.map((id) => id.toString());
    // console.log(likedPostIds);
    if (likedPostIds.includes(postid)) {
      //Liked so dislike it
      // console.log("Disliked");
      await Post.updateOne({ _id: postid }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedposts: postid } });
      return res.status(200).json({ liked: false, message: "Unliked" });
    } else {
      await Post.updateOne({ _id: postid }, { $addToSet: { likes: userId } });
      await User.updateOne(
        { _id: userId },
        { $addToSet: { likedposts: postid } }
      );
      // console.log("liked");
      return res.status(200).json({ liked: true, message: "Liked" });
    }
  } catch (err) {
    console.log("error in likeunlikeit " + err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/saveunsaveit", isAuthenticated, async (req, res) => {
  try {
    const postid = req.body.postId;
    const userId = req.user._id;
    const user = req.user;
    const result = await Post.findById(postid);
    if (!result) {
      return res.status(404).json({ message: "Post not found" });
    }
    // console.log(userId);
    const savedPostIds = user.savedposts.map((id) => id.toString());
    // console.log(likedPostIds);
    if (savedPostIds.includes(postid)) {
      //Liked so dislike it
      console.log("unsaved");
      await User.updateOne({ _id: userId }, { $pull: { savedposts: postid } });
      return res.status(200).json({ saved: false, message: "Unsaved" });
    } else {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { savedposts: postid } }
      );
      console.log("saved");
      return res.status(200).json({ saved: true, message: "Saved" });
    }
  } catch (err) {
    console.log("error in likeunlikeit " + err);
    return res.status(500).json({ message: "Internal server error" });
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
