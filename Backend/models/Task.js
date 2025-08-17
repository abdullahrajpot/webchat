const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String }
}, { _id: false }); // Don't create _id for subdocuments

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Urgent"], 
    default: "Medium" 
  },
  tags: [{ type: String }], // Be explicit about array of strings
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  attachments: [attachmentSchema] // Use the schema we defined above
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);