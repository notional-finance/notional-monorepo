import {
  AccountFetchMode,
  fCashMarket,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities/src';
import { RiskFactorLimit } from '@notional-finance/risk-engine';
import { Network } from '@notional-finance/util';
import {
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeposit,
  calculateDepositCollateralGivenDebtRiskLimit,
  calculateDepositDebtGivenCollateralRiskLimit,
} from '../src/calculate';

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
      'fETH:fixed@1687392000',
      undefined,
    ];
    const usdcDebtTypes = [
      'nUSDC',
      'pdUSD Coin',
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

    const LTV: RiskFactorLimit<'loanToValue'> = {
      riskFactor: 'loanToValue',
      limit: 50,
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

    it.each(
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

    it.each(
      ethCollateralTypes
        .filter((c) => c !== undefined)
        .flatMap((collateral) => {
          return ethDebtTypes
            .concat(usdcDebtTypes)
            .filter((d) => d !== undefined && d !== collateral)
            .map((debt) => {
              return { collateral, debt };
            });
        })
    )('Collateral [$collateral] <=> Debt [$debt]', ({ collateral, debt }) => {
      const collateralToken = getToken(collateral)!;
      const debtToken = getToken(debt)!;
      const debtPool = getPool(debtToken)!;
      const collateralPool = getPool(collateralToken)!;
      const debtInput =
        debtToken.currencyId === 1
          ? TokenBalance.fromFloat(-0.05, debtToken)
          : TokenBalance.fromFloat(-1, debtToken);

      const {
        collateralBalance,
        collateralFee: cf1,
        debtFee: df1,
      } = calculateCollateral(
        collateralToken,
        collateralPool,
        debtPool,
        undefined,
        debtInput
      );

      const {
        debtBalance,
        collateralFee: cf2,
        debtFee: df2,
      } = calculateDebt(
        debtToken,
        debtPool,
        collateralPool,
        undefined,
        collateralBalance
      );

      expect(df1).toBeApprox(df2);
      expect(cf1).toBeApprox(cf2);
      expect(debtBalance).toBeApprox(debtInput, 0.001, 5e-4, 1e-6);
    });

    it.each(
      ethDebtTypes
        .filter((c) => c !== undefined)
        .map((debt) => ({ deposit: 'ETH', debt }))
    )('Withdraw [$deposit] <=> Debt [$debt]', ({ deposit, debt }) => {
      const depositUnderlying = getToken(deposit)!;
      const debtToken = getToken(debt)!;
      const debtPool = getPool(debtToken)!;
      const depositInput = TokenBalance.fromFloat(-0.05, depositUnderlying);

      const {
        debtBalance,
        collateralFee: cf1,
        debtFee: df1,
      } = calculateDebt(
        debtToken,
        debtPool,
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
        undefined,
        debtPool,
        debtBalance,
        undefined
      );

      expect(df1).toBeApprox(df2);
      expect(cf1).toBe(undefined);
      expect(cf2).toBe(undefined);
      expect(depositBalance).toBeApprox(depositInput);
    });

    it.each(tokens.filter(({ deposit }) => deposit !== undefined))(
      'Deposit [$deposit], Collateral [$collateral], Debt [$debt]',
      ({ deposit, collateral, debt }) => {
        const depositUnderlying = getToken(deposit)!;
        const debtToken = getToken(debt)!;
        const debtPool = getPool(debtToken)!;
        const collateralToken = getToken(collateral)!;
        const collateralPool = getPool(collateralToken)!;

        const debtInput =
          debtToken.currencyId === 1
            ? TokenBalance.fromFloat(-0.05, debtToken)
            : TokenBalance.fromFloat(-1, debtToken);
        const collateralInput = TokenBalance.fromFloat(0.005, collateralToken);

        const {
          depositBalance,
          collateralFee: cf1,
          debtFee: df1,
        } = calculateDeposit(
          depositUnderlying,
          collateralPool,
          debtPool,
          debtInput,
          collateralInput
        );

        const {
          debtBalance,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateDebt(
          debtToken,
          debtPool,
          collateralPool,
          depositBalance,
          collateralInput
        );

        const {
          collateralBalance,
          collateralFee: cf3,
          debtFee: df3,
        } = calculateCollateral(
          collateralToken,
          collateralPool,
          debtPool,
          depositBalance,
          debtInput
        );

        expect(cf1).toBeApprox(cf2);
        expect(cf2).toBeApprox(cf3);
        expect(df1).toBeApprox(df2);
        expect(df2).toBeApprox(df3);
        expect(debtBalance).toBeApprox(debtInput);
        expect(collateralBalance).toBeApprox(collateralInput);
      }
    );

    it.each(tokens.filter(({ deposit }) => deposit !== undefined))(
      'Deposit [$deposit] + Debt [$debt] given Collateral [$collateral] + Risk Limit',
      ({ deposit, collateral, debt }) => {
        const depositUnderlying = getToken(deposit)!;
        const debtToken = getToken(debt)!;
        const debtPool = getPool(debtToken)!;
        const collateralToken = getToken(collateral)!;
        const collateralPool = getPool(collateralToken)!;
        const riskFactorLimit = LTV;
        const collateralInput = TokenBalance.fromFloat(0.005, collateralToken);

        const {
          depositBalance: deposit1,
          debtBalance: debt1,
          debtFee: df1,
          collateralFee: cf1,
        } = calculateDepositDebtGivenCollateralRiskLimit(
          debtToken,
          depositUnderlying,
          debtPool,
          collateralPool,
          collateralInput,
          [],
          riskFactorLimit
        );

        const {
          depositBalance: deposit2,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateDeposit(
          depositUnderlying,
          collateralPool,
          debtPool,
          debt1,
          collateralInput
        );

        const {
          debtBalance: debt2,
          collateralFee: cf3,
          debtFee: df3,
        } = calculateDebt(
          debtToken,
          debtPool,
          collateralPool,
          deposit1,
          collateralInput
        );

        expect(cf1).toBeApprox(cf2);
        expect(cf2).toBeApprox(cf3);
        expect(df1).toBeApprox(df2);
        expect(df2).toBeApprox(df3);
        expect(deposit1).toBeApprox(deposit2);
        expect(debt1).toBeApprox(debt2);
      }
    );

    it.each(tokens.filter(({ deposit }) => deposit !== undefined))(
      'Deposit [$deposit] + Collateral [$collateral] given Debt [$debt] + Risk Limit',
      ({ deposit, collateral, debt }) => {
        const depositUnderlying = getToken(deposit)!;
        const debtToken = getToken(debt)!;
        const debtPool = getPool(debtToken)!;
        const collateralToken = getToken(collateral)!;
        const collateralPool = getPool(collateralToken)!;
        const riskFactorLimit = LTV;
        const debtInput = TokenBalance.fromFloat(-0.05, debtToken);

        const {
          depositBalance: deposit1,
          collateralBalance: collateral1,
          debtFee: df1,
          collateralFee: cf1,
        } = calculateDepositCollateralGivenDebtRiskLimit(
          collateralToken,
          depositUnderlying,
          collateralPool,
          debtPool,
          debtInput,
          [],
          riskFactorLimit
        );

        const {
          depositBalance: deposit2,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateDeposit(
          depositUnderlying,
          collateralPool,
          debtPool,
          debtInput,
          collateral1
        );

        const {
          collateralBalance: collateral2,
          collateralFee: cf3,
          debtFee: df3,
        } = calculateCollateral(
          collateralToken,
          collateralPool,
          debtPool,
          deposit1,
          debtInput
        );

        expect(cf1).toBeApprox(cf2);
        expect(cf2).toBeApprox(cf3);
        expect(df1).toBeApprox(df2);
        expect(df2).toBeApprox(df3);
        expect(deposit1).toBeApprox(deposit2);
        expect(collateral1).toBeApprox(collateral2);
      }
    );

    it.each(
      tokens.filter(
        ({ debt, collateral }) =>
          // Exclude this case because they offset each other exactly
          !(debt?.includes('pdEther') && collateral?.includes('pEther'))
      )
      // .filter(
      //   ({ debt, collateral }) =>
      //     !(debt?.includes('USD') || collateral?.includes('fETH'))
      // )
    )(
      'Debt [$debt] + Collateral [$collateral] given Deposit [$deposit] + Risk Limit',
      ({ deposit, collateral, debt }) => {
        const depositUnderlying = getToken('ETH')!;
        const debtToken = getToken(debt)!;
        const debtPool = getPool(debtToken)!;
        const collateralToken = getToken(collateral)!;
        const collateralPool = getPool(collateralToken)!;

        const depositInput =
          deposit === undefined
            ? TokenBalance.fromFloat(0, depositUnderlying)
            : TokenBalance.fromFloat(0.05, depositUnderlying);
        const riskFactorLimit = LTV;

        const {
          debtBalance: debt1,
          collateralBalance: collateral1,
          debtFee: df1,
          collateralFee: cf1,
        } = calculateDebtCollateralGivenDepositRiskLimit(
          collateralToken,
          debtToken,
          collateralPool,
          debtPool,
          depositInput,
          [],
          riskFactorLimit
        );

        const {
          debtBalance: debt2,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateDebt(
          debtToken,
          debtPool,
          collateralPool,
          depositInput,
          collateral1
        );

        const {
          collateralBalance: collateral2,
          collateralFee: cf3,
          debtFee: df3,
        } = calculateCollateral(
          collateralToken,
          collateralPool,
          debtPool,
          depositInput,
          debt1
        );
        expect(cf1).toBeApprox(cf2);
        expect(cf2).toBeApprox(cf3);
        expect(df1).toBeApprox(df2);
        expect(df2).toBeApprox(df3);
        expect(debt1).toBeApprox(debt2);
        expect(collateral1).toBeApprox(collateral2);
      }
    );
  }
);
