import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useVault() {
  const ctx = useVaultContext();
  const [vault, setVault] = useState<any | null>(null);
  const [vaults, setVaults] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const unlock = useCallback(async (passphrase?: string) => {
    await ctx.apiFetch('/v1/vault/unlock', { method: 'POST', body: JSON.stringify({ passphrase }) });
    setIsLocked(false);
    setIsConnected(true);
  }, [ctx]);

  const lock = useCallback(async () => {
    await ctx.apiFetch('/v1/vault/lock', { method: 'POST' });
    setIsLocked(true);
  }, [ctx]);

  const fetchVaults = useCallback(async () => {
    setIsLoading(true);
    const data = await ctx.apiFetch('/v1/vaults') as { data: any[] };
    setVaults(data.data ?? []);
    setIsLoading(false);
  }, [ctx]);

  return { vault, vaults, isLocked, isConnected, isLoading, unlock, lock, fetchVaults };
}
