/**
 * Vault configuration for connecting to the MACHINA Vault API.
 */
export interface VaultConfig {
    apiUrl: string;
    auth: {
        type: 'passkey';
    } | {
        type: 'apikey';
        key: string;
    };
}
/**
 * Information about a connected vault.
 */
export interface VaultInfo {
    id: string;
    address: string;
    chains: string[];
    status: string;
    createdAt: string;
}
/**
 * Balance information for a token on a specific chain.
 */
export interface BalanceInfo {
    chain: string;
    token: string;
    balance: string;
    balanceUsd?: string;
}
/**
 * Request to sign a transaction.
 */
export interface SignRequest {
    chain: string;
    to: string;
    value?: string;
    data?: string;
    key?: string;
}
/**
 * Result of a signing operation.
 */
export interface SignResult {
    hash: string;
    status: string;
    chain: string;
}
/**
 * Reputation information for a vault or address.
 */
export interface ReputationInfo {
    score: number;
    tier: string;
    components: Record<string, number>;
    lastUpdated: string;
}
/**
 * Value provided by the VaultContext.
 */
export interface VaultContextValue {
    vault: VaultInfo | null;
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
    apiUrl: string;
    getAuthHeaders: () => Record<string, string>;
}
/**
 * Generic async state wrapper for hook return values.
 */
export interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}
/**
 * Information about a vault key.
 */
export interface KeyInfo {
    id: string;
    tier: string;
    publicKey: string;
    address: string;
    status: string;
    expiresAt?: string;
}
/**
 * Result of a counterparty risk check.
 */
export interface CounterpartyResult {
    address: string;
    reputation?: ReputationInfo;
    sanctions?: boolean;
    riskScore: number;
    safe: boolean;
}
//# sourceMappingURL=types.d.ts.map