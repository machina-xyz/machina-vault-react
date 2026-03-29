import type { SignRequest } from './types.js';
export interface PolicyRule {
    [key: string]: unknown;
}
export interface PolicyEvaluationResult {
    allowed: boolean;
    reasons: string[];
}
export interface UsePolicyReturn {
    policy: PolicyRule[] | null;
    setPolicy: (rules: PolicyRule[]) => Promise<void>;
    evaluatePolicy: (request: SignRequest) => Promise<PolicyEvaluationResult>;
    isLoading: boolean;
    error: Error | null;
}
/**
 * Hook for managing and evaluating vault policies.
 */
export declare function usePolicy(): UsePolicyReturn;
//# sourceMappingURL=use-policy.d.ts.map