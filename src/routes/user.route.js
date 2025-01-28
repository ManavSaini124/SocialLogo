const express = require("express")
const verifyJwt = require("../middleware/auth.middleware.js")
const {registerUser,
        loginUser,
        LogoutUser,
        refreshAcessToken} = require("../controller/user.controller.js")

const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt,LogoutUser)
router.route("/refresh").post(refreshAcessToken)

module.exports = router;