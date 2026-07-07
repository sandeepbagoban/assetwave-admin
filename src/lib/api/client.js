const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1';
const TOKEN_KEY = 'assetwave_admin_token';
const USER_KEY = 'assetwave_admin_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function buildQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Core request helper. Always unwraps the {data} / {data, meta} envelope so
 * callers just get the payload (plus .meta attached when present).
 */
async function request(path, { method = 'GET', body, params, isForm = false, signal } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body !== undefined && !isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (networkErr) {
    throw new Error(`Network error contacting API: ${networkErr.message}`);
  }

  if (res.status === 204) return null;

  let json = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // non-JSON response body
    }
  }

  if (!res.ok) {
    const message = json?.error?.message || json?.message || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.code = json?.error?.code;
    throw err;
  }

  if (json && typeof json === 'object' && 'data' in json) {
    if (json.meta) {
      const wrapped = json.data;
      if (Array.isArray(wrapped)) {
        wrapped.meta = json.meta;
        return wrapped;
      }
      return { ...wrapped, meta: json.meta };
    }
    return json.data;
  }

  return json;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
};

export { TOKEN_KEY, USER_KEY };
