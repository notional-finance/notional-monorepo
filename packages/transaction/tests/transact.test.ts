import {
  AccountFetchMode,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';
import { LendFixed, LendVariable, MintNToken } from '../src/builders';
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
    let fETH: TokenDefinition;
    let defaultInputs: PopulateTransactionInputs;

    beforeAll(async () => {
      address = await signer.getAddress();
      ETH = Registry.getTokenRegistry().getTokenBySymbol(network, 'ETH');
      fETH = Registry.getTokenRegistry().getTokenBySymbol(
        network,
        'fETH:fixed@1695168000'
      );
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

    const sendTransaction = async (txn: Promise<PopulatedTransaction>) => {
      const populated = await txn;
      const resp = await signer.sendTransaction(populated);
      const rcpt = await resp.wait();
      const {
        transaction: [t],
      } = parseTransactionLogs(
        Network.ArbitrumOne,
        rcpt.blockNumber,
        rcpt.logs
      );

      return t;
    };

    it('MintNToken', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const t = await sendTransaction(
        MintNToken({
          ...defaultInputs,
          depositBalance,
        })
      );
      expect(t?.name).toBe('Mint nToken');
      // TODO: this does not include the deposit....
      expect(t?.bundles.map((b) => b.bundleName)).toEqual([
        'nToken Add Liquidity',
        'nToken Add Liquidity',
        'Mint nToken',
      ]);
    });

    it('LendVariable', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const t = await sendTransaction(
        LendVariable({
          ...defaultInputs,
          depositBalance,
        })
      );
      expect(t?.name).toBe('Account Action');
      expect(t?.bundles[0].bundleName).toBe('Deposit');
      expect(t?.transfers[0].value).toEqTB(depositBalance.toPrimeCash());
    });

    it('LendFixed', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const collateralBalance = TokenBalance.fromFloat(0.01, fETH);

      const t = await sendTransaction(
        LendFixed({
          ...defaultInputs,
          depositBalance,
          collateralBalance,
        })
      );

      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'Deposit',
        'Buy fCash',
        'Withdraw',
      ]);
    });
  }
);
