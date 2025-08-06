export * from './types';
export { VaultAccountRiskProfile } from './vault-account-risk';
import { BaseRiskProfile } from './base-risk';

export type RiskProfile = typeof BaseRiskProfile;
