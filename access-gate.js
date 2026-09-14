/* Lightweight class access gate for a static GitHub Pages site.
   This deters casual access, but it is not a substitute for real server-side authentication. */
(() => {
  const accessConfig = window.KOREAN_REVIEW_ACCESS || {
    enabled: true,
    version: 'class-2026-fall',
    title: 'Korean Review class access',
    subtitle: 'For students using this Korean review site in class.',
    notice: 'Please do not repost teacher-derived course structure, screenshots, or classroom materials.',
    users: [
      {
        label: 'Class passcode',
        username: 'student',
        hash: 'd3f249ff3b185b392c2b614ea04d0ad1b72668ca21fe65cda68140e9b7abcff8'
      }
    ]
  };
  window.KOREAN_REVIEW_ACCESS = accessConfig;

  const sessionKey = `korean-review-access:${accessConfig.version}:session`;
  const rememberKey = `korean-review-access:${accessConfig.version}:remember`;
  const pendingStarts = [];

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function userMarker(username) {
    return `${String(username || '').toLowerCase()}:${accessConfig.version}`;
  }

  function storedMarker() {
    try {
      return sessionStorage.getItem(sessionKey) || localStorage.getItem(rememberKey);
    } catch {
      return '';
    }
  }

  function ready() {
    if (!accessConfig.enabled) return true;
    const marker = storedMarker();
    return (accessConfig.users || []).some(user => marker === userMarker(user.username));
  }

  function setLockedClass() {
    document.documentElement.classList.toggle('access-locked', !ready());
    document.documentElement.classList.toggle('access-ready', ready());
  }

  async function sha256(text) {
    if (!window.crypto?.subtle) {
      throw new Error('Secure browser crypto is unavailable.');
    }
    const encoded = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function findUser(username, password) {
    const normalized = String(username || '').trim().toLowerCase();
    const hash = await sha256(`${normalized}:${password || ''}`);
    return (accessConfig.users || []).find(user =>
      String(user.username || '').toLowerCase() === normalized && user.hash === hash
    );
  }

  function unlock(user, remember) {
    const marker = userMarker(user.username);
    try {
      sessionStorage.setItem(sessionKey, marker);
      if (remember) localStorage.setItem(rememberKey, marker);
      else localStorage.removeItem(rememberKey);
    } catch {}

    document.getElementById('accessGate')?.remove();
    setLockedClass();
    while (pendingStarts.length) pendingStarts.shift()?.();
  }

  function startWhenUnlocked(fn) {
    if (ready()) {
      fn();
      return;
    }
    pendingStarts.push(fn);
  }

  function renderGate() {
    if (ready() || document.getElementById('accessGate')) {
      setLockedClass();
      return;
    }

    const gate = document.createElement('div');
    gate.id = 'accessGate';
    gate.className = 'access-gate';
    gate.innerHTML = `
      <div class="access-panel" role="dialog" aria-modal="true" aria-labelledby="accessTitle">
        <div class="access-mark">복습장</div>
        <h1 id="accessTitle">${esc(accessConfig.title)}</h1>
        <p class="access-subtitle">${esc(accessConfig.subtitle)}</p>
        <form id="accessForm" class="access-form">
          <label for="accessUsername">Username</label>
          <input id="accessUsername" name="username" autocomplete="username" required>
          <label for="accessPassword">Password</label>
          <input id="accessPassword" name="password" type="password" autocomplete="current-password" required>
          <label class="access-check">
            <input id="accessRemember" type="checkbox">
            <span>Remember this device</span>
          </label>
          <button class="access-submit" type="submit">Enter site</button>
          <div class="access-error" id="accessError" role="status"></div>
        </form>
        <p class="access-note">${esc(accessConfig.notice)}</p>
        <p class="access-footnote">This is a light class gate for a static site. Use private hosting for real per-person accounts.</p>
      </div>
    `;
    document.body.appendChild(gate);

    const form = document.getElementById('accessForm');
    const error = document.getElementById('accessError');
    const username = document.getElementById('accessUsername');
    const password = document.getElementById('accessPassword');
    const submit = form.querySelector('button[type="submit"]');

    username.focus();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      error.textContent = '';
      submit.disabled = true;
      submit.textContent = 'Checking...';
      try {
        const user = await findUser(username.value, password.value);
        if (!user) {
          error.textContent = 'That username or password did not match.';
          password.select();
          return;
        }
        unlock(user, document.getElementById('accessRemember').checked);
      } catch (err) {
        error.textContent = 'This browser could not verify the passcode. Try opening the HTTPS site.';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Enter site';
      }
    });

    setLockedClass();
  }

  if (!ready()) document.documentElement.classList.add('access-locked');
  document.addEventListener('DOMContentLoaded', renderGate);

  window.KoreanReviewAccess = {
    ready,
    startWhenUnlocked,
    show: renderGate
  };
})();
