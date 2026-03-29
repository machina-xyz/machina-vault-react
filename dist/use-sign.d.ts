import type { SignRequest, SignResult } from './types.js';
export interface UseSignReturn {
    sign: (request: SignRequest) => Promise<SignResult>;
    signAndBroadcast: (request: SignRequest) => Promise<SignResult>;
    isLoading: boolean;
    error: Error | null;
    lastResult: SignResult | null;
    reset: () => void;
}
/**
 * Hook for signing and broadcasting transactions through the vault.
 */
export declare function useSign(): UseSignReturn;
//# sourceMappingURL=use-sign.d.ts.map