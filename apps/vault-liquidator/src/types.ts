import { BigNumber } from 'ethers';

export interface IGasOracle {
  getGasPrice(): Promise<BigNumber>;
}

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS =
    'vault_liquidator.num_risky_accounts';
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
