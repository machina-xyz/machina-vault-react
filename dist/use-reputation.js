import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
/**
 * Hook for fetching reputation data for an address or the connected vault.
 */
export function useReputation(address) {
    const { apiUrl, getAuthHeaders, vault, isConnected } = useVaultContext();
    const [reputation, setReputation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const abortRef = useRef(null);
    const resolvedAddress = address ?? vault?.address;
    const fetchReputation = useCallback(async () => {
        if (!resolvedAddress)
            return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/v1/reputation/${encodeURIComponent(resolvedAddress)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch reputation: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (mountedRef.current) {
                setReputation(data);
                setIsLoading(false);
            }
        }
        catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                return;
            }
            if (mountedRef.current) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        }
    }, [apiUrl, getAuthHeaders, resolvedAddress]);
    useEffect(() => {
        mountedRef.current = true;
        if (resolvedAddress) {
            fetchReputation();
        }
        return () => {
            mountedRef.current = false;
            abortRef.current?.abort();
        };
    }, [resolvedAddress, fetchReputation]);
    return { reputation, isLoading, error, refresh: fetchReputation };
}
//# sourceMappingURL=use-reputation.js.map