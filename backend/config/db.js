const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
require('dotenv').config();

const db = new sqlite3.Database(path.resolve(process.env.DB_PATH), (err) => {
  if (err) console.error('❌ خطأ قاعدة البيانات:', err.message);
  else console.log('✅ قاعدة البيانات جاهزة');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sensor_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor    TEXT    NOT NULL,
    value     INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pump_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    pump      TEXT    NOT NULL,
    status    TEXT    NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS alert_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    type      TEXT    NOT NULL,
    message   TEXT    NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;