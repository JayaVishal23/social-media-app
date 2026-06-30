import express from "express";
import mongoose from "mongoose";
import Post from "../db/Postschema.js";
import upload from "../middleware/upload.js";
import User from "../db/Userschema.js";
import isAuthenticated from "../middleware/isAuth.js";

const router = express.Router();

// Personalized, paginated feed.
//   ?feed=following  -> posts from people you follow (plus your own)
//   ?feed=explore    -> all posts (default)
//   ?cursor=<_id>    -> keyset cursor: return posts older than this _id
//   ?limit=<n>       -> page size (default 10, max 50)
//
// Keyset pagination on the indexed _id field (ObjectIds are monotonic by
// creation time) avoids the O(n) cost of skip() on large offsets. The
// per-post flags (isliked/issaved/isfollowing/isowner/numlikes) are computed
// inside an aggregation pipeline instead of in JS, so the DB does the set
// membership work and we ship a slimmer payload (likes/comments arrays dropped).
router.get("/allposts", isAuthenticated, async (req, res) => {
  try {
    const me = req.user;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const feed = req.query.feed === "following" ? "following" : "explore";

    const match = {};

    if (req.query.cursor) {
      if (!mongoose.Types.ObjectId.isValid(req.query.cursor)) {
        return res.status(400).json({ message: "Invalid cursor" });
      }
      match._id = { $lt: new mongoose.Types.ObjectId(req.query.cursor) };
    }

    if (feed === "following") {
      match.user = { $in: [...me.following, me._id] };
    }

    const posts = await Post.aggregate([
      { $match: match },
      { $sort: { _id: -1 } },
      { $limit: limit + 1 }, // fetch one extra to detect a next page
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
          pipeline: [
            { $project: { _id: 1, username: 1, fullname: 1, profile: 1 } },
          ],
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          numlikes: { $size: "$likes" },
          isliked: { $in: ["$_id", me.likedposts] },
          issaved: { $in: ["$_id", me.savedposts] },
          isowner: { $eq: ["$user._id", me._id] },
          isfollowing: { $in: ["$user._id", me.following] },
        },
      },
      { $project: { likes: 0, comments: 0 } },
    ]);

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop(); // remove the extra probe item
    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;

    res.status(200).json({ posts, nextCursor, hasMore });
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
