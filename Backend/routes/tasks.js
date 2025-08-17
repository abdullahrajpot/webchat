const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/", auth, async (req, res) => {
  try {
    console.log('=== DEBUGGING REQUEST ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body type:', typeof req.body);
    console.log('Raw body:', JSON.stringify(req.body, null, 2));
    console.log('========================');

    const { title, description, deadline, priority, tags, assignees, attachments } = req.body;
    
    // Log each field individually
    console.log('Title:', title, '(type:', typeof title, ')');
    console.log('Description:', description, '(type:', typeof description, ')');
    console.log('Attachments:', attachments, '(type:', typeof attachments, ')');
    console.log('Tags:', tags, '(type:', typeof tags, ')');
    console.log('Assignees:', assignees, '(type:', typeof assignees, ')');
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Handle tags
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          processedTags = JSON.parse(tags);
        } catch (e) {
          processedTags = [tags]; // If it's just a single string
        }
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }

    // Handle assignees
    let processedAssignees = [];
    if (assignees) {
      if (typeof assignees === 'string') {
        try {
          processedAssignees = JSON.parse(assignees);
        } catch (e) {
          processedAssignees = [assignees]; // If it's just a single string
        }
      } else if (Array.isArray(assignees)) {
        processedAssignees = assignees;
      }
    }

    // Handle attachments - THIS IS THE KEY PART
    let processedAttachments = [];
    if (attachments) {
      console.log('Processing attachments...');
      
      if (typeof attachments === 'string') {
        console.log('Attachments is a string, trying to parse...');
        try {
          processedAttachments = JSON.parse(attachments);
          console.log('Successfully parsed attachments:', processedAttachments);
        } catch (e) {
          console.error('Failed to parse attachments string:', e);
          return res.status(400).json({ 
            success: false,
            message: "Invalid attachments format - could not parse JSON string",
            debug: { attachments, error: e.message }
          });
        }
      } else if (Array.isArray(attachments)) {
        console.log('Attachments is already an array');
        processedAttachments = attachments;
      } else {
        console.error('Attachments is neither string nor array:', typeof attachments);
        return res.status(400).json({ 
          success: false,
          message: "Attachments must be an array or a valid JSON string",
          debug: { attachments, type: typeof attachments }
        });
      }
    }

    console.log('Final processed attachments:', processedAttachments);

    // Validate each attachment has required fields
    if (processedAttachments && processedAttachments.length > 0) {
      for (const att of processedAttachments) {
        if (!att.id || !att.name || !att.size || !att.type) {
          return res.status(400).json({ 
            success: false,
            message: "Each attachment must have id, name, size, and type fields",
            debug: { attachment: att }
          });
        }
      }
    }

    // Validate assignees are valid users
    if (processedAssignees && processedAssignees.length > 0) {
      const users = await User.find({ _id: { $in: processedAssignees } });
      if (users.length !== processedAssignees.length) {
        return res.status(400).json({ message: "One or more assignees are invalid" });
      }
    }

    // Create the task data object
    const taskData = {
      title,
      description,
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || "Medium",
      tags: processedTags,
      assignees: processedAssignees,
      attachments: processedAttachments,
      creator: req.userId
    };

    console.log('Final task data before save:', JSON.stringify(taskData, null, 2));

    // Create new task
    const task = new Task(taskData);

    // Save task
    const savedTask = await task.save();
    console.log('Task saved successfully:', savedTask._id);

    // Populate creator and assignees for the response
    const populatedTask = await Task.findById(savedTask._id)
      .populate('creator', 'name email')
      .populate('assignees', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });

  } catch (error) {
    console.error("=== ERROR CREATING TASK ===");
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('==========================');
    
    res.status(500).json({ 
      success: false,
      message: "Server error while creating task",
      error: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;