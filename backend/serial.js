const { SerialPort } = require('serialport');
require('dotenv').config();

let port = null;
let ioRef = null;

function initSerial(io) {
  ioRef = io;

  port = new SerialPort({
    path: process.env.SERIAL_PORT,
    baudRate: parseInt(process.env.BAUD_RATE),
  });

  port.on('open', () => {
    console.log('✅ Serial متصل:', process.env.SERIAL_PORT);
  });

  port.on('data', (data) => {
    const msg = data.toString().trim();
    console.log('📥 Arduino:', msg);
    if (ioRef) ioRef.emit('arduino_data', { raw: msg, time: new Date() });
  });

  port.on('error', (err) => {
    console.error('❌ Serial Error:', err.message);
  });
}

function sendToArduino(cmd) {
  if (port && port.isOpen) {
    port.write(cmd + '\n', (err) => {
      if (err) console.error('❌ خطأ في الإرسال:', err.message);
      else console.log('📤 أُرسل للـ Arduino:', cmd);
    });
  } else {
    console.warn('⚠️ Serial غير متصل');
  }
}

module.exports = { initSerial, sendToArduino };