import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
import type { BalanceInfo } from './types.js';

export interface UseBalanceOptions {
  pollIntervalMs?: number;
}

export interface UseBalanceReturn {
  balances: BalanceInfo[];
  totalUsd: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and optionally polling vault balances.
 */
export function useBalance(
  chain?: string,
  token?: string,
  options?: UseBalanceOptions,
): UseBalanceReturn {
  const { apiUrl, getAuthHeaders, isConnected } = useVaultContext();
  const [balances, setBalances] = useState<BalanceInfo[]>([]);
  const [totalUsd, setTotalUsd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!isConnected) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (chain) params.set('chain', chain);
      if (token) params.set('token', token);
      const query = params.toString();
      const url = `${apiUrl}/v1/vault/balances${query ? `?${query}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        const fetchedBalances: BalanceInfo[] = data.balances ?? [];
        setBalances(fetchedBalances);
        setTotalUsd(data.totalUsd ?? null);
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
  }, [apiUrl, getAuthHeaders, isConnected, chain, token]);

  // Initial fetch when connected
  useEffect(() => {
    mountedRef.current = true;
    if (isConnected) {
      fetchBalances();
    }
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [isConnected, fetchBalances]);

  // Polling
  useEffect(() => {
    if (!options?.pollIntervalMs || !isConnected) return;

    const interval = setInterval(() => {
      fetchBalances();
    }, options.pollIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [options?.pollIntervalMs, isConnected, fetchBalances]);

  return { balances, totalUsd, isLoading, error, refresh: fetchBalances };
}
