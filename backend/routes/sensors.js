const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT sensor, value, timestamp FROM sensor_logs WHERE id IN (SELECT MAX(id) FROM sensor_logs GROUP BY sensor)'
    ).all();
    res.json(rows);
  } catch(e) {
    res.json([]);
  }
});

router.get('/:sensor/history', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT value, timestamp FROM sensor_logs WHERE sensor = ? ORDER BY timestamp DESC LIMIT 50'
    ).all(req.params.sensor);
    res.json(rows);
  } catch(e) {
    res.json([]);
  }
});

module.exports = router;