/** Base URL for the Express API (see server README / deployment env). */
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/**
 * JSON fetch helper: sends credentials (refresh cookie), optional Bearer access token,
 * and throws an Error with `.status` / `.data` when the response is not OK.
 */
export async function apiFetch(path, { method = 'GET', body, accessToken, headers } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseBody = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = responseBody?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = responseBody;
    throw err;
  }
  return responseBody;
}

