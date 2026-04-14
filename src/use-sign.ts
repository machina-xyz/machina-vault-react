import { useCallback, useState } from 'react';
import { useVaultContext } from './use-vault-context';

export function useSign() {
  const ctx = useVaultContext();
  const [isSigning, setIsSigning] = useState(false);

  const sign = useCallback(async (payload: unknown) => {
    setIsSigning(true);
    try {
      const data = await ctx.apiFetch('/v1/vault/sign', {
        method: 'POST',
        body: JSON.stringify(payload),
      }) as { signature: string };
      setIsSigning(false);
      return data.signature;
    } catch (err) {
      setIsSigning(false);
      throw err;
    }
  }, [ctx]);

  return { isSigning, sign };
}
