/*
================================================================================
|                                                                              |
|   js/app.js — Lógica del Dashboard de Usuario para PredictHealth             |
|   - Se conecta a la API de Flask (/api/dashboard_data).                      |
|   - Recibe datos de predicciones del usuario que ha iniciado sesión.         |
|   - Renderiza todos los gráficos y KPIs en el lado del cliente.              |
|                                                                              |
================================================================================
*/

// Único punto de verdad: La ruta de la API en nuestro backend de Flask.
const API_ENDPOINT = '/api/dashboard_data';

/* --------- Elementos del DOM ---------- */
const btnLoad = document.getElementById('btnLoad');
const lastUpdate = document.getElementById('lastUpdate');
const predTableBody = document.getElementById('predTableBody');
const factorsList = document.getElementById('factorsList');
const insightsArea = document.getElementById('insightsArea');
const btnExplain = document.getElementById('btnExplain');
const btnExport = document.getElementById('btnExport');

// Variables globales para los gráficos y los datos actuales.
let evolutionChart, distChart, gaugeDiabetes, gaugeHyper;
let currentRecords = [];

/* ------- Datos de Respaldo (si la API falla o no hay datos) ------- */
const fallbackRecords = [
  {id:'fb-001', patient:'Usuario de Demostración', age:45, diabetes:0.45, hyper:0.35, date:'2025-09-01'},
  {id:'fb-002', patient:'Usuario de Demostración', age:45, diabetes:0.33, hyper:0.25, date:'2025-08-29'},
  {id:'fb-003', patient:'Usuario de Demostración', age:45, diabetes:0.61, hyper:0.55, date:'2025-08-28'}
];

/* ------- Inicialización de Gráficos (con datos vacíos) ------- */
function initCharts() {
  const createChartConfig = (type, data, options) => ({ type, data, options });

  const ctxEvo = document.getElementById('evolutionChart').getContext('2d');
  evolutionChart = new Chart(ctxEvo, createChartConfig('line', {
    labels: ['Semana -3','Semana -2','Semana -1','Esta semana'],
    datasets: [
      { label: 'Diabetes (%)', data: [], tension:0.3, borderColor:'#e74c3c', fill:false },
      { label: 'Hipertensión (%)', data: [], tension:0.3, borderColor:'#f39c12', fill:false }
    ]
  }, { responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true, max:100 } } }));

  const ctxDist = document.getElementById('distChart').getContext('2d');
  distChart = new Chart(ctxDist, createChartConfig('bar', {
    labels:['Alto','Medio','Bajo'], datasets:[{ label:'% de casos', data:[], backgroundColor:['#e74c3c','#f39c12','#27ae60'] }]
  }, { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100 } } }));

  const gaugeOptions = { cutout:'75%', plugins:{ legend:{ display:false }, tooltip: { enabled: false } } };
  const ctxGaugeD = document.getElementById('gaugeDiabetes').getContext('2d');
  gaugeDiabetes = new Chart(ctxGaugeD, createChartConfig('doughnut', { labels:['Riesgo','Restante'], datasets:[{ data:[0,100], backgroundColor:['#e74c3c', '#EAECEE'] }] }, gaugeOptions));
    
  const ctxGaugeH = document.getElementById('gaugeHyper').getContext('2d');
  gaugeHyper = new Chart(ctxGaugeH, createChartConfig('doughnut', { labels:['Riesgo','Restante'], datasets:[{ data:[0,100], backgroundColor:['f39c12', '#EAECEE'] }] }, gaugeOptions));
}

