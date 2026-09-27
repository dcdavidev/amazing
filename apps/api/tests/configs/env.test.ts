import { describe, expect, it, vi } from 'vitest';

import { parseAllowedOrigins } from '../../src/configs/env/parse-allowed-origins.ts';
import { parseDatabaseUrl } from '../../src/configs/env/parse-database-url.ts';
import { parseLogLevel } from '../../src/configs/env/parse-log-level.ts';
import { parseNodeEnv } from '../../src/configs/env/parse-node-env.ts';
import { parsePort } from '../../src/configs/env/parse-port.ts';
import { validateEnv } from '../../src/configs/env/validate-env.ts';

describe('Environment Variable Validation', () => {
  describe('parseNodeEnv', () => {
    it('returns development by default when undefined or empty', () => {
      expect(parseNodeEnv(undefined)).toBe('development');
      expect(parseNodeEnv('')).toBe('development');
      expect(parseNodeEnv(' '.repeat(3))).toBe('development');
    });

    it('accepts valid environment values', () => {
      expect(parseNodeEnv('development')).toBe('development');
      expect(parseNodeEnv('production')).toBe('production');
      expect(parseNodeEnv('test')).toBe('test');
    });

    it('falls back to development and logs error when value is invalid', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parseNodeEnv('staging')).toBe('development');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid NODE_ENV: "staging"')
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('parsePort', () => {
    it('returns 3000 by default when undefined or empty', () => {
      expect(parsePort(undefined)).toBe(3000);
      expect(parsePort('')).toBe(3000);
    });

    it('accepts valid numeric strings and numbers', () => {
      expect(parsePort('8080')).toBe(8080);
      expect(parsePort('3000')).toBe(3000);
      expect(parsePort('65535')).toBe(65_535);
    });

    it('falls back to 3000 and logs error when out of range or not a number', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parsePort('invalid')).toBe(3000);
      expect(parsePort('0')).toBe(3000);
      expect(parsePort('70000')).toBe(3000);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('parseLogLevel', () => {
    it('defaults to info in production and debug in other environments', () => {
      expect(parseLogLevel(undefined, 'production')).toBe('info');
      expect(parseLogLevel(undefined, 'development')).toBe('debug');
      expect(parseLogLevel('', 'test')).toBe('debug');
    });

    it('accepts supported log levels', () => {
      expect(parseLogLevel('warn', 'development')).toBe('warn');
      expect(parseLogLevel('error', 'development')).toBe('error');
      expect(parseLogLevel('silent', 'development')).toBe('silent');
    });

    it('falls back and logs error on unknown log level', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parseLogLevel('verbose', 'development')).toBe('debug');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid LOG_LEVEL: "verbose"')
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('parseAllowedOrigins', () => {
    it('returns undefined when neither ALLOWED_ORIGINS nor CORS_ORIGIN is set', () => {
      expect(parseAllowedOrigins(undefined, undefined)).toBeUndefined();
      expect(parseAllowedOrigins('', '')).toBeUndefined();
    });

    it('accepts single or comma-separated valid URLs and wildcard', () => {
      expect(parseAllowedOrigins('https://app.vercel.app', undefined)).toBe(
        'https://app.vercel.app'
      );
      expect(
        parseAllowedOrigins('https://a.com,http://localhost:5173', undefined)
      ).toBe('https://a.com,http://localhost:5173');
      expect(parseAllowedOrigins('*', undefined)).toBe('*');
    });

    it('uses CORS_ORIGIN as fallback when ALLOWED_ORIGINS is not set', () => {
      expect(parseAllowedOrigins(undefined, 'https://fallback.com')).toBe(
        'https://fallback.com'
      );
    });

    it('falls back to undefined and logs error when invalid URL format is passed', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parseAllowedOrigins('ftp://bad-proto', undefined)).toBeUndefined();
      expect(parseAllowedOrigins('not-a-url', undefined)).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('parseDatabaseUrl', () => {
    it('returns empty string and logs error when undefined or empty', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parseDatabaseUrl(undefined)).toBe('');
      expect(parseDatabaseUrl('')).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL is not set or is empty')
      );
      consoleErrorSpy.mockRestore();
    });

    it('accepts valid postgresql URLs', () => {
      const valid = 'postgresql://user:pass@localhost:5432/amazing_db';
      expect(parseDatabaseUrl(valid)).toBe(valid);
      const validPostgres = 'postgres://user:pass@localhost:5432/amazing_db';
      expect(parseDatabaseUrl(validPostgres)).toBe(validPostgres);
    });

    it('returns raw string with warning when URL is malformed', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(parseDatabaseUrl('mysql://localhost:3306')).toBe(
        'mysql://localhost:3306'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid DATABASE_URL')
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('validateEnv', () => {
    it('validates a complete environment dictionary without throwing', () => {
      const env = validateEnv({
        NODE_ENV: 'test',
        PORT: '4000',
        LOG_LEVEL: 'warn',
        DATABASE_URL:
          'postgresql://postgres:postgres@localhost:5432/amazing_db',
        ALLOWED_ORIGINS: 'https://example.com',
      });

      expect(env.NODE_ENV).toBe('test');
      expect(env.PORT).toBe(4000);
      expect(env.LOG_LEVEL).toBe('warn');
      expect(env.DATABASE_URL).toBe(
        'postgresql://postgres:postgres@localhost:5432/amazing_db'
      );
      expect(env.ALLOWED_ORIGINS).toBe('https://example.com');
    });
  });
});
