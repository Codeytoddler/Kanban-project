const express = require('express');
const router = express.Router();
const { moveTask, reorderTask } = require('../controllers/tasksController');

router.put('/:task_str_id/move', moveTask);
router.put('/:task_str_id/reorder', reorderTask);

module.exports = router;
