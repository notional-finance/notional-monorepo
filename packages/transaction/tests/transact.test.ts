import {
  AccountFetchMode,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { LendVariable } from '../src/builders';
import { PopulateTransactionInputs } from '../src/builders/common';
import { parseTransactionLogs } from '../src/parser/transfers';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Executes Trade Builders',
  () => {
    let address: string;
    const network = Network.ArbitrumOne;
    let ETH: TokenDefinition;
    let defaultInputs: PopulateTransactionInputs;

    beforeAll(async () => {
      address = await signer.getAddress();
      ETH = Registry.getTokenRegistry().getTokenBySymbol(network, 'ETH');
      defaultInputs = {
        address,
        network,
        depositBalance: undefined,
        debtBalance: undefined,
        collateralBalance: undefined,
        redeemToWETH: false,
        accountBalances: [],
      };
    });

    it('LendVariable', async () => {
      console.log((await signer.getBalance()).toString());
      console.log((await signer.getAddress()).toString());
      const txn = await LendVariable({
        ...defaultInputs,
        depositBalance: TokenBalance.fromFloat(0.01, ETH),
      });
      const resp = await signer.sendTransaction(txn);
      const rcpt = await resp.wait();
      const { transfers, bundles, transaction } = parseTransactionLogs(
        Network.ArbitrumOne,
        rcpt.blockNumber,
        rcpt.logs
      );

      console.log(transfers);
      console.log(bundles);
      console.log(transaction);
    });
  }
);
