import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { renderTradeContext } from './renderTradeContext';
import { act } from '@testing-library/react-hooks';
import { TradeType } from '@notional-finance/notionable';
import {
  EnablePrimeBorrow,
  LendVariable,
  PopulateTransactionInputs,
} from '@notional-finance/transaction';

interface Config {
  tradeType: TradeType;
  selectedDepositToken: string;
  depositAmount: number;
  collateral?: string;
  debt?: string;
  approve?: boolean;
  leverageRatio?: number;
  enablePrimeBorrow?: boolean;
  initialDeposit?: {
    amount: number;
    symbol: string;
  };
}

jest.setTimeout(15_000);

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Transaction Screens',
  () => {
    const maturity = 1695168000;
    const config: Config[] = [
      {
        tradeType: 'MintNToken',
        selectedDepositToken: 'ETH',
        collateral: 'nETH',
        depositAmount: 0.1,
        approve: false,
        debt: undefined,
        initialDeposit: undefined,
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
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        depositAmount: 0.1,
        approve: false,
      },
      {
        tradeType: 'LendFixed',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        depositAmount: 0.1,
        approve: false,
        initialDeposit: {
          amount: 0.1,
          symbol: 'ETH',
        },
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
      {
        tradeType: 'LendVariable',
        selectedDepositToken: 'ETH',
        collateral: `pEther`,
        depositAmount: 0.1,
        approve: false,
      },
      {
        tradeType: 'BorrowVariable',
        selectedDepositToken: 'USDC',
        collateral: undefined,
        debt: `pdUSD Coin`,
        depositAmount: -10,
        approve: false,
        enablePrimeBorrow: true,
        initialDeposit: {
          amount: 1,
          symbol: 'ETH',
        },
      },
      {
        tradeType: 'BorrowVariable',
        selectedDepositToken: 'ETH',
        collateral: undefined,
        debt: `pdEther`,
        depositAmount: -0.01,
        approve: false,
        enablePrimeBorrow: true,
      },
      {
        tradeType: 'BorrowFixed',
        selectedDepositToken: 'ETH',
        collateral: undefined,
        debt: `fETH:fixed@${maturity}`,
        depositAmount: -0.01,
      },
      {
        tradeType: 'BorrowFixed',
        selectedDepositToken: 'USDC',
        collateral: undefined,
        debt: `fUSDC:fixed@${maturity}`,
        depositAmount: -1,
      },
      {
        tradeType: 'LeveragedLend',
        selectedDepositToken: 'DAI',
        collateral: 'pDai Stablecoin',
        debt: `fDAI:fixed@${maturity}`,
        depositAmount: 1,
        approve: true,
        leverageRatio: 3,
      },
      {
        tradeType: 'LeveragedLend',
        selectedDepositToken: 'DAI',
        debt: 'pdDai Stablecoin',
        collateral: `fDAI:fixed@${maturity}`,
        depositAmount: 1,
        approve: true,
        leverageRatio: 3,
        enablePrimeBorrow: true,
      },
    ];

    let defaultInputs: PopulateTransactionInputs;
    beforeAll(async () => {
      const address = await signer.getAddress();
      defaultInputs = {
        address,
        network: Network.ArbitrumOne,
        depositBalance: undefined,
        debtBalance: undefined,
        collateralBalance: undefined,
        redeemToWETH: false,
        maxWithdraw: true,
        accountBalances: [],
      };
    });

    it.only.each(config)(
      '[$tradeType] $collateral ($depositAmount $selectedDepositToken)',
      async ({
        tradeType,
        selectedDepositToken,
        collateral,
        depositAmount,
        debt,
        approve,
        initialDeposit,
        enablePrimeBorrow,
        leverageRatio,
      }) => {
        if (initialDeposit) {
          const t = await LendVariable({
            ...defaultInputs,
            depositBalance: TokenBalance.fromFloat(
              initialDeposit.amount,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                initialDeposit.symbol
              )
            ),
          });
          const resp = await signer.sendTransaction(t);
          await resp.wait(1);
        }

        if (enablePrimeBorrow) {
          const t = await EnablePrimeBorrow(defaultInputs);
          const resp = await signer.sendTransaction(t);
          await resp.wait(1);
        }

        const {
          result: { result, waitForNextUpdate },
          submitTransaction,
          approveToken,
        } = await renderTradeContext(tradeType as TradeType, signer);
        act(() => {
          result.current.updateState({ selectedDepositToken });
        });

        await waitForNextUpdate();

        if (collateral) {
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
        }

        if (debt) {
          if (result.current.state.debt?.symbol !== debt) {
            const c = result.current.state.availableDebtTokens?.find(
              (t) => t.symbol === debt
            );
            if (!c) {
              console.log(result.current.state.availableDebtTokens);
              throw Error('Debt Token not found');
            }

            act(() => {
              result.current.updateState({ debt: c });
            });

            await waitForNextUpdate();
          }
          expect(result.current.state.debt?.symbol).toBe(debt);
        }

        if (leverageRatio) {
          act(() => {
            result.current.updateState({
              riskFactorLimit: {
                riskFactor: 'leverageRatio',
                limit: leverageRatio,
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                args: [result.current.state.deposit?.currencyId!],
              },
            });
          });

          await waitForNextUpdate();
        }

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
      },
      10_000
    );

    // describe('Borrow Fixed', () => {
    //   it('Borrow fETH with Cash');
    //   it('Borrow fUSDC with Cash');
    // });

    // describe('Leveraged Liquidity', () => {
    //   it('Borrow Fixed');
    //   it('Borrow Variable');
    // });

    // describe('Repay', () => {
    //   it('Repay Variable');
    //   it('Repay Fixed');
    //   it('Roll Fixed => Variable');
    //   it('Roll Variable => Fixed');
    // });

    // describe('Convert', () => {
    //   it('Convert Fixed => Variable');
    //   it('Convert Fixed => nToken');
    //   it('Convert Variable => Fixed');
    //   it('Convert Variable => nToken');
    //   it('Convert nToken => Fixed');
    //   it('Convert nToken => Variable');
    // });

    // describe('Deposit / Withdraw', () => {
    //   it('Deposit Variable');
    //   it('Deposit Fixed');
    //   it('Deposit nToken');
    //   it('Withdraw Variable');
    //   it('Withdraw Fixed');
    //   it('Withdraw nToken');
    //   it('[MAX] Withdraw Variable');
    //   it('[MAX] Withdraw Fixed');
    //   it('[MAX] Withdraw nToken');
    // });
  }
);
