const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust to your DB helper (pg, knex, sequelize, etc.)

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  const id = req.params.id;
  const { stage_id, progress } = req.body;

  if (stage_id == null || progress == null) {
    return res.status(400).json({ error: 'stage_id and progress are required' });
  }

  try {
    const result = await db.query(
      `UPDATE tasks
       SET stage_id = $1, progress = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, title, stage_id, progress`,
      [stage_id, progress, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
