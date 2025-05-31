import express from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const frontend = process.env.FRONTEND_URL;

router.post("/login", (req, res) => {});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const frontend = process.env.FRONTEND_URL;
    res.redirect(`${frontend}/home`);
  }
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(`${frontend}/`);
  });
});

router.get("/check", (req, res) => {
  if (req.isAuthenticated()) {
    const { googleId, ...safeUser } = req.user._doc;
    res.status(200).json({
      authenticated: true,
      user: safeUser,
    });
  } else {
    console.log("unauthorized");
    res.status(401).json({ authenticated: false });
  }
});

export default router;
