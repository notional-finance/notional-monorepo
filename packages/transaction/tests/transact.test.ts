import {
  AccountFetchMode,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, NotionalAddress } from '@notional-finance/util';
import { Contract, PopulatedTransaction } from 'ethers';
import {
  ConvertCashToNToken,
  EnablePrimeBorrow,
  LendFixed,
  LendVariable,
  LeveragedNToken,
  LeveragedOrDeleverageLend,
  MintNToken,
} from '../src/builders';
import { PopulateTransactionInputs } from '../src/builders/common';
import { parseTransactionLogs } from '../src/parser/transfers';
import { NotionalV3, NotionalV3ABI } from '@notional-finance/contracts';

describe.withForkAndRegistry(
  {
    network: Network.arbitrum,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Executes Trade Builders',
  () => {
    let address: string;
    const network = Network.arbitrum;
    let ETH: TokenDefinition;
    let fETH: TokenDefinition;
    let pETH: TokenDefinition;
    let pdETH: TokenDefinition;
    let defaultInputs: PopulateTransactionInputs;
    const notional = new Contract(
      NotionalAddress[network],
      NotionalV3ABI,
      signer
    ) as NotionalV3;

    beforeAll(async () => {
      address = await signer.getAddress();
      ETH = Registry.getTokenRegistry().getTokenBySymbol(network, 'ETH');
      pETH = Registry.getTokenRegistry().getPrimeCash(network, 1);
      pdETH = Registry.getTokenRegistry().getPrimeDebt(network, 1);
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

    const send = async (txn: Promise<PopulatedTransaction>) => {
      const populated = await txn;
      const resp = await signer.sendTransaction(populated);
      const rcpt = await resp.wait(1);
      return rcpt;
    };

    const sendTransaction = async (txn: Promise<PopulatedTransaction>) => {
      const rcpt = await send(txn);
      const { transaction } = parseTransactionLogs(
        Network.arbitrum,
        rcpt.blockNumber,
        rcpt.logs
      );

      return transaction;
    };

    it('MintNToken', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const [t] = await sendTransaction(
        MintNToken({
          ...defaultInputs,
          depositBalance,
        })
      );
      expect(t.name).toBe('Mint nToken');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'nToken Add Liquidity',
        'nToken Add Liquidity',
        'Mint nToken',
      ]);
    });

    it('LendVariable', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const [t] = await sendTransaction(
        LendVariable({
          ...defaultInputs,
          depositBalance,
        })
      );
      expect(t.name).toBe('Account Action');
      expect(t.bundles[0].bundleName).toBe('Deposit');
      expect(t.transfers[0].value).toEqTB(depositBalance.toPrimeCash());
    });

    it('LendFixed', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const collateralBalance = TokenBalance.fromFloat(0.01, fETH);

      const [t] = await sendTransaction(
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

    it('LendFixed [With Cash]', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const collateralBalance = TokenBalance.fromFloat(0.01, fETH);
      await sendTransaction(
        LendVariable({
          ...defaultInputs,
          depositBalance,
        })
      );

      const [t] = await sendTransaction(
        LendFixed({
          ...defaultInputs,
          depositBalance,
          collateralBalance,
          accountBalances: [TokenBalance.fromFloat(0.01, pETH)],
        })
      );

      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'Deposit',
        'Buy fCash',
        // No withdraw if cash balance
      ]);
    });

    it('LeveragedLend [Variable => Fixed]', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const debtBalance = TokenBalance.fromFloat(0.01, pdETH);
      const collateralBalance = TokenBalance.fromFloat(0.02, fETH);
      await send(EnablePrimeBorrow({ ...defaultInputs }));

      const [t] = await sendTransaction(
        LeveragedOrDeleverageLend({
          ...defaultInputs,
          debtBalance,
          depositBalance,
          collateralBalance,
        })
      );
      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'Deposit',
        'Buy fCash',
        'Borrow Prime Cash',
      ]);
    });

    it('LeveragedLend [Fixed => Variable]', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const debtBalance = TokenBalance.fromFloat(-0.01, fETH);
      const collateralBalance = TokenBalance.fromFloat(0.02, pETH);

      const [t] = await sendTransaction(
        LeveragedOrDeleverageLend({
          ...defaultInputs,
          debtBalance,
          depositBalance,
          collateralBalance,
        })
      );
      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'Deposit',
        'Sell fCash',
        'Borrow fCash',
      ]);
    });

    it('LeveragedLiquidity [Fixed]', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const debtBalance = TokenBalance.fromFloat(-0.01, fETH);

      const [t] = await sendTransaction(
        LeveragedNToken({
          ...defaultInputs,
          depositBalance,
          debtBalance,
        })
      );
      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual([
        'Deposit',
        'Sell fCash',
        'Borrow fCash',
      ]);
      const { cashBalance } = await notional.getAccountBalance(
        1,
        await signer.getAddress()
      );

      const [t2] = await sendTransaction(
        ConvertCashToNToken({
          ...defaultInputs,
          debtBalance: TokenBalance.fromID(cashBalance, pETH.id, network),
        })
      );
      expect(t2.name).toBe('Mint nToken');
      expect(t2.bundles[2].bundleName).toBe('Mint nToken');
      expect(t2.bundles[2].transfers[1].value.toFloat()).toBeGreaterThan(0.02);
    });

    it('LeveragedLiquidity [Variable]', async () => {
      const depositBalance = TokenBalance.fromFloat(0.01, ETH);
      const debtBalance = TokenBalance.fromFloat(-0.01, pdETH);
      await send(EnablePrimeBorrow({ ...defaultInputs }));

      const [t] = await sendTransaction(
        LeveragedNToken({
          ...defaultInputs,
          depositBalance,
          debtBalance,
        })
      );
      expect(t.name).toBe('Account Action');
      expect(t.bundles.map((b) => b.bundleName)).toEqual(['Deposit']);

      const { cashBalance } = await notional.getAccountBalance(
        1,
        await signer.getAddress()
      );

      const [mint, borrow] = await sendTransaction(
        ConvertCashToNToken({
          ...defaultInputs,
          debtBalance: TokenBalance.fromID(cashBalance, pETH.id, network).add(
            debtBalance.neg().toPrimeCash()
          ),
        })
      );
      expect(mint?.name).toBe('Mint nToken');
      expect(mint.bundles[2].transfers[1].value.toFloat()).toBeGreaterThan(
        0.02
      );
      expect(borrow.bundles.map((b) => b.bundleName)).toEqual([
        'Borrow Prime Cash',
      ]);
    });

    it.only('BorrowWithCollateral', async () => {
      // todo
    });
  }
);
