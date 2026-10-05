(() => {
  const MARKETING_API = 'https://automation.sionsemi.com/webhook/dashboard/marketing';
  const REFRESH_MS = 60000;
  const demo = {
    updatedAt: '05 Oct 2026, 10:55 IST',
    summaries: [
      {period:'August 2026',content:{postersGenerated:18,postersPosted:14,blogs:4,newsletters:2,videos:3,scheduled:5},totals:{impressions:138400,clicks:4910,leads:91,spend:184500,engagement:4.9}},
      {period:'September 2026',content:{postersGenerated:21,postersPosted:17,blogs:5,newsletters:3,videos:3,scheduled:6},totals:{impressions:161800,clicks:5780,leads:108,spend:216300,engagement:5.3}},
      {period:'October 2026',content:{postersGenerated:24,postersPosted:18,blogs:6,newsletters:3,videos:4,scheduled:7},totals:{impressions:184620,clicks:6842,leads:126,spend:248750,engagement:5.8}}
    ],
    campaigns: [
      {period:'October 2026',platform:'Google Ads',name:'High-Speed IP Services — Search',status:'Running',spend:112400,impressions:48200,clicks:2786,leads:61},
      {period:'October 2026',platform:'Google Ads',name:'PCIe & CXL Verification — Search',status:'Running',spend:58200,impressions:26140,clicks:1215,leads:24},
      {period:'October 2026',platform:'Meta Ads',name:'Xtremesilica Engineering Awareness',status:'Running',spend:41350,impressions:69480,clicks:1786,leads:28},
      {period:'October 2026',platform:'Meta Ads',name:'Semiconductor Decision Makers',status:'Paused',spend:36800,impressions:40800,clicks:1055,leads:13}
    ],
    weekly: [
      {period:'October 2026',label:'Week 1',google:21,meta:12,organic:8},{period:'October 2026',label:'Week 2',google:26,meta:15,organic:11},
      {period:'October 2026',label:'Week 3',google:31,meta:18,organic:13},{period:'October 2026',label:'Week 4',google:37,meta:22,organic:16}
    ]
  };
  let data=demo, activePeriod='', chart=null;
  const money=value=>'₹'+Number(value||0).toLocaleString('en-IN');
  const number=value=>Number(value||0).toLocaleString('en-IN');

  async function loadSheet(){
    const request=window.xtremeDashboardAuth?.authenticatedFetch||fetch;
    const response=await request(`${MARKETING_API}?cacheBust=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.success===false)throw new Error(payload.message||`Marketing API returned ${response.status}`);
    if(!Array.isArray(payload.summaries)||!payload.summaries.length)throw new Error('Marketing API returned no summary rows');
    return payload;
  }

  function selected(){
    if(activePeriod==='All Months'){
      const summary=data.summaries.reduce((result,row)=>{
        Object.keys(result.content).forEach(key=>result.content[key]+=Number(row.content?.[key]||0));
        ['impressions','clicks','leads','spend'].forEach(key=>result.totals[key]+=Number(row.totals?.[key]||0));
        result.totals.engagement+=Number(row.totals?.engagement||0);
        return result;
      },{period:'All Months',content:{postersGenerated:0,postersPosted:0,blogs:0,newsletters:0,videos:0,scheduled:0},totals:{impressions:0,clicks:0,leads:0,spend:0,engagement:0}});
      summary.totals.engagement=data.summaries.length?summary.totals.engagement/data.summaries.length:0;
      const grouped=new Map();
      data.campaigns.forEach(c=>{const key=`${c.platform}|${c.name}`;const x=grouped.get(key)||{...c,period:'All Months',spend:0,impressions:0,clicks:0,leads:0};x.status=c.status;x.spend+=Number(c.spend||0);x.impressions+=Number(c.impressions||0);x.clicks+=Number(c.clicks||0);x.leads+=Number(c.leads||0);grouped.set(key,x)});
      const weekMap=new Map();
      data.weekly.forEach(w=>{const x=weekMap.get(w.label)||{period:'All Months',label:w.label,google:0,meta:0,organic:0};x.google+=Number(w.google||0);x.meta+=Number(w.meta||0);x.organic+=Number(w.organic||0);weekMap.set(w.label,x)});
      return{summary,campaigns:[...grouped.values()],weekly:[...weekMap.values()]};
    }
    const summary=data.summaries.find(x=>x.period===activePeriod)||data.summaries[data.summaries.length-1];
    return{summary,campaigns:data.campaigns.filter(x=>x.period===summary.period),weekly:data.weekly.filter(x=>x.period===summary.period)};
  }

  function template(source,error=''){
    const periods=data.summaries.map(x=>x.period);if(!activePeriod||(activePeriod!=='All Months'&&!periods.includes(activePeriod)))activePeriod=periods[periods.length-1];
    const {summary,campaigns,weekly}=selected(),content=summary.content,totals=summary.totals;
    const runningGoogle=campaigns.filter(x=>x.platform==='Google Ads'&&x.status==='Running').length;
    const runningMeta=campaigns.filter(x=>x.platform==='Meta Ads'&&x.status==='Running').length;
    const live=source==='live';
    return `<div class="md-wrap"><section class="md-hero"><div><div class="md-eyebrow">Marketing Operations Dashboard</div><h1>Content, campaigns and lead performance</h1><p>Track production output, publishing activity, active paid campaigns and marketing results in one operational view.</p></div><div class="md-period"><label for="marketingPeriod">Reporting period</label><select id="marketingPeriod"><option${activePeriod==='All Months'?' selected':''}>All Months</option>${periods.map(p=>`<option${p===activePeriod?' selected':''}>${p}</option>`).join('')}</select></div></section>
      <div class="md-source"><span><span class="md-live-dot"></span><strong>${live?'Google Sheets connected.':'Demo fallback active.'}</strong> ${live?'Sheet changes refresh automatically every 60 seconds.':'The sheet is unavailable, so safe demo values are shown.'}</span><span class="md-source-note">${error?error+' · ':''}Last updated ${data.updatedAt||new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST'}</span></div>
      <section class="md-kpis"><article class="md-kpi"><div class="md-kpi-label">Posters generated</div><div class="md-kpi-value">${content.postersGenerated}</div><div class="md-kpi-sub">${summary.period}</div></article><article class="md-kpi green"><div class="md-kpi-label">Posters published</div><div class="md-kpi-value">${content.postersPosted}</div><div class="md-kpi-sub">${content.postersGenerated?Math.round(content.postersPosted/content.postersGenerated*100):0}% publication rate</div></article><article class="md-kpi blue"><div class="md-kpi-label">Running Google Ads</div><div class="md-kpi-value">${runningGoogle}</div><div class="md-kpi-sub">Search campaigns active</div></article><article class="md-kpi violet"><div class="md-kpi-label">Running Meta Ads</div><div class="md-kpi-value">${runningMeta}</div><div class="md-kpi-sub">Awareness + lead generation</div></article><article class="md-kpi amber"><div class="md-kpi-label">Total qualified leads</div><div class="md-kpi-value">${totals.leads}</div><div class="md-kpi-sub">${number(totals.clicks)} clicks · ${number(totals.impressions)} impressions</div></article><article class="md-kpi"><div class="md-kpi-label">Marketing spend</div><div class="md-kpi-value" style="font-size:25px">${money(totals.spend)}</div><div class="md-kpi-sub">Average CPL ${money(totals.leads?totals.spend/totals.leads:0)}</div></article></section>
      <section class="md-grid"><article class="md-card"><div class="md-card-head"><div><h2>Weekly lead trend</h2><div class="md-card-sub">Google Ads, Meta Ads and organic activity</div></div></div><div class="md-chart"><canvas id="marketingLeadChart"></canvas></div></article><article class="md-card"><div class="md-card-head"><div><h2>Content production</h2><div class="md-card-sub">Created and scheduled for ${summary.period}</div></div></div><div class="md-content-list">${[['POST','Posters generated',content.postersGenerated],['LIVE','Posters published',content.postersPosted],['BLOG','Technical blogs',content.blogs],['NEWS','Newsletters',content.newsletters],['VID','Videos / reels',content.videos],['NEXT','Scheduled content',content.scheduled]].map(x=>`<div class="md-content-row"><div class="md-content-icon">${x[0]}</div><div><div class="md-content-title">${x[1]}</div><div class="md-progress"><span style="width:${content.postersGenerated?Math.min(100,x[2]/content.postersGenerated*100):0}%"></span></div></div><div class="md-content-count">${x[2]}<small>items</small></div></div>`).join('')}</div></article></section>
      <section class="md-card" style="margin-bottom:16px"><div class="md-card-head"><div><h2>Paid campaign performance</h2><div class="md-card-sub">Google Ads and Meta Ads campaigns for ${summary.period}</div></div><span class="md-source-note">${runningGoogle+runningMeta} campaigns running</span></div><div class="md-table-wrap"><table class="md-table"><thead><tr><th>Platform / campaign</th><th>Status</th><th class="num">Spend</th><th class="num">Impressions</th><th class="num">Clicks</th><th class="num">Leads</th><th class="num">CPL</th></tr></thead><tbody>${campaigns.map(c=>`<tr><td><div class="md-channel"><span class="md-channel-dot" style="background:${c.platform==='Google Ads'?'#1e4fd8':'#5b2fb9'}"></span>${c.platform}</div><div class="md-card-sub">${c.name}</div></td><td><span class="md-status ${String(c.status).toLowerCase()}">${c.status}</span></td><td class="num">${money(c.spend)}</td><td class="num">${number(c.impressions)}</td><td class="num">${number(c.clicks)}</td><td class="num"><strong>${c.leads}</strong></td><td class="num">${money(c.leads?c.spend/c.leads:0)}</td></tr>`).join('')}</tbody></table></div></section></div>`;
  }

  function renderChart(){if(chart)chart.destroy();const {weekly}=selected();chart=new Chart(document.getElementById('marketingLeadChart'),{type:'line',data:{labels:weekly.map(x=>x.label),datasets:[{label:'Google Ads',data:weekly.map(x=>x.google),borderColor:'#1e4fd8',backgroundColor:'rgba(30,79,216,.10)',fill:true,tension:.35},{label:'Meta Ads',data:weekly.map(x=>x.meta),borderColor:'#5b2fb9',backgroundColor:'rgba(91,47,185,.08)',fill:true,tension:.35},{label:'Organic',data:weekly.map(x=>x.organic),borderColor:'#0e7a4f',backgroundColor:'rgba(14,122,79,.06)',fill:true,tension:.35}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{family:"'IBM Plex Mono', monospace",size:10}}}},scales:{y:{beginAtZero:true,grid:{color:'#eef2f8'}},x:{grid:{display:false}}}}})}
  function render(source,error=''){const page=document.getElementById('page-marketing');if(!page)return;page.innerHTML=template(source,error);renderChart();document.getElementById('marketingPeriod')?.addEventListener('change',event=>{activePeriod=event.target.value;render(source,error)})}
  async function refresh(initial=false){try{data=await loadSheet();render('live')}catch(error){if(initial)data=demo;render('fallback',error.message);console.warn('Marketing sheet refresh failed:',error)}}
  async function initialise(){const page=document.getElementById('page-marketing');if(!page||page.dataset.dashboardReady)return;page.dataset.dashboardReady='true';await refresh(true);window.setInterval(refresh,REFRESH_MS);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('xtreme-dashboard-authenticated',()=>refresh())}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialise);else initialise();
})();
