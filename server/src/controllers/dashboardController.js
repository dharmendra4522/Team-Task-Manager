const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'Admin';

    // Project count
    const projectQuery = isAdmin ? {} : { 'members.user': userId };
    const totalProjects = await Project.countDocuments(projectQuery);

    // Task stats
    const taskQuery = isAdmin ? {} : { assignedTo: userId };
    const tasks = await Task.find(taskQuery);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    
    const today = new Date();
    const overdueTasks = tasks.filter(t => {
      return new Date(t.dueDate) < today && t.status !== 'Done';
    }).length;

    // Grouped by status
    const statsByStatus = {
      Todo: tasks.filter(t => t.status === 'Todo').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      Done: completedTasks,
    };

    // Tasks per user aggregation
    const userProjects = await Project.find(projectQuery, '_id');
    const userProjectIds = userProjects.map(p => p._id);

    const tasksByUser = await Task.aggregate([
      { $match: { project: { $in: userProjectIds } } },
      { $group: {
          _id: "$assignedTo",
          total: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } 
          }
      }},
      { $lookup: { 
          from: "users", localField: "_id", 
          foreignField: "_id", as: "user" 
      }},
      { $unwind: "$user" },
      { $project: { 
          userName: "$user.name", 
          total: 1, completed: 1,
          pending: { $subtract: ["$total", "$completed"] }
      }}
    ]);

    res.status(200).json({
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      statsByStatus,
      tasksByUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
