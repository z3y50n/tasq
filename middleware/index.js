var Board = require("../models/boards");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error","You need to be logged in");
    res.redirect("/login");
};

middlewareObj.checkMembership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Board.findById(req.params.id, (err, foundBoard) => {
            if (err || !foundBoard) {
                req.flash("error","Board not found");
                res.redirect("/boards");
            } else {
                if (foundBoard.members.includes(req.user._id)) {
                    next();
                } else {
                    req.flash("error","You don't have permission to do that");
                    res.redirect("/boards");
                }
            }
        });
    } else {
        req.flash("error", "Please Log In");
        res.redirect("/login");
    }
}

middlewareObj.checkAuthority = function (req, res, next) {
    if (req.isAuthenticated()) {
        Board.findById(req.params.id, (err, foundBoard) => {
            if(err || !foundBoard){
                req.flash("error","Board not found");
                res.redirect("/boards");
            }else{
                if(foundBoard.creator.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that");
                    res.redirect("/boards");
                }
            }
        });
    } else {
        req.flash("error", "Please Log In");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;