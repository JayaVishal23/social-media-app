import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/login", (req, res) => {});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    successRedirect: "http://localhost:5173/home",
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173/");
  });
});

router.get("/check", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
