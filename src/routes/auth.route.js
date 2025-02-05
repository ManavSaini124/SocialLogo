const express = require("express")
const passport = require("passport");
const {getProfile} = require("../controller/socialAuth.controller.js")

const router = express.Router()

// router.route("/linkedin").get(passport.authenticate("linkedin",{scope: ["profile", "email"] , state: true}))
router.route("/linkedin").get((req, res, next) => {
  console.log("Request received for linkedin OAuth.");
  passport.authenticate("linkedin", { scope: ["openid", "profile", "email"] , state: true})(req, res, next);
});
router.route("/linkedin/callback").get(passport.authenticate("linkedin",{ failureRedirect: "/api/v1/user/error" }),(req,res)=>{
  if (!req.user) {
    console.error("❌ No user found in req.user after authentication!");
    return res.redirect("/error"); 
  }
  res.redirect("/api/v1/user/profile");
}
)
router.route("/profile").get(getProfile);
  
module.exports = router; 
  

