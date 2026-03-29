import type { BalanceInfo } from './types.js';
export interface UseBalanceOptions {
    pollIntervalMs?: number;
}
export interface UseBalanceReturn {
    balances: BalanceInfo[];
    totalUsd: string | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
/**
 * Hook for fetching and optionally polling vault balances.
 */
export declare function useBalance(chain?: string, token?: string, options?: UseBalanceOptions): UseBalanceReturn;
//# sourceMappingURL=use-balance.d.ts.map