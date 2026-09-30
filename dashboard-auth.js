(function () {
  'use strict';
  const CONFIG = {
    apiBaseUrl: 'https://automation.sionsemi.com',
    loginPath: '/webhook/dashboard/auth/login',
    sessionPath: '/webhook/dashboard/auth/session',
    logoutPath: '/webhook/dashboard/auth/logout',
    tokenKey: 'xtreme_dashboard_token',
    userKey: 'xtreme_dashboard_user',
    requestTimeoutMs: 20000
  };
  const PERMISSIONS = {
    home: ['home:view'], marketing: ['marketing:view'], finance: ['finance:view'],
    assignment: ['assignment:create'],
    taskProgress: ['task_progress:view_all', 'task_progress:view_team', 'task_progress:view_self']
  };

  document.documentElement.classList.add('xtreme-auth-locked');
  const style = document.createElement('style');
  style.textContent = `
    .xtreme-auth-locked body > :not(#xtremeAuthRoot) { visibility: hidden !important; }
    #xtremeAuthRoot { position:fixed; inset:0; z-index:2147483647; display:grid; place-items:center;
      overflow:auto; padding:24px; color:#0e1726; font-family:Inter,Arial,sans-serif;
      background:radial-gradient(circle at 15% 15%,rgba(229,37,42,.10),transparent 34%),linear-gradient(135deg,#f8fafc 0%,#fff 54%,#fff1f2 100%); }
    #xtremeAuthRoot[hidden] { display:none!important; }
    .xtreme-auth-card { width:min(430px,100%); overflow:hidden; border:1px solid #e2e8f0; border-radius:16px;
      background:#fff; box-shadow:0 28px 75px rgba(15,23,42,.18); }
    .xtreme-auth-head { padding:30px 32px 26px; color:#fff; background:linear-gradient(135deg,#7f1d1d,#b91c1c 55%,#e5252a); }
    .xtreme-auth-logo { display:flex; align-items:center; gap:12px; }
    .xtreme-auth-mark { display:grid; place-items:center; width:42px; height:42px; border-radius:10px; color:#fff;
      background:#0e1726; font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:700; }
    .xtreme-auth-brand { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; }
    .xtreme-auth-kicker { margin-top:4px; color:#fecaca; font-family:'IBM Plex Mono',monospace; font-size:10px;
      letter-spacing:.14em; text-transform:uppercase; }
    .xtreme-auth-body { padding:30px 32px 32px; }
    .xtreme-auth-card h1 { margin:0 0 7px; color:#0e1726; font-family:'Space Grotesk',sans-serif; font-size:27px; }
    .xtreme-auth-intro { margin:0 0 24px; color:#64748b; font-size:14px; line-height:1.55; }
    .xtreme-auth-field { display:grid; gap:7px; margin-bottom:16px; }
    .xtreme-auth-field label { color:#0f172a; font-size:13px; font-weight:700; }
    .xtreme-auth-field input { width:100%; box-sizing:border-box; padding:13px 14px; border:1px solid #cbd5e1;
      border-radius:8px; color:#0f172a; background:#fff; font:inherit; font-size:15px; outline:none; }
    .xtreme-auth-field input:focus { border-color:#e5252a; box-shadow:0 0 0 3px rgba(229,37,42,.12); }
    .xtreme-password-wrap { position:relative; }
    .xtreme-password-wrap input { padding-right:66px; }
    #xtremePasswordToggle { position:absolute; top:50%; right:10px; transform:translateY(-50%); border:0;
      color:#7f1d1d; background:transparent; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }
    #xtremeAuthSubmit { width:100%; margin-top:5px; padding:13px 16px; border:0; border-radius:8px; color:#fff;
      background:#b91c1c; font:inherit; font-size:14px; font-weight:800; cursor:pointer; }
    #xtremeAuthSubmit:hover { background:#991b1b; } #xtremeAuthSubmit:disabled { cursor:wait; opacity:.65; }
    #xtremeAuthError { min-height:20px; margin:13px 0 0; color:#b91c1c; font-size:13px; }
    .xtreme-auth-foot { margin-top:18px; color:#94a3b8; font-size:11px; text-align:center; }
    #xtremeUserMenu { position:fixed; right:18px; bottom:18px; z-index:10000; display:flex; align-items:center; gap:10px;
      padding:8px 8px 8px 13px; border:1px solid #e2e8f0; border-radius:10px; background:rgba(255,255,255,.96);
      box-shadow:0 8px 25px rgba(15,23,42,.12); }
    .xtreme-user-copy { display:grid; line-height:1.15; } .xtreme-user-copy strong { color:#0f172a; font-size:12px; }
    .xtreme-user-copy span { margin-top:3px; color:#64748b; font-family:'IBM Plex Mono',monospace; font-size:9px;
      letter-spacing:.06em; text-transform:uppercase; }
    #xtremeLogoutButton { padding:8px 11px; border:1px solid #fecaca; border-radius:7px; color:#b91c1c;
      background:#fff1f2; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }
    [data-auth-hidden="true"] { display:none!important; }
    @media(max-width:560px){#xtremeAuthRoot{padding:14px}.xtreme-auth-head,.xtreme-auth-body{padding-left:23px;padding-right:23px}#xtremeUserMenu{right:10px;bottom:10px}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'xtremeAuthRoot';
  root.innerHTML = `<form class="xtreme-auth-card" id="xtremeAuthForm" autocomplete="on">
    <div class="xtreme-auth-head"><div class="xtreme-auth-logo"><div class="xtreme-auth-mark">X</div><div>
      <div class="xtreme-auth-brand">Xtremesilica</div><div class="xtreme-auth-kicker">Executive Dashboard · Secure Access</div>
    </div></div></div><div class="xtreme-auth-body"><h1>Welcome back</h1>
    <p class="xtreme-auth-intro">Sign in with your dashboard account to continue.</p>
    <div class="xtreme-auth-field"><label for="xtremeUsername">Username</label>
      <input id="xtremeUsername" name="username" autocomplete="username" maxlength="100" required autofocus></div>
    <div class="xtreme-auth-field"><label for="xtremePassword">Password</label><div class="xtreme-password-wrap">
      <input id="xtremePassword" name="password" type="password" autocomplete="current-password" maxlength="256" required>
      <button id="xtremePasswordToggle" type="button" aria-label="Show password">Show</button></div></div>
    <button id="xtremeAuthSubmit" type="submit">Sign in securely</button>
    <div id="xtremeAuthError" role="alert" aria-live="polite"></div><div class="xtreme-auth-foot">Authorized users only</div>
    </div></form>`;
  document.body.prepend(root);

  const form = document.getElementById('xtremeAuthForm');
  const submit = document.getElementById('xtremeAuthSubmit');
  const error = document.getElementById('xtremeAuthError');
  const usernameInput = document.getElementById('xtremeUsername');
  const passwordInput = document.getElementById('xtremePassword');
  const passwordToggle = document.getElementById('xtremePasswordToggle');
  const storedToken = () => sessionStorage.getItem(CONFIG.tokenKey) || '';

  async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
    try { return await fetch(CONFIG.apiBaseUrl + path, { ...options, mode:'cors', cache:'no-store', signal:controller.signal,
      headers:{Accept:'application/json','Content-Type':'application/json',...(options.headers||{})} }); }
    finally { clearTimeout(timeout); }
  }
  function hasAny(user, required) {
    const granted = new Set(Array.isArray(user?.permissions) ? user.permissions : []);
    return required.some((permission) => granted.has(permission));
  }
  function setVisibility(selector, allowed) {
    document.querySelectorAll(selector).forEach((element) => allowed
      ? element.removeAttribute('data-auth-hidden') : element.setAttribute('data-auth-hidden','true'));
  }
  function applyPermissions(user) {
    setVisibility('[data-page="home"],#page-home',hasAny(user,PERMISSIONS.home));
    setVisibility('[data-page="marketing"],#page-marketing',hasAny(user,PERMISSIONS.marketing));
    setVisibility('[data-page="finance"],#page-finance',hasAny(user,PERMISSIONS.finance));
    setVisibility('#openAssignment',hasAny(user,PERMISSIONS.assignment));
    setVisibility('[data-page="task-progress"],#openTaskProgress',hasAny(user,PERMISSIONS.taskProgress));
    const map={home:PERMISSIONS.home,marketing:PERMISSIONS.marketing,finance:PERMISSIONS.finance,'task-progress':PERMISSIONS.taskProgress};
    const requested=(location.hash||'#home').slice(1);
    if(map[requested]&&!hasAny(user,map[requested])){
      const first=Object.keys(map).find((page)=>document.getElementById(`page-${page}`)&&hasAny(user,map[page]));
      if(first){ history.replaceState(null,'',`#${first}`); window.dispatchEvent(new HashChangeEvent('hashchange')); }
    }
  }
  function addUserMenu(user) {
    document.getElementById('xtremeUserMenu')?.remove();
    const menu=document.createElement('div'); menu.id='xtremeUserMenu';
    menu.innerHTML='<div class="xtreme-user-copy"><strong></strong><span></span></div><button id="xtremeLogoutButton" type="button">Logout</button>';
    menu.querySelector('strong').textContent=String(user.display_name||user.username||'User');
    menu.querySelector('span').textContent=String(user.role||'User');
    menu.querySelector('button').addEventListener('click',logout); document.body.appendChild(menu);
  }
  function showDashboard(user) {
    sessionStorage.setItem(CONFIG.userKey,JSON.stringify(user)); applyPermissions(user); addUserMenu(user);
    root.hidden=true; document.documentElement.classList.remove('xtreme-auth-locked'); window.xtremeDashboardUser=user;
    window.dispatchEvent(new CustomEvent('xtreme-dashboard-authenticated',{detail:{user}}));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
  function showLogin(message='') {
    root.hidden=false; document.documentElement.classList.add('xtreme-auth-locked'); error.textContent=message;
    setTimeout(()=>usernameInput.focus(),0);
  }
  async function logout() {
    const token=storedToken();
    try { if(token) await apiRequest(CONFIG.logoutPath,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:'{}'}); }
    catch (_) {} finally { sessionStorage.removeItem(CONFIG.tokenKey); sessionStorage.removeItem(CONFIG.userKey); location.reload(); }
  }
  passwordToggle.addEventListener('click',()=>{
    const showing=passwordInput.type==='text'; passwordInput.type=showing?'password':'text';
    passwordToggle.textContent=showing?'Show':'Hide'; passwordToggle.setAttribute('aria-label',showing?'Show password':'Hide password');
  });
  form.addEventListener('submit',async(event)=>{
    event.preventDefault(); error.textContent=''; submit.disabled=true; submit.textContent='Signing in…';
    try {
      const response=await apiRequest(CONFIG.loginPath,{method:'POST',body:JSON.stringify({username:usernameInput.value.trim(),password:passwordInput.value})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.success!==true||!data.token||!data.user) throw new Error(data.message||'The username or password is incorrect.');
      sessionStorage.setItem(CONFIG.tokenKey,data.token); passwordInput.value=''; showDashboard(data.user);
    } catch(requestError) {
      const message=requestError.name==='AbortError'?'The login request timed out. Please try again.':requestError instanceof TypeError
        ?'Unable to reach the authentication service. Check the n8n workflow and CORS settings.':requestError.message;
      showLogin(message);
    } finally { submit.disabled=false; submit.textContent='Sign in securely'; }
  });
  async function validateExistingSession() {
    const token=storedToken(); if(!token) return showLogin();
    try {
      const response=await apiRequest(CONFIG.sessionPath,{method:'GET',headers:{Authorization:`Bearer ${token}`}});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.success!==true||data.authenticated!==true||!data.user) throw new Error('Session expired.');
      showDashboard(data.user);
    } catch (_) { sessionStorage.removeItem(CONFIG.tokenKey); sessionStorage.removeItem(CONFIG.userKey); showLogin('Your session has expired. Please sign in again.'); }
  }
  window.xtremeDashboardAuth={getToken:storedToken,getUser:()=>window.xtremeDashboardUser||null,
    hasPermission:(permission)=>hasAny(window.xtremeDashboardUser,[permission]),logout,
    authenticatedFetch:(url,options={})=>fetch(url,{...options,headers:{...(options.headers||{}),Authorization:`Bearer ${storedToken()}`}})};
  window.addEventListener('hashchange',()=>{
    if(window.xtremeDashboardUser) applyPermissions(window.xtremeDashboardUser);
  });
  validateExistingSession();
})();
