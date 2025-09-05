/* js/app.js — lógica para user_dashboard.html
   - Cambia API_BASE a la URL real cuando el backend esté listo.
   - Consume JSON y XML mocks (si no hay servidor).
*/

const API_BASE = './data'; // cuando tengas microservicio: 'https://api.tudominio.com'
const MOCK_JSON = `${API_BASE}/mock_predict.json`;
const MOCK_XML = `${API_BASE}/mock_predictions.xml`;

/* --------- DOM elements ---------- */
const btnLoad = document.getElementById('btnLoad');
const btnDemo = document.getElementById('btnDemo');
const sourceSelect = document.getElementById('sourceSelect');
const lastUpdate = document.getElementById('lastUpdate');
const predTableBody = document.getElementById('predTableBody');
const factorsList = document.getElementById('factorsList');
const insightsArea = document.getElementById('insightsArea');
const btnExplain = document.getElementById('btnExplain');
const btnExport = document.getElementById('btnExport');

let evolutionChart, distChart, gaugeDiabetes, gaugeHyper;
let currentRecords = [];

/* ------- Helper: fallback data (if fetch fails) ------- */
const fallbackRecords = [
  {id:'r-001', patient:'María López', age:52, diabetes:0.78, hyper:0.62, date:'2025-08-30'},
  {id:'r-002', patient:'Juan Pérez', age:39, diabetes:0.33, hyper:0.25, date:'2025-08-29'},
  {id:'r-003', patient:'Lucía Gómez', age:60, diabetes:0.61, hyper:0.55, date:'2025-08-28'},
  {id:'r-004', patient:'Demo User', age:45, diabetes:0.45, hyper:0.35, date:'2025-09-01'}
];

/* ------- Charts init ------- */
function initCharts() {
  const ctxEvo = document.getElementById('evolutionChart').getContext('2d');
  evolutionChart = new Chart(ctxEvo, {
    type: 'line',
    data: {
      labels: ['Semana -3','Semana -2','Semana -1','Esta semana'],
      datasets: [
        { label: 'Diabetes (%)', data: [22, 30, 28, 35], tension:0.3, borderColor:'#e74c3c', fill:false },
        { label: 'Hipertensión (%)', data: [18, 22, 20, 27], tension:0.3, borderColor:'#f39c12', fill:false }
      ]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ position:'top' } },
      interaction: { mode:'index', intersect:false },
      scales:{ y:{ beginAtZero:true, max:100 } }
    }
  });

  const ctxDist = document.getElementById('distChart').getContext('2d');
  distChart = new Chart(ctxDist, {
    type:'bar',
    data:{ labels:['Alto','Medio','Bajo'], datasets:[{ label:'% de casos', data:[30,45,25], backgroundColor:['#e74c3c','#f39c12','#27ae60'] }] },
    options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100 } } }
  });

  const ctxGaugeD = document.getElementById('gaugeDiabetes').getContext('2d');
  gaugeDiabetes = new Chart(ctxGaugeD, {
    type:'doughnut',
    data:{ labels:['Riesgo','Restante'], datasets:[{ data:[35,65] }] },
    options:{ cutout:'75%', plugins:{ legend:{ display:false } } }
  });

  const ctxGaugeH = document.getElementById('gaugeHyper').getContext('2d');
  gaugeHyper = new Chart(ctxGaugeH, {
    type:'doughnut',
    data:{ labels:['Riesgo','Restante'], datasets:[{ data:[27,73] }] },
    options:{ cutout:'75%', plugins:{ legend:{ display:false } } }
  });
}

