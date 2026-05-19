// ===== وضع ليلي / نهاري =====
function toggleTheme() {
  const body = document.body;
  const btn  = document.getElementById('theme-btn');
  body.classList.toggle('light-mode');
  if (body.classList.contains('light-mode')) {
    btn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    btn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

// تطبيق الثيم المحفوظ عند التحميل
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = '🌙';
  }
});
const socket = io();

// ===== اتصال =====
socket.on('connect', () => {
  document.getElementById('connection-status').textContent = '🟢 متصل';
  document.getElementById('connection-status').className = 'status-online';
  addLog('✅ متصل بالسيرفر', 'sensor');
  loadInitialData();
});

socket.on('disconnect', () => {
  document.getElementById('connection-status').textContent = '⚫ غير متصل';
  document.getElementById('connection-status').className = 'status-offline';
  addLog('❌ انقطع الاتصال', 'pump-off');
});

// ===== استقبال تحديث مضخة =====
socket.on('pump_update', (data) => {
  updatePump(data.pump, data.status === 'ON');
  addLog(`⚙️ ${data.pump} → ${data.status}`,
    data.status === 'ON' ? 'pump-on' : 'pump-off');
  checkPumpAlert(data.pump, data.status);
  updatePumpChart(data.pump, data.status === 'ON');
});

// ===== استقبال تحديث حساس =====
socket.on('sensor_update', (data) => {
  updateSensor(data.sensor, data.value > 0);
  addLog(`🔵 ${data.sensor} → ${data.value > 0 ? 'ممتلئ' : 'فارغ'}`, 'sensor');
  checkSensorAlert(data.sensor, data.value);
  updateSensorChart(data.sensor, data.value);
});

// ===== استقبال حدث النظام =====
socket.on('system_event', (data) => {
  const events = {
    'SYS1_START':  '🟢 خزان 1 بدأ',
    'SYS3_START':  '🟢 خزان 3 بدأ',
    'STOP1_BEGIN': '🔴 إيقاف تدريجي خزان 1',
    'STOP3_BEGIN': '🔴 إيقاف تدريجي خزان 3',
    'STOP1_DONE':  '⏹ خزان 1 متوقف',
    'STOP3_DONE':  '⏹ خزان 3 متوقف',
    'STOP_ALL':    '🛑 كل المضخات متوقفة',
    'J0_RESTART':  '🔄 إعادة تشغيل خزان 1',
    'J4_RESTART':  '🔄 إعادة تشغيل خزان 3',
  };
  addLog(events[data.event] || '📢 ' + data.event, 'sensor');
  checkEventAlert(data.event);
});

// ===== استقبال تحديث الوضع =====
socket.on('mode_update', (data) => {
  addLog(`🔧 الوضع: ${data.mode === 'MANUAL' ? 'يدوي' : 'تلقائي'}`, 'sensor');
});

// ===== استقبال raw =====
socket.on('arduino_data', (data) => {
  addLog('📡 ' + data.raw, '');
});

// ===== تحكم في المضخة من الموقع =====
function controlPump(pump, action) {
  socket.emit('pump_control', { pump, action });
  addLog(`🎮 أمر: ${pump} → ${action}`, action === 'ON' ? 'pump-on' : 'pump-off');
}

// ===== تحديث واجهة المضخة =====
function updatePump(name, isOn) {
  const el = document.getElementById('pump-' + name);
  if (!el) return;
  const status = el.querySelector('.pump-status');
  if (isOn) {
    status.textContent = '🟢 تعمل';
    status.className = 'pump-status on';
    el.classList.add('active');
  } else {
    status.textContent = 'متوقفة';
    status.className = 'pump-status off';
    el.classList.remove('active');
  }
}

// ===== تحديث واجهة الحساس =====
function updateSensor(name, isActive) {
  const el = document.getElementById('sensor-' + name);
  if (!el) return;
  const val = el.querySelector('.sensor-value');
  if (isActive) {
    val.textContent = '✅ ممتلئ';
    el.className = 'sensor-item active';
  } else {
    val.textContent = '❌ فارغ';
    el.className = 'sensor-item inactive';
  }
}

// ===== سجل الأحداث =====
function addLog(msg, type = '') {
  const log = document.getElementById('event-log');
  const p   = document.createElement('p');
  p.className = 'log-item ' + type;
  const time  = new Date().toLocaleTimeString('ar');
  p.textContent = time + ' — ' + msg;
  log.insertBefore(p, log.firstChild);
  if (log.children.length > 50) log.removeChild(log.lastChild);
}

// ===== جلب البيانات عند التحميل =====
async function loadInitialData() {
  try {
    const pumps = await fetch('/api/pumps').then(r => r.json());
    pumps.forEach(p => updatePump(p.pump, p.status === 'ON'));

    const sensors = await fetch('/api/sensors').then(r => r.json());
    sensors.forEach(s => updateSensor(s.sensor, s.value > 0));

    loadAlerts();
    initCharts();
  } catch(e) {
    console.error('خطأ:', e);
  }
}