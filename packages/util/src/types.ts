import { Network } from './constants';

type DataServiceAccountContextUpdate = {
  name: 'AccountContextUpdate';
  params: {
    account: string;
  };
};

type DataServiceTransferBatch = {
  name: 'TransferBatch';
  params: {
    operator: string;
    from: string;
    to: string;
    ids: string[];
    values: string[];
  };
};
type DataServiceTransferSingle = {
  name: 'TransferSingle';
  params: {
    operator: string;
    from: string;
    to: string;
    id: string;
    value: string;
  };
};

export type DataServiceReinvestmentTrade = {
  name: 'ReinvestmentTrade';
  params: {
    networkId: number;
    vaultAddress: string;
    timestamp: number;
    txHash: string;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    sellTokenPrice: string;
    buyTokenPrice: string;
    lossPercentage: number;
  };
};

export type DataServiceEvent =
  | DataServiceTransferSingle
  | DataServiceTransferBatch
  | DataServiceAccountContextUpdate;

export enum DataServiceEndpoints {
  BLOCKS = 'blocks',
  BACKFILL_ORACLE_DATA = 'backfillOracleData',
  BACKFILL_YIELD_DATA = 'backfillYieldData',
  BACKFILL_GENERIC_DATA = 'backfillGenericData',
  VAULT_APY = 'vaultApy',
  REINVESTMENT_TRADES = 'reinvestmentTrades',
  EVENTS = 'events',
  ACCOUNTS = 'accounts',
  VAULT_ACCOUNTS = 'vaultAccounts',
  VIEWS = 'views',
  READINESS_CHECK = 'readiness_check',
  QUERY = 'query',
}

export type DataServiceVaultAPY = {
  network?: Network;
  vaultAPY: VaultAPY[];
  redemptionData: RedemptionData;
};

export type VaultAPY = {
  // Shared data
  feeApy: string;
  vaultName?: string;
  network: Network;
  date: string;
  swapFees: string;
  blockNumber: number;
  timestamp: number;
  vaultAddress: string;
  poolValuePerShareInPrimary: string;
  totalLpTokens: string;
  lpTokenValuePrimaryBorrow: string;
  lpTokenValuePrimaryBorrowAlt: string | null;
  noVaultShares: boolean;

  // Reward-specific data
  apy?: string;
  rewardToken: string;
  rewardTokensClaimed?: string;
  rewardTokenClaimedPerVaultShare?: string;
  rewardTokenValuePrimaryBorrow: string;
  rewardTokenSymbol: string;
};

export type RedemptionToken = {
  symbol: string;
  address: string;
  amountPerLpToken: string;
  decimals: number;
  price?: string;
  priceDecimals?: string;
};

export type RedemptionData = {
  vaultAddress: string;
  priceOfVaultShare: string;
  timestamp: number;
  redemptionTokens: RedemptionToken[];
  lpTokenPerVaultShare: string;
  lpTokenDecimals: number;
};
