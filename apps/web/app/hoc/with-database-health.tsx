import React, { useCallback, useEffect, useState } from 'react';

import { LoadingScreen } from '~/components/LoadingScreen';
import { MaintenanceSplashScreen } from '~/components/MaintenanceSplashScreen';
import { checkDatabaseHealth } from '~/services/check-database-health';
import type { DatabaseHealthResult, DatabaseHealthState } from '~/types/health';

/**
 * Return signature of the useDatabaseHealth hook.
 */
export interface UseDatabaseHealthReturn {
  readonly isHealthy: boolean | null;
  readonly databaseStatus: DatabaseHealthState | null;
  readonly isChecking: boolean;
  readonly recheck: () => Promise<void>;
}

/**
 * Custom React hook that queries the root health check endpoint and tracks database availability.
 *
 * Automatically conducts an initial check on mount, and sets up a periodic polling timer
 * when in maintenance state to recover automatically once the database returns online.
 *
 * @returns Object exposing health state, raw database status, loading indicator, and manual recheck trigger.
 */
export function useDatabaseHealth(): UseDatabaseHealthReturn {
  const [health, setHealth] = useState<DatabaseHealthResult | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const recheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkDatabaseHealth();
      setHealth(result);
    } catch {
      setHealth({ isHealthy: false, database: 'offline' });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void recheck();
  }, [recheck]);

  // Periodic polling when unhealthy to automatically resume once database recovers
  useEffect(() => {
    if (health !== null && !health.isHealthy) {
      const timer = setInterval(() => {
        void recheck();
      }, 30_000);

      return () => {
        clearInterval(timer);
      };
    }

    return;
  }, [health, recheck]);

  return {
    isHealthy: health === null ? null : health.isHealthy,
    databaseStatus: health?.database ?? null,
    isChecking,
    recheck,
  };
}

/**
 * Properties for DatabaseHealthGuard component.
 */
export interface DatabaseHealthGuardProps {
  readonly children: React.ReactNode;
}

/**
 * Guard component that inspects database health before rendering its children.
 *
 * If the database is unhealthy (malformed, not reachable, offline, or invalid),
 * it displays the Italian MaintenanceSplashScreen.
 *
 * @param props - Component children.
 * @returns Guarded React element or splash screen.
 */
export function DatabaseHealthGuard({ children }: DatabaseHealthGuardProps) {
  const { isHealthy, isChecking, recheck } = useDatabaseHealth();

  if (isHealthy === null && isChecking) {
    return <LoadingScreen />;
  }

  return isHealthy ? (
    <>{children}</>
  ) : (
    <MaintenanceSplashScreen isChecking={isChecking} onRetry={recheck} />
  );
}

/**
 * Higher-Order Component (HOC) wrapping a component with database health inspection.
 *
 * Intercepts rendering and displays a maintenance splash screen in Italian if the database
 * is offline, malformed, not reachable, or reporting an invalid state.
 *
 * @template P - Properties expected by the wrapped component.
 * @param Component - Target React component to wrap.
 * @returns Wrapped component guarded by database health checks.
 */
export function withDatabaseHealth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const ComponentWithDatabaseHealth: React.FC<P> = (props: P) => {
    return (
      <DatabaseHealthGuard>
        <Component {...props} />
      </DatabaseHealthGuard>
    );
  };

  const displayName =
    Component.displayName ?? Component.name ?? 'ComponentWithDatabaseHealth';
  ComponentWithDatabaseHealth.displayName = `withDatabaseHealth(${displayName})`;

  return ComponentWithDatabaseHealth;
}
