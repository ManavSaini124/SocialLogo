const apiResponse = require('../util/apiResponse.js')
const ApiError = require('../util/errorHandler.js')
const async_handler = require('../util/asyncHandler.js')
const User = require('../model/user.model.js')
const ApiResponse = require('../util/apiResponse.js')

const googleHandleSocialLogin = async (profile) => {
    // console.log("🔍 Google Profile Received in handleSocialLogin:", profile);
    if (!profile.emails || !profile.emails[0]) {
        console.error("No email provided by Google.");
        throw new ApiError(500,"No email provided by Google.");
    }

    // console.log("🔍 Searching for user with googleId or email...");

    const user = await User.findOne(
        {$or: [{googleId: profile.id}, {email: profile.emails[0].value}]}
    )

    // console.log("🔍 User found in DB:", user);

    if(user){
        // console.log("✅ Returning existing user:", user);
        return user
    }

    // console.log("🔍 Creating new user...");
    const newUser = await User.create({
        googleId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        fullname: profile.displayName,
        isSocialLogin: true,
    });

    // console.log("✅ New User Created:", newUser);
    return newUser;
}

const linkedInHandleSocialLogin = async(profile) => {
    if (!profile.emails || !profile.emails[0]) {
        console.error("No email provided by LinkedIn.");
        throw new ApiError(500,"No email provided by LinkedIn.");
    }

    // check if user already exists in db
    const user = await User.findOne({
        $or: [{linkedinId: profile.id}, {email: profile.emails[0].value}]
    })

    if(user){
        return user;
    }

    // create new user
    const newUser = await User.create({
        // TODO: refersh token is not provided (take a look to see if it is needed)
        linkedinId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        fullname: profile.displayName,
        isSocialLogin: true
    })

    if(!newUser){
        throw new ApiError(500, "Unable to create user");
    }

    return newUser;

};

const getProfile = async_handler(async (req, res) => {
    // console.log("in get profile");
    if(!req.user){
        throw new ApiError(401, "Unauthorized access");
    }

    res.status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"))
})

module.exports = {googleHandleSocialLogin,linkedInHandleSocialLogin , getProfile}
  