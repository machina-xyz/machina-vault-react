import type { ReputationInfo } from './types.js';
export interface UseReputationReturn {
    reputation: ReputationInfo | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
/**
 * Hook for fetching reputation data for an address or the connected vault.
 */
export declare function useReputation(address?: string): UseReputationReturn;
//# sourceMappingURL=use-reputation.d.ts.map