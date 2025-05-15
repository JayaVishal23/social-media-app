import express from "express";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import env from "dotenv";
import session from "express-session";
import bodyParser from "body-parser";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import interviewRouter from "./routes/interviewbot.js";
import autopost from "./routes/autopost.js";
import mongoose, { mongo } from "mongoose";
import User from "./db/Userschema.js";
import Post from "./db/Postschema.js";
import cors from "cors";
import "./routes/passport.js";

const app = express();
const port = 5000;

env.config();
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    saveUninitialized: true,
    resave: false,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
app.use(cors({ origin: true, credentials: true }));
app.use("/interview", interviewRouter);
app.use("/api/autopost", autopost);

mongoose
  .connect(process.env.MONGODB_CONNECTION_LINK)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", async (req, res) => {
  const users = await User.find();
  console.log(users);
  res.send("Done!").status(200);
});

app.listen(port, () => {
  console.log("Listening");
});
