import { type ReactNode } from 'react';
import type { VaultConfig, VaultContextValue } from './types.js';
export interface VaultProviderProps {
    config: VaultConfig;
    children: ReactNode;
}
export declare function VaultProvider({ config, children }: VaultProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Access the VaultContext. Must be used within a VaultProvider.
 */
export declare function useVaultContext(): VaultContextValue;
//# sourceMappingURL=context.d.ts.map