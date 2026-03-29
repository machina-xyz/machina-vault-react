import { useState, useCallback, useRef } from 'react';
import { useVaultContext } from './context.js';
/**
 * Hook for checking counterparty risk (reputation, sanctions, risk score).
 */
export function useCounterparty() {
    const { apiUrl, getAuthHeaders } = useVaultContext();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    const mountedRef = useRef(true);
    const check = useCallback(async (address) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/v1/counterparty/${encodeURIComponent(address)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Counterparty check failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (!controller.signal.aborted) {
                setResult(data);
                setIsLoading(false);
            }
            return data;
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
    const reset = useCallback(() => {
        abortRef.current?.abort();
        setResult(null);
        setError(null);
        setIsLoading(false);
    }, []);
    return { check, result, isLoading, error, reset };
}
//# sourceMappingURL=use-counterparty.js.map