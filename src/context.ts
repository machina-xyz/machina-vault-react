import { createContext } from 'react';
import type { VaultContextValue } from './types';

export const VaultContext = createContext<VaultContextValue | null>(null);
