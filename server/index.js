import express from "express";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import env from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
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

const port = process.env.PORT || 5000;

env.config();

const frontend = process.env.FRONTEND_URL;

mongoose
  .connect(process.env.MONGODB_CONNECTION_LINK)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_CONNECTION_LINK,
      collectionName: "sessions",
      stringify: false,
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(
  cors({
    origin: `${frontend}`,
    credentials: true,
  })
);
// app.use(cors({ origin: true, credentials: true }));
app.use("/interview", interviewRouter);
app.use("/api/autopost", autopost);

app.use("/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

app.get("/", async (req, res) => {
  try {
    const users = await User.find();
  } catch (err) {
    console.log(err);
  }
  res.send("Done!").status(200);
});

app.get("/home", (req, res) => {
  console.log("Hello");
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
