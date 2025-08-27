const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const router = express.Router();

// Get dashboard stats for user
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get task counts by status for tasks where user is creator or assignee
    const taskStats = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { assignees: { $in: [userId] } }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total tasks count
    const totalTasks = await Task.countDocuments({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ]
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ],
      deadline: { $lt: new Date() },
      status: { $ne: 'Completed' }
    });

    // Format the stats
    const stats = {
      total: totalTasks,
      pending: 0,
      inProgress: 0,
      completed: 0,
      onHold: 0,
      overdue: overdueTasks
    };

    taskStats.forEach(stat => {
      switch(stat._id) {
        case 'Pending':
          stats.pending = stat.count;
          break;
        case 'In Progress':
          stats.inProgress = stat.count;
          break;
        case 'Completed':
          stats.completed = stat.count;
          break;
        case 'On Hold':
          stats.onHold = stat.count;
          break;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get task progress data for chart (last 7 days)
router.get('/dashboard/task-progress', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const progressData = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { assignees: { $in: [userId] } }
          ],
          updatedAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
          },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          avgProgress: { $avg: "$progress" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Fill in missing days with zero data
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayData = progressData.find(d => d._id.date === dateString);
      
      const progress = dayData ? Math.round(dayData.avgProgress || 0) : 0;
      const previousDay = result[result.length - 1];
      const change = previousDay ? progress - previousDay.progress : 0;

      result.push({
        date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        progress: progress,
        change: change,
        totalTasks: dayData ? dayData.totalTasks : 0,
        completedTasks: dayData ? dayData.completedTasks : 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project statistics
router.get('/dashboard/project-stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall completion percentage
    const allTasks = await Task.find({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ]
    });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = allTasks.filter(task => task.status === 'In Progress').length;
    
    const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const inProgressPercentage = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

    // Calculate weekly improvement
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const thisWeekCompleted = await Task.countDocuments({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ],
      status: 'Completed',
      updatedAt: { $gte: lastWeek }
    });

    const previousWeek = new Date();
    previousWeek.setDate(previousWeek.getDate() - 14);

    const lastWeekCompleted = await Task.countDocuments({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ],
      status: 'Completed',
      updatedAt: { 
        $gte: previousWeek,
        $lt: lastWeek
      }
    });

    const weeklyImprovement = lastWeekCompleted > 0 ? 
      Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100) : 
      thisWeekCompleted > 0 ? 100 : 0;

    res.json({
      completed: completedPercentage,
      inProgress: inProgressPercentage,
      activityRecord: {
        completed: completedPercentage,
        inProgress: inProgressPercentage,
        weeklyImprovement: Math.abs(weeklyImprovement)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's tasks
router.get('/dashboard/today-tasks', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await Task.find({
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ],
      $or: [
        {
          deadline: {
            $gte: today,
            $lt: tomorrow
          }
        },
        {
          createdAt: {
            $gte: today,
            $lt: tomorrow
          }
        }
      ]
    })
    .populate('creator', 'name email avatar')
    .populate('assignees', 'name email avatar')
    .sort({ priority: -1, createdAt: -1 })
    .limit(5);

    res.json(todayTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent projects with stats
router.get('/dashboard/recent-projects', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get tasks grouped by project/category for recent projects
    const recentProjects = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { assignees: { $in: [userId] } }
          ],
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: {
            category: "$category",
            priority: "$priority"
          },
          title: { $first: "$title" },
          description: { $first: "$description" },
          tasks: { $push: "$$ROOT" },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          assignees: { $addToSet: "$assignees" },
          latestUpdate: { $max: "$updatedAt" },
          priority: { $first: "$priority" },
          status: { $first: "$status" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignees",
          foreignField: "_id",
          as: "assigneeDetails"
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          totalTasks: 1,
          completedTasks: 1,
          progress: {
            $round: [
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }, 
              0
            ]
          },
          assigneeDetails: { $slice: ["$assigneeDetails", 4] },
          priority: 1,
          status: 1,
          category: "$_id.category"
        }
      },
      {
        $sort: { latestUpdate: -1 }
      },
      {
        $limit: 3
      }
    ]);

    // If no projects found, create some sample data based on actual tasks
    if (recentProjects.length === 0) {
      const sampleTasks = await Task.find({
        $or: [
          { creator: userId },
          { assignees: { $in: [userId] } }
        ]
      })
      .populate('assignees', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(3);

      const projects = sampleTasks.map(task => ({
        title: task.title,
        description: task.description || `${task.category || 'General'} project`,
        totalTasks: 1,
        completedTasks: task.status === 'Completed' ? 1 : 0,
        progress: task.progress || (task.status === 'Completed' ? 100 : 50),
        assigneeDetails: task.assignees || [],
        priority: task.priority,
        status: task.status,
        category: task.category || 'General'
      }));

      return res.json(projects);
    }

    res.json(recentProjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chart data (monthly/yearly)
router.get('/dashboard/chart', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'monthly' } = req.query;
    
    let groupBy, dateFormat;
    const currentDate = new Date();
    let startDate;

    if (period === 'yearly') {
      // Group by month for yearly view
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      startDate = new Date(currentDate.getFullYear(), 0, 1);
    } else {
      // Group by day for monthly view
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }

    const chartData = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { assignees: { $in: [userId] } }
          ],
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          created: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user tasks with pagination and filters
router.get('/user-tasks', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      deadline_start,
      deadline_end
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query
    const query = {
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ]
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Date range filter for today's tasks
    if (deadline_start && deadline_end) {
      query.deadline = {
        $gte: new Date(deadline_start),
        $lt: new Date(deadline_end)
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    if (!['Pending', 'In Progress', 'Completed', 'On Hold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    // Auto-update progress based on status
    if (status === 'Completed') task.progress = 100;
    else if (status === 'In Progress' && task.progress === 0) task.progress = 25;
    else if (status === 'Pending') task.progress = 0;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const userId = req.user._id;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { creator: userId },
        { assignees: { $in: [userId] } }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.progress = progress;
    
    // Auto-update status based on progress
    if (progress === 0) task.status = 'Pending';
    else if (progress === 100) task.status = 'Completed';
    else if (progress > 0) task.status = 'In Progress';

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      creator: req.user._id
    };

    const task = new Task(taskData);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const task = await Task.findOne({
      _id: req.params.id,
      creator: userId // Only creator can delete
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks for admin (with filters)
router.get('/admin-tasks', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build query - admin can see all tasks
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('creator', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (admin can update any task)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('creator', 'name email avatar')
     .populate('assignees', 'name email avatar');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task (admin can delete any task)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;