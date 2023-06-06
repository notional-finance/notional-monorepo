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
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const txn = await LendVariable({
        ...defaultInputs,
        depositBalance,
      });
      const resp = await signer.sendTransaction(txn);
      const rcpt = await resp.wait();
      const {
        transaction: [t],
      } = parseTransactionLogs(
        Network.ArbitrumOne,
        rcpt.blockNumber,
        rcpt.logs
      );
      expect(t?.name).toBe('Account Action');
      expect(t?.bundles[0].bundleName).toBe('Deposit');
      expect(t?.transfers[0].value).toEqTB(depositBalance.toPrimeCash());
    });
  }
);
