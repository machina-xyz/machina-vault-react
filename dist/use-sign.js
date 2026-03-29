import { useState, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
/**
 * Hook for signing and broadcasting transactions through the vault.
 */
export function useSign() {
    const { apiUrl, getAuthHeaders } = useVaultContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const mountedRef = useRef(true);
    const abortRef = useRef(null);
    // Track mounted state
    // Note: we don't use useEffect cleanup for mountedRef here because
    // sign operations are user-initiated and we want to track across renders.
    // Instead we use AbortController for cancellation.
    const performSign = useCallback(async (request, broadcast) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/v1/vault/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ ...request, broadcast }),
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Sign request failed: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            if (!controller.signal.aborted) {
                setLastResult(result);
                setIsLoading(false);
            }
            return result;
        }
        catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                throw err;
            }
            const error = err instanceof Error ? err : new Error(String(err));
            if (!controller.signal.aborted) {
                setError(error);
                setIsLoading(false);
            }
            throw error;
        }
    }, [apiUrl, getAuthHeaders]);
    const sign = useCallback((request) => performSign(request, false), [performSign]);
    const signAndBroadcast = useCallback((request) => performSign(request, true), [performSign]);
    const reset = useCallback(() => {
        abortRef.current?.abort();
        setLastResult(null);
        setError(null);
        setIsLoading(false);
    }, []);
    return { sign, signAndBroadcast, isLoading, error, lastResult, reset };
}
//# sourceMappingURL=use-sign.js.map