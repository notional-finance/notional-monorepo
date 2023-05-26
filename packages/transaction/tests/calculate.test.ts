import {
  AccountFetchMode,
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities/src';
import { RiskFactorLimit } from '@notional-finance/risk-engine';
import { Network } from '@notional-finance/util';
import { calculateCollateral, calculateDeposit } from '../src/calculate';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Calculate Trade',
  () => {
    const ethCollateralTypes = [
      'nETH',
      'pEther',
      'fETH:fixed@1695168000',
      undefined,
    ];
    const ethDebtTypes = [
      'nETH',
      'pdEther',
      'fETH:fixed@1695168000',
      undefined,
    ];
    const usdcDebtTypes = [
      'nUSDC',
      'pdUSDC',
      'fUSDC:fixed@1695168000',
      undefined,
    ];
    const localCurrency = ethCollateralTypes.flatMap((collateral) => {
      return ethDebtTypes.flatMap((debt) => {
        return [
          { deposit: 'ETH', collateral, debt },
          { deposit: undefined, collateral, debt },
        ];
      });
    });

    const crossCurrency = ethCollateralTypes.flatMap((collateral) => {
      return usdcDebtTypes.flatMap((debt) => {
        return [
          { deposit: 'ETH', collateral, debt },
          { deposit: undefined, collateral, debt },
        ];
      });
    });

    const tokens = localCurrency
      .concat(crossCurrency)
      .filter(
        ({ collateral, debt }) =>
          collateral !== undefined && debt !== undefined && collateral !== debt
      );

    const _riskFactorLimit: RiskFactorLimit<'loanToValue'> = {
      riskFactor: 'loanToValue',
      limit: 100,
    };

    const getToken = (s: string | undefined) => {
      return s
        ? Registry.getTokenRegistry().getTokenBySymbol(Network.ArbitrumOne, s)
        : undefined;
    };

    const getPool = (token: TokenDefinition | undefined) => {
      return token
        ? Registry.getExchangeRegistry().getPoolInstance<fCashMarket>(
            Network.ArbitrumOne,
            Registry.getTokenRegistry().getNToken(
              token.network,
              token.currencyId
            ).address
          )
        : undefined;
    };

    it.only.each(
      ethCollateralTypes
        .filter((c) => c !== undefined)
        .map((collateral) => ({ deposit: 'ETH', collateral }))
    )(
      'Deposit [$deposit] <=> Collateral [$collateral]',
      ({ deposit, collateral }) => {
        const depositUnderlying = getToken(deposit)!;
        const collateralToken = getToken(collateral)!;
        const collateralPool = getPool(collateralToken)!;
        const depositInput = TokenBalance.fromFloat(0.05, depositUnderlying);

        const {
          collateralBalance,
          collateralFee: cf1,
          debtFee: df1,
        } = calculateCollateral(
          collateralToken,
          collateralPool,
          undefined,
          depositInput,
          undefined
        );

        const {
          depositBalance,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateDeposit(
          depositUnderlying,
          collateralPool,
          undefined,
          undefined,
          collateralBalance
        );

        expect(cf1).toBeApprox(cf2);
        expect(df1).toBe(undefined);
        expect(df2).toBe(undefined);
        expect(depositBalance).toBeApprox(depositInput);
      }
    );

    // it.each(
    //   ethCollateralTypes
    //     .filter((c) => c !== undefined)
    //     .flatMap((collateral) => {
    //       return ethDebtTypes
    //         .concat(usdcDebtTypes)
    //         .filter((d) => d !== undefined && d !== collateral)
    //         .map((debt) => {
    //           return { collateral, debt };
    //         });
    //     })
    // )('Collateral [$collateral] <=> Debt [$debt]', ({ collateral, debt }) => {
    //   console.log(collateral, debt);
    // });

    // it.each(
    //   ethDebtTypes
    //     .filter((c) => c !== undefined)
    //     .map((debt) => ({ deposit: 'ETH', debt }))
    // )('Withdraw [$deposit] <=> Debt [$debt]', ({ deposit, debt }) => {
    //   console.log(deposit, debt);
    // });

    // it.each(tokens.filter(({ deposit }) => deposit !== undefined))(
    //   'Deposit [$deposit] given Collateral [$collateral] + Debt [$debt]',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );

    // it.each(tokens)(
    //   'Collateral [$collateral] given Deposit [$deposit] + Debt [$debt]',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );

    // it.each(tokens)(
    //   'Debt [$debt] given Deposit [$deposit] + Collateral [$collateral]',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );

    // it.each(tokens.filter(({ deposit }) => deposit !== undefined))(
    //   'Deposit [$deposit] + Debt [$debt] given Collateral [$collateral] + Risk Limit',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );

    // it.each(tokens)(
    //   'Deposit [$deposit] + Collateral [$collateral] given Debt [$debt] + Risk Limit',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );

    // it.each(tokens)(
    //   'Debt [$debt] + Collateral [$collateral] given Deposit [$deposit] + Risk Limit',
    //   ({ deposit, collateral, debt }) => {
    //     console.log(deposit, collateral, debt);
    //   }
    // );
  }
);
