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
  calculateVaultCollateral,
  calculateVaultDebt,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
} from '../src/calculate';

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Calculate Vault',
  () => {
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

    const vaultAddress = '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa';
    const vaultTokens = [
      [
        `vdUSDC:${vaultAddress}:open`,
        `vsUSDC:${vaultAddress}:open`,
        `vcUSDC:${vaultAddress}:open`,
      ],
      [
        `vdUSDC:${vaultAddress}:fixed@1687392000`,
        `vsUSDC:${vaultAddress}:fixed@1687392000`,
        `vcUSDC:${vaultAddress}:fixed@1687392000`,
      ],
      [
        `vdUSDC:${vaultAddress}:fixed@1695168000`,
        `vsUSDC:${vaultAddress}:fixed@1695168000`,
        `vcUSDC:${vaultAddress}:fixed@1695168000`,
      ],
    ];

    it.each(vaultTokens)(
      'calculates vault debt and collateral',
      (debt, vaultShare, _) => {
        const depositUnderlying = getToken('USDC')!;
        const debtToken = getToken(debt)!;
        const debtPool = getPool(debtToken)!;
        const collateralToken = getToken(vaultShare)!;
        const vaultAdapter = Registry.getVaultRegistry().getVaultAdapter(
          Network.ArbitrumOne,
          vaultAddress
        );

        const depositInput = TokenBalance.fromFloat(0.005, depositUnderlying);
        const balances: TokenBalance[] = [TokenBalance.zero(collateralToken)];

        // if (deposit === undefined) {
        //   depositInput = TokenBalance.fromFloat(0, depositUnderlying);
        //   balances.push(TokenBalance.fromFloat(0.005, depositUnderlying));
        // } else {
        // }
        const riskFactorLimit: RiskFactorLimit<'leverageRatio'> = {
          riskFactor: 'leverageRatio',
          limit: 4,
        };

        const {
          debtBalance: debt1,
          collateralBalance: collateral1,
          debtFee: df1,
          collateralFee: cf1,
        } = calculateVaultDebtCollateralGivenDepositRiskLimit({
          vaultAddress,
          collateral: collateralToken,
          debt: debtToken,
          vaultAdapter,
          debtPool,
          depositBalance: depositInput,
          balances,
          riskFactorLimit,
        });

        const {
          debtBalance: debt2,
          collateralFee: cf2,
          debtFee: df2,
        } = calculateVaultDebt({
          debt: debtToken,
          debtPool,
          vaultAdapter,
          depositBalance: depositInput,
          collateralBalance: collateral1,
        });

        const {
          collateralBalance: collateral2,
          collateralFee: cf3,
          debtFee: df3,
        } = calculateVaultCollateral({
          collateral: collateralToken,
          vaultAdapter,
          debtPool,
          depositBalance: depositInput,
          debtBalance: debt1,
        });
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
