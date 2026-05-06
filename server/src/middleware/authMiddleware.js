const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const isProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.body.project || req.query.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const Project = require('../models/Project');
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (member && member.role === 'Admin') {
    req.project = project; // Pass project to next middleware/controller
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as project admin' });
  }
};

const isProjectMember = async (req, res, next) => {
  const projectId = req.params.id || req.body.project || req.query.projectId;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });

  const Project = require('../models/Project');
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (member) {
    req.project = project;
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as project member' });
  }
};

module.exports = { protect, isAdmin, isProjectAdmin, isProjectMember };
