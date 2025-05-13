import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../db/Userschema.js";
import env from "dotenv";

env.config();

let counter = 100;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        let username = `User${
          profile.emails[0].value.split("@")[0]
        }${Date.now()}`;
        const newUser = await User.create({
          googleId: profile.id,
          username,
          email: profile.emails[0].value,
          fullname:
            profile.displayName || profile.emails[0].value.split("@")[0],
          profile: profile.photos[0]?.value || "",
        });

        done(null, newUser);
      } catch (err) {
        done(err, null);
        console.log(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);
