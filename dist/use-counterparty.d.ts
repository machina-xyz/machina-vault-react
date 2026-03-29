import type { CounterpartyResult } from './types.js';
export interface UseCounterpartyReturn {
    check: (address: string) => Promise<CounterpartyResult>;
    result: CounterpartyResult | null;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
}
/**
 * Hook for checking counterparty risk (reputation, sanctions, risk score).
 */
export declare function useCounterparty(): UseCounterpartyReturn;
//# sourceMappingURL=use-counterparty.d.ts.map