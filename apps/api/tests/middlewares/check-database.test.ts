import type { NextFunction, Request, Response } from 'express';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as dbStatusModule from '../../src/lib/check-database-status.ts';
import { checkDatabase } from '../../src/middlewares/check-database.ts';

describe('checkDatabase Middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('bypasses database check on root path "/"', async () => {
    const req = { path: '/' } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    const spy = vi.spyOn(dbStatusModule, 'checkDatabaseStatus');
    await checkDatabase(req, res, next);

    expect(spy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('calls next() when database is running', async () => {
    const req = { path: '/articles' } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    vi.spyOn(dbStatusModule, 'checkDatabaseStatus').mockResolvedValue({
      status: 'running',
      isRunning: true,
      troubleshooting: [],
    });

    await checkDatabase(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 503 error response when database is offline', async () => {
    const req = { path: '/articles' } as Request;
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock } as unknown as Response;
    const next = vi.fn() as NextFunction;

    vi.spyOn(dbStatusModule, 'checkDatabaseStatus').mockResolvedValue({
      status: 'not reachable',
      isRunning: false,
      errorDetails: 'Connection refused',
      troubleshooting: ['Start Docker'],
    });

    await checkDatabase(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(503);
    expect(jsonMock).toHaveBeenCalledWith({
      error: '@amazing/api is offline. Please try again later.',
    });
  });
});
