const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');
const db         = require('./config/db');
require('dotenv').config();

const pumpsRoute   = require('./routes/pumps');
const sensorsRoute = require('./routes/sensors');
const alertsRoute  = require('./routes/alerts');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/api/pumps',   pumpsRoute);
app.use('/api/sensors', sensorsRoute);
app.use('/api/alerts',  alertsRoute);

// ===== استقبال بيانات ESP32 =====
app.post('/api/esp32/data', (req, res) => {
  const data = req.body;
  console.log('📥 ESP32:', data);

  try {
    if (data.type === 'pump') {
      db.run('INSERT INTO pump_logs (pump, status) VALUES (?, ?)',
        [data.name, data.status]);
      io.emit('pump_update', { pump: data.name, status: data.status });
    }
    else if (data.type === 'sensor') {
      db.run('INSERT INTO sensor_logs (sensor, value) VALUES (?, ?)',
        [data.name, data.value]);
      io.emit('sensor_update', { sensor: data.name, value: data.value });
    }
    else if (data.type === 'event') {
      io.emit('system_event', { event: data.event });
    }
    else if (data.type === 'mode') {
      io.emit('mode_update', { mode: data.mode });
    }
    else {
      io.emit('arduino_data', { raw: data.raw, time: new Date() });
    }
  } catch(e) {
    console.error('❌ خطأ:', e.message);
  }

  res.json({ ok: true });
});

// ===== Socket.IO للمتصفح =====
io.on('connection', (socket) => {
  console.log('🌐 متصل:', socket.id);

  socket.on('pump_control', (data) => {
    console.log('🎮 أمر تحكم:', data);
    io.emit('send_to_esp32', {
      type:   'pump_control',
      pump:   data.pump,
      action: data.action
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ انقطع:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
});