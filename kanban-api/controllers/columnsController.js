const db = require('../db');

exports.createTask = async (req, res) => {
  const { task_str_id, title } = req.body;
  const columnId = req.params.column_str_id;

  const result = await db.query(
    'SELECT MAX(order_in_column) AS max FROM Tasks WHERE column_str_id = $1',
    [columnId]
  );
  const nextOrder = (result.rows[0].max || 0) + 1;

  await db.query(
    'INSERT INTO Tasks (task_str_id, column_str_id, title, order_in_column) VALUES ($1, $2, $3, $4)',
    [task_str_id, columnId, title, nextOrder]
  );
  res.status(201).json({ task_str_id, title, order_in_column: nextOrder });
};

exports.getTasks = async (req, res) => {
  const columnId = req.params.column_str_id;

  const tasks = await db.query(
    'SELECT * FROM Tasks WHERE column_str_id = $1 ORDER BY order_in_column ASC',
    [columnId]
  );
  res.json(tasks.rows);
};
