// ===== تصدير البيانات =====

async function exportToExcel() {
  try {
    // جلب البيانات
    const [pumps, sensors, alerts] = await Promise.all([
      fetch('/api/pumps').then(r => r.json()),
      fetch('/api/sensors').then(r => r.json()),
      fetch('/api/alerts').then(r => r.json()),
    ]);

    // إنشاء ملف Excel
    const wb = XLSX.utils.book_new();

    // ورقة المضخات
    const pumpsData = [
      ['المضخة', 'الحالة', 'آخر تحديث'],
      ...pumps.map(p => [p.pump, p.status === 'ON' ? 'تعمل' : 'متوقفة', p.timestamp || ''])
    ];
    const wsP = XLSX.utils.aoa_to_sheet(pumpsData);
    XLSX.utils.book_append_sheet(wb, wsP, 'المضخات');

    // ورقة الحساسات
    const sensorsData = [
      ['الحساس', 'القيمة', 'الحالة', 'آخر تحديث'],
      ...sensors.map(s => [
        s.sensor,
        s.value,
        s.value > 0 ? 'ممتلئ' : 'فارغ',
        s.timestamp || ''
      ])
    ];
    const wsS = XLSX.utils.aoa_to_sheet(sensorsData);
    XLSX.utils.book_append_sheet(wb, wsS, 'الحساسات');

    // ورقة التنبيهات
    const alertsData = [
      ['النوع', 'الرسالة', 'الوقت'],
      ...alerts.map(a => [
        a.type === 'ERROR' ? 'خطأ' : a.type === 'WARNING' ? 'تحذير' : 'معلومة',
        a.message,
        a.timestamp || ''
      ])
    ];
    const wsA = XLSX.utils.aoa_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(wb, wsA, 'التنبيهات');

    // تحميل الملف
    const date = new Date().toLocaleDateString('ar').replace(/\//g, '-');
    XLSX.writeFile(wb, `محطة-تحلية-${date}.xlsx`);

    addLog('📥 تم تصدير البيانات بنجاح', 'sensor');

  } catch(e) {
    console.error('خطأ في التصدير:', e);
    addLog('❌ فشل تصدير البيانات', 'pump-off');
  }
}

// ===== تصدير سجل الأحداث =====
async function exportHistory(sensor) {
  try {
    const rows = await fetch(`/api/sensors/${sensor}/history`)
      .then(r => r.json());

    const wb = XLSX.utils.book_new();
    const data = [
      ['الوقت', 'القيمة', 'الحالة'],
      ...rows.map(r => [
        r.timestamp,
        r.value,
        r.value > 0 ? 'ممتلئ' : 'فارغ'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sensor);
    XLSX.writeFile(wb, `سجل-${sensor}.xlsx`);

    addLog(`📥 تم تصدير سجل ${sensor}`, 'sensor');
  } catch(e) {
    addLog('❌ فشل التصدير', 'pump-off');
  }
}