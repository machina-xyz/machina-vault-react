import { describe, it, expect } from "vitest";

describe("@machina-xyz/vault-react", () => {
  it("exports expected modules", async () => {
    const mod = await import("../index.js");
    expect(mod.VaultProvider).toBeDefined();
    expect(mod.useVaultContext).toBeDefined();
    expect(mod.useVault).toBeDefined();
    expect(mod.useBalance).toBeDefined();
    expect(mod.useSign).toBeDefined();
    expect(mod.useKeys).toBeDefined();
    expect(mod.usePolicy).toBeDefined();
    expect(mod.useReputation).toBeDefined();
    expect(mod.useCounterparty).toBeDefined();
  });
});
