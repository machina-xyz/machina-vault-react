import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function usePolicy() {
  const ctx = useVaultContext();
  const [policies, setPolicies] = useState<any[]>([]);
  const [policy, setInternalPolicy] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createPolicy = useCallback(async (params: Record<string, unknown>) => {
    const data = await ctx.apiFetch('/v1/vault/policies', {
      method: 'POST', body: JSON.stringify(params),
    });
    return data;
  }, [ctx]);

  const updatePolicy = useCallback(async (id: string, params: Record<string, unknown>) => {
    const data = await ctx.apiFetch(`/v1/vault/policies/${id}`, {
      method: 'PUT', body: JSON.stringify(params),
    });
    return data;
  }, [ctx]);

  const setPolicy = useCallback(async (rules: any[]) => {
    const data = await ctx.apiFetch('/v1/vault/policy', {
      method: 'PUT', body: JSON.stringify({ rules }),
    });
    setInternalPolicy(rules);
    return data;
  }, [ctx]);

  const evaluatePolicy = useCallback(async (params: Record<string, unknown>) => {
    const data = await ctx.apiFetch('/v1/vault/policy/evaluate', {
      method: 'POST', body: JSON.stringify(params),
    });
    return data;
  }, [ctx]);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    const data = await ctx.apiFetch('/v1/vault/policies') as { data: any[] };
    setPolicies(data.data ?? []);
    setIsLoading(false);
  }, [ctx]);

  return {
    policies, policy, isLoading,
    createPolicy, updatePolicy, setPolicy, evaluatePolicy, fetchPolicies,
  };
}
