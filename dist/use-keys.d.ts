import type { KeyInfo } from './types.js';
export interface CreateKeyOptions {
    tier?: string;
    label?: string;
    expiresIn?: string;
}
export interface UseKeysReturn {
    keys: KeyInfo[];
    createKey: (opts?: CreateKeyOptions) => Promise<KeyInfo>;
    revokeKey: (keyId: string) => Promise<void>;
    rotateKey: (keyId: string) => Promise<KeyInfo>;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
/**
 * Hook for managing vault keys (create, revoke, rotate).
 */
export declare function useKeys(): UseKeysReturn;
//# sourceMappingURL=use-keys.d.ts.map