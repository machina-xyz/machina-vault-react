import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

export function useReputation() {
  const ctx = useVaultContext();
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReputation = useCallback(async (address: string) => {
    setIsLoading(true);
    const data = await ctx.apiFetch(`/v1/vault/reputation/${address}`) as { score: number; history: unknown[] };
    setScore(data.score ?? 0);
    setHistory(data.history ?? []);
    setIsLoading(false);
  }, [ctx]);

  return { score, history, isLoading, fetchReputation };
}
