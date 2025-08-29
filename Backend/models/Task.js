// // const mongoose = require("mongoose");

// // const attachmentSchema = new mongoose.Schema({
// //   id: { type: String, required: true },
// //   name: { type: String, required: true },
// //   size: { type: String, required: true },
// //   type: { type: String, required: true },
// //   url: { type: String }
// // }, { _id: false }); // Don't create _id for subdocuments

// // const taskSchema = new mongoose.Schema({
// //   title: { type: String, required: true },
// //   description: { type: String },
// //   deadline: { type: Date },
// //   priority: { 
// //     type: String, 
// //     enum: ["Low", "Medium", "High", "Urgent"], 
// //     default: "Medium" 
// //   },
// //   tags: [{ type: String }], // Be explicit about array of strings
// //   creator: { 
// //     type: mongoose.Schema.Types.ObjectId, 
// //     ref: 'User', 
// //     required: true 
// //   },
// //   assignees: [{ 
// //     type: mongoose.Schema.Types.ObjectId, 
// //     ref: 'User' 
// //   }],
// //   attachments: [attachmentSchema] // Use the schema we defined above
// // }, { timestamps: true });

// // module.exports = mongoose.model("Task", taskSchema);





// const mongoose = require("mongoose");

// const attachmentSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   name: { type: String, required: true },
//   size: { type: String, required: true },
//   type: { type: String, required: true },
//   url: { type: String }
// }, { _id: false }); // Don't create _id for subdocuments

// const taskSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   deadline: { type: Date },
//   status: { 
//     type: String, 
//     enum: ["Pending", "In Progress", "Completed", "On Hold"], 
//     default: "Pending" 
//   },
//   priority: { 
//     type: String, 
//     enum: ["Low", "Medium", "High", "Urgent"], 
//     default: "Medium" 
//   },
//   tags: [{ type: String }], 
//   creator: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User', 
//     required: true 
//   },
//   assignees: [{ 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   }],
//   attachments: [attachmentSchema],
//   completedAt: { type: Date }, // Track when task was completed
//   progress: { type: Number, default: 0, min: 0, max: 100 } // Progress percentage
// }, { 
//   timestamps: true 
// });

// // Add index for better query performance
// taskSchema.index({ creator: 1, status: 1 });
// taskSchema.index({ assignees: 1, status: 1 });

// // Pre-save middleware to set completedAt when status changes to Completed
// taskSchema.pre('save', function(next) {
//   if (this.isModified('status')) {
//     if (this.status === 'Completed') {
//       this.completedAt = new Date();
//       this.progress = 100;
//     } else if (this.status === 'Pending') {
//       this.progress = 0;
//     }
//   }
//   next();
// });

// module.exports = mongoose.model("Task", taskSchema);









const mongoose = require('mongoose');

// Define attachment subdocument schema
const attachmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  deadline: {
    type: Date
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Files attached to the task
  attachments: [attachmentSchema],
  // New fields for enhanced dashboard functionality
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  projectType: {
    type: String,
    enum: ['Design', 'Development', 'Marketing', 'Research', 'Other'],
    default: 'Other'
  },
  fidelity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Middleware to update completedAt when status changes to Completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.progress = 100;
    } else if (this.status === 'In Progress' && !this.startedAt) {
      this.startedAt = new Date();
      if (this.progress === 0) this.progress = 25;
    } else if (this.status === 'Pending') {
      this.startedAt = null;
      this.progress = 0;
    }
  }
  next();
});
      
// Index for better query performancea
taskSchema.index({ creator: 1, status: 1 });
taskSchema.index({ assignees: 1, status: 1 });
taskSchema.index({ deadline: 1, status: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ updatedAt: -1 });
taskSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);