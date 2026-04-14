import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useKeys() {
  const ctx = useVaultContext();
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createKey = useCallback(async (params?: Record<string, unknown>) => {
    const data = await ctx.apiFetch('/v1/vault/keys', {
      method: 'POST', body: JSON.stringify(params ?? {}),
    });
    return data;
  }, [ctx]);

  const revokeKey = useCallback(async (keyId: string) => {
    await ctx.apiFetch(`/v1/vault/keys/${keyId}`, { method: 'DELETE' });
  }, [ctx]);

  const rotateKey = useCallback(async (keyId: string) => {
    const data = await ctx.apiFetch(`/v1/vault/keys/${keyId}/rotate`, { method: 'POST' });
    return data;
  }, [ctx]);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    const data = await ctx.apiFetch('/v1/vault/keys') as { data: any[] };
    setKeys(data.data ?? []);
    setIsLoading(false);
  }, [ctx]);

  const refresh = useCallback(async () => {
    await fetchKeys();
  }, [fetchKeys]);

  return { keys, isLoading, createKey, revokeKey, rotateKey, fetchKeys, refresh };
}
