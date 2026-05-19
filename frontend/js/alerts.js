// ========== أنواع التنبيهات ==========
const ALERT_TYPES = {
  ERROR:   { icon: '🔴', label: 'خطأ',     class: 'alert-error'   },
  WARNING: { icon: '🟡', label: 'تحذير',   class: 'alert-warning' },
  INFO:    { icon: '🟢', label: 'معلومة',  class: 'alert-info'    },
};

// ========== إضافة تنبيه ==========
function addAlert(type, message) {
  const alert = ALERT_TYPES[type] || ALERT_TYPES.INFO;
  const time  = new Date().toLocaleTimeString('ar');

  // عرض في الواجهة
  showAlertBanner(alert, message, time);

  // حفظ في قاعدة البيانات
  fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, message })
  });

  // صوت تنبيه
  playAlertSound(type);
}

// ========== عرض البانر ==========
function showAlertBanner(alert, message, time) {
  const container = document.getElementById('alerts-container');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `alert-item ${alert.class}`;
  div.innerHTML = `
    <span class="alert-icon">${alert.icon}</span>
    <span class="alert-text">${message}</span>
    <span class="alert-time">${time}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.insertBefore(div, container.firstChild);

  // حذف تلقائي بعد 10 ثواني للمعلومات فقط
  if (alert.class === 'alert-info') {
    setTimeout(() => div.remove(), 10000);
  }

  // أقصى 20 تنبيه
  if (container.children.length > 20) {
    container.removeChild(container.lastChild);
  }
}

// ========== صوت تنبيه ==========
function playAlertSound(type) {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ERROR') {
      osc.frequency.value = 300;
      gain.gain.value = 0.3;
    } else if (type === 'WARNING') {
      osc.frequency.value = 600;
      gain.gain.value = 0.2;
    } else {
      osc.frequency.value = 900;
      gain.gain.value = 0.1;
    }

    osc.start();
    setTimeout(() => osc.stop(), 300);
  } catch(e) {}
}

// ========== قواعد التنبيهات التلقائية ==========
function checkPumpAlert(pump, status) {
  if (status === 'OFF' && isSystemRunning) {
    addAlert('ERROR', `مضخة ${pump} توقفت فجأة!`);
  }
}

function checkSensorAlert(sensor, value) {
  if (sensor === 'j0' && value === 0 && isSystemRunning) {
    addAlert('WARNING', `خزان 1 فارغ — سيبدأ الإيقاف التدريجي`);
  }
  if (sensor === 'j4' && value === 0 && isSystem3Running) {
    addAlert('WARNING', `خزان 3 فارغ — سيبدأ الإيقاف التدريجي`);
  }
}

function checkEventAlert(event) {
  const alerts = {
    'SYS1_START':  ['INFO',    'خزان 1 بدأ التشغيل'],
    'SYS3_START':  ['INFO',    'خزان 3 بدأ التشغيل'],
    'STOP1_BEGIN': ['WARNING', 'بدأ الإيقاف التدريجي لخزان 1'],
    'STOP3_BEGIN': ['WARNING', 'بدأ الإيقاف التدريجي لخزان 3'],
    'STOP1_DONE':  ['INFO',    'خزان 1 توقف بشكل طبيعي'],
    'STOP3_DONE':  ['INFO',    'خزان 3 توقف بشكل طبيعي'],
    'STOP_ALL':    ['ERROR',   'توقف طارئ — كل المضخات متوقفة!'],
    'J0_RESTART':  ['INFO',    'إعادة تشغيل خزان 1'],
    'J4_RESTART':  ['INFO',    'إعادة تشغيل خزان 3'],
  };
  if (alerts[event]) {
    addAlert(alerts[event][0], alerts[event][1]);
  }
}

// ========== تحميل التنبيهات السابقة ==========
async function loadAlerts() {
  try {
    const rows = await fetch('/api/alerts').then(r => r.json());
    rows.forEach(row => {
      const alert = ALERT_TYPES[row.type] || ALERT_TYPES.INFO;
      const time  = new Date(row.timestamp).toLocaleTimeString('ar');
      showAlertBanner(alert, row.message, time);
    });
  } catch(e) {}
}

// ========== مسح التنبيهات ==========
function clearAlerts() {
  fetch('/api/alerts', { method: 'DELETE' });
  const container = document.getElementById('alerts-container');
  if (container) container.innerHTML = '';
}

let isSystemRunning  = false;
let isSystem3Running = false;