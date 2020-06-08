var express = require("express"),
    router = express.Router({ mergeParams: true });

var middleware = require("../middleware");

var Board = require("../models/boards");
var Task = require("../models/tasks");

// NEW ROUTE TASK
router.get("/new", middleware.checkMembership, function (req, res) {
    Board.findById(req.params.id, function (err, board) {
        if (err) {
            console.log(err);
        } else {
            res.render("tasks/new", { board });
        }
    });
});

// CREATE ROUTE TASK
router.post("/", middleware.checkMembership, function (req, res) {
    Board.findById(req.params.id, function (err, board) {
        if (err) {
            console.log(err);
            res.redirect("/boards");
        } else {
            Task.create(req.body.task, function (err, task) {
                if (err) {
                    console.log(err);
                    res.redirect("/boards");
                } else {
                    task.status = "On Going";
                    task.save();

                    board.tasks.push(task);
                    board.save();
                    res.redirect("/boards/" + req.params.id);
                }
            });
        }
    });
});

// SHOW ROUTE TASK
router.get("/:task_id", middleware.checkMembership, function (req, res) {
    Task.findById(req.params.task_id, function (err, task) {
        if (err) {
            console.log(err);
            res.redirect("/boards/" + req.params.id);
        } else {
            res.render("tasks/show", { task, board_id: req.params.id });
        }
    });
});

// EDIT ROUTE TASK
router.get("/:task_id/edit", middleware.checkMembership, function (req, res) {
    Task.findById(req.params.task_id, function (err, foundTask) {
        if (err || !foundTask) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("tasks/edit", { task: foundTask, board_id: req.params.id });
        }
    });
});

// UPDATE ROUTE TASK
router.put("/:task_id", middleware.checkMembership, function (req, res) {
    Task.findByIdAndUpdate(req.params.task_id, req.body.task, function (err) {
        if (err) {
            res.redirect("/boards/" + req.params.id + "/tasks");
        } else {
            res.redirect("/boards/" + req.params.id + "/tasks/" + req.params.task_id);
        }
    });
});

// DESTROY ROUTE TASK
router.delete("/:task_id", middleware.checkMembership, function (req, res) {
    // REMOVE TASK FROM BOARD
    Board.findById(req.params.id, function (err, foundBoard) {
        if (err || !foundBoard) {
            console.log(err);
            res.redirect("back");
        } else {
            for (var i = 0; i < foundBoard.tasks.length; i++) {
                if (foundBoard.tasks[i].equals(req.params.task_id)) {
                    foundBoard.tasks.splice(i, 1);
                    break;
                }
            }
        }
    });

    // DELETE TASK
    Task.findByIdAndRemove(req.params.task_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/boards/" + req.params.id);
        } else {
            res.redirect("/boards/" + req.params.id);
        }
    });
});

module.exports = router;