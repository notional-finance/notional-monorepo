export * from './types';
export { AccountRiskProfile } from './account-risk';
import { BaseRiskProfile } from './base-risk';

export type RiskProfile = typeof BaseRiskProfile;
