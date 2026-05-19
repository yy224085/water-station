const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { sendToArduino } = require('../serial');

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT pump, status FROM pump_logs
      WHERE id IN (SELECT MAX(id) FROM pump_logs GROUP BY pump)
    `).all();
    res.json(rows);
  } catch(e) { res.json([]); }
});

router.post('/control', (req, res) => {
  const { pump, action } = req.body;
  if (!pump || !action) return res.status(400).json({ error: 'مطلوب' });
  db.prepare('INSERT INTO pump_logs (pump, status) VALUES (?, ?)').run(pump, action);
  sendToArduino(`${pump}:${action}`);
  res.json({ success: true, pump, action });
});

module.exports = router;