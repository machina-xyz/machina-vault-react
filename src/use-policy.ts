import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
import type { SignRequest } from './types.js';

export interface PolicyRule {
  [key: string]: unknown;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reasons: string[];
}

export interface UsePolicyReturn {
  policy: PolicyRule[] | null;
  setPolicy: (rules: PolicyRule[]) => Promise<void>;
  evaluatePolicy: (request: SignRequest) => Promise<PolicyEvaluationResult>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing and evaluating vault policies.
 */
export function usePolicy(): UsePolicyReturn {
  const { apiUrl, getAuthHeaders, isConnected } = useVaultContext();
  const [policy, setLocalPolicy] = useState<PolicyRule[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPolicy = useCallback(async () => {
    if (!isConnected) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/v1/vault/policy`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch policy: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (mountedRef.current) {
        setLocalPolicy(data.rules ?? []);
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
      fetchPolicy();
    }
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [isConnected, fetchPolicy]);

  const setPolicy = useCallback(
    async (rules: PolicyRule[]): Promise<void> => {
      const controller = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/v1/vault/policy`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ rules }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to set policy: ${response.status} ${response.statusText}`);
        }

        if (mountedRef.current) {
          setLocalPolicy(rules);
          setIsLoading(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          setIsLoading(false);
        }
        throw error;
      }
    },
    [apiUrl, getAuthHeaders],
  );

  const evaluatePolicy = useCallback(
    async (request: SignRequest): Promise<PolicyEvaluationResult> => {
      const controller = new AbortController();

      try {
        const response = await fetch(`${apiUrl}/v1/vault/policy/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to evaluate policy: ${response.status} ${response.statusText}`,
          );
        }

        const result: PolicyEvaluationResult = await response.json();
        return result;
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

  return { policy, setPolicy, evaluatePolicy, isLoading, error };
}
