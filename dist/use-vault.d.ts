import type { VaultInfo } from './types.js';
export interface UseVaultReturn {
    vault: VaultInfo | null;
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
    reconnect: () => Promise<void>;
}
/**
 * Main vault hook for accessing vault info and connection state.
 */
export declare function useVault(): UseVaultReturn;
//# sourceMappingURL=use-vault.d.ts.map