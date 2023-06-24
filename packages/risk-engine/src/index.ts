export * from './types';
export { AccountRiskProfile } from './account-risk';
export { VaultAccountRiskProfile } from './vault-account-risk';
import { BaseRiskProfile } from './base-risk';

export type RiskProfile = typeof BaseRiskProfile;
