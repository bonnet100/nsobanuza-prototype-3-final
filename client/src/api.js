const tokenKey = 'nsobanuza_token';
const LIVE_API_BASE = 'https://nsobanuza-prototype-3-final-backend.vercel.app';
const configuredApiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL;
const API_BASE = String(
  configuredApiBase || (import.meta.env.DEV ? '' : LIVE_API_BASE)
).replace(/\/+$/, '');

const buildUrl = (path) => `${API_BASE}${formatPath(path)}`;

const getHeaders = (optionsHeaders = {}) => {
  const token = localStorage.getItem(tokenKey);
  const headers = {
    'Content-Type': 'application/json',
    ...optionsHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to ensure paths start with a slash and handle the /auth prefix correctly
const formatPath = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If the component calls '/login', we redirect it to '/auth/login' to match your backend
  if (cleanPath === '/login' || cleanPath === '/register' || cleanPath === '/me') {
    return `/auth${cleanPath}`;
  }
  return cleanPath;
};

const request = (method, path, body, options = {}) => {
  const config = {
    ...options,
    method,
    headers: getHeaders(options.headers)
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  return fetch(buildUrl(path), config);
};

const api = {
  get: (path, options = {}) => request('GET', path, undefined, options),
  post: (path, body, options = {}) => request('POST', path, body, options),
  put: (path, body, options = {}) => request('PUT', path, body, options),
  patch: (path, body, options = {}) => request('PATCH', path, body, options),
  delete: (path, options = {}) => request('DELETE', path, undefined, options),
  stream: (path, body, options = {}) => request('POST', path, body, options)
};

const setToken = (value) => {
  if (value) {
    localStorage.setItem(tokenKey, value);
  } else {
    localStorage.removeItem(tokenKey);
  }
};

const getToken = () => localStorage.getItem(tokenKey);
const clearToken = () => localStorage.removeItem(tokenKey);

export { api, setToken, getToken, clearToken };
