const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const ApiError = require('../util/errorHandler.js');
const asyncHandler = require('../util/asyncHandler.js');
const { handleSocialLogin } = require('../controller/socialAuth.controller.js');

passport.serializeUser((user, done) => {
  console.log("Serializing User:", user);
    done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    try {
      const User = require("../model/user.model.js");
      const user = await User.findById(_id).select("-password -refreshToken");
      if (!user) throw new Error("User not found during deserialization");
      console.log("Deserialized User:", user);

      // console.log("deserializeUser:", user);
      done(null, user);
    } catch (err) {
      console.error("Error in deserializeUser:", err.message);
      done(err);
    }
});

passport.use(
    new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/v1/user/google/callback",
        scope: ['profile', 'email'] 
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
          // console.log("Google Profile:", profile);
          const user = await handleSocialLogin(profile);
          // console.log("✅ User After handleSocialLogin:", user);
          done(null, user);
        } catch (err) {
          console.error("Error in google strategy:", err.message);
          done(err, null);
        }
    }) 
)

module.exports = passport;
  
