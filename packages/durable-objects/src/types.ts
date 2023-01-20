import { BigNumber } from 'ethers';

export interface GetExchangeRatesResponse {
  blockNumber: number;
  network: string;
  results: ExchangeRate[];
}

export interface ExchangeRate {
  quote: string;
  base: string;
  value: BigNumber;
  decimals: number;
  metadata: Record<string, unknown>;
}
