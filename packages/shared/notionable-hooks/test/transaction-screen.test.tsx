import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network, SECONDS_IN_QUARTER } from '@notional-finance/util';
import { renderTradeContext } from './renderTradeContext';
import { act } from '@testing-library/react-hooks';
import { TradeType } from '@notional-finance/notionable';
import {
  BorrowFixed,
  BorrowVariable,
  EnablePrimeBorrow,
  LendFixed,
  LendVariable,
  LeveragedLend,
  MintNToken,
  PopulateTransactionInputs,
} from '@notional-finance/transaction';
import { PopulatedTransaction } from 'ethers';

interface Config {
  tradeType: TradeType;
  selectedDepositToken: string;
  depositAmount?: number;
  collateralAmount?: number;
  maxWithdraw?: boolean;
  debtAmount?: number;
  collateral?: string;
  debt?: string;
  approve?: boolean;
  leverageRatio?: number;
  enablePrimeBorrow?: boolean;
  initialDeposit?: (
    defaultInputs: PopulateTransactionInputs
  ) => Promise<PopulatedTransaction>;
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
    const maturity2 = maturity + SECONDS_IN_QUARTER;

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

    const runTest = async ({
      tradeType,
      selectedDepositToken,
      collateral,
      depositAmount,
      debt,
      approve,
      initialDeposit,
      enablePrimeBorrow,
      leverageRatio,
      maxWithdraw,
      collateralAmount,
      debtAmount,
    }: Config) => {
      if (enablePrimeBorrow) {
        const t = await EnablePrimeBorrow(defaultInputs);
        const resp = await signer.sendTransaction(t);
        await resp.wait(1);
      }

      if (initialDeposit) {
        const t = await initialDeposit(defaultInputs);
        const resp = await signer.sendTransaction(t);
        await resp.wait(1);
        await new Promise<void>((r) => {
          Registry.getAccountRegistry().triggerRefresh(
            Network.ArbitrumOne,
            0,
            r
          );
        });
      }

      const {
        result: { result, waitForNextUpdate },
        submitTransaction,
        approveToken,
      } = await renderTradeContext(tradeType as TradeType, signer);

      if (selectedDepositToken) {
        act(() => {
          result.current.updateState({ selectedDepositToken });
        });
        await waitForNextUpdate();
      }

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

      /*** Set Balance Amounts */
      if (depositAmount !== undefined) {
        act(() => {
          result.current.updateState({
            depositBalance: TokenBalance.fromFloat(
              depositAmount,
              result.current.state.deposit!
            ),
          });
        });

        // This is required for deleverage lend
        if (depositAmount) await waitForNextUpdate();
      }

      if (collateralAmount !== undefined && debtAmount !== undefined) {
        act(() => {
          result.current.updateState({
            collateralBalance: TokenBalance.fromFloat(
              collateralAmount,
              result.current.state.collateral!
            ),
            debtBalance: TokenBalance.fromFloat(
              debtAmount,
              result.current.state.debt!
            ),
          });
        });

        await waitForNextUpdate();
      } else if (collateralAmount !== undefined) {
        act(() => {
          result.current.updateState({
            collateralBalance: TokenBalance.fromFloat(
              collateralAmount,
              result.current.state.collateral!
            ),
          });
        });

        await waitForNextUpdate();
      } else if (debtAmount !== undefined) {
        act(() => {
          result.current.updateState({
            debtBalance: TokenBalance.fromFloat(
              debtAmount,
              result.current.state.debt!
            ),
          });
        });

        await waitForNextUpdate();
      }

      if (maxWithdraw) {
        // TODO: use the max repay or withdraw hooks here...
      }

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
    };

