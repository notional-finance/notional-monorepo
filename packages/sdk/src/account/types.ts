import { BigNumber } from 'ethers';

export interface AssetResult {
  currencyId: BigNumber;
  maturity: BigNumber;
  assetType: BigNumber;
  notional: BigNumber;
  storageSlot: BigNumber;
  storageState: number;
}

export interface BalanceResult {
  currencyId: number;
  cashBalance: BigNumber;
  nTokenBalance: BigNumber;
  lastClaimTime: BigNumber;
  lastClaimIntegralSupply?: BigNumber;
  accountIncentiveDebt: BigNumber;
}

export interface GetAccountResult {
  accountContext: {
    nextSettleTime: number;
    hasDebt: string;
    assetArrayLength: number;
    bitmapCurrencyId: number;
    activeCurrencies: string;
  };
  accountBalances: BalanceResult[];
  portfolio: AssetResult[];
}
