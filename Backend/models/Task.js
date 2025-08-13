const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
  tags: [String],
 creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  attachments: [
    { id: Number, name: String, size: String, type: String }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
