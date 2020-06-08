var express = require("express"),
    router = express.Router();

var middleware = require("../middleware");

var Board = require("../models/boards");
var Task = require("../models/tasks");
var User = require("../models/users");

// INDEX ROUTE BOARD
router.get("/", middleware.isLoggedIn, function (req, res) {
    Board.find({ members: req.user._id }, function (err, boards) {
        if (err) {
            console.log(err);
        } else {
            res.render("boards/index", { boards });
        }
    });
});

// NEW ROUTE BOARD
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("boards/new");
});

// CREATE ROUTE BOARD
router.post("/", middleware.isLoggedIn, function (req, res) {
    Board.create(req.body.board, function (err, newBoard) {
        if (err) {
            console.log(err);
        } else {
            admin = {
                id: req.user._id,
                username: req.user.username
            };
            newBoard.creator = admin;
            newBoard.members.push(req.user._id);
            newBoard.save();
            res.redirect("/boards");
        }
    });
});

// SHOW ROUTE BOARD
router.get("/:id", middleware.checkMembership, function (req, res) {
    Board.findById(req.params.id).populate("tasks").exec(function (err, foundBoard) {
        if (err || !foundBoard) {
            res.redirect("/boards");
        } else {
            res.render("boards/show", { board: foundBoard });
        }
    });
});

// EDIT ROUTE BOARD
router.get("/:id/edit", middleware.checkAuthority, function (req, res) {
    Board.findById(req.params.id, function (err, foundBoard) {
        if (err || !foundBoard) {
            console.log(err);
            res.redirect("/boards");
        } else {
            res.render("boards/edit", { board: foundBoard });
        }
    });
});

// UPDATE ROUTE BOARD
router.put("/:id", middleware.checkAuthority, function (req, res) {
    Board.findByIdAndUpdate(req.params.id, req.body.board, function (err, updatedBoard) {
        if (err) {
            res.redirect("/boards");
        } else {
            res.redirect(`/boards/${req.params.id}`);
        }
    });
});

// DESTROY ROUTE BOARD
router.delete("/:id", middleware.checkAuthority, function (req, res) {
    // FIRST DELETE ALL TASKS
    Board.findById(req.params.id, function (err, foundBoard) {
        foundBoard.tasks.forEach(function (task) {
            Task.findByIdAndDelete(task, function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/boards");
                }
            });
        });
    });

    // THEN DELETE THE BOARD
    Board.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/boards");
        } else {
            res.redirect("/boards");
        }
    });
});

// NEW MEMBER FORM
router.get("/:id/new_member", middleware.checkAuthority, (req, res) => {
    User.find({}, (err, foundUsers) =>{
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.render("boards/new_member", { board_id: req.params.id, users: foundUsers});
        }
    })
});

// ADD NEW MEMBER
router.post("/:id/new_member", middleware.checkAuthority, (req, res) => {
    Board.findById(req.params.id, (err, foundBoard) => {
        if (err || !foundBoard) {
            console.log(err);
            res.redirect(`/boards/${req.params.id}/new_member`);
        } else {
            User.find({ username: req.body.username }, (err, foundUser) => {
                if (err || foundUser.length === 0) {
                    console.log(err);
                    res.redirect(`/boards/${req.params.id}/new_member`);
                } else {
                    if(!foundBoard.members.includes(foundUser[0]._id)){
                        foundBoard.members.push(foundUser[0]._id);
                        foundBoard.save();
                        req.flash("success", "Added new member");
                    }
                    res.redirect(`/boards/${req.params.id}`);
                }
            });
        }
    });
});
module.exports = router;