/* ------- Render table & UI ------- */
function renderRecords(records) {
  currentRecords = records;
  predTableBody.innerHTML = records.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.patient || 'Anon'}</td>
      <td>${r.age || '—'}</td>
      <td>${Math.round(((r.diabetes||r.risk||0)*100))}% / ${Math.round(((r.hyper||0)*100))}%</td>
      <td>${r.date}</td>
    </tr>
  `).join('');

  // KPIs: compute average of last record (or compute aggregated)
  const last = records[0] || records[records.length-1];
  const avgDiab = Math.round(((last && (last.diabetes||last.risk||0))? (last.diabetes||last.risk)*100 : 0));
  const avgHyper = Math.round(((last && last.hyper)? last.hyper*100 : 0));
  document.getElementById('kpiDiabetes').textContent = avgDiab + '%';
  document.getElementById('kpiHyper').textContent = avgHyper + '%';

  // update gauges
  updateGauge(gaugeDiabetes, avgDiab);
  updateGauge(gaugeHyper, avgHyper);

  // update distribution chart from aggregated data
  const counts = {high:0, med:0, low:0};
  records.forEach(it => {
    const s = Math.round(((it.diabetes||it.risk||0)*100));
    if (s>=70) counts.high++;
    else if (s>=40) counts.med++;
    else counts.low++;
  });
  const total = Math.max(1, records.length);
  const newData = [ Math.round(100*counts.high/total), Math.round(100*counts.med/total), Math.round(100*counts.low/total) ];
  distChart.data.datasets[0].data = newData;
  distChart.update();

  // factors example (simulated)
  const topFactors = [
    {name:'IMC elevado', score:0.72},
    {name:'Edad > 45', score:0.55},
    {name:'Sedentarismo', score:0.43}
  ];
  factorsList.innerHTML = topFactors.map(f => `<li class="list-group-item d-flex justify-content-between align-items-center">${f.name}<span class="badge bg-primary rounded-pill">${Math.round(f.score*100)}%</span></li>`).join('');

  lastUpdate.textContent = new Date().toLocaleString();
  insightsArea.innerHTML = `<strong>Recomendación:</strong> Aumentar actividad física y seguimiento clínico en 3 meses. (IA - demo)`;
}

/* ------- Gauge helper ------- */
function updateGauge(chart, valuePercent) {
  const v = Math.min(100, Math.max(0, valuePercent));
  chart.data.datasets[0].data = [v, 100-v];
  chart.update();
}

/* ------- Loaders: JSON / XML ------- */
async function loadFromJson() {
  try {
    const r = await fetch(MOCK_JSON);
    const js = await r.json();
    // if single object, coerce into array
    if (!Array.isArray(js)) {
      // expected fields: patientId, name, age, risk_score, recommendation, date
      return [{ id: js.patientId || 'demo', patient: js.name || 'Demo', age: js.age || 0, diabetes: js.risk_score || js.risk || 0, hyper: js.risk_score || js.risk || 0, date: js.date || js.created_at || new Date().toISOString().slice(0,10) }];
    }
    // map arrays to our record format
    return js.map((it, idx) => ({ id: it.patientId || 'p-'+idx, patient: it.name || it.patient || 'Anon', age: it.age || 0, diabetes: it.risk_score || it.diabetes || it.risk || 0, hyper: it.hyper || it.risk || 0, date: it.date || it.created_at || '' }));
  } catch (err) {
    console.warn('JSON fetch failed, using fallback', err);
    return fallbackRecords;
  }
}

async function loadFromXml() {
  try {
    const r = await fetch(MOCK_XML);
    const txt = await r.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(txt, 'application/xml');
    const items = Array.from(xml.querySelectorAll('record')).map((node, idx) => ({
      id: node.querySelector('id')?.textContent || `x-${idx}`,
      patient: node.querySelector('patient')?.textContent || '',
      age: Number(node.querySelector('age')?.textContent || 0),
      diabetes: Number(node.querySelector('risk')?.textContent || 0),
      hyper: Number(node.querySelector('risk')?.textContent || 0),
      date: node.querySelector('date')?.textContent || ''
    }));
    return items;
  } catch (err) {
    console.warn('XML fetch failed, using fallback', err);
    return fallbackRecords;
  }
}

/* ------- UI Actions ------- */
btnLoad.addEventListener('click', async () => {
  btnLoad.disabled = true;
  btnLoad.textContent = 'Cargando...';
  const src = sourceSelect.value;
  let items = [];
  if (src === 'json') items = await loadFromJson();
  else items = await loadFromXml();
  renderRecords(items);
  btnLoad.disabled = false;
  btnLoad.textContent = 'Cargar datos';
});

btnDemo.addEventListener('click', async () => {
  renderRecords(fallbackRecords);
});

/* Show IA explanation modal-like area (simple) */
btnExplain.addEventListener('click', () => {
  const last = currentRecords[0] || fallbackRecords[0];
  const explanation = `
    <strong>Explicación IA (demo):</strong>
    <ul>
      <li>Factor dominante: IMC elevado (peso vs altura).</li>
      <li>Presión arterial sistólica: ${last && last.hyper? Math.round(last.hyper*100)+'%': '—'}</li>
      <li>Recomendación: Evaluación clínica y plan de actividad.</li>
    </ul>
  `;
  insightsArea.innerHTML = explanation;
});

/* Export currentRecords as JSON file */
btnExport.addEventListener('click', () => {
  const dataStr = JSON.stringify(currentRecords, null, 2);
  const blob = new Blob([dataStr], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `predicthealth_report_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/* ------- Init ------- */
window.addEventListener('DOMContentLoaded', () => {
  initCharts();
  // try auto-load JSON on start
  (async () => {
    const items = await loadFromJson();
    renderRecords(items);
  })();
});
