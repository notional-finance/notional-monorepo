import { BigNumber } from 'ethers';

export type RiskyAccount = {
  id: string;
  vault: string;
  collateralRatio: BigNumber;
};
