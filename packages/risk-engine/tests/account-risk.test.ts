import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { AccountRiskProfile } from '../src/account-risk';
import { RiskFactorKeys, RiskFactorLimit, RiskFactors } from '../src/types';

interface Profile {
  name: string;
  balances: [number, string][];
  expected: {
    factor: keyof RiskFactors;
    args?: string[];
    expected: [number, string] | number | null;
  }[];
}

describe.withForkAndRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Account Risk',
  () => {
    const profiles: Profile[] = [
      {
        name: 'One ETH',
        balances: [[1, 'ETH']],
        expected: [
          { factor: 'netWorth', expected: [1, 'ETH'] },
          { factor: 'freeCollateral', expected: [0.81, 'ETH'] },
          { factor: 'loanToValue', expected: 0 },
          { factor: 'collateralRatio', expected: null },
          { factor: 'healthFactor', expected: null },
          {
            factor: 'collateralLiquidationThreshold',
            args: ['ETH'],
            expected: null,
          },
        ],
      },
      {
        name: 'ETH / USDC',
        balances: [
          [1, 'ETH'],
          [-1280, 'USDC'],
        ],
        expected: [
          { factor: 'netWorth', expected: [0.324, 'ETH'] },
          { factor: 'freeCollateral', expected: [0.263, 'ETH'] },
          { factor: 'loanToValue', expected: 67.59 },
          { factor: 'collateralRatio', expected: 147.94 },
          { factor: 'healthFactor', expected: 0.8122 },
          {
            factor: 'collateralLiquidationThreshold',
            args: ['ETH'],
            expected: [0.736, 'ETH'],
          },
          {
            factor: 'liquidationPrice',
            args: ['USDC', 'ETH'],
            expected: [1395.2, 'USDC'],
          },
        ],
      },
      {
        name: 'Net Prime Cash',
        balances: [
          [-5, 'pdEther'],
          [10, 'pEther'],
        ],
        expected: [
          { factor: 'netWorth', expected: [5, 'ETH'] },
          { factor: 'freeCollateral', expected: [4.05, 'ETH'] },
          { factor: 'loanToValue', expected: 0 },
          { factor: 'collateralRatio', expected: null },
          { factor: 'healthFactor', expected: null },
        ],
      },
      {
        name: 'Leveraged nToken',
        balances: [
          [-8, 'pdEther'],
          [10, 'nETH'],
        ],
        expected: [
          { factor: 'netWorth', expected: [1.996, 'ETH'] },
          { factor: 'freeCollateral', expected: [0.996, 'ETH'] },
          { factor: 'loanToValue', expected: 80.03 },
          { factor: 'collateralRatio', expected: 124.94 },
          { factor: 'healthFactor', expected: 0.499 },
          { factor: 'leverageRatio', expected: 4.008 },
        ],
      },
    ];

    const riskFactors: {
      riskFactor: RiskFactorKeys;
      limit: number | [number, string];
      args?: [string];
    }[] = [
      {
        riskFactor: 'loanToValue',
        limit: 60,
      },
      {
        riskFactor: 'loanToValue',
        limit: 70,
      },
      {
        riskFactor: 'collateralRatio',
        limit: 140,
      },
      {
        riskFactor: 'collateralRatio',
        limit: 160,
      },
      {
        riskFactor: 'netWorth',
        limit: [0.31, 'ETH'],
      },
      {
        riskFactor: 'netWorth',
        limit: [0.37, 'ETH'],
      },
      {
        riskFactor: 'freeCollateral',
        limit: [0.2, 'ETH'],
      },
      {
        riskFactor: 'freeCollateral',
        limit: [0.35, 'ETH'],
      },
      {
        riskFactor: 'collateralLiquidationThreshold',
        args: ['ETH'],
        limit: [0.65, 'ETH'],
      },
      {
        riskFactor: 'collateralLiquidationThreshold',
        args: ['ETH'],
        limit: [0.85, 'ETH'],
      },
    ];

    it.each(profiles)('Risk Factors: $name', ({ name, balances, expected }) => {
      const tokens = Registry.getTokenRegistry();
      const p = AccountRiskProfile.from(
        balances.map(([n, t]) =>
          TokenBalance.fromFloat(
            n,
            tokens.getTokenBySymbol(Network.ArbitrumOne, t)
          )
        )
      );

      expected.forEach(({ factor, expected, args = [] }) => {
        const _args = args.map((t: string) =>
          tokens.getTokenBySymbol(Network.ArbitrumOne, t)
        );
        const actual = p.getRiskFactor(factor as keyof RiskFactors, _args);
        const logResults = name.includes('LOG');
        if (Array.isArray(expected)) {
          const e = TokenBalance.fromFloat(
            expected[0],
            tokens.getTokenBySymbol(Network.ArbitrumOne, expected[1])
          );

          if (logResults) {
            console.log(
              `${name} / ${factor}: ${(
                actual as TokenBalance
              ).toDisplayStringWithSymbol(8)} ${e.toDisplayStringWithSymbol(8)}`
            );
          } else {
            expect(actual).toBeApprox(e, 1e-2);
          }
        } else if (expected === null) {
          if (logResults) {
            console.log(
              `${name} / ${factor}: ${
                actual instanceof TokenBalance
                  ? actual.toDisplayStringWithSymbol(8)
                  : actual
              } null`
            );
          } else {
            expect(actual).toBe(null);
          }
        } else {
          if (logResults) {
            console.log(`${name} / ${factor}: ${actual} ${expected}`);
          } else {
            expect(actual).toBeCloseTo(expected, 1);
          }
        }
      });
    });

    it.each(riskFactors)(
      'Deposit / Withdraw Maintain Factor [$riskFactor | $limit]',
      ({ riskFactor, limit, args }) => {
        const tokens = Registry.getTokenRegistry();
        const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
        const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
        const p = AccountRiskProfile.from([
          TokenBalance.fromFloat(1, ETH),
          TokenBalance.fromFloat(-1280, USDC),
        ]);

        const l =
          typeof limit === 'number'
            ? limit
            : TokenBalance.fromFloat(
                limit[0],
                tokens.getTokenBySymbol(Network.ArbitrumOne, limit[1])
              );

        const _args = (
          args
            ? args.map((s) => tokens.getTokenBySymbol(Network.ArbitrumOne, s))
            : undefined
        ) as RiskFactorLimit<RiskFactorKeys>['args'];
        const deposit = p.getDepositRequiredToMaintainRiskFactor(ETH, {
          riskFactor,
          limit: l,
          args: _args,
        });

        if (typeof limit === 'number') {
          expect(
            p.simulate([deposit]).getRiskFactor(riskFactor, _args)
          ).toBeCloseTo(l, 1);
        } else {
          expect(
            p.simulate([deposit]).getRiskFactor(riskFactor, _args)
          ).toBeApprox(l, 0.01);
        }
      }
    );

    it.each(riskFactors.filter(({ riskFactor }) => riskFactor !== 'netWorth'))(
      'Leverage / Deleverage Maintain Factor [$riskFactor | $limit]',
      ({ riskFactor, limit, args }) => {
        const tokens = Registry.getTokenRegistry();
        const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
        const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
        const p = AccountRiskProfile.from([
          TokenBalance.fromFloat(1, ETH),
          TokenBalance.fromFloat(-1280, USDC),
        ]);
        const l =
          typeof limit === 'number'
            ? limit
            : TokenBalance.fromFloat(
                limit[0],
                tokens.getTokenBySymbol(Network.ArbitrumOne, limit[1])
              );

        const _args = (
          args
            ? args.map((s) => tokens.getTokenBySymbol(Network.ArbitrumOne, s))
            : undefined
        ) as RiskFactorLimit<RiskFactorKeys>['args'];
        const { netCollateral, netDebt } =
          p.getDebtAndCollateralMaintainRiskFactor(USDC, ETH, {
            riskFactor,
            limit: l,
            args: _args,
          });

        if (typeof limit === 'number') {
          expect(
            p
              .simulate([netCollateral, netDebt])
              .getRiskFactor(riskFactor, _args)
          ).toBeCloseTo(l, 0);
        } else {
          expect(
            p
              .simulate([netCollateral, netDebt])
              .getRiskFactor(riskFactor, _args)
          ).toBeApprox(l, 0.01);
        }
      }
    );

    it('All Liquidation Prices', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const BTC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'WBTC');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const FRAX = tokens.getTokenBySymbol(Network.ArbitrumOne, 'FRAX');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(0.01, BTC),
        TokenBalance.fromFloat(-1200, USDC),
        TokenBalance.fromFloat(-100, FRAX),
      ]);

      const prices = p.getAllLiquidationPrices({ onlyUnderlyingDebt: false });
      const pairs = prices.map(({ collateral, debt }) => [
        collateral.symbol,
        debt.symbol,
      ]);

      expect(pairs).toEqual([
        ['ETH', 'USDC'],
        ['ETH', 'FRAX'],
      ]);
    });

    it('All Risk Factors', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const BTC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'WBTC');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const FRAX = tokens.getTokenBySymbol(Network.ArbitrumOne, 'FRAX');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(0.01, BTC),
        TokenBalance.fromFloat(-1200, USDC),
        TokenBalance.fromFloat(-100, FRAX),
      ]);
      expect(p.getAllRiskFactors()).toBeDefined();
    });
  }
);
