const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  const { all } = req.query;
  let projects;
  
  if (all === 'true') {
    // Return all projects so users can browse and join
    projects = await Project.find().populate('createdBy', 'name email').populate('members.user', 'name email');
  } else {
    // Return only projects the user is a member of
    projects = await Project.find({ 'members.user': req.user._id }).populate('createdBy', 'name email').populate('members.user', 'name email');
  }
  res.status(200).json(projects);
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Please add title and description' });
  }

  const project = await Project.create({
    title,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'Admin' }],
  });

  res.status(201).json(project);
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedProject);
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  await project.deleteOne();
  res.status(200).json({ id: req.params.id });
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  const { userId, role } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.members.some(m => m.user.toString() === userId)) {
    return res.status(400).json({ message: 'User already a member' });
  }

  project.members.push({ user: userId, role: role || 'Member' });
  await project.save();
  res.status(200).json(project);
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/ProjectAdmin
const removeMember = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
  await project.save();
  res.status(200).json(project);
};

// @desc    Join project
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.members.some(m => m.user.toString() === req.user._id.toString())) {
    return res.status(400).json({ message: 'You are already a member' });
  }

  project.members.push({ user: req.user._id, role: 'Member' });
  await project.save();
  res.status(200).json(project);
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  joinProject,
};
