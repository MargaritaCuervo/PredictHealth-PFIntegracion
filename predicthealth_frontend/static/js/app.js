/* js/app.js — Lógica para user_dashboard.html
   - Se conecta al endpoint /api/dashboard_data del backend de Flask.
   - Consume los datos procesados por el servidor para renderizar los componentes.
*/

// La API_ENDPOINT ahora apunta a la ruta que creamos en Flask.
const API_ENDPOINT = '/api/dashboard_data';

/* --------- DOM elements ---------- */
// El botón de carga ahora es un botón para refrescar los datos.
const btnRefresh = document.getElementById('btnLoad'); 
const lastUpdate = document.getElementById('lastUpdate');
const predTableBody = document.getElementById('predTableBody');
const factorsList = document.getElementById('factorsList');
const insightsArea = document.getElementById('insightsArea');
const btnExplain = document.getElementById('btnExplain');
const btnExport = document.getElementById('btnExport');

let evolutionChart, distChart, gaugeDiabetes, gaugeHyper;
// Almacena la última respuesta completa de la API.
let currentApiData = {}; 

/* ------- Helper: fallback data (si la API falla) ------- */
const fallbackData = {
    metadata: {
        lastUpdate: new Date().toISOString(),
        source: "Fallback Data (Error en API)"
    },
    kpis: { diabetesRisk: 0, hypertensionRisk: 0 },
    evolution: [
        {"week": "W1", "diabetes": 0, "hypertension": 0},
        {"week": "W2", "diabetes": 0, "hypertension": 0},
        {"week": "W3", "diabetes": 0, "hypertension": 0},
        {"week": "W4", "diabetes": 0, "hypertension": 0}
    ],
    keyFactors: ["No se pudieron cargar los datos."]
};

/* ------- Charts init: Inicializa los gráficos con datos vacíos ------- */
function initCharts() {
    const createChartConfig = (type, data, options) => ({ type, data, options });

    const ctxEvo = document.getElementById('evolutionChart').getContext('2d');
    evolutionChart = new Chart(ctxEvo, createChartConfig('line', {
        labels: ['Semana -3', 'Semana -2', 'Semana -1', 'Esta semana'],
        datasets: [
            { label: 'Diabetes (%)', data: [], tension: 0.3, borderColor: '#e74c3c', fill: false },
            { label: 'Hipertensión (%)', data: [], tension: 0.3, borderColor: '#f39c12', fill: false }
        ]
    }, { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, max: 100 } } }));

    const ctxDist = document.getElementById('distChart').getContext('2d');
    distChart = new Chart(ctxDist, createChartConfig('bar', {
        labels: ['Alto', 'Medio', 'Bajo'],
        datasets: [{ label: '% de casos', data: [], backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'] }]
    }, { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }));

    const gaugeOptions = { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } };
    const ctxGaugeD = document.getElementById('gaugeDiabetes').getContext('2d');
    gaugeDiabetes = new Chart(ctxGaugeD, createChartConfig('doughnut', { labels: ['Riesgo', 'Restante'], datasets: [{ data: [0, 100], backgroundColor: ['#e74c3c', '#EAECEE'] }] }, gaugeOptions));
    
    const ctxGaugeH = document.getElementById('gaugeHyper').getContext('2d');
    gaugeHyper = new Chart(ctxGaugeH, createChartConfig('doughnut', { labels: ['Riesgo', 'Restante'], datasets: [{ data: [0, 100], backgroundColor: ['#f39c12', '#EAECEE'] }] }, gaugeOptions));
}

/* ------- Renderiza toda la UI con datos de la API ------- */
function updateDashboard(data) {
    currentApiData = data;

    // 1. Actualizar KPIs y Gauges
    const { diabetesRisk, hypertensionRisk } = data.kpis;
    document.getElementById('kpiDiabetes').textContent = diabetesRisk.toFixed(1) + '%';
    document.getElementById('kpiHyper').textContent = hypertensionRisk.toFixed(1) + '%';
    updateGauge(gaugeDiabetes, diabetesRisk);
    updateGauge(gaugeHyper, hypertensionRisk);

    // 2. Actualizar gráfico de evolución
    evolutionChart.data.datasets[0].data = data.evolution.map(e => e.diabetes);
    evolutionChart.data.datasets[1].data = data.evolution.map(e => e.hypertension);
    evolutionChart.update();
    
    // 3. Actualizar lista de factores clave
    factorsList.innerHTML = data.keyFactors.map(f => `
        <li class="list-group-item">${f}</li>
    `).join('');

    // 4. Actualizar metadata e insights
    lastUpdate.textContent = new Date(data.metadata.lastUpdate).toLocaleString();
    insightsArea.innerHTML = `<strong>Recomendación IA:</strong> Basado en los factores de riesgo, se sugiere un monitoreo continuo.`;
    
    // Nota: La tabla de predicciones individuales se puede poblar si la API devuelve una lista
    // predTableBody.innerHTML = `<tr><td colspan="5">Datos agregados cargados.</td></tr>`;
}


/* ------- Gauge helper ------- */
function updateGauge(chart, valuePercent) {
    const v = Math.min(100, Math.max(0, valuePercent));
    chart.data.datasets[0].data = [v, 100 - v];
    chart.update();
}

/* ------- Carga los datos desde el backend de Flask ------- */
async function loadDataFromBackend() {
    btnRefresh.disabled = true;
    btnRefresh.textContent = 'Cargando...';
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            // Si el servidor responde con un error (ej. 401 No Autorizado), lanza una excepción.
            throw new Error(`Error del servidor: ${response.status}`);
        }
        const data = await response.json();
        updateDashboard(data);
    } catch (err) {
        console.error('Fallo al cargar datos del backend, usando fallback.', err);
        updateDashboard(fallbackData); // Muestra datos de respaldo en caso de error
        alert("No se pudieron cargar los datos del servidor. Mostrando datos de respaldo.");
    } finally {
        btnRefresh.disabled = false;
        btnRefresh.textContent = 'Refrescar Datos';
    }
}


/* ------- UI Actions ------- */

// El botón "Cargar Datos" ahora refresca la información desde el backend.
btnRefresh.addEventListener('click', loadDataFromBackend);

// El select de fuente ya no es necesario, pero lo ocultamos/deshabilitamos en el HTML si quieres.
// Lo mismo para el botón "Modo demo".

/* Exporta los datos actuales recibidos de la API */
btnExport.addEventListener('click', () => {
    const dataStr = JSON.stringify(currentApiData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predicthealth_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

/* ------- Init ------- */
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    // Carga automáticamente los datos del backend al iniciar.
    loadDataFromBackend();
});