    const noInitDeposit: Config[] = [
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
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        depositAmount: 0.1,
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
        selectedDepositToken: 'ETH',
        debt: `pdEther`,
        depositAmount: -0.01,
        enablePrimeBorrow: true,
      },
      {
        tradeType: 'BorrowFixed',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        depositAmount: -0.01,
      },
      {
        tradeType: 'BorrowFixed',
        selectedDepositToken: 'USDC',
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
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'ETH',
        collateral: `pEther`,
        depositAmount: 0.1,
      },
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'DAI',
        collateral: `pDai Stablecoin`,
        depositAmount: 10,
        approve: true,
      },
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        depositAmount: 0.1,
      },
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'DAI',
        collateral: `fDAI:fixed@${maturity}`,
        depositAmount: 10,
        approve: true,
      },
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'ETH',
        collateral: `nETH`,
        depositAmount: 0.1,
      },
      {
        tradeType: 'Deposit',
        selectedDepositToken: 'DAI',
        collateral: `nDAI`,
        depositAmount: 10,
        approve: true,
      },
    ];

    const fCashLend: Config[] = [
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        depositAmount: -0.005,
      },
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        maxWithdraw: true,
      },
      {
        tradeType: 'ConvertAsset',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        collateral: `fETH:fixed@${maturity2}`,
        debtAmount: -0.01,
      },
      {
        tradeType: 'ConvertAsset',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        collateral: `pEther`,
        debtAmount: -0.01,
      },
      {
        tradeType: 'ConvertAsset',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        collateral: `nETH`,
        debtAmount: -0.01,
      },
    ].map(
      (c) =>
        Object.assign(c, {
          initialDeposit: (d: PopulateTransactionInputs) => {
            return LendFixed({
              ...d,
              depositBalance: TokenBalance.fromFloat(
                0.01,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  `ETH`
                )
              ),
              collateralBalance: TokenBalance.fromFloat(
                0.01,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  `fETH:fixed@${maturity}`
                )
              ),
            });
          },
        }) as Config
    );

    const primeLend: Config[] = [
      {
        // Lend Fixed with Cash
        tradeType: 'LendFixed',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        depositAmount: 0.01,
      },
      {
        // Borrow Fixed with Cash
        tradeType: 'BorrowFixed',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        depositAmount: -0.01,
      },
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `pdEther`,
        depositAmount: -0.005,
      },
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `pdEther`,
        maxWithdraw: true,
      },
      {
        tradeType: 'ConvertAsset',
        debt: `pdEther`,
        collateral: `fETH:fixed@${maturity2}`,
        debtAmount: -0.01,
      },
      {
        tradeType: 'ConvertAsset',
        debt: `pdEther`,
        collateral: `nETH`,
        debtAmount: -0.01,
      },
    ].map(
      (c) =>
        Object.assign(c, {
          initialDeposit: (defaultInputs: PopulateTransactionInputs) => {
            return LendVariable({
              ...defaultInputs,
              depositBalance: TokenBalance.fromFloat(
                0.1,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  'ETH'
                )
              ),
            });
          },
        }) as Config
    );

    const nToken: Config[] = [
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `nETH`,
        depositAmount: -0.005,
      },
      {
        tradeType: 'Withdraw',
        selectedDepositToken: 'ETH',
        debt: `nETH`,
        maxWithdraw: true,
      },
      {
        tradeType: 'ConvertAsset',
        debt: `nETH`,
        collateral: `fETH:fixed@${maturity2}`,
        debtAmount: -0.01,
      },
      {
        tradeType: 'ConvertAsset',
        debt: `nETH`,
        collateral: `pEther`,
        debtAmount: -0.01,
      },
    ].map(
      (c) =>
        Object.assign(c, {
          initialDeposit: (defaultInputs: PopulateTransactionInputs) => {
            return MintNToken({
              ...defaultInputs,
              depositBalance: TokenBalance.fromFloat(
                0.1,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  'ETH'
                )
              ),
            });
          },
        }) as Config
    );

    const pCashDebt: Config[] = [
      {
        tradeType: 'RepayDebt',
        selectedDepositToken: 'ETH',
        collateral: `pEther`,
        enablePrimeBorrow: true,
        depositAmount: 0.005,
      },
      {
        tradeType: 'RepayDebt',
        selectedDepositToken: 'ETH',
        collateral: `pEther`,
        enablePrimeBorrow: true,
        maxWithdraw: true,
      },
      {
        tradeType: 'RollDebt',
        selectedDepositToken: 'ETH',
        collateral: `pEther`,
        debt: `fETH:fixed@${maturity}`,
        enablePrimeBorrow: true,
        collateralAmount: 0.01,
      },
    ].map(
      (c) =>
        Object.assign(c, {
          initialDeposit: (d: PopulateTransactionInputs) => {
            return BorrowVariable({
              ...d,
              debtBalance: TokenBalance.fromFloat(
                -0.01,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  `pdEther`
                )
              ),
            });
          },
        }) as Config
    );

    const fCashDebt: Config[] = [
      {
        tradeType: 'RepayDebt',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        collateralAmount: 0.005,
      },
      {
        tradeType: 'RepayDebt',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        maxWithdraw: true,
      },
      {
        tradeType: 'RollDebt',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        debt: `fETH:fixed@${maturity2}`,
        collateralAmount: 0.01,
      },
      {
        tradeType: 'RollDebt',
        selectedDepositToken: 'ETH',
        collateral: `fETH:fixed@${maturity}`,
        debt: `pdEther`,
        enablePrimeBorrow: true,
        collateralAmount: 0.01,
      },
    ].map(
      (c) =>
        Object.assign(c, {
          initialDeposit: (d: PopulateTransactionInputs) => {
            return BorrowFixed({
              ...d,
              debtBalance: TokenBalance.fromFloat(
                -0.01,
                Registry.getTokenRegistry().getTokenBySymbol(
                  Network.ArbitrumOne,
                  `fETH:fixed@${maturity}`
                )
              ),
            });
          },
        }) as Config
    );

    const leveragedLend: Config[] = [
      {
        tradeType: 'Deleverage',
        selectedDepositToken: 'ETH',
        debt: `fETH:fixed@${maturity}`,
        depositAmount: 0,
        debtAmount: -0.01,
        collateral: `pEther`,
        collateralAmount: 0,
        enablePrimeBorrow: true,
        initialDeposit: (d: PopulateTransactionInputs) => {
          return LeveragedLend({
            ...d,
            depositBalance: TokenBalance.fromFloat(
              0.01,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `ETH`
              )
            ),
            collateralBalance: TokenBalance.fromFloat(
              0.05,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `fETH:fixed@${maturity}`
              )
            ),
            debtBalance: TokenBalance.fromFloat(
              -0.04,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `pdEther`
              )
            ),
          });
        },
      },
      {
        tradeType: 'Deleverage',
        selectedDepositToken: 'ETH',
        depositAmount: 0,
        debt: `pdEther`,
        debtAmount: -0.01,
        collateral: `fETH:fixed@${maturity}`,
        collateralAmount: 0,
        enablePrimeBorrow: true,
        initialDeposit: (d: PopulateTransactionInputs) => {
          return LeveragedLend({
            ...d,
            depositBalance: TokenBalance.fromFloat(
              0.01,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `ETH`
              )
            ),
            collateralBalance: TokenBalance.fromFloat(
              0.05,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `pEther`
              )
            ),
            debtBalance: TokenBalance.fromFloat(
              -0.04,
              Registry.getTokenRegistry().getTokenBySymbol(
                Network.ArbitrumOne,
                `fETH:fixed@${maturity}`
              )
            ),
          });
        },
      },
    ];

    it.each([
      ...noInitDeposit,
      ...pCashDebt,
      ...fCashDebt,
      ...fCashLend,
      ...primeLend,
      ...nToken,
      ...leveragedLend,
    ])(
      '[$tradeType] $collateral ($depositAmount $selectedDepositToken)',
      runTest,
      15_000
    );

    /**
     * TODO
     * Leveraged nToken, Borrow Fixed
     * Leveraged nToken, Borrow Variable
     * Deleverage nToken, Lend Fixed
     * Deleverage nToken, Lend Variable
     */
  }
);
