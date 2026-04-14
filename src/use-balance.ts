import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useBalance() {
  const ctx = useVaultContext();
  const [balances, setBalances] = useState<any[]>([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = useCallback(async () => {
    setIsLoading(true);
    const data = await ctx.apiFetch('/v1/vault/balances') as { data: any[]; totalUsd?: number };
    setBalances(data.data ?? []);
    setTotalUsd(data.totalUsd ?? 0);
    setIsLoading(false);
  }, [ctx]);

  const refresh = useCallback(async () => {
    await fetchBalances();
  }, [fetchBalances]);

  return { balances, totalUsd, isLoading, fetchBalances, refresh };
}
