const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM alert_logs ORDER BY timestamp DESC LIMIT 100'
    ).all();
    res.json(rows);
  } catch(e) { res.json([]); }
});

router.post('/', (req, res) => {
  const { type, message } = req.body;
  if (!type || !message) return res.status(400).json({ error: 'مطلوب' });
  const result = db.prepare(
    'INSERT INTO alert_logs (type, message) VALUES (?, ?)'
  ).run(type, message);
  res.json({ id: result.lastInsertRowid, type, message });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM alert_logs').run();
  res.json({ success: true });
});

module.exports = router;