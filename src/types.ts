export interface VaultConfig {
  apiUrl?: string;
  auth?: { type: string; key: string };
}

export interface VaultContextValue {
  config: VaultConfig;
  apiUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiFetch: (path: string, init?: RequestInit) => Promise<any>;
}
