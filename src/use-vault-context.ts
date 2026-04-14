import { useContext } from 'react';
import { VaultContext } from './context';
import type { VaultContextValue } from './types';

export function useVaultContext(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error('useVaultContext must be used within a <VaultProvider>');
  }
  return ctx;
}
