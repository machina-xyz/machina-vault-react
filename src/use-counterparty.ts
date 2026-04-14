import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useCounterparty() {
  const ctx = useVaultContext();
  const [counterparties, setCounterparties] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCounterparties = useCallback(async () => {
    setIsLoading(true);
    const data = await ctx.apiFetch('/v1/vault/counterparties') as { data: any[]; riskScore?: number };
    setCounterparties(data.data ?? []);
    setRiskScore(data.riskScore ?? 0);
    setIsLoading(false);
  }, [ctx]);

  const check = useCallback(async (addressOrParams: string | Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    const body = typeof addressOrParams === 'string'
      ? { address: addressOrParams }
      : addressOrParams;
    try {
      const data = await ctx.apiFetch('/v1/vault/counterparty/check', {
        method: 'POST', body: JSON.stringify(body),
      });
      setResult(data);
      setIsLoading(false);
      return data;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setIsLoading(false);
      throw e;
    }
  }, [ctx]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { counterparties, riskScore, result, isLoading, error, fetchCounterparties, check, reset };
}
