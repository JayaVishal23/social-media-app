import express from "express";
import Post from "../db/Postschema.js";
import upload from "../middleware/upload.js";
import User from "../db/Userschema.js";
import isAuthenticated from "../middleware/isAuth.js";

const router = express.Router();

router.get("/getuserself", isAuthenticated, async (req, res) => {
  if (req.isAuthenticated()) {
    const safeUser = await User.findById(req.user.id)
      .select("-googleId")
      .populate("followers", "username profile")
      .populate("following", "username profile");

    res.status(200).json({
      authenticated: true,
      user: safeUser,
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

router.put("/updateuser/:id", async (req, res) => {
  try {
    const userId = req.params.id.toString();
    const userId_auth = req.user._id.toString();
    const { username, email, fullname, bio, skills } = req.body;
    if (userId != userId_auth) {
      res.status(404).json("Invalid");
    }
    let user = await User.findById(userId);
    user.username = username;
    user.email = email;
    user.fullname = fullname;
    user.bio = bio;
    user.skills = skills;

    await user.save();
    res.status(201).json({ message: "Successfully changed" });
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
});

router.post("/getuser", isAuthenticated, async (req, res) => {
  try {
    const Uid = req.body.userId;
    const result = await User.findById(Uid)
      .select("-googleId")
      .populate("followers", "username profile")
      .populate("following", "username profile");

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(201).json(result);
  } catch (err) {
    console.log("Error" + err);
  }
});

router.post("/followunfollow", isAuthenticated, async (req, res) => {
  try {
    const fuserId = req.body.userId;
    const userId = req.user._id.toString();
    const user = req.user;
    const result = await User.findById(userId);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userId.toString() === fuserId.toString()) {
      return res
        .status(404)
        .json({ message: "You cant follow/unfollow yourself" });
    }

    if (result.following.includes(fuserId)) {
      //Following so unfollow
      await User.updateOne({ _id: fuserId }, { $pull: { followers: userId } });
      await User.updateOne({ _id: userId }, { $pull: { following: fuserId } });
      console.log("UnFollowed");

      return res.status(200).json({ follow: false, message: "UnFollowed" });
    } else {
      await User.updateOne(
        { _id: fuserId },
        { $addToSet: { followers: userId } }
      );
      await User.updateOne(
        { _id: userId },
        { $addToSet: { following: fuserId } }
      );
      console.log("Followed");
      return res.status(200).json({ follow: true, message: "Followed" });
    }
  } catch (err) {
    console.log("error in followunfollow " + err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.que;

    if (!query) {
      return res.status(400).json({ error: "Query parameter missing" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullname: { $regex: query, $options: "i" } },
      ],
    }).select("-googleId");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Search error" });
  }
});

export default router;
