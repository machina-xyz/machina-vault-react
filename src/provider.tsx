import React, { useCallback, useMemo } from 'react';
import { VaultContext } from './context';
import type { VaultConfig } from './types';

const DEFAULT_API_URL = 'https://vault-api.machina.xyz';

export function VaultProvider({
  config,
  children,
}: {
  config: VaultConfig;
  children: React.ReactNode;
}) {
  const apiUrl = config.apiUrl ?? DEFAULT_API_URL;

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const url = `${apiUrl}${path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      };
      if (config.auth) {
        headers['Authorization'] = `${config.auth.type} ${config.auth.key}`;
      }
      const resp = await fetch(url, { ...init, headers });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error((body as Record<string, string>).error ?? resp.statusText);
      }
      return resp.json();
    },
    [apiUrl, config.auth],
  );

  const value = useMemo(
    () => ({ config, apiUrl, apiFetch }),
    [config, apiUrl, apiFetch],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}
