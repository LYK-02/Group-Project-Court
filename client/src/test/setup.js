import '@testing-library/jest-dom';
import { vi } from 'vitest';

export function createDefaultFetchMock() {
  return vi.fn().mockImplementation(async (url) => {
    if (typeof url === 'string' && url.includes('/auth/me')) {
      return {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }),
      };
    }
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'healthy', version: '1.0.0' }),
    };
  });
}

// Global mock for fetch
global.fetch = createDefaultFetchMock();
