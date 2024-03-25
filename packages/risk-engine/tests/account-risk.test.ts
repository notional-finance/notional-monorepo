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
    factor: keyof RiskFactors | 'maxWithdraw';
    args?: string[];
    expected?: [number, string] | number | null;
  }[];
}

describe.withForkAndRegistry(
  {
    network: Network.arbitrum,
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
            factor: 'assetLiquidationThreshold',
            args: ['ETH'],
            expected: null,
          },
          {
            factor: 'maxWithdraw',
            args: ['pETH'],
            expected: [1, 'pETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['nETH'],
            expected: [0, 'nETH'],
          },
        ],
      },
      // ETH/USD 1,893.67000000
      // USDC w/ buffer: 1395.2
      // USDC in ETH: -0.74
      // ETH w/ Haircut: 0.81
      // Total FC: 0.07
      {
        name: 'ETH / USDC',
        balances: [
          [1, 'ETH'],
          [-1280, 'USDC'],
        ],
        expected: [
          { factor: 'netWorth' },
          { factor: 'freeCollateral' },
          { factor: 'loanToValue' },
          { factor: 'collateralRatio' },
          { factor: 'healthFactor' },
          { factor: 'leverageRatio' },
          {
            factor: 'assetLiquidationThreshold',
            args: ['ETH'],
          },
          {
            factor: 'assetLiquidationThreshold',
            args: ['USDC'],
          },
          {
            factor: 'liquidationPrice',
            args: ['USDC', 'ETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['pETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['pUSDC'],
            expected: [0, 'pUSDC'],
          },
        ],
      },
      {
        name: 'Net Prime Cash',
        balances: [
          [-5, 'pdETH'],
          [10, 'pETH'],
        ],
        expected: [
          { factor: 'netWorth', expected: [5, 'ETH'] },
          { factor: 'freeCollateral', expected: [4.05, 'ETH'] },
          { factor: 'loanToValue', expected: 0 },
          { factor: 'collateralRatio', expected: null },
          { factor: 'healthFactor', expected: null },
          {
            factor: 'maxWithdraw',
            args: ['pETH'],
            expected: [5, 'pETH'],
          },
        ],
      },
      {
        name: 'Leveraged nToken',
        balances: [
          [-8, 'pdETH'],
          [10, 'nETH'],
        ],
        expected: [
          { factor: 'netWorth' },
          { factor: 'freeCollateral' },
          { factor: 'loanToValue' },
          { factor: 'collateralRatio' },
          { factor: 'healthFactor' },
          { factor: 'leverageRatio' },
          {
            factor: 'assetLiquidationThreshold',
            args: ['nETH'],
            expected: null,
          },
          {
            factor: 'assetLiquidationThreshold',
            args: ['ETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['pETH'],
            expected: [0, 'pETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['nETH'],
          },
        ],
      },
      {
        name: 'Leveraged nToken w/ Liquidation Risk',
        balances: [
          [-8.5, 'pdETH'],
          [10, 'nETH'],
        ],
        expected: [
          {
            factor: 'assetLiquidationThreshold',
            args: ['nETH'],
          },
          {
            factor: 'maxWithdraw',
            args: ['nETH'],
          },
        ],
      },
      {
        name: 'Leveraged fCash Spread',
        balances: [
          [16, 'fUSDC:fixed@1702944000'],
          [-15.8, 'pdUSDC'],
        ],
        expected: [
          { factor: 'freeCollateral' },
          { factor: 'healthFactor' },
          {
            factor: 'assetLiquidationThreshold',
            args: ['pdUSDC'],
            expected: null,
          },
          {
            factor: 'assetLiquidationThreshold',
            args: ['fUSDC:fixed@1702944000'],
          },
        ],
      },
      {
        name: 'Zero Haircut Collateral',
        balances: [
          [-100, 'pdUSDC'],
          [110, 'pFRAX'],
        ],
        expected: [
          { factor: 'freeCollateral' },
          {
            factor: 'assetLiquidationThreshold',
            args: ['FRAX'],
            expected: null,
          },
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
        riskFactor: 'leverageRatio',
        limit: 3,
      },
      {
        riskFactor: 'leverageRatio',
        limit: 5,
      },
      {
        riskFactor: 'freeCollateral',
        limit: [0, 'ETH'],
      },
      {
        riskFactor: 'freeCollateral',
        limit: [0.2, 'ETH'],
      },
      {
        riskFactor: 'freeCollateral',
        limit: [0.25, 'ETH'],
      },
      {
        riskFactor: 'assetLiquidationThreshold',
        args: ['ETH'],
        limit: [0.75, 'ETH'],
      },
      {
        riskFactor: 'assetLiquidationThreshold',
        args: ['ETH'],
        limit: [0.85, 'ETH'],
      },
    ];

    it.each(profiles)('Risk Factors: $name', ({ balances, expected }) => {
      const tokens = Registry.getTokenRegistry();
      const p = AccountRiskProfile.from(
        balances.map(([n, t]) =>
          TokenBalance.fromFloat(
            n,
            tokens.getTokenBySymbol(Network.arbitrum, t)
          )
        )
      );

      expected.forEach(({ factor, expected, args = [] }) => {
        const _args = args.map((t: string) =>
          tokens.getTokenBySymbol(Network.arbitrum, t)
        );
        const actual =
          factor === 'maxWithdraw'
            ? p.maxWithdraw(_args[0])
            : p.getRiskFactor(factor as keyof RiskFactors, _args);

        if (expected === null) {
          expect(actual).toBe(null);
        } else if (expected === undefined) {
          expect(actual).toMatchSnapshot();
        } else if (Array.isArray(expected)) {
          const e = TokenBalance.fromFloat(
            expected[0],
            tokens.getTokenBySymbol(Network.arbitrum, expected[1])
          );
          expect(actual).toBeApprox(e, 1e-2);
        } else {
          expect(actual).toBeCloseTo(expected, 1);
        }
      });
    });

    it.each(riskFactors)(
      'Deposit / Withdraw Maintain Factor [$riskFactor | $limit]',
      ({ riskFactor, limit, args }) => {
        const tokens = Registry.getTokenRegistry();
        const ETH = tokens.getTokenBySymbol(Network.arbitrum, 'ETH');
        const USDC = tokens.getTokenBySymbol(Network.arbitrum, 'USDC');
        const p = AccountRiskProfile.from([
          TokenBalance.fromFloat(1, ETH),
          TokenBalance.fromFloat(-1280, USDC),
        ]);

        const l =
          typeof limit === 'number'
            ? limit
            : TokenBalance.fromFloat(
                limit[0],
                tokens.getTokenBySymbol(Network.arbitrum, limit[1])
              );

        const _args = (
          args
            ? args.map((s) => tokens.getTokenBySymbol(Network.arbitrum, s))
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
          ).toBeApprox(l, 0.01, 0.00001);
        }
      }
    );

    it('All Liquidation Prices', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.arbitrum, 'ETH');
      const BTC = tokens.getTokenBySymbol(Network.arbitrum, 'WBTC');
      const USDC = tokens.getTokenBySymbol(Network.arbitrum, 'USDC');
      const FRAX = tokens.getTokenBySymbol(Network.arbitrum, 'FRAX');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(0.01, BTC),
        TokenBalance.fromFloat(-1200, USDC),
        TokenBalance.fromFloat(-100, FRAX),
      ]);

      const prices = p.getAllLiquidationPrices();
      const assets = prices.map(({ asset }) => asset.symbol);

      expect(assets).toEqual(['ETH', 'WBTC', 'USDC', 'FRAX']);
    });

    it('All Risk Factors', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.arbitrum, 'ETH');
      const BTC = tokens.getTokenBySymbol(Network.arbitrum, 'WBTC');
      const USDC = tokens.getTokenBySymbol(Network.arbitrum, 'USDC');
      const FRAX = tokens.getTokenBySymbol(Network.arbitrum, 'FRAX');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(0.01, BTC),
        TokenBalance.fromFloat(-1200, USDC),
        TokenBalance.fromFloat(-100, FRAX),
      ]);
      expect(p.getAllRiskFactors()).toBeDefined();
    });

    describe('Settlement', () => {
      it('Settles Negative fCash to Prime Cash', () => {
        const tokens = Registry.getTokenRegistry();
        const p = AccountRiskProfile.from([
          TokenBalance.fromFloat(
            -1,
            tokens.getTokenBySymbol(
              Network.arbitrum,
              'fETH:fixed@1687392000'
            )
          ),
          TokenBalance.fromFloat(
            -1,
            tokens.getTokenBySymbol(
              Network.arbitrum,
              'fETH:fixed@1695168000'
            )
          ),
        ]);

        expect(p.settledBalances.length).toBe(1);
        expect(p.balances.length).toBe(2);
        expect(p.balances[0].tokenType).toBe('PrimeCash');
        expect(p.balances[0].toUnderlying().toFloat()).toBeLessThan(-1);
      });

      it('Settles Positive fCash to Prime Cash', () => {
        const tokens = Registry.getTokenRegistry();
        const p = AccountRiskProfile.from([
          TokenBalance.fromFloat(
            1,
            tokens.getTokenBySymbol(
              Network.arbitrum,
              'fETH:fixed@1687392000'
            )
          ),
        ]);

        expect(p.settledBalances.length).toBe(1);
        expect(p.balances.length).toBe(1);
        expect(p.balances[0].tokenType).toBe('PrimeCash');
        expect(p.balances[0].toUnderlying().toFloat()).toBeGreaterThan(1);
      });
    });
  }
);
