const db = require('../db');

exports.moveTask = async (req, res) => {
  const taskId = req.params.task_str_id;
  const { target_column_str_id, new_order_in_column } = req.body;

  const task = await db.query('SELECT * FROM Tasks WHERE task_str_id = $1', [taskId]);
  if (!task.rows.length) return res.status(404).send('Task not found');

  const oldCol = task.rows[0].column_str_id;
  const oldOrder = task.rows[0].order_in_column;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Remove gap in old column
    await client.query(
      'UPDATE Tasks SET order_in_column = order_in_column - 1 WHERE column_str_id = $1 AND order_in_column > $2',
      [oldCol, oldOrder]
    );

    // Shift tasks in new column
    await client.query(
      'UPDATE Tasks SET order_in_column = order_in_column + 1 WHERE column_str_id = $1 AND order_in_column >= $2',
      [target_column_str_id, new_order_in_column]
    );

    // Move task
    await client.query(
      'UPDATE Tasks SET column_str_id = $1, order_in_column = $2 WHERE task_str_id = $3',
      [target_column_str_id, new_order_in_column, taskId]
    );

    await client.query('COMMIT');
    res.send('Task moved');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.reorderTask = async (req, res) => {
  const taskId = req.params.task_str_id;
  const { new_order_in_column } = req.body;

  const task = await db.query('SELECT * FROM Tasks WHERE task_str_id = $1', [taskId]);
  if (!task.rows.length) return res.status(404).send('Task not found');

  const col = task.rows[0].column_str_id;
  const oldOrder = task.rows[0].order_in_column;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    if (new_order_in_column < oldOrder) {
      await client.query(
        'UPDATE Tasks SET order_in_column = order_in_column + 1 WHERE column_str_id = $1 AND order_in_column >= $2 AND order_in_column < $3',
        [col, new_order_in_column, oldOrder]
      );
    } else {
      await client.query(
        'UPDATE Tasks SET order_in_column = order_in_column - 1 WHERE column_str_id = $1 AND order_in_column > $2 AND order_in_column <= $3',
        [col, oldOrder, new_order_in_column]
      );
    }

    await client.query(
      'UPDATE Tasks SET order_in_column = $1 WHERE task_str_id = $2',
      [new_order_in_column, taskId]
    );

    await client.query('COMMIT');
    res.send('Task reordered');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
