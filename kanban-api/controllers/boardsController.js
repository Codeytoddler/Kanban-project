const db = require('../db');

exports.getBoardView = async (req, res) => {
  const boardId = req.params.board_id;

  const board = await db.query('SELECT * FROM Boards WHERE board_id = $1', [boardId]);
  if (board.rows.length === 0) return res.status(404).json({ msg: 'Board not found' });

  const columns = await db.query(
    'SELECT * FROM Columns WHERE board_id = $1 ORDER BY order_on_board ASC',
    [boardId]
  );

  const columnIds = columns.rows.map(c => c.column_str_id);
  let tasks = [];
  if (columnIds.length) {
    const placeholders = columnIds.map((_, i) => `$${i + 2}`).join(',');
    tasks = await db.query(
      `SELECT * FROM Tasks WHERE column_str_id IN (${placeholders}) ORDER BY column_str_id, order_in_column ASC`,
      [boardId, ...columnIds]
    );
  }

  const tasksByColumn = {};
  tasks.rows.forEach(t => {
    tasksByColumn[t.column_str_id] = tasksByColumn[t.column_str_id] || [];
    tasksByColumn[t.column_str_id].push(t);
  });

  const columnsWithTasks = columns.rows.map(col => ({
    ...col,
    tasks: tasksByColumn[col.column_str_id] || []
  }));

  res.json({
    ...board.rows[0],
    columns: columnsWithTasks
  });
};

exports.createColumn = async (req, res) => {
  const { column_str_id, name, order_on_board } = req.body;
  const boardId = req.params.board_id;

  await db.query(
    'INSERT INTO Columns (column_str_id, board_id, name, order_on_board) VALUES ($1, $2, $3, $4)',
    [column_str_id, boardId, name, order_on_board]
  );
  res.status(201).json({ column_str_id, name, order_on_board, board_id: boardId });
};
