import { BigNumber } from 'ethers';

export interface IGasOracle {
  getGasPrice(): Promise<BigNumber>;
}

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS =
    'vault_liquidator.num_risky_accounts';
  public static readonly TOTAL_ACCOUNTS_PROCESSED =
    'vault_liquidator.total_accounts_processed';
}

export type RiskyAccount = {
  id: string;
  vault: string;
  collateralRatio: BigNumber;
  maxLiquidatorDepositUnderlying: BigNumber[];
  vaultSharesToLiquidator: BigNumber[];
  borrowCurrencyId: number;
  minCollateralRatio: BigNumber;
  maturity: number;
};
