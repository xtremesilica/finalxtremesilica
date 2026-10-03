(() => {
  const demoFinanceData = {
    updatedAt: '03 Oct 2026, 09:20 IST', period: 'October 2026',
    monthly: [
      {month:'May',revenue:2850000,salary:1120000,office:310000,marketing:285000,other:120000},
      {month:'Jun',revenue:3240000,salary:1160000,office:295000,marketing:340000,other:135000},
      {month:'Jul',revenue:3680000,salary:1210000,office:325000,marketing:395000,other:142000},
      {month:'Aug',revenue:3420000,salary:1240000,office:318000,marketing:425000,other:151000},
      {month:'Sep',revenue:4210000,salary:1290000,office:340000,marketing:475000,other:168000},
      {month:'Oct',revenue:4580000,salary:1340000,office:355000,marketing:525000,other:175000}
    ],
    clients: [
      {name:'HCLTech',revenue:1680000,directCost:720000},
      {name:'Apex Silicon Labs',revenue:1120000,directCost:510000},
      {name:'NovaEdge Systems',revenue:840000,directCost:390000},
      {name:'Orion Mobility',revenue:590000,directCost:315000},
      {name:'Vertex Embedded',revenue:350000,directCost:210000}
    ]
  };

  // Replace this function later with a Google Sheets CSV/API fetch that returns the same object shape.
  async function getFinanceData() { return demoFinanceData; }
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const shortMoney = value => '₹' + (Number(value || 0) / 100000).toFixed(1) + 'L';
  const total = (rows, key) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);

  function template(data) {
    const current = data.monthly[data.monthly.length - 1];
    const expenses = current.salary + current.office + current.marketing + current.other;
    const net = current.revenue - expenses;
    const margin = current.revenue ? net / current.revenue * 100 : 0;
    return `<div class="fd-wrap">
      <section class="fd-hero"><div><div class="fd-eyebrow">Finance Operations Dashboard</div><h1>Revenue, expenditure and profitability</h1><p>Monitor salary, office and marketing expenses, client profitability, and the company’s monthly net profit or loss.</p></div><div class="fd-period"><label for="financePeriod">Reporting period</label><select id="financePeriod"><option>${data.period}</option><option>September 2026</option><option>August 2026</option></select></div></section>
      <div class="fd-source"><span><span class="fd-dot"></span><strong>Demo data active.</strong> Data structure is ready for Google Sheets integration.</span><span class="fd-source-note">Last updated ${data.updatedAt}</span></div>
      <section class="fd-kpis">
        <article class="fd-kpi green"><div class="fd-label">Client revenue</div><div class="fd-value">${money(current.revenue)}</div><div class="fd-sub">Revenue recognized this month</div></article>
        <article class="fd-kpi blue"><div class="fd-label">Salary expenditure</div><div class="fd-value">${money(current.salary)}</div><div class="fd-sub">${(current.salary/current.revenue*100).toFixed(1)}% of revenue</div></article>
        <article class="fd-kpi amber"><div class="fd-label">Office expenditure</div><div class="fd-value">${money(current.office)}</div><div class="fd-sub">Facilities and operations</div></article>
        <article class="fd-kpi violet"><div class="fd-label">Marketing expenses</div><div class="fd-value">${money(current.marketing)}</div><div class="fd-sub">Ads, content and outreach</div></article>
        <article class="fd-kpi ${net >= 0 ? 'green' : ''}"><div class="fd-label">Net profit / loss</div><div class="fd-value ${net >= 0 ? 'fd-positive' : 'fd-negative'}">${money(net)}</div><div class="fd-sub">${margin.toFixed(1)}% net margin</div></article>
      </section>
      <section class="fd-grid"><article class="fd-card"><div class="fd-head"><div><h2>Revenue, expenses and net result</h2><div class="fd-card-sub">Six-month financial trend</div></div></div><div class="fd-chart"><canvas id="financeTrendChart"></canvas></div></article><article class="fd-card"><div class="fd-head"><div><h2>Expense composition</h2><div class="fd-card-sub">Current-period allocation</div></div></div><div class="fd-chart"><canvas id="financeExpenseChart"></canvas></div></article></section>
      <section class="fd-grid equal"><article class="fd-card"><div class="fd-head"><div><h2>Profit by client</h2><div class="fd-card-sub">Revenue less directly attributable delivery cost</div></div></div><div class="fd-chart short"><canvas id="financeClientChart"></canvas></div></article><article class="fd-card"><div class="fd-head"><div><h2>Financial summary</h2><div class="fd-card-sub">Current-period calculation</div></div></div><div class="fd-table-wrap"><table class="fd-table" style="min-width:480px"><tbody><tr><th>Total revenue</th><td class="num"><strong>${money(current.revenue)}</strong></td></tr><tr><th>Salary</th><td class="num">− ${money(current.salary)}</td></tr><tr><th>Office</th><td class="num">− ${money(current.office)}</td></tr><tr><th>Marketing</th><td class="num">− ${money(current.marketing)}</td></tr><tr><th>Other operating costs</th><td class="num">− ${money(current.other)}</td></tr><tr><th>Net profit / loss</th><td class="num ${net >= 0 ? 'fd-positive' : 'fd-negative'}"><strong>${money(net)}</strong></td></tr></tbody></table></div></article></section>
      <section class="fd-card"><div class="fd-head"><div><h2>Client profitability details</h2><div class="fd-card-sub">Demo client-level revenue and direct delivery cost</div></div><span class="fd-source-note">${data.clients.length} active clients</span></div><div class="fd-table-wrap"><table class="fd-table"><thead><tr><th>Client</th><th class="num">Revenue</th><th class="num">Direct cost</th><th class="num">Gross profit</th><th class="num">Margin</th></tr></thead><tbody>${data.clients.map(client => { const profit=client.revenue-client.directCost; const pct=client.revenue ? profit/client.revenue*100 : 0; return `<tr><td><strong>${client.name}</strong></td><td class="num">${money(client.revenue)}</td><td class="num">${money(client.directCost)}</td><td class="num fd-positive"><strong>${money(profit)}</strong></td><td class="num"><span class="fd-margin ${pct<40?'low':''}">${pct.toFixed(1)}%</span></td></tr>`; }).join('')}</tbody></table></div></section>
    </div>`;
  }

  function renderCharts(data) {
    const labels=data.monthly.map(x=>x.month), expenses=data.monthly.map(x=>x.salary+x.office+x.marketing+x.other), net=data.monthly.map((x,i)=>x.revenue-expenses[i]);
    const shared={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{family:"'IBM Plex Mono', monospace",size:10}}}}};
    new Chart(document.getElementById('financeTrendChart'),{type:'bar',data:{labels,datasets:[{label:'Revenue',data:data.monthly.map(x=>x.revenue),backgroundColor:'#0e7a4f',borderRadius:4},{label:'Expenses',data:expenses,backgroundColor:'#b91c1c',borderRadius:4},{label:'Net profit / loss',data:net,type:'line',borderColor:'#1e4fd8',backgroundColor:'#1e4fd8',tension:.3}]},options:{...shared,scales:{y:{beginAtZero:true,ticks:{callback:shortMoney},grid:{color:'#eef2f8'}},x:{grid:{display:false}}}}});
    const current=data.monthly[data.monthly.length-1];
    new Chart(document.getElementById('financeExpenseChart'),{type:'doughnut',data:{labels:['Salary','Office','Marketing','Other'],datasets:[{data:[current.salary,current.office,current.marketing,current.other],backgroundColor:['#1e4fd8','#b45309','#5b2fb9','#b91c1c'],borderWidth:0}]},options:{...shared,cutout:'66%',plugins:{...shared.plugins,legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:16}}}}});
    new Chart(document.getElementById('financeClientChart'),{type:'bar',data:{labels:data.clients.map(x=>x.name),datasets:[{label:'Gross profit',data:data.clients.map(x=>x.revenue-x.directCost),backgroundColor:'#b91c1c',borderRadius:4}]},options:{...shared,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{callback:shortMoney},grid:{color:'#eef2f8'}},y:{grid:{display:false}}}}});
  }

  async function initialise(){const page=document.getElementById('page-finance');if(!page||page.dataset.dashboardReady)return;page.dataset.dashboardReady='true';const data=await getFinanceData();page.innerHTML=template(data);renderCharts(data)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialise);else initialise();
})();
