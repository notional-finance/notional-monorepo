import {
  AccountFetchMode,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { renderTradeContext } from './util';
import { act } from '@testing-library/react-hooks';
import { TradeType } from '@notional-finance/notionable';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Transaction Screens',
  () => {
    const maturity = 1695168000;
    const config = [
      {
        tradeType: 'MintNToken',
        selectedDepositToken: 'ETH',
        collateral: 'nETH',
        depositAmount: 0.1,
      },
      {
        tradeType: 'MintNToken',
        selectedDepositToken: 'DAI',
        collateral: 'nDAI',
        depositAmount: 10,
        approve: true,
      },
      {
        tradeType: 'LendFixed',
        selectedDepositToken: 'DAI',
        collateral: `fDAI:fixed@${maturity}`,
        depositAmount: 10,
        approve: true,
      },
      {
        tradeType: 'LendVariable',
        selectedDepositToken: 'DAI',
        collateral: `pDai Stablecoin`,
        depositAmount: 10,
        approve: true,
      },
    ];

    it.only.each(config)(
      '[$tradeType] $collateral ($depositAmount $selectedDepositToken)',
      async ({
        tradeType,
        selectedDepositToken,
        collateral,
        depositAmount,
        approve,
      }) => {
        const {
          result: { result, waitForNextUpdate },
          submitTransaction,
          approveToken,
        } = await renderTradeContext(tradeType as TradeType, signer);
        act(() => {
          result.current.updateState({ selectedDepositToken });
        });

        await waitForNextUpdate();

        if (result.current.state.collateral?.symbol !== collateral) {
          const c = result.current.state.availableCollateralTokens?.find(
            (t) => t.symbol === collateral
          );
          if (!c) {
            console.log(result.current.state.availableCollateralTokens);
            throw Error('Collateral Token not found');
          }

          act(() => {
            result.current.updateState({
              collateral: c,
            });
          });

          await waitForNextUpdate();
        }
        expect(result.current.state.collateral?.symbol).toBe(collateral);

        act(() => {
          result.current.updateState({
            depositBalance: TokenBalance.fromFloat(
              depositAmount,
              result.current.state.deposit!
            ),
          });
        });

        await waitForNextUpdate();

        expect(result.current.state.canSubmit).toBe(true);
        expect(result.current.state.calculationSuccess).toBe(true);

        if (approve) {
          await approveToken(result.current.state.deposit!.address);
        }

        act(() => {
          result.current.updateState({ confirm: true });
        });

        await waitForNextUpdate();

        expect(result.current.state.populatedTransaction).toBeDefined();

        const { rcpt } = await submitTransaction();
        expect(rcpt).toBeDefined();
        // TODO: extract simulation from this thing and match
        // expect(transaction[0].name).toBe('Mint nToken');
      },
      10_000
    );

    // describe('Lend Fixed', () => {
    //   it('Lend fETH');
    //   it('Lend fETH with Cash');
    // });

    // describe('Lend Variable', () => {
    //   it('Lend pETH');
    //   it('Lend pUSDC');
    // });

    // describe('Borrow Fixed', () => {
    //   it('Borrow fETH');
    //   it('Borrow fETH with Cash');
    //   it('Borrow fUSDC');
    //   it('Borrow fUSDC with Cash');
    // });

    // describe('Borrow Variable', () => {
    //   it('Borrow pETH');
    //   it('Borrow pUSDC');
    // });

    // describe('Leveraged Lend', () => {
    //   it('Borrow Fixed => Lend Variable');
    //   it('Borrow Variable => Lend Fixed');
    // });

    // describe('Leveraged Liquidity', () => {
    //   it('Borrow Fixed');
    //   it('Borrow Variable');
    // });
  }
);
