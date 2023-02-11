/// <reference types="jest" />

import { TokenBalance } from '@notional-finance/token-balance';

export {};

declare global {
  const provider: ethers.providers.JsonRpcProvider;

  namespace jest {
    interface Describe {
      withFork: (
        chainConfig: { blockNumber: number; network: string },
        name: string,
        fn: () => void
      ) => void;
    }

    interface Matchers<TokenBalance> {
      toEqTB: (e: TokenBalance) => { pass: boolean; message: string };
      toLtTB: (e: TokenBalance) => { pass: boolean; message: string };
      toLtEqTB: (e: TokenBalance) => { pass: boolean; message: string };
      toGtTB: (e: TokenBalance) => { pass: boolean; message: string };
      toGtEqTB: (e: TokenBalance) => { pass: boolean; message: string };
      toBeApprox: (e: TokenBalance) => { pass: boolean; message: string };
    }
  }
}
