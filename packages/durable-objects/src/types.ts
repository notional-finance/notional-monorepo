import { BigNumber } from 'ethers';

export interface ExchangeRateResponse {
  blockNumber: number;
  network: string;
  rates: {
    [key: string]: BigNumber;
  };
}
