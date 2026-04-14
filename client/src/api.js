const API_BASE = import.meta.env.VITE_API_BASE || '';

const getHeaders = (optionsHeaders = {}) => {
  const token = localStorage.getItem('nsobanuza_token');
  const headers = {
    'Content-Type': 'application/json',
    ...optionsHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const api = {
  get: (path, options = {}) => fetch(`${API_BASE}${path}`, { ...options, method: 'GET', headers: getHeaders(options.headers) }),
  post: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { ...options, method: 'POST', headers: getHeaders(options.headers), body: JSON.stringify(body) }),
  stream: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { ...options, method: 'POST', headers: getHeaders(options.headers), body: JSON.stringify(body) }),
  put: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { ...options, method: 'PUT', headers: getHeaders(options.headers), body: JSON.stringify(body) }),
  patch: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { ...options, method: 'PATCH', headers: getHeaders(options.headers), body: JSON.stringify(body) })
};

const tokenKey = 'nsobanuza_token';

const setToken = (value) => {
  if (value) {
    localStorage.setItem(tokenKey, value);
  }
};

const getToken = () => localStorage.getItem(tokenKey);
const clearToken = () => localStorage.removeItem(tokenKey);

export { api, setToken, getToken, clearToken };
