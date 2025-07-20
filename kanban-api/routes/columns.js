const express = require('express');
const router = express.Router();
const { createTask, getTasks } = require('../controllers/columnsController');

router.post('/:column_str_id/tasks', createTask);
router.get('/:column_str_id/tasks', getTasks);

module.exports = router;
