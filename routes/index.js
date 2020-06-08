var express = require("express"),
    router = express.Router(),
    passport = require("passport");

var User = require("../models/users");

// INDEX ROUTE
router.get("/", function (req, res) {
    res.render("landing");
});

// SHOW REGISTER
router.get("/register", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("register");
});

// REGISTER LOGIC
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Welcome to Tasq");
                res.redirect("/boards");
            });
        }
    });
});

// SHOW LOGIN
router.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("login");
});

// LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
    successRedirect: "/boards",
    failureRedirect: "/login",
    failureFlash: "Invalid username or password",
    successFlash: "Welcome!"
}), function (req, res) {
});

// GOOGLE AUTHENTICATION
router.get("/auth/google", passport.authenticate("google", {
    scope: ['profile']
}));

router.get("/auth/google/redirect", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/boards");
});

// LOGOUT ROUTE
router.get("/logout", function (req, res) {
    req.flash("error", "Goodbye");
    req.logout();
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;