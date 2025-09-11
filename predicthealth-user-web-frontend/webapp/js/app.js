// app.js - funciones para actualizar KPIs y consumir API
document.addEventListener('DOMContentLoaded', () => {
  // demo: actualizar KPIs desde datos simulado o desde /api/dashboard
  function updateKpis(data){
    document.getElementById('lastUpdate').textContent = data.updatedAt || new Date().toLocaleString();
    document.getElementById('kpiDiabetes').textContent = (data.diabetesRisk ?? 17) + '%';
    document.getElementById('kpiHyper').textContent = (data.hypertensionRisk ?? 12) + '%';
    const list = document.getElementById('factorsList');
    list.innerHTML = '';
    (data.factors ?? ['IMC alto','Edad']).forEach(f=>{
      const li = document.createElement('li'); li.className='list-group-item'; li.textContent=f;
      list.appendChild(li);
    });
  }

  // carga demo al iniciar
  updateKpis({updatedAt:new Date().toLocaleString(), diabetesRisk:17, hypertensionRisk:12, factors:['IMC alto','Sedentarismo']});

  // logout (ejemplo)
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    fetch('/auth/logout', {method:'POST'}).then(()=> window.location.href = 'log_in.html');
  });

  // función para obtener datos reales:
  window.fetchDashboard = async function(){
    try{
      const res = await fetch('/api/dashboard'); // tu DashboardServlet
      if(!res.ok) throw new Error('error');
      const json = await res.json();
      updateKpis(json);
      // actualizar charts:
      if(window.evolutionChart){ window.evolutionChart.data.datasets[0].data = json.evolution || window.evolutionChart.data.datasets[0].data; window.evolutionChart.update();}
      if(window.distChart){ window.distChart.data.datasets[0].data = json.distribution || window.distChart.data.datasets[0].data; window.distChart.update();}
    }catch(err){
      console.warn('No se pudieron cargar datos reales: ', err);
    }
  };
});
