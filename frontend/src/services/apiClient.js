const RAW_BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').trim();
const NORMALIZED_BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '');

export const API_URL = NORMALIZED_BACKEND_URL
  ? `${NORMALIZED_BACKEND_URL}/api`
  : '/api';

const ACCESS_TOKEN_KEY = 'nirmaya_session_token';
const LEGACY_TOKEN_KEY = 'token';

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
};

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;

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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) return null;
    return response.json();
  },

  get(endpoint) {
    return api.request(endpoint);
  },

  post(endpoint, data) {
    return api.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  },

  put(endpoint, data) {
    return api.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(endpoint) {
    return api.request(endpoint, { method: 'DELETE' });
  },

  postForm(endpoint, formData) {
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
