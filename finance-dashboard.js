(() => {
  const FINANCE_API = 'https://automation.sionsemi.com/webhook/dashboard/finance';
  const REFRESH_MS = 60000;
  const demo = {
    updatedAt: '03 Oct 2026, 09:20 IST',
    monthly: [
      {month:'May 2026',revenue:2850000,salary:1120000,office:310000,marketing:285000,other:120000},
      {month:'June 2026',revenue:3240000,salary:1160000,office:295000,marketing:340000,other:135000},
      {month:'July 2026',revenue:3680000,salary:1210000,office:325000,marketing:395000,other:142000},
      {month:'August 2026',revenue:3420000,salary:1240000,office:318000,marketing:425000,other:151000},
      {month:'September 2026',revenue:4210000,salary:1290000,office:340000,marketing:475000,other:168000},
      {month:'October 2026',revenue:4580000,salary:1340000,office:355000,marketing:525000,other:175000}
    ],
    clients: [
      {period:'October 2026',name:'HCLTech',revenue:1680000,directCost:720000},
      {period:'October 2026',name:'Apex Silicon Labs',revenue:1120000,directCost:510000},
      {period:'October 2026',name:'NovaEdge Systems',revenue:840000,directCost:390000},
      {period:'October 2026',name:'Orion Mobility',revenue:590000,directCost:315000},
      {period:'October 2026',name:'Vertex Embedded',revenue:350000,directCost:210000}
    ]
  };
  let data = demo, activePeriod = '', charts = [];
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const shortMoney = value => '₹' + (Number(value || 0) / 100000).toFixed(1) + 'L';
  const numberValue = value => Number(String(value ?? '').replace(/[₹,\s]/g, '')) || 0;
  const cleanHeader = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  function parseCsv(text) {
    const rows=[]; let row=[], cell='', quoted=false;
    for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i+=1}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i+=1;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=c}
    if(cell||row.length){row.push(cell);if(row.some(v=>v.trim()))rows.push(row)}
    if(rows.length<2)return[];const headers=rows[0].map(cleanHeader);
    return rows.slice(1).map(values=>Object.fromEntries(headers.map((header,index)=>[header,String(values[index]??'').trim()])));
  }

  function normalise(rows) {
    const monthly=[], clients=[]; let updatedAt='';
    rows.forEach(row=>{const type=String(row.record_type||row.type||'').toLowerCase();const period=row.period||row.month||'';updatedAt=row.updated_at||updatedAt;
      if(type==='monthly'||(!type&&period&&!row.client&&!row.client_name))monthly.push({month:period,revenue:numberValue(row.revenue||row.client_revenue),salary:numberValue(row.salary||row.salary_expenditure),office:numberValue(row.office||row.office_expenditure),marketing:numberValue(row.marketing||row.marketing_expenses),other:numberValue(row.other||row.other_expenses)});
      if(type==='client'||row.client||row.client_name)clients.push({period,name:row.client||row.client_name||'Unnamed client',revenue:numberValue(row.revenue||row.client_revenue),directCost:numberValue(row.direct_cost||row.direct_delivery_cost)});
    });
    if(!monthly.length)throw new Error('No monthly finance rows found');
    return {monthly,clients,updatedAt:updatedAt||new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST'};
  }

  async function loadSheet(){
    const request=window.xtremeDashboardAuth?.authenticatedFetch||fetch;
    const response=await request(`${FINANCE_API}?cacheBust=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.success===false)throw new Error(payload.message||`Finance API returned ${response.status}`);
    if(Array.isArray(payload.rows))return normalise(payload.rows);
    if(Array.isArray(payload.monthly))return payload;
    throw new Error('Finance API returned an invalid data structure');
  }
  function selected(){const current=data.monthly.find(row=>row.month===activePeriod)||data.monthly[data.monthly.length-1];const matching=data.clients.filter(client=>!client.period||client.period===current.month);return{current,clients:matching.length?matching:data.clients}}
  function destroyCharts(){charts.forEach(chart=>chart.destroy());charts=[]}

  function template(source,error='') {
    const periods=data.monthly.map(row=>row.month);if(!activePeriod||!periods.includes(activePeriod))activePeriod=periods[periods.length-1];
    const {current,clients}=selected();const expenses=current.salary+current.office+current.marketing+current.other;const net=current.revenue-expenses;const margin=current.revenue?net/current.revenue*100:0;const live=source==='live';
    return `<div class="fd-wrap">
      <section class="fd-hero"><div><div class="fd-eyebrow">Finance Operations Dashboard</div><h1>Revenue, expenditure and profitability</h1><p>Monitor salary, office and marketing expenses, client profitability, and the company’s monthly net profit or loss.</p></div><div class="fd-period"><label for="financePeriod">Reporting period</label><select id="financePeriod">${periods.map(period=>`<option${period===activePeriod?' selected':''}>${period}</option>`).join('')}</select></div></section>
      <div class="fd-source"><span><span class="fd-dot"></span><strong>${live?'Google Sheets connected.':'Demo fallback active.'}</strong> ${live?'Sheet changes refresh automatically every 60 seconds.':'The sheet is unavailable, so safe demo values are shown.'}</span><span class="fd-source-note">${error?error+' · ':''}Last updated ${data.updatedAt}</span></div>
      <section class="fd-kpis"><article class="fd-kpi green"><div class="fd-label">Client revenue</div><div class="fd-value">${money(current.revenue)}</div><div class="fd-sub">Revenue recognized this month</div></article><article class="fd-kpi blue"><div class="fd-label">Salary expenditure</div><div class="fd-value">${money(current.salary)}</div><div class="fd-sub">${current.revenue?(current.salary/current.revenue*100).toFixed(1):'0.0'}% of revenue</div></article><article class="fd-kpi amber"><div class="fd-label">Office expenditure</div><div class="fd-value">${money(current.office)}</div><div class="fd-sub">Facilities and operations</div></article><article class="fd-kpi violet"><div class="fd-label">Marketing expenses</div><div class="fd-value">${money(current.marketing)}</div><div class="fd-sub">Ads, content and outreach</div></article><article class="fd-kpi ${net>=0?'green':''}"><div class="fd-label">Net profit / loss</div><div class="fd-value ${net>=0?'fd-positive':'fd-negative'}">${money(net)}</div><div class="fd-sub">${margin.toFixed(1)}% net margin</div></article></section>
      <section class="fd-grid"><article class="fd-card"><div class="fd-head"><div><h2>Revenue, expenses and net result</h2><div class="fd-card-sub">Financial trend from Google Sheets</div></div></div><div class="fd-chart"><canvas id="financeTrendChart"></canvas></div></article><article class="fd-card"><div class="fd-head"><div><h2>Expense composition</h2><div class="fd-card-sub">${current.month} allocation</div></div></div><div class="fd-chart"><canvas id="financeExpenseChart"></canvas></div></article></section>
      <section class="fd-grid equal"><article class="fd-card"><div class="fd-head"><div><h2>Profit by client</h2><div class="fd-card-sub">Revenue less direct delivery cost</div></div></div><div class="fd-chart short"><canvas id="financeClientChart"></canvas></div></article><article class="fd-card"><div class="fd-head"><div><h2>Financial summary</h2><div class="fd-card-sub">${current.month} calculation</div></div></div><div class="fd-table-wrap"><table class="fd-table" style="min-width:480px"><tbody><tr><th>Total revenue</th><td class="num"><strong>${money(current.revenue)}</strong></td></tr><tr><th>Salary</th><td class="num">− ${money(current.salary)}</td></tr><tr><th>Office</th><td class="num">− ${money(current.office)}</td></tr><tr><th>Marketing</th><td class="num">− ${money(current.marketing)}</td></tr><tr><th>Other operating costs</th><td class="num">− ${money(current.other)}</td></tr><tr><th>Net profit / loss</th><td class="num ${net>=0?'fd-positive':'fd-negative'}"><strong>${money(net)}</strong></td></tr></tbody></table></div></article></section>
      <section class="fd-card"><div class="fd-head"><div><h2>Client profitability details</h2><div class="fd-card-sub">Client-level revenue and direct delivery cost for ${current.month}</div></div><span class="fd-source-note">${clients.length} active clients</span></div><div class="fd-table-wrap"><table class="fd-table"><thead><tr><th>Client</th><th class="num">Revenue</th><th class="num">Direct cost</th><th class="num">Gross profit</th><th class="num">Margin</th></tr></thead><tbody>${clients.map(client=>{const profit=client.revenue-client.directCost;const pct=client.revenue?profit/client.revenue*100:0;return`<tr><td><strong>${client.name}</strong></td><td class="num">${money(client.revenue)}</td><td class="num">${money(client.directCost)}</td><td class="num ${profit>=0?'fd-positive':'fd-negative'}"><strong>${money(profit)}</strong></td><td class="num"><span class="fd-margin ${pct<40?'low':''}">${pct.toFixed(1)}%</span></td></tr>`}).join('')}</tbody></table></div></section>
    </div>`;
  }

  function renderCharts(){destroyCharts();const labels=data.monthly.map(x=>x.month),expenses=data.monthly.map(x=>x.salary+x.office+x.marketing+x.other),net=data.monthly.map((x,i)=>x.revenue-expenses[i]),{current,clients}=selected();const shared={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{family:"'IBM Plex Mono', monospace",size:10}}}}};
    charts.push(new Chart(document.getElementById('financeTrendChart'),{type:'bar',data:{labels,datasets:[{label:'Revenue',data:data.monthly.map(x=>x.revenue),backgroundColor:'#0e7a4f',borderRadius:4},{label:'Expenses',data:expenses,backgroundColor:'#b91c1c',borderRadius:4},{label:'Net profit / loss',data:net,type:'line',borderColor:'#1e4fd8',backgroundColor:'#1e4fd8',tension:.3}]},options:{...shared,scales:{y:{beginAtZero:true,ticks:{callback:shortMoney},grid:{color:'#eef2f8'}},x:{grid:{display:false}}}}}));
    charts.push(new Chart(document.getElementById('financeExpenseChart'),{type:'doughnut',data:{labels:['Salary','Office','Marketing','Other'],datasets:[{data:[current.salary,current.office,current.marketing,current.other],backgroundColor:['#1e4fd8','#b45309','#5b2fb9','#b91c1c'],borderWidth:0}]},options:{...shared,cutout:'66%',plugins:{...shared.plugins,legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:8,padding:16}}}}}));
    charts.push(new Chart(document.getElementById('financeClientChart'),{type:'bar',data:{labels:clients.map(x=>x.name),datasets:[{label:'Gross profit',data:clients.map(x=>x.revenue-x.directCost),backgroundColor:'#b91c1c',borderRadius:4}]},options:{...shared,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{callback:shortMoney},grid:{color:'#eef2f8'}},y:{grid:{display:false}}}}}));
  }

  function render(source,error=''){const page=document.getElementById('page-finance');if(!page)return;page.innerHTML=template(source,error);renderCharts();document.getElementById('financePeriod')?.addEventListener('change',event=>{activePeriod=event.target.value;render(source,error)})}
  async function refresh(initial=false){try{data=await loadSheet();render('live')}catch(error){if(initial)data=demo;render('fallback',error.message);console.warn('Finance sheet refresh failed:',error)}}
  async function initialise(){const page=document.getElementById('page-finance');if(!page||page.dataset.dashboardReady)return;page.dataset.dashboardReady='true';await refresh(true);window.setInterval(refresh,REFRESH_MS);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('xtreme-dashboard-authenticated',()=>refresh())}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialise);else initialise();
})();
