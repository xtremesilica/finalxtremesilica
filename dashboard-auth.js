(function () {
  'use strict';

  const CONFIG = {
    apiBaseUrl: 'https://automation.sionsemi.com',
    loginPath: '/webhook/dashboard/login',
    sessionPath: '/webhook/dashboard/session',
    tokenKey: 'xtreme_dashboard_token',
    requestTimeoutMs: 20000
  };

  document.documentElement.classList.add('xtreme-auth-locked');

  const style = document.createElement('style');
  style.textContent = `
    .xtreme-auth-locked body > :not(#xtremeAuthRoot) { visibility: hidden !important; }
    #xtremeAuthRoot { position: fixed; inset: 0; z-index: 2147483647; display: grid;
      place-items: center; padding: 24px; background: #f8fafc; font-family: Arial, sans-serif; }
    #xtremeAuthRoot[hidden] { display: none !important; }
    .xtreme-auth-card { width: min(420px, 100%); padding: 34px; border: 1px solid #e2e8f0;
      border-radius: 18px; background: #fff; box-shadow: 0 24px 60px rgba(15,23,42,.16); }
    .xtreme-auth-brand { color: #e5252a; font-size: 13px; font-weight: 800;
      letter-spacing: .15em; text-transform: uppercase; }
    .xtreme-auth-card h1 { margin: 10px 0 8px; color: #0f172a; font-size: 28px; }
    .xtreme-auth-card p { margin: 0 0 24px; color: #64748b; line-height: 1.5; }
    .xtreme-auth-field { display: grid; gap: 7px; margin-bottom: 16px; }
    .xtreme-auth-field label { color: #0f172a; font-size: 14px; font-weight: 700; }
    .xtreme-auth-field input { width: 100%; box-sizing: border-box; padding: 13px 14px;
      border: 1px solid #cbd5e1; border-radius: 9px; font-size: 15px; outline: none; }
    .xtreme-auth-field input:focus { border-color: #e5252a; box-shadow: 0 0 0 3px rgba(229,37,42,.12); }
    #xtremeAuthSubmit { width: 100%; margin-top: 6px; padding: 13px 16px; border: 0;
      border-radius: 9px; color: #fff; background: #e5252a; font-size: 15px; font-weight: 800; cursor: pointer; }
    #xtremeAuthSubmit:disabled { cursor: wait; opacity: .65; }
    #xtremeAuthError { min-height: 20px; margin: 14px 0 0; color: #b91c1c; font-size: 14px; }
    #xtremeLogoutButton { position: fixed; right: 20px; bottom: 20px; z-index: 10000;
      padding: 9px 14px; border: 1px solid #e5252a; border-radius: 8px; color: #e5252a;
      background: #fff; font-weight: 700; cursor: pointer; }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'xtremeAuthRoot';
  root.innerHTML = `
    <form class="xtreme-auth-card" id="xtremeAuthForm" autocomplete="on">
      <div class="xtreme-auth-brand">XtremeSilica</div>
      <h1>Dashboard login</h1>
      <p>Enter the shared account details to access the dashboard.</p>
      <div class="xtreme-auth-field">
        <label for="xtremeUserId">User ID</label>
        <input id="xtremeUserId" name="username" autocomplete="username" required>
      </div>
      <div class="xtreme-auth-field">
        <label for="xtremePassword">Password</label>
        <input id="xtremePassword" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button id="xtremeAuthSubmit" type="submit">Sign in</button>
      <div id="xtremeAuthError" role="alert"></div>
    </form>`;
  document.body.prepend(root);

  const form = document.getElementById('xtremeAuthForm');
  const submit = document.getElementById('xtremeAuthSubmit');
  const error = document.getElementById('xtremeAuthError');

  async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
    try {
      return await fetch(CONFIG.apiBaseUrl + path, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  function showDashboard() {
    root.hidden = true;
    document.documentElement.classList.remove('xtreme-auth-locked');
    addLogoutButton();
    window.dispatchEvent(new CustomEvent('xtreme-dashboard-authenticated'));
  }

  function showLogin(message = '') {
    root.hidden = false;
    document.documentElement.classList.add('xtreme-auth-locked');
    error.textContent = message;
  }

  function logout() {
    sessionStorage.removeItem(CONFIG.tokenKey);
    window.location.reload();
  }

  function addLogoutButton() {
    if (document.getElementById('xtremeLogoutButton')) return;
    const button = document.createElement('button');
    button.id = 'xtremeLogoutButton';
    button.type = 'button';
    button.textContent = 'Logout';
    button.addEventListener('click', logout);
    document.body.appendChild(button);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Signing in…';
    try {
      const response = await apiRequest(CONFIG.loginPath, {
        method: 'POST',
        body: JSON.stringify({
          user_id: document.getElementById('xtremeUserId').value.trim(),
          password: document.getElementById('xtremePassword').value
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !data.token) throw new Error(data.message || 'Login failed.');
      sessionStorage.setItem(CONFIG.tokenKey, data.token);
      document.getElementById('xtremePassword').value = '';
      showDashboard();
    } catch (requestError) {
      showLogin(requestError.name === 'AbortError' ? 'Request timed out.' : requestError.message);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Sign in';
    }
  });

  async function validateExistingSession() {
    const token = sessionStorage.getItem(CONFIG.tokenKey);
    if (!token) return showLogin();
    try {
      const response = await apiRequest(CONFIG.sessionPath, {
        method: 'GET', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.authenticated) throw new Error('Session expired.');
      showDashboard();
    } catch {
      sessionStorage.removeItem(CONFIG.tokenKey);
      showLogin('Your session expired. Please sign in again.');
    }
  }

  window.xtremeDashboardAuth = {
    getToken: () => sessionStorage.getItem(CONFIG.tokenKey) || '',
    logout,
    authenticatedFetch: (url, options = {}) => fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${sessionStorage.getItem(CONFIG.tokenKey) || ''}`
      }
    })
  };

  validateExistingSession();
})();
