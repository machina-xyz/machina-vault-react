import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { VaultConfig, VaultInfo, VaultContextValue } from './types.js';

const VaultContext = createContext<VaultContextValue | null>(null);

export interface VaultProviderProps {
  config: VaultConfig;
  children: ReactNode;
}

export function VaultProvider({ config, children }: VaultProviderProps) {
  const [vault, setVault] = useState<VaultInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (config.auth.type === 'apikey') {
      return { Authorization: `Bearer ${config.auth.key}` };
    }
    return {};
  }, [config.auth]);

  const authenticate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/v1/vault`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Vault authentication failed: ${response.status} ${response.statusText}`);
      }

      const data: VaultInfo = await response.json();

      if (mountedRef.current) {
        setVault(data);
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setVault(null);
        setIsLoading(false);
      }
    }
  }, [config.apiUrl, getAuthHeaders]);

  useEffect(() => {
    mountedRef.current = true;
    authenticate();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [authenticate]);

  const contextValue = useMemo<VaultContextValue>(
    () => ({
      vault,
      isConnected: vault !== null,
      isLoading,
      error,
      apiUrl: config.apiUrl,
      getAuthHeaders,
    }),
    [vault, isLoading, error, config.apiUrl, getAuthHeaders],
  );

  return <VaultContext.Provider value={contextValue}>{children}</VaultContext.Provider>;
}

/**
 * Access the VaultContext. Must be used within a VaultProvider.
 */
export function useVaultContext(): VaultContextValue {
  const context = useContext(VaultContext);
  if (context === null) {
    throw new Error('useVaultContext must be used within a <VaultProvider>');
  }
  return context;
}
