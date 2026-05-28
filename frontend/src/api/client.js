/**
 * Thin client for the Chapterly Express API.
 *
 * - Base URL defaults to "/api" (proxied to the backend by Vite in dev); override
 *   with VITE_API_URL for a deployed backend.
 * - The JWT returned by login/register is kept in localStorage and attached as a
 *   Bearer token on every request.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'chapterly-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Performs a JSON request and throws an Error (with .status) on non-2xx responses.
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

/**
 * Uploads a file via multipart/form-data (used for Cloudinary-backed photos).
 * The browser sets the multipart Content-Type/boundary automatically.
 */
async function uploadFile(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  return parseResponse(response);
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  // --- Auth ---
  register: (data) =>
    request('/auth/register', { method: 'POST', body: data, auth: false }),
  login: (data) => request('/auth/login', { method: 'POST', body: data, auth: false }),
  me: () => request('/auth/me'),

  // --- Chapters ---
  listChapters: () => request('/chapters'),
  createChapter: (data) => request('/chapters', { method: 'POST', body: data }),

  // --- Journal entries (stories) ---
  listJournalEntries: (chapterId) =>
    request(`/journal-entries${chapterId ? `?chapterId=${chapterId}` : ''}`),
  createJournalEntry: (data) =>
    request('/journal-entries', { method: 'POST', body: data }),

  // --- Goals ---
  listGoals: (chapterId) => request(`/goals${chapterId ? `?chapterId=${chapterId}` : ''}`),
  createGoal: (data) => request('/goals', { method: 'POST', body: data }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: data }),

  // --- Photos (Cloudinary-backed) ---
  listPhotos: (chapterId) => request(`/photos${chapterId ? `?chapterId=${chapterId}` : ''}`),
  uploadPhoto: ({ chapterId, caption, file }) => {
    const formData = new FormData();
    formData.append('chapterId', String(chapterId));
    if (caption) {
      formData.append('caption', caption);
    }
    formData.append('photo', file);
    return uploadFile('/photos/upload', formData);
  },
};
