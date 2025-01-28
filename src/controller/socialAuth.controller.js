const apiResponse = require('../util/apiResponse.js')
const ApiError = require('../util/errorHandler.js')
const async_handler = require('../util/asyncHandler.js')
const User = require('../model/user.model.js')
const ApiResponse = require('../util/apiResponse.js')

const handleSocialLogin = async_handler(async (profile) => {
    if (!profile.emails || !profile.emails[0]) {
        console.error("No email provided by Google.");
        throw new ApiError(500,"No email provided by Google.");
    }

    const user = await User.findOne(
        {$or: [{googleId: profile.id}, {email: profile.emails[0].value}]}
    )

    // console.log("User => ",user)


    if(user){
        return user
    }

    const newUser = await User.create({
        googleId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        fullname: profile.displayName,
        isSocialLogin: true,
    });

    // console.log("New User => ",newUser)

    return newUser;
})

const getProfile = async_handler(async (req, res) => {
    console.log("in get profile");
    if(!req.user){
        throw new ApiError(401, "Unauthorized access");
    }

    res.status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"))
})

module.exports = {handleSocialLogin, getProfile}
  