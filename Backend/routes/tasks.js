// routes/tasks.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task"); // adjust path to your Task model

// Add or update title
router.put("/:id/title", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await Task.findByIdAndUpdate(req.params.id, { title }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update description
router.put("/:id/description", async (req, res) => {
  try {
    const { description } = req.body;
    if (description === undefined)
      return res.status(400).json({ message: "Description is required" });

    const task = await Task.findByIdAndUpdate(req.params.id, { description }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove brand
router.delete("/:id/brand", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $unset: { brand: "" } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove subtasks
router.delete("/:id/subtasks", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { subtasks: [] } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
