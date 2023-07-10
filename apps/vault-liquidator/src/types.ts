import { BigNumber } from 'ethers';

export type RiskyAccount = {
  id: string;
  vault: string;
  collateralRatio: BigNumber;
  maxLiquidatorDepositUnderlying: BigNumber[];
  vaultSharesToLiquidator: BigNumber[];
  borrowCurrencyId: number;
  minCollateralRatio: BigNumber;
};
