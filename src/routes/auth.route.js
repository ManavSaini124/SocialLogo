const express = require("express")
const passport = require("passport");
const {getProfile} = require("../controller/socialAuth.controller.js")

const router = express.Router()

router.route("/google").get(passport.authenticate("google", {scope: ["profile", "email"] , state: true}))
// router.route("/google").get((req, res, next) => {
//   console.log("Request received for Google OAuth.");
//   passport.authenticate("google", { scope: ["profile", "email"] , state: true})(req, res, next);
// });


// router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }),
//     (req, res) => {
//       res.redirect("/profile"); // Redirect after successful login
//     }
// );
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/error",
  }),
  (req, res) => {
    console.log("Authentication successful!");
    res.redirect("/profile");
  }
);
// router.get("/google/callback", (req, res, next) => {
//   console.log("Google OAuth callback triggered:", req.url);
//   next();
// }, passport.authenticate("google", { failureRedirect: "/" }));

router.get("/error", (req, res) => {
  console.log("Error in Google OAuth.");
  res.status(401).json({ message: "Authentication failed. Please try again." });
});

router.get("/profile", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    getProfile(req, res, next);
  });

  
module.exports = router;
  

