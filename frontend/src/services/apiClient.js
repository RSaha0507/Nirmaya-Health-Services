const RAW_BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').trim();
const NORMALIZED_BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

export const API_URL = NORMALIZED_BACKEND_URL
  ? `${NORMALIZED_BACKEND_URL}/api`
  : '/api';

const ACCESS_TOKEN_KEY = 'nirmaya_session_token';
const LEGACY_TOKEN_KEY = 'token';
const USER_PROFILE_KEY = 'nirmaya_user_profile';
const DEFAULT_GET_CACHE_TTL_MS = 15000;
const responseCache = new Map();
const inflightGetRequests = new Map();

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

export const clearApiCache = () => {
  responseCache.clear();
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

    if (!force && cacheTtlMs > 0) {
      const cached = responseCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return Promise.resolve(cached.data);
      }
      if (cached) {
        responseCache.delete(cacheKey);
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
