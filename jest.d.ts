/// <reference types="jest" />

import { TokenBalance } from '@notional-finance/token-balance';
import { Network } from '@notional-finance/util';
import { Signer } from 'ethers';
import { AccountFetchMode } from 'packages/core-entities/src/client/account-registry-client';

export {};

declare global {
  const provider: ethers.providers.JsonRpcProvider;
  const signer: Signer;

  namespace jest {
    interface Describe {
      withFork: (
        chainConfig: {
          blockNumber: number;
          network: Network;
          useTokens?: boolean;
        },
        name: string,
        fn: () => void
      ) => void;
      withRegistry: (
        config: {
          snapshotPath?: string;
          fetchMode: AccountFetchMode;
          network: Network;
        },
        name: string,
        fn: (blockNumber: number, blockTime: number) => void
      ) => void;
      withForkAndRegistry: (
        config: { network: Network; fetchMode: AccountFetchMode },
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
