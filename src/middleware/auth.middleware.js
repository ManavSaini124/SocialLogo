const jwt = require("jsonwebtoken")
const User = require("../model/user.model")
const ApiError = require("../util/errorHandler")
const asyncHandler = require("../util/asyncHandler")

const verifyJwt = asyncHandler(async (req, res, next) => {
    //1) get the token ether from header or cookie
    //              => check if token received
    //2) decode the received token
    //3) check if the user is present in the database
    //4) store it in req.user

    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if(!token){
        throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_JWT_SECRET);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401, "invalid access token provided");
    }
    
    req.user = user; 

    next();  
})

module.exports = verifyJwt;
