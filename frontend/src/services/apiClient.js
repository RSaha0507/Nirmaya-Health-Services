const RAW_BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').trim();
const NORMALIZED_BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

export const API_URL = NORMALIZED_BACKEND_URL
  ? `${NORMALIZED_BACKEND_URL}/api`
  : '/api';

const ACCESS_TOKEN_KEY = 'nirmaya_session_token';
const LEGACY_TOKEN_KEY = 'token';
const USER_PROFILE_KEY = 'nirmaya_user_profile';
const PERSISTED_CACHE_PREFIX = 'nirmaya_api_cache:';
const DEFAULT_GET_CACHE_TTL_MS = 15000;
const responseCache = new Map();
const inflightGetRequests = new Map();
const PERSISTED_ENDPOINT_RULES = [
  { pattern: /^\/doctors(\?|$)/, ttlMs: 5 * 60 * 1000 },
  { pattern: /^\/equipment(\?|$)/, ttlMs: 5 * 60 * 1000 },
  { pattern: /^\/departments(\?|$)/, ttlMs: 5 * 60 * 1000 },
  { pattern: /^\/health-packages(\?|$)/, ttlMs: 5 * 60 * 1000 },
  { pattern: /^\/lab-tests(\?|$)/, ttlMs: 3 * 60 * 1000 },
  { pattern: /^\/beds(\?|$)/, ttlMs: 60 * 1000 },
  { pattern: /^\/beds\/availability(\?|$)/, ttlMs: 60 * 1000 },
];

const safeReadStorage = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
};

const safeWriteStorage = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch (error) {
    // Ignore storage write failures (private mode/restrictions).
  }
};

const safeRemoveStorage = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch (error) {
    // Ignore storage remove failures.
  }
};

const normalizeToken = (token) => (typeof token === 'string' ? token.trim() : '');

const isBrowser = () => typeof window !== 'undefined';

export const setAccessToken = (token) => {
  const normalizedToken = normalizeToken(token);
  if (!isBrowser()) return;

  if (!normalizedToken) {
    clearAccessToken();
    return;
  }

  safeWriteStorage(window.sessionStorage, ACCESS_TOKEN_KEY, normalizedToken);
  safeRemoveStorage(window.sessionStorage, LEGACY_TOKEN_KEY);
  safeRemoveStorage(window.localStorage, ACCESS_TOKEN_KEY);
  safeRemoveStorage(window.localStorage, LEGACY_TOKEN_KEY);
};

export const getAccessToken = () => {
  if (!isBrowser()) return '';

  const primary = safeReadStorage(window.sessionStorage, ACCESS_TOKEN_KEY);
  if (primary) return primary;

  const fallback =
    safeReadStorage(window.sessionStorage, LEGACY_TOKEN_KEY) ||
    safeReadStorage(window.localStorage, ACCESS_TOKEN_KEY) ||
    safeReadStorage(window.localStorage, LEGACY_TOKEN_KEY);

  if (fallback) setAccessToken(fallback);
  return fallback || '';
};

export const clearAccessToken = () => {
  if (!isBrowser()) return;
  safeRemoveStorage(window.sessionStorage, ACCESS_TOKEN_KEY);
  safeRemoveStorage(window.sessionStorage, LEGACY_TOKEN_KEY);
  safeRemoveStorage(window.localStorage, ACCESS_TOKEN_KEY);
  safeRemoveStorage(window.localStorage, LEGACY_TOKEN_KEY);
  clearCachedUserProfile();
  clearApiCache();
};

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;
const getCacheKey = (endpoint) => `GET:${endpoint}`;
const getPersistedCacheKey = (endpoint) => `${PERSISTED_CACHE_PREFIX}${endpoint}`;

const getPersistedCacheRule = (endpoint) =>
  PERSISTED_ENDPOINT_RULES.find((rule) => rule.pattern.test(endpoint));

const readPersistedCache = (endpoint) => {
  if (!isBrowser()) return null;
  const raw = safeReadStorage(window.sessionStorage, getPersistedCacheKey(endpoint));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.expiresAt <= Date.now()) {
      safeRemoveStorage(window.sessionStorage, getPersistedCacheKey(endpoint));
      return null;
    }
    return parsed.data;
  } catch (error) {
    safeRemoveStorage(window.sessionStorage, getPersistedCacheKey(endpoint));
    return null;
  }
};

const writePersistedCache = (endpoint, data, ttlMs) => {
  if (!isBrowser() || !ttlMs || ttlMs <= 0) return;
  safeWriteStorage(
    window.sessionStorage,
    getPersistedCacheKey(endpoint),
    JSON.stringify({
      expiresAt: Date.now() + ttlMs,
      data,
    })
  );
};

const clearPersistedApiCache = (endpointPrefix = '') => {
  if (!isBrowser()) return;
  const keys = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key || !key.startsWith(PERSISTED_CACHE_PREFIX)) continue;
    if (!endpointPrefix || key.startsWith(`${PERSISTED_CACHE_PREFIX}${endpointPrefix}`)) {
      keys.push(key);
    }
  }
  keys.forEach((key) => safeRemoveStorage(window.sessionStorage, key));
};

export const clearApiCache = () => {
  responseCache.clear();
  clearPersistedApiCache();
};

