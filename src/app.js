const express = require("express")
const cookieParser = require("cookie-parser")
const passport = require("passport")
const session = require("express-session")


const connect = require("./db/connect")
const ApiError = require("./util/errorHandler")
const userRoute = require("./routes/user.route.js")



const app = express();
require("dotenv").config()

app.use(
    session({
        secret:process.env.SESSION_SECRET || "i_guess_env_file_is_not_working",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: false, 
            // sameSite: "lax",
        }
      
    })
)

app.use(passport.initialize())
app.use(passport.session())

// dont fuck with them , should always above your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// session config

require("./middleware/passport.middleware.js");
// TODO: add route of 3rd party auth

app.use("/api/v1/user", userRoute)
// app.get("/test-session", (req, res) => {
//     console.log("🔍 Session Data:", req.session);
//     res.json({ session: req.session });
// });

const port = process.env.PORT || 4000

const start = async () => {
    try {
        await connect(process.env.MONGODB_URI);
        app.listen(port, () => {
            console.log(`Server is running on port http://localhost:${port}`);
        });
    } catch (err) {
        new ApiError(500 , "server error occured")
    }
}

start()