/* ------- Renderiza TODA la UI a partir de una lista de registros ------- */
function renderRecords(records) {
  currentRecords = records; // Almacenamos los datos para usarlos en otras funciones (exportar, etc.)

  // 1. Renderizar la tabla de predicciones
  predTableBody.innerHTML = records.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.patient || 'Anon'}</td>
      <td>${r.age || '—'}</td>
      <td>${Math.round((r.diabetes || 0) * 100)}% / ${Math.round((r.hyper || 0) * 100)}%</td>
      <td>${r.date}</td>
    </tr>
  `).join('');

  // 2. Calcular y mostrar los KPIs (basados en el registro más reciente)
  const last = records[0] || {}; // El backend ya nos da los datos ordenados del más nuevo al más viejo
  const kpiDiab = Math.round((last.diabetes || 0) * 100);
  const kpiHyper = Math.round((last.hyper || 0) * 100);
  document.getElementById('kpiDiabetes').textContent = kpiDiab + '%';
  document.getElementById('kpiHyper').textContent = kpiHyper + '%';

  // 3. Actualizar los medidores (gauges)
  updateGauge(gaugeDiabetes, kpiDiab);
  updateGauge(gaugeHyper, kpiHyper);

  // 4. Actualizar el gráfico de evolución (con los últimos 4 registros)
  const evolutionPoints = records.slice(0, 4).reverse(); // Tomamos los 4 más nuevos y los invertimos para el gráfico
  evolutionChart.data.datasets[0].data = evolutionPoints.map(p => (p.diabetes || 0) * 100);
  evolutionChart.data.datasets[1].data = evolutionPoints.map(p => (p.hyper || 0) * 100);
  evolutionChart.update();

  // 5. Actualizar el gráfico de distribución de riesgo
  const counts = { high: 0, med: 0, low: 0 };
  records.forEach(r => {
    const riskScore = (r.diabetes || 0) * 100;
    if (riskScore >= 70) counts.high++;
    else if (riskScore >= 40) counts.med++;
    else counts.low++;
  });
  const total = Math.max(1, records.length);
  const distData = [
    Math.round(100 * counts.high / total),
    Math.round(100 * counts.med / total),
    Math.round(100 * counts.low / total)
  ];
  distChart.data.datasets[0].data = distData;
  distChart.update();

  // 6. Actualizar la lista de factores clave (simulado por ahora)
  factorsList.innerHTML = `
    <li class="list-group-item">Índice de Masa Corporal (IMC)</li>
    <li class="list-group-item">Nivel de actividad física</li>
    <li class="list-group-item">Historial familiar (genética)</li>
  `;

  // 7. Actualizar metadatos
  lastUpdate.textContent = new Date().toLocaleString();
  insightsArea.innerHTML = `<strong>Recomendación IA:</strong> Basado en la evolución, se sugiere un monitoreo continuo de la presión arterial.`;
}

/* ------- Función Auxiliar para Actualizar Medidores ------- */
function updateGauge(chart, valuePercent) {
  const v = Math.min(100, Math.max(0, valuePercent));
  chart.data.datasets[0].data = [v, 100 - v];
  chart.update();
}

/* ------- Carga los Datos desde el Backend de Flask ------- */
async function loadDataFromBackend() {
  btnLoad.disabled = true;
  btnLoad.textContent = 'Cargando...';

  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    const records = await response.json();
    
    // Si el backend devuelve una lista vacía (ej. usuario nuevo), usamos los datos de respaldo.
    if (records.length === 0) {
      console.warn("No se recibieron datos del servidor para este usuario, mostrando datos de demostración.");
      renderRecords(fallbackRecords);
    } else {
      renderRecords(records);
    }
  } catch (err) {
    console.error('Fallo al cargar datos del backend, usando datos de respaldo.', err);
    renderRecords(fallbackRecords);
  } finally {
    btnLoad.disabled = false;
    btnLoad.textContent = 'Refrescar Datos';
  }
}

/* ------- Acciones de la Interfaz de Usuario ------- */

// 1. Botón para refrescar los datos
btnLoad.addEventListener('click', loadDataFromBackend);

// 2. Botón para mostrar explicación de la IA
btnExplain.addEventListener('click', () => {
  const last = currentRecords[0] || fallbackRecords[0];
  const explanation = `
    <strong>Explicación Detallada (IA - Demo):</strong>
    <p class="small">La predicción de riesgo actual se basa en los siguientes factores clave:</p>
    <ul>
      <li class="small"><strong>Factor dominante:</strong> Historial de presión arterial elevado.</li>
      <li class="small"><strong>Factor secundario:</strong> Índice de Masa Corporal (IMC) por encima del rango ideal.</li>
      <li class="small"><strong>Recomendación:</strong> Se aconseja un plan de actividad física moderada (3-4 veces por semana) y una evaluación clínica para ajustar el tratamiento si es necesario.</li>
    </ul>
  `;
  insightsArea.innerHTML = explanation;
});

// 3. Botón para exportar los datos actuales a un archivo JSON
btnExport.addEventListener('click', () => {
  const dataStr = JSON.stringify(currentRecords, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `predicthealth_report_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

/* ------- Inicialización al Cargar la Página ------- */
window.addEventListener('DOMContentLoaded', () => {
  // Ocultamos los elementos de la interfaz que ya no se usan
  const demoButton = document.getElementById('btnDemo');
  const sourceSelector = document.getElementById('sourceSelect');
  if (demoButton) demoButton.style.display = 'none';
  if (sourceSelector) sourceSelector.style.display = 'none';
  
  // Renombramos el botón de carga principal
  btnLoad.textContent = 'Refrescar Datos';
  
  // Inicializamos los gráficos
  initCharts();
  
  // Cargamos los datos del backend automáticamente al entrar a la página
  loadDataFromBackend();
});