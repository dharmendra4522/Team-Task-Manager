const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  joinProject,
} = require('../controllers/projectController');
const { protect, isProjectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .put(protect, isProjectAdmin, updateProject)
  .delete(protect, isProjectAdmin, deleteProject);

router.post('/:id/join', protect, joinProject);
router.post('/:id/members', protect, isProjectAdmin, addMember);
router.delete('/:id/members/:userId', protect, isProjectAdmin, removeMember);

module.exports = router;
