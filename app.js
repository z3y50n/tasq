var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    flash = require("connect-flash"),
    LocalStrategy = require("passport-local").Strategy,
    GoogleStrategy = require("passport-google-oauth20").Strategy;

const dotenv = require("dotenv");
dotenv.config();

var User = require("./models/users");

// REQUIRE ROUTES
var indexRoutes = require("./routes/index"),
    boardRoutes = require("./routes/boards"),
    taskRoutes = require("./routes/tasks");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// SERVE STATIC FILES
app.use(express.static(__dirname + "/public"));

// METHOD OVERRIDE
app.use(methodOverride("_method"));

// FLASH
app.use(flash());

// EXPRESS SESSION
app.use(require("express-session")({
    secret: "Tony Stark",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/redirect"
}, (accessToken, refreshToken, profile, cb)=>{
    User.findOne({googleID:profile.id}, (err, user) => {
        if(err || !user){
            new User({
                username: profile.displayName,
                googleID: profile.id
            }).save().then((newUser) => {
                cb(null, newUser);
            });
        }else{
            cb(null, user);
        }
    });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// USE ROUTES
app.use("/", indexRoutes);
app.use("/boards", boardRoutes);
app.use("/boards/:id/tasks", taskRoutes);

// START SERVER
app.listen(process.env.PORT, () => {
    console.log("Started Server");
});