const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const api = {
  get: (path, options = {}) => fetch(`${API_BASE}${path}`, { method: 'GET', ...options }),
  post: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, body: JSON.stringify(body), ...options }),
  put: (path, body, options = {}) => fetch(`${API_BASE}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, body: JSON.stringify(body), ...options })
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
