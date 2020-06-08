var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    created: { type: Date, default: Date.now },
    deadline: Date
});

module.exports = mongoose.model("Task", taskSchema);