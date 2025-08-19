import { SingleSidedLP, SingleSidedLPParams } from './SingleSidedLP';
import { PendlePT, PendlePTVaultParams } from './PendlePT';
import { Staking, StakingVaultParams } from './Staking';
export { SingleSidedLP, PendlePT, Staking };
export type VaultMetadata =
  | SingleSidedLPParams
  | PendlePTVaultParams
  | StakingVaultParams;
export { VaultAdapter } from './VaultAdapter';
