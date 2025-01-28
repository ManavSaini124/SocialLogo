// const { validate } = require("../model/user.model.js")
// const { options } = require("../routes/user.route.js")

const jwt = require('jsonwebtoken')

const async_handler = require('../util/asyncHandler.js')
const ApiResponse = require('../util/apiResponse.js')
const ApiError = require('../util/errorHandler.js')
const User = require('../model/user.model.js')

// for internal use only so no need to use asyncHandler , since we are already using it in our controller (just use try catch block)
const genrateAccessANDRefreshToken = async(user_id)=>{
    //1) find the user in our DB based on user_id
    //2) generate a new access token and refresh token
    //3) save the refresh token in the user document
    //4) return the access token and refresh token
    try{
        // database is in another continent
        const user = await User.findById(user_id);
        if (!user) {
            console.error("User not found");
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        // console.log({accessToken})

        const refreshToken = user.generateRefreshToken();
        // console.log({refreshToken})

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken}

    }catch(err){
        console.error("Error => ",err)
        throw new ApiError(500, "unable to genrate access and refresh token")
    }
}

const registerUser = async_handler(async (req, res) => {
    //1) get the data from the request
    //2) check if user exists in db
    //3) create a new user 
    //4) send the response

    if (!req.body) {
        throw new ApiError(400,"Request body is missing");
    }
    

    const { userName, email, fullname, password } = req.body;
    if([userName, email, fullname, password].some((field) => !field?.trim === "")){
        throw new ApiError(400, "Please provide all the fields");
    }

    // database is in another continent
    const userExists = await User.findOne(
        { $or: [{ userName }, { email }] }
    );

    if (userExists) {
        throw new ApiError(400, "User already exists");
    }

    // database is in another continent
    const newUser = await User.create({
        userName : userName.toLowerCase(),
        email : email.toLowerCase(),
        fullname,
        password,
    });

    // database is in another continent
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Sorry, User not created");
    }

    return res
        .status(200)
        .json(new ApiResponse(201, createdUser,"User created successfully"))  
        
})

const loginUser = async_handler(async(req,res)=>{
    //1) to login , we need ether username or email , password from req.body
    //2) now search in our db if the user exists based on their username or email
    //3) if user exists, check if the password is correct(we have a method in our model for this)
    //4) generate a token and send it to the user
    //5) attach these tokken in cookies 

    const { userName, email, password } = req.body;
    
    if(!userName && !email){
        throw new ApiError(400, "provide either username or password")
    }

    // database is in another continent
    const user = await User.findOne(
        { $or: [{ userName }, { email }] }
    )

    if(!user){
        throw new ApiError(404, "User not found in servers")
    }

    // database is in another continent
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "password provided by user is incorrect")
    }


    const { accessToken, refreshToken } = await genrateAccessANDRefreshToken(user._id);

    // one more db call to get the updated user
    const updatedUser = await User.findById(user._id).select("-password -refreshToken");

    options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, 
                {
                    user : updatedUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully")
            )
})

const LogoutUser = async_handler(async(req,res)=>{
    //1) for req.user , we get user id
    //2) find the user in db
    //3) remove the refresh token from the user document(use $set )
    //4) clear the cookies

    // console.log("User => ",req.user)
    const userId = req.user._id;

    // database is in another continent
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                refreshToken: null
            }
        },{
            new:true
        }
    )
    console.log("Updated User => ",updatedUser)

    options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAcessToken = async_handler(async(req,res)=>{
    //1) get the refresh token from the cookies or body depending on the app
    //2) verify the refresh token
    //3) get the user id from the refresh token

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(400, "no refersh token avilable")
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_JWT_SECRET);

        const user = await User.findById(decodedToken._id);

        if(!user){
            throw new ApiError(401, "invalid refresh token provided")
        }

        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "refresh token is not same as in our db")
        }

        const { accessToken, refreshToken } = await genrateAccessANDRefreshToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, 
                {
                    accessToken,
                    refreshToken
                },
                "new access token generated successfully"
            ))
    }catch(err){
        console.error("Error => ",err)
        throw new ApiError(401, "invalid refresh token provided or expired")
    }
})



module.exports = { 
    registerUser,
    loginUser,
    LogoutUser,
    refreshAcessToken
 }