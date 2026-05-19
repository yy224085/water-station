const Database = require('better-sqlite3');
const path     = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './backend/water.db';
const db     = new Database(path.resolve(dbPath));

db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor    TEXT    NOT NULL,
    value     INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS pump_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    pump      TEXT    NOT NULL,
    status    TEXT    NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS alert_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    type      TEXT    NOT NULL,
    message   TEXT    NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ قاعدة البيانات جاهزة');
module.exports = db;