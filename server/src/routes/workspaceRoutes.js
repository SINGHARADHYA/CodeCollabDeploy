const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const protect = require('../middleware/authMiddleware');

// All workspace routes require the user to be logged in
router.use(protect);

router.post('/save', workspaceController.saveWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
