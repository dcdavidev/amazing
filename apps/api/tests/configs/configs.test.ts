import { describe, expect, it } from 'vitest';

import { allowedOrigins } from '../../src/configs/allowed-origins.ts';
import { port } from '../../src/configs/port.ts';

describe('Configuration Modules', () => {
  it('exports a numeric port', () => {
    expect(typeof port).toBe('number');
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65_535);
  });

  it('exports allowedOrigins containing localhost and regex patterns', () => {
    expect(Array.isArray(allowedOrigins)).toBe(true);
    expect(allowedOrigins).toContain(`http://localhost:${port}`);

    const hasLocalhostRegex = allowedOrigins.some(
      (entry) => entry instanceof RegExp && entry.test('http://localhost:5173')
    );
    expect(hasLocalhostRegex).toBe(true);

    const hasLoopbackRegex = allowedOrigins.some(
      (entry) => entry instanceof RegExp && entry.test('http://127.0.0.1:3000')
    );
    expect(hasLoopbackRegex).toBe(true);
  });
});
