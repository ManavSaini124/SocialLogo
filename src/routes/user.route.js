const express = require("express")
const verifyJwt = require("../middleware/auth.middleware.js")
const passport = require("passport");
const {getProfile} = require("../controller/socialAuth.controller.js")
const {registerUser,
        loginUser,
        LogoutUser,
        refreshAcessToken} = require("../controller/user.controller.js")

const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt,LogoutUser)
router.route("/refresh").post(refreshAcessToken)

// google auth
router.route("/google").get(passport.authenticate("google", {scope: ["profile", "email"] , state: true}))

router.get("/google/callback",passport.authenticate("google", { failureRedirect: "/api/v1/user/error" }),
  (req, res) => {
    // console.log("✅ Authentication successful! User:", req.user); // Debug log
    if (!req.user) {
      console.error("❌ No user found in req.user after authentication!");
      return res.redirect("/error");
    }
    res.redirect("/api/v1/user/profile");
  }
);
router.get("/profile", (req, res, next) => {
  // console.log("🔍 Checking Profile Route - req.user:", req.user); // Debug log
  // console.log("🔍 Checking Session:", req.session); // Debug log
    if (!req.isAuthenticated()) { 
      console.error("❌ Unauthorized Access to Profile");
      return res.status(401).json({ message: "Unauthorized" });
    }
    getProfile(req, res);
});
router.get("/error", (req, res) => {
        console.log("Error in Google OAuth.");
        res.status(401).json({ message: "Authentication failed. Please try again." });
      });

module.exports = router;