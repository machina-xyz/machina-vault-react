import { useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
import type { VaultInfo } from './types.js';

export interface UseVaultReturn {
  vault: VaultInfo | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  reconnect: () => Promise<void>;
}

/**
 * Main vault hook for accessing vault info and connection state.
 */
export function useVault(): UseVaultReturn {
  const { vault, isConnected, isLoading, error, apiUrl, getAuthHeaders } = useVaultContext();
  const abortRef = useRef<AbortController | null>(null);

  const reconnect = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${apiUrl}/v1/vault`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Vault reconnection failed: ${response.status} ${response.statusText}`);
      }

      // The provider will handle updating state through context re-fetch.
      // Force a window-level event to signal reconnection if needed.
      window.dispatchEvent(new CustomEvent('machina:vault:reconnect'));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      throw err;
    }
  }, [apiUrl, getAuthHeaders]);

  return { vault, isConnected, isLoading, error, reconnect };
}
