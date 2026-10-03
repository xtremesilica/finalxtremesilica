(() => {
  const dummyMarketingData = {
    updatedAt: '03 Oct 2026, 08:45 IST',
    period: 'October 2026',
    content: { postersGenerated: 24, postersPosted: 18, blogs: 6, newsletters: 3, videos: 4, scheduled: 7 },
    totals: { impressions: 184620, clicks: 6842, leads: 126, spend: 248750, avgCpl: 1974, engagement: 5.8 },
    campaigns: [
      { platform:'Google Ads', name:'High-Speed IP Services — Search', status:'Running', spend:112400, impressions:48200, clicks:2786, leads:61, cpl:1843 },
      { platform:'Google Ads', name:'PCIe & CXL Verification — Search', status:'Running', spend:58200, impressions:26140, clicks:1215, leads:24, cpl:2425 },
      { platform:'Meta Ads', name:'Xtremesilica Engineering Awareness', status:'Running', spend:41350, impressions:69480, clicks:1786, leads:28, cpl:1477 },
      { platform:'Meta Ads', name:'Semiconductor Decision Makers', status:'Paused', spend:36800, impressions:40800, clicks:1055, leads:13, cpl:2831 }
    ],
    weekly: [
      { label:'Week 1', google:21, meta:12, organic:8 },
      { label:'Week 2', google:26, meta:15, organic:11 },
      { label:'Week 3', google:31, meta:18, organic:13 },
      { label:'Week 4', google:37, meta:22, organic:16 }
    ],
    posts: [
      { type:'Poster', title:'When Scale Demands Custom Silicon', channel:'LinkedIn', date:'03 Oct', status:'Published' },
      { type:'Carousel', title:'FPGA to ASIC Conversion', channel:'LinkedIn', date:'02 Oct', status:'Published' },
      { type:'Blog', title:'Production-Ready Silicon IP Core', channel:'Website', date:'01 Oct', status:'Published' },
      { type:'Poster', title:'PCIe 6.0 Equalization Verification', channel:'LinkedIn', date:'05 Oct', status:'Scheduled' },
      { type:'Newsletter', title:'Xtremesilica × HCLTech Overview', channel:'PitchEngine', date:'06 Oct', status:'Draft' }
    ]
  };

  // Later replace this function with a Google Sheets CSV/API fetch and return the same object shape.
  async function getMarketingData() { return dummyMarketingData; }
  const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
  const number = value => Number(value || 0).toLocaleString('en-IN');

  function template(data) {
    const runningGoogle = data.campaigns.filter(x => x.platform === 'Google Ads' && x.status === 'Running').length;
    const runningMeta = data.campaigns.filter(x => x.platform === 'Meta Ads' && x.status === 'Running').length;
    return `<div class="md-wrap">
      <section class="md-hero">
        <div><div class="md-eyebrow">Marketing Operations Dashboard</div><h1>Content, campaigns and lead performance</h1><p>Track production output, publishing activity, active paid campaigns and marketing results in one operational view.</p></div>
        <div class="md-period"><label for="marketingPeriod">Reporting period</label><select id="marketingPeriod"><option>${data.period}</option><option>September 2026</option><option>August 2026</option></select></div>
      </section>
      <div class="md-source"><span><span class="md-live-dot"></span><strong>Demo data active.</strong> Layout is prepared for Google Sheets integration.</span><span class="md-source-note">Last updated ${data.updatedAt}</span></div>
      <section class="md-kpis">
        <article class="md-kpi"><div class="md-kpi-label">Posters generated</div><div class="md-kpi-value">${data.content.postersGenerated}</div><div class="md-kpi-sub"><span class="md-up">+20%</span> vs last month</div></article>
        <article class="md-kpi green"><div class="md-kpi-label">Posters published</div><div class="md-kpi-value">${data.content.postersPosted}</div><div class="md-kpi-sub">${Math.round(data.content.postersPosted/data.content.postersGenerated*100)}% publication rate</div></article>
        <article class="md-kpi blue"><div class="md-kpi-label">Running Google Ads</div><div class="md-kpi-value">${runningGoogle}</div><div class="md-kpi-sub">Search campaigns active</div></article>
        <article class="md-kpi violet"><div class="md-kpi-label">Running Meta Ads</div><div class="md-kpi-value">${runningMeta}</div><div class="md-kpi-sub">Awareness + lead generation</div></article>
        <article class="md-kpi amber"><div class="md-kpi-label">Total qualified leads</div><div class="md-kpi-value">${data.totals.leads}</div><div class="md-kpi-sub"><span class="md-up">+14.5%</span> period growth</div></article>
        <article class="md-kpi"><div class="md-kpi-label">Marketing spend</div><div class="md-kpi-value" style="font-size:25px">${money(data.totals.spend)}</div><div class="md-kpi-sub">Average CPL ${money(data.totals.avgCpl)}</div></article>
      </section>
      <section class="md-grid">
        <article class="md-card"><div class="md-card-head"><div><h2>Weekly lead trend</h2><div class="md-card-sub">Google Ads, Meta Ads and organic activity</div></div><select class="md-filter"><option>Leads</option><option>Clicks</option><option>Impressions</option></select></div><div class="md-chart"><canvas id="marketingLeadChart"></canvas></div></article>
        <article class="md-card"><div class="md-card-head"><div><h2>Content production</h2><div class="md-card-sub">Created and scheduled this period</div></div></div><div class="md-content-list">
          ${[['POST','Posters generated',data.content.postersGenerated],['LIVE','Posters published',data.content.postersPosted],['BLOG','Technical blogs',data.content.blogs],['NEWS','Newsletters',data.content.newsletters],['VID','Videos / reels',data.content.videos],['NEXT','Scheduled content',data.content.scheduled]].map(x=>`<div class="md-content-row"><div class="md-content-icon">${x[0]}</div><div><div class="md-content-title">${x[1]}</div><div class="md-progress"><span style="width:${Math.min(100,x[2]/data.content.postersGenerated*100)}%"></span></div></div><div class="md-content-count">${x[2]}<small>items</small></div></div>`).join('')}
        </div></article>
      </section>
      <section class="md-card" style="margin-bottom:16px"><div class="md-card-head"><div><h2>Paid campaign performance</h2><div class="md-card-sub">Current Google Ads and Meta Ads campaigns</div></div><span class="md-source-note">${runningGoogle+runningMeta} campaigns running</span></div><div class="md-table-wrap"><table class="md-table"><thead><tr><th>Platform / campaign</th><th>Status</th><th class="num">Spend</th><th class="num">Impressions</th><th class="num">Clicks</th><th class="num">Leads</th><th class="num">CPL</th></tr></thead><tbody>${data.campaigns.map(c=>`<tr><td><div class="md-channel"><span class="md-channel-dot" style="background:${c.platform==='Google Ads'?'#1e4fd8':'#5b2fb9'}"></span>${c.platform}</div><div class="md-card-sub">${c.name}</div></td><td><span class="md-status ${c.status.toLowerCase()}">${c.status}</span></td><td class="num">${money(c.spend)}</td><td class="num">${number(c.impressions)}</td><td class="num">${number(c.clicks)}</td><td class="num"><strong>${c.leads}</strong></td><td class="num">${money(c.cpl)}</td></tr>`).join('')}</tbody></table></div></section>
    </div>`;
  }

  function renderCharts(data) {
    const shared = { responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{usePointStyle:true,boxWidth:8,font:{family:"'IBM Plex Mono', monospace",size:10}}}} };
    new Chart(document.getElementById('marketingLeadChart'), { type:'line', data:{labels:data.weekly.map(x=>x.label),datasets:[{label:'Google Ads',data:data.weekly.map(x=>x.google),borderColor:'#1e4fd8',backgroundColor:'rgba(30,79,216,.10)',fill:true,tension:.35},{label:'Meta Ads',data:data.weekly.map(x=>x.meta),borderColor:'#5b2fb9',backgroundColor:'rgba(91,47,185,.08)',fill:true,tension:.35},{label:'Organic',data:data.weekly.map(x=>x.organic),borderColor:'#0e7a4f',backgroundColor:'rgba(14,122,79,.06)',fill:true,tension:.35}]},options:{...shared,scales:{y:{beginAtZero:true,grid:{color:'#eef2f8'}},x:{grid:{display:false}}}}});
  }

  async function initialise() {
    const page = document.getElementById('page-marketing');
    if (!page || page.dataset.dashboardReady) return;
    page.dataset.dashboardReady = 'true';
    const data = await getMarketingData();
    page.innerHTML = template(data);
    renderCharts(data);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise); else initialise();
})();
