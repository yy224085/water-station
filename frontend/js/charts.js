let sensorChart = null;
let pumpChart   = null;

// ===== تهيئة الرسوم البيانية =====
function initCharts() {
  // رسم بياني الحساسات
  const sCtx = document.getElementById('sensor-chart');
  if (sCtx) {
    sensorChart = new Chart(sCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'J0 خزان1', data: [], borderColor: '#4fc3f7', tension: 0.4, fill: false },
          { label: 'J2 خزان2', data: [], borderColor: '#81c784', tension: 0.4, fill: false },
          { label: 'J4 خزان3', data: [], borderColor: '#ffb74d', tension: 0.4, fill: false },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#90a4ae' } }
        },
        scales: {
          x: { ticks: { color: '#90a4ae' }, grid: { color: '#1a3a6b' } },
          y: {
            ticks: { color: '#90a4ae' },
            grid:  { color: '#1a3a6b' },
            min: -0.1, max: 1.1,
            stepSize: 1
          }
        }
      }
    });
  }

  // رسم بياني المضخات
  const pCtx = document.getElementById('pump-chart');
  if (pCtx) {
    pumpChart = new Chart(pCtx, {
      type: 'bar',
      data: {
        labels: ['j18','j19','j20','j21','j22','j23','j24'],
        datasets: [{
          label: 'حالة المضخات',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: [
            '#1a3a6b','#1a3a6b','#1a3a6b',
            '#1a3a6b','#1a3a6b','#1a3a6b','#1a3a6b'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#90a4ae' } }
        },
        scales: {
          x: { ticks: { color: '#90a4ae' }, grid: { color: '#1a3a6b' } },
          y: {
            ticks: { color: '#90a4ae' },
            grid:  { color: '#1a3a6b' },
            min: 0, max: 1.2,
            stepSize: 1
          }
        }
      }
    });
  }

  loadChartHistory();
}

// ===== تحديث رسم الحساسات =====
function updateSensorChart(sensor, value) {
  if (!sensorChart) return;

  const sensorIndex = { 'j0': 0, 'j2': 1, 'j4': 2 };
  const idx = sensorIndex[sensor];
  if (idx === undefined) return;

  const time = new Date().toLocaleTimeString('ar');

  if (sensorChart.data.labels.length === 0 ||
      sensorChart.data.labels[sensorChart.data.labels.length - 1] !== time) {
    sensorChart.data.labels.push(time);
    sensorChart.data.datasets.forEach(ds => ds.data.push(null));
  }

  const last = sensorChart.data.labels.length - 1;
  sensorChart.data.datasets[idx].data[last] = value;

  // أقصى 20 نقطة
  if (sensorChart.data.labels.length > 20) {
    sensorChart.data.labels.shift();
    sensorChart.data.datasets.forEach(ds => ds.data.shift());
  }

  sensorChart.update('none');
}

// ===== تحديث رسم المضخات =====
function updatePumpChart(pump, isOn) {
  if (!pumpChart) return;

  const pumpIndex = {
    'j18': 0, 'j19': 1, 'j20': 2,
    'j21': 3, 'j22': 4, 'j23': 5, 'j24': 6
  };
  const idx = pumpIndex[pump];
  if (idx === undefined) return;

  pumpChart.data.datasets[0].data[idx] = isOn ? 1 : 0;
  pumpChart.data.datasets[0].backgroundColor[idx] = isOn ? '#4caf50' : '#1a3a6b';
  pumpChart.update('none');
}

// ===== تحميل تاريخ الحساسات =====
async function loadChartHistory() {
  if (!sensorChart) return;

  const sensors = ['j0', 'j2', 'j4'];
  const sensorIndex = { 'j0': 0, 'j2': 1, 'j4': 2 };

  for (const sensor of sensors) {
    try {
      const rows = await fetch(`/api/sensors/${sensor}/history`)
        .then(r => r.json());

      rows.reverse().forEach(row => {
        const time = new Date(row.timestamp).toLocaleTimeString('ar');
        const idx  = sensorIndex[sensor];

        if (!sensorChart.data.labels.includes(time)) {
          sensorChart.data.labels.push(time);
          sensorChart.data.datasets.forEach(ds => ds.data.push(null));
        }

        const labelIdx = sensorChart.data.labels.indexOf(time);
        sensorChart.data.datasets[idx].data[labelIdx] = row.value;
      });
    } catch(e) {}
  }

  sensorChart.update();
}