const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const { projectId } = req.query;
  let query = {};

  if (projectId) {
    query.project = projectId;
  }

  // If not admin, only show tasks assigned to them
  if (req.user.role !== 'Admin') {
    query.assignedTo = req.user._id;
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('project', 'title');
    
  res.status(200).json(tasks);
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { title, description, status, priority, assignedTo, project, dueDate } = req.body;

  if (!title || !project || !assignedTo || !dueDate) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  // Check if user is project admin
  const proj = await Project.findById(project);
  if (!proj) return res.status(404).json({ message: 'Project not found' });
  
  const member = proj.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member || member.role !== 'Admin') {
    return res.status(403).json({ message: 'Only project admins can create tasks' });
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo,
    project,
    dueDate,
  });

  res.status(201).json(task);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // If not project admin, only allow status update
  const project = await Project.findById(task.project);
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  const isProjAdmin = member && member.role === 'Admin';

  if (!isProjAdmin) {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    const { status } = req.body;
    task.status = status || task.status;
    await task.save();
    return res.status(200).json(task);
  }

  // If Project Admin, full update
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedTask);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if project admin
  const project = await Project.findById(task.project);
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member || member.role !== 'Admin') {
    return res.status(403).json({ message: 'Only project admins can delete tasks' });
  }

  await task.deleteOne();
  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