export const invalidateApiCache = (endpointPrefix = '') => {
  if (!endpointPrefix) {
    clearApiCache();
    return;
  }
  const normalizedPrefix = getCacheKey(endpointPrefix);
  for (const key of responseCache.keys()) {
    if (key.startsWith(normalizedPrefix)) {
      responseCache.delete(key);
    }
  }
  clearPersistedApiCache(endpointPrefix);
};

export const setCachedUserProfile = (profile) => {
  if (!isBrowser()) return;
  if (!profile || typeof profile !== 'object') {
    clearCachedUserProfile();
    return;
  }
  safeWriteStorage(window.sessionStorage, USER_PROFILE_KEY, JSON.stringify(profile));
};

export const getCachedUserProfile = () => {
  if (!isBrowser()) return null;
  const raw = safeReadStorage(window.sessionStorage, USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    clearCachedUserProfile();
    return null;
  }
};

export const clearCachedUserProfile = () => {
  if (!isBrowser()) return;
  safeRemoveStorage(window.sessionStorage, USER_PROFILE_KEY);
};

export const api = {
  async request(endpoint, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getAccessToken();

    if (!isFormData(options.body)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      const errorMessage =
        (error && (error.detail || error.message)) ||
        response.statusText ||
        'Request failed';
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null;
    return response.json();
  },

  get(endpoint, options = {}) {
    const { cacheTtlMs = DEFAULT_GET_CACHE_TTL_MS, force = false } = options;
    const cacheKey = getCacheKey(endpoint);
    const persistedRule = getPersistedCacheRule(endpoint);

    if (!force && cacheTtlMs > 0) {
      const cached = responseCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return Promise.resolve(cached.data);
      }
      if (cached) {
        responseCache.delete(cacheKey);
      }
    }

    if (!force && persistedRule) {
      const persisted = readPersistedCache(endpoint);
      if (persisted !== null && persisted !== undefined) {
        if (cacheTtlMs > 0) {
          responseCache.set(cacheKey, {
            data: persisted,
            expiresAt: Date.now() + Math.min(cacheTtlMs, persistedRule.ttlMs),
          });
        }
        return Promise.resolve(persisted);
      }
    }

    if (!force && inflightGetRequests.has(cacheKey)) {
      return inflightGetRequests.get(cacheKey);
    }

    const request = api
      .request(endpoint)
      .then((data) => {
        if (cacheTtlMs > 0) {
          responseCache.set(cacheKey, {
            data,
            expiresAt: Date.now() + cacheTtlMs,
          });
        }
        if (persistedRule) {
          writePersistedCache(endpoint, data, persistedRule.ttlMs);
        }
        return data;
      })
      .finally(() => {
        inflightGetRequests.delete(cacheKey);
      });

    inflightGetRequests.set(cacheKey, request);
    return request;
  },

  post(endpoint, data) {
    invalidateApiCache();
    return api.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  },

  put(endpoint, data) {
    invalidateApiCache();
    return api.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(endpoint) {
    invalidateApiCache();
    return api.request(endpoint, { method: 'DELETE' });
  },

  postForm(endpoint, formData) {
    invalidateApiCache();
    return api.request(endpoint, { method: 'POST', body: formData });
  },
};

const normalizeAllowedHosts = (hosts = []) =>
  hosts
    .map((host) => String(host || '').trim().toLowerCase())
    .filter(Boolean)
    .map((host) => host.replace(/^\*\./, ''));

const isHostAllowed = (hostname, allowedHosts = []) => {
  if (!allowedHosts.length) return true;
  const normalizedHost = String(hostname || '').toLowerCase();
  return allowedHosts.some(
    (allowedHost) =>
      normalizedHost === allowedHost || normalizedHost.endsWith(`.${allowedHost}`)
  );
};

const sanitizeExternalUrl = (value, options = {}) => {
  if (!isBrowser()) return null;
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    const allowedHosts = normalizeAllowedHosts(options.allowedHosts || []);
    if (!isHostAllowed(parsed.hostname, allowedHosts)) return null;

    parsed.hash = '';
    return parsed.toString();
  } catch (error) {
    return null;
  }
};

export const openExternalUrlSafely = (url, options = {}) => {
  if (!isBrowser()) return false;
  const safeUrl = sanitizeExternalUrl(url, options);
  if (!safeUrl) return false;
  window.open(safeUrl, '_blank', 'noopener,noreferrer');
  return true;
};

export const redirectToExternalUrlSafely = (url, options = {}) => {
  if (!isBrowser()) return false;
  const safeUrl = sanitizeExternalUrl(url, options);
  if (!safeUrl) return false;
  window.location.assign(safeUrl);
  return true;
};

export const buildWebSocketUrl = (path, token = '') => {
  if (!isBrowser()) return '';

  const wsBase = NORMALIZED_BACKEND_URL
    ? NORMALIZED_BACKEND_URL.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;

  const normalizedPath = String(path || '').trim().replace(/^\/+/, '');
  const socketUrl = new URL(normalizedPath, wsBase.endsWith('/') ? wsBase : `${wsBase}/`);

  if (token) {
    socketUrl.searchParams.set('token', token);
  }

  return socketUrl.toString();
};
