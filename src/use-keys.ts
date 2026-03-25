import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
import type { KeyInfo } from './types.js';

export interface CreateKeyOptions {
  tier?: string;
  label?: string;
  expiresIn?: string;
}

export interface UseKeysReturn {
  keys: KeyInfo[];
  createKey: (opts?: CreateKeyOptions) => Promise<KeyInfo>;
  revokeKey: (keyId: string) => Promise<void>;
  rotateKey: (keyId: string) => Promise<KeyInfo>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing vault keys (create, revoke, rotate).
 */
export function useKeys(): UseKeysReturn {
  const { apiUrl, getAuthHeaders, isConnected } = useVaultContext();
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!isConnected) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/v1/vault/keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch keys: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setKeys(data.keys ?? []);
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
  }, [apiUrl, getAuthHeaders, isConnected]);

  useEffect(() => {
    mountedRef.current = true;
    if (isConnected) {
      fetchKeys();
    }
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [isConnected, fetchKeys]);

  const createKey = useCallback(
    async (opts?: CreateKeyOptions): Promise<KeyInfo> => {
      const controller = new AbortController();

      try {
        const response = await fetch(`${apiUrl}/v1/vault/keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(opts ?? {}),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to create key: ${response.status} ${response.statusText}`);
        }

        const key: KeyInfo = await response.json();

        if (mountedRef.current) {
          setKeys((prev) => [...prev, key]);
        }

        return key;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
        }
        throw error;
      }
    },
    [apiUrl, getAuthHeaders],
  );

  const revokeKey = useCallback(
    async (keyId: string): Promise<void> => {
      const controller = new AbortController();

      try {
        const response = await fetch(
          `${apiUrl}/v1/vault/keys/${encodeURIComponent(keyId)}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to revoke key: ${response.status} ${response.statusText}`);
        }

        if (mountedRef.current) {
          setKeys((prev) => prev.filter((k) => k.id !== keyId));
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
        }
        throw error;
      }
    },
    [apiUrl, getAuthHeaders],
  );

  const rotateKey = useCallback(
    async (keyId: string): Promise<KeyInfo> => {
      const controller = new AbortController();

      try {
        const response = await fetch(
          `${apiUrl}/v1/vault/keys/${encodeURIComponent(keyId)}/rotate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to rotate key: ${response.status} ${response.statusText}`);
        }

        const newKey: KeyInfo = await response.json();

        if (mountedRef.current) {
          setKeys((prev) => prev.map((k) => (k.id === keyId ? newKey : k)));
        }

        return newKey;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
        }
        throw error;
      }
    },
    [apiUrl, getAuthHeaders],
  );

  return { keys, createKey, revokeKey, rotateKey, isLoading, error, refresh: fetchKeys };
}
