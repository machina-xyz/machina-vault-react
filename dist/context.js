import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, } from 'react';
const VaultContext = createContext(null);
export function VaultProvider({ config, children }) {
    const [vault, setVault] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const mountedRef = useRef(true);
    const getAuthHeaders = useCallback(() => {
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
            const data = await response.json();
            if (mountedRef.current) {
                setVault(data);
                setIsLoading(false);
            }
        }
        catch (err) {
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
    const contextValue = useMemo(() => ({
        vault,
        isConnected: vault !== null,
        isLoading,
        error,
        apiUrl: config.apiUrl,
        getAuthHeaders,
    }), [vault, isLoading, error, config.apiUrl, getAuthHeaders]);
    return _jsx(VaultContext.Provider, { value: contextValue, children: children });
}
/**
 * Access the VaultContext. Must be used within a VaultProvider.
 */
export function useVaultContext() {
    const context = useContext(VaultContext);
    if (context === null) {
        throw new Error('useVaultContext must be used within a <VaultProvider>');
    }
    return context;
}
//# sourceMappingURL=context.js.map