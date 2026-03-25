import { useState, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
import type { SignRequest, SignResult } from './types.js';

export interface UseSignReturn {
  sign: (request: SignRequest) => Promise<SignResult>;
  signAndBroadcast: (request: SignRequest) => Promise<SignResult>;
  isLoading: boolean;
  error: Error | null;
  lastResult: SignResult | null;
  reset: () => void;
}

/**
 * Hook for signing and broadcasting transactions through the vault.
 */
export function useSign(): UseSignReturn {
  const { apiUrl, getAuthHeaders } = useVaultContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<SignResult | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  // Track mounted state
  // Note: we don't use useEffect cleanup for mountedRef here because
  // sign operations are user-initiated and we want to track across renders.
  // Instead we use AbortController for cancellation.

  const performSign = useCallback(
    async (request: SignRequest, broadcast: boolean): Promise<SignResult> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/v1/vault/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ ...request, broadcast }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Sign request failed: ${response.status} ${response.statusText}`);
        }

        const result: SignResult = await response.json();

        if (!controller.signal.aborted) {
          setLastResult(result);
          setIsLoading(false);
        }

        return result;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw err;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        if (!controller.signal.aborted) {
          setError(error);
          setIsLoading(false);
        }
        throw error;
      }
    },
    [apiUrl, getAuthHeaders],
  );

  const sign = useCallback(
    (request: SignRequest): Promise<SignResult> => performSign(request, false),
    [performSign],
  );

  const signAndBroadcast = useCallback(
    (request: SignRequest): Promise<SignResult> => performSign(request, true),
    [performSign],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setLastResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { sign, signAndBroadcast, isLoading, error, lastResult, reset };
}
