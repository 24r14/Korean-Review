/* Fast startup: prefetch all course sources in parallel and reuse a short-lived local cache. */
(() => {
  const nativeFetch = window.fetch.bind(window);
  const CACHE_PREFIX = 'koreanReviewNetCache_v2:';
  const TTL = 10 * 60 * 1000; // 10 minutes
  const inflight = new Map();

  const sheetBase = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_LKSMUYj7ehGgazL1-sujxiznaWetrYLHPGTRJ9UEHJxYf7r9rNeU5I6Gqenm6e3gQafDA_sZKbKC/pub';
  const warmUrls = [
    'content/lesson13.json',
    'content/explore.json',
    'content/vocab-enrichment.json',
    'shared-content.json',
    `${sheetBase}?gid=0&single=true&output=csv`,
    `${sheetBase}?gid=754782420&single=true&output=csv`,
    `${sheetBase}?gid=1482161321&single=true&output=csv`
  ];

  function canonical(raw) {
    try {
      const u = new URL(raw, location.href);
      u.searchParams.delete('ts');
      return u.href;
    } catch { return String(raw); }
  }

  function isCacheable(url) {
    try {
      const u = new URL(url, location.href);
      if (u.origin === location.origin) {
        return u.pathname.includes('/content/') || u.pathname.endsWith('/shared-content.json');
      }
      return u.hostname === 'docs.google.com' && u.pathname.includes('/spreadsheets/');
    } catch { return false; }
  }

  function readCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (!item || typeof item.body !== 'string') return null;
      return item;
    } catch { return null; }
  }

  function writeCache(key, body, contentType) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ts:Date.now(), body, contentType:contentType || 'text/plain'}));
    } catch {}
  }

  async function networkFetch(input, init, key) {
    const cleanInit = {...(init || {})};
    // app.js currently requests no-store; for course data that only forces needless reloads.
    cleanInit.cache = 'default';
    const response = await nativeFetch(input, cleanInit);
    if (response.ok) {
      try {
        const clone = response.clone();
        const body = await clone.text();
        writeCache(key, body, response.headers.get('content-type') || 'text/plain');
      } catch {}
    }
    return response;
  }

  window.fetch = function(input, init = {}) {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const key = canonical(rawUrl);
    if (method !== 'GET' || !isCacheable(key)) return nativeFetch(input, init);

    const cached = readCache(key);
    if (cached && Date.now() - cached.ts < TTL) {
      // Return immediately, then quietly refresh for the next visit.
      if (!inflight.has(key)) {
        const bg = networkFetch(input, init, key).catch(() => null).finally(() => inflight.delete(key));
        inflight.set(key, bg);
      }
      return Promise.resolve(new Response(cached.body, {status:200, headers:{'content-type':cached.contentType}}));
    }

    if (inflight.has(key)) {
      return inflight.get(key).then(r => r ? r.clone() : nativeFetch(input, init));
    }

    const p = networkFetch(input, init, key).finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p.then(r => r.clone());
  };

  // Start every known request immediately instead of waiting for app.js to request them sequentially.
  warmUrls.forEach(url => window.fetch(url).catch(() => {}));
})();