const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// جلب كل التنبيهات
router.get('/', (req, res) => {
  db.all(`SELECT * FROM alert_logs 
          ORDER BY timestamp DESC LIMIT 100`,
    [], (err, rows) => {
      if (err) return res.json([]);
      res.json(rows);
    });
});

// إضافة تنبيه
router.post('/', (req, res) => {
  const { type, message } = req.body;
  if (!type || !message) {
    return res.status(400).json({ error: 'type و message مطلوبان' });
  }
  db.run('INSERT INTO alert_logs (type, message) VALUES (?, ?)',
    [type, message], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, type, message });
    });
});

// حذف كل التنبيهات
router.delete('/', (req, res) => {
  db.run('DELETE FROM alert_logs', [], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;