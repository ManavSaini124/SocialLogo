const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1) create modelSchema for user
// 2) make sure you encrypt the password before saving it to the database
// 3) create a method to check if the password is correct
// 4) create a method to generate a token (accessToken,refreshToken)

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:[true,"Please provide a username"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:[true,"Please provide a email"],
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:[true,"Please provide a fullname"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:function(){
            return this.isSocialLogin === false;
        },
        trim:true
    },
    refreshToken:{
        type:String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allow `null` or `undefined` values
    },
    isSocialLogin: {
        type: Boolean,
        default: false, 
    },
},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName,
            email:this.email,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_JWT_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_JWT_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

const User = mongoose.model("User",userSchema)

module.exports = User;

