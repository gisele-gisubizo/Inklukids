import { apiFetch } from './client';

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ hello: 'world' }),
    });

    const data = await apiFetch('/api/health');
    expect(data).toEqual({ hello: 'world' });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/health',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('sends Bearer token when accessToken is provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({}),
    });

    await apiFetch('/api/auth/me', { accessToken: 'abc' });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer abc',
        }),
      }),
    );
  });

  it('throws with message and status from JSON error body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Invalid credentials' }),
    });

    await expect(apiFetch('/api/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'Invalid credentials',
      status: 401,
    });
  });

  it('throws generic message when response is not JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => 'text/html' },
      json: async () => null,
    });

    await expect(apiFetch('/bad')).rejects.toMatchObject({
      message: 'Request failed (502)',
      status: 502,
    });
  });
});
