import type { Server } from 'node:http';

import type { Express } from 'express';

import { describe, expect, it, vi } from 'vitest';

import { setupGracefulShutdown } from '../../src/lib/setup-graceful-shutdown.ts';
import { startServer } from '../../src/lib/start-server.ts';

describe('Server Lifecycle Modules', () => {
  describe('startServer', () => {
    it('creates server and attaches error listener', () => {
      const errorListeners: Array<(err: NodeJS.ErrnoException) => void> = [];
      const mockServer = {
        on: vi.fn(
          (
            event: string,
            listener: (err: NodeJS.ErrnoException) => void
          ): Server => {
            if (event === 'error') {
              errorListeners.push(listener);
            }
            return mockServer as unknown as Server;
          }
        ),
      } as unknown as Server;

      const mockApp = {
        listen: vi.fn().mockReturnValue(mockServer),
      } as unknown as Express;

      const server = startServer(mockApp, 0);
      expect(mockApp.listen).toHaveBeenCalledWith(0, expect.any(Function));
      expect(server).toBe(mockServer);

      // Trigger EADDRINUSE error handler
      const err = new Error('Address in use') as NodeJS.ErrnoException;
      err.code = 'EADDRINUSE';
      for (const listener of errorListeners) {
        listener(err);
      }
      expect(process.exitCode).toBe(1);
      process.exitCode = 0; // reset
    });
  });

  describe('setupGracefulShutdown', () => {
    it('registers signal and unhandled rejection listeners', () => {
      const mockServer = {
        close: vi.fn(),
        closeIdleConnections: vi.fn(),
        closeAllConnections: vi.fn(),
      } as unknown as Server;

      const processOnSpy = vi.spyOn(process, 'on');
      setupGracefulShutdown(mockServer);

      expect(processOnSpy).toHaveBeenCalledWith(
        'SIGTERM',
        expect.any(Function)
      );
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      processOnSpy.mockRestore();
    });
  });
});
