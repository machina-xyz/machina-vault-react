import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
/**
 * Hook for managing vault keys (create, revoke, rotate).
 */
export function useKeys() {
    const { apiUrl, getAuthHeaders, isConnected } = useVaultContext();
    const [keys, setKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);
    const abortRef = useRef(null);
    const fetchKeys = useCallback(async () => {
        if (!isConnected)
            return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/v1/vault/keys`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch keys: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (mountedRef.current) {
                setKeys(data.keys ?? []);
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
    }, [apiUrl, getAuthHeaders, isConnected]);
    useEffect(() => {
        mountedRef.current = true;
        if (isConnected) {
            fetchKeys();
        }
        return () => {
            mountedRef.current = false;
            abortRef.current?.abort();
        };
    }, [isConnected, fetchKeys]);
    const createKey = useCallback(async (opts) => {
        const controller = new AbortController();
        try {
            const response = await fetch(`${apiUrl}/v1/vault/keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(opts ?? {}),
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Failed to create key: ${response.status} ${response.statusText}`);
            }
            const key = await response.json();
            if (mountedRef.current) {
                setKeys((prev) => [...prev, key]);
            }
            return key;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (mountedRef.current) {
                setError(error);
            }
            throw error;
        }
    }, [apiUrl, getAuthHeaders]);
    const revokeKey = useCallback(async (keyId) => {
        const controller = new AbortController();
        try {
            const response = await fetch(`${apiUrl}/v1/vault/keys/${encodeURIComponent(keyId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Failed to revoke key: ${response.status} ${response.statusText}`);
            }
            if (mountedRef.current) {
                setKeys((prev) => prev.filter((k) => k.id !== keyId));
            }
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (mountedRef.current) {
                setError(error);
            }
            throw error;
        }
    }, [apiUrl, getAuthHeaders]);
    const rotateKey = useCallback(async (keyId) => {
        const controller = new AbortController();
        try {
            const response = await fetch(`${apiUrl}/v1/vault/keys/${encodeURIComponent(keyId)}/rotate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Failed to rotate key: ${response.status} ${response.statusText}`);
            }
            const newKey = await response.json();
            if (mountedRef.current) {
                setKeys((prev) => prev.map((k) => (k.id === keyId ? newKey : k)));
            }
            return newKey;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (mountedRef.current) {
                setError(error);
            }
            throw error;
        }
    }, [apiUrl, getAuthHeaders]);
    return { keys, createKey, revokeKey, rotateKey, isLoading, error, refresh: fetchKeys };
}
//# sourceMappingURL=use-keys.js.map