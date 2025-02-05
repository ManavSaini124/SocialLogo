const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const linkedinStrategy = require('passport-linkedin-oauth2').Strategy;
const ApiError = require('../util/errorHandler.js');
const asyncHandler = require('../util/asyncHandler.js');
const { googleHandleSocialLogin ,
        linkedInHandleSocialLogin
      } = require('../controller/socialAuth.controller.js');

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

// google strategy
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
          console.log("Google Access Token:=> ", accessToken);
          console.log("Google Refresh Token:=> ", refreshToken);
  
          const user = await googleHandleSocialLogin(profile);
          // console.log("✅ User After handleSocialLogin:", user);
          done(null, user);
        } catch (err) {
          console.error("Error in google strategy:", err.message);
          done(err, null);
        }
    }) 
)

// linkedin strategy
passport.use(
  new linkedinStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_REDIRECT_URI,
    // TODO: Add the post scope for linkedin(w_member_social)
    // scope: ['r_emailaddress', 'r_liteprofile'],
    scope: ['openid', 'profile', 'email'],
    
  },
  async(accessToken, refreshToken, profile, done) => {
    try{
      console.log("LinkedIn Profile:", profile);
      console.log("LinkedIn Access Token:=> ", accessToken);
      // req.session.accessToken = accessToken;


      const user = await linkedInHandleSocialLogin(profile);
      console.log("✅ User After handleSocialLogin => ",user );
      //no error , return user
      done(null , user)


    }catch(err){
      console.error("Error in linkedin strategy:", err.message);
      done(err, null);
    }
  }
  )
)
// passport._strategy('linkedin').on('error', (err) => {
//   console.error("🔴 Passport Internal Error:", err);
// });

module.exports = passport;
  
