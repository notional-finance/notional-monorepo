import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { AccountRiskProfile } from '../src/account-risk';
import { RiskFactors } from '../src/types';

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
          [-1200, 'USDC'],
        ],
        expected: [
          { factor: 'netWorth', expected: [0.332, 'ETH'] },
          { factor: 'freeCollateral', expected: [0.0827, 'ETH'] },
          { factor: 'loanToValue', expected: 66.7 },
          { factor: 'collateralRatio', expected: 149.87 },
          { factor: 'healthFactor', expected: 0.248 },
          {
            factor: 'collateralLiquidationThreshold',
            args: ['ETH'],
            expected: [0.897, 'ETH'],
          },
          {
            factor: 'liquidationPrice',
            args: ['USDC', 'ETH'],
            expected: [1614.81, 'USDC'],
          },
        ],
      },
      // TODO: test net local
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

    it('Deposit Maintain Factor [FC]', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(-1200, USDC),
      ]);

      const limit = TokenBalance.fromFloat(0.1, ETH);
      const deposit = p.getDepositRequiredToMaintainRiskFactor(ETH, {
        riskFactor: 'freeCollateral',
        limit,
      });

      expect(p.simulate([deposit]).freeCollateral()).toBeApprox(limit, 0.01);
    });

    it('Deposit Maintain Factor [NW]', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(-1200, USDC),
      ]);

      const limit = TokenBalance.fromFloat(0.4, ETH);
      const deposit = p.getDepositRequiredToMaintainRiskFactor(ETH, {
        riskFactor: 'netWorth',
        limit,
      });

      expect(p.simulate([deposit]).netWorth()).toBeApprox(limit, 0.01);
    });

    it('Withdraw Maintain Factor [NW]', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(-1200, USDC),
      ]);

      const limit = TokenBalance.fromFloat(0.2, ETH);
      const withdraw = p.getWithdrawRequiredToMaintainRiskFactor(ETH, {
        riskFactor: 'netWorth',
        limit,
      });

      expect(p.simulate([withdraw]).netWorth()).toBeApprox(limit, 0.01);
    });

    it('Deleverage Maintain Factor [NW]', () => {
      const tokens = Registry.getTokenRegistry();
      const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
      const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
      const p = AccountRiskProfile.from([
        TokenBalance.fromFloat(1, ETH),
        TokenBalance.fromFloat(-1200, USDC),
      ]);

      const limit = TokenBalance.fromFloat(0.3, ETH);
      const { debtRepaid, collateralSold } = p.getDeleverageMaintainRiskFactor(
        ETH,
        USDC,
        {
          riskFactor: 'netWorth',
          limit,
        }
      );

      expect(p.simulate([debtRepaid, collateralSold]).netWorth()).toBeApprox(
        limit,
        0.01
      );
    });

    // it.only('Deposit Maintain Factor [LTV]', () => {
    //   const tokens = Registry.getTokenRegistry();
    //   const ETH = tokens.getTokenBySymbol(Network.ArbitrumOne, 'ETH');
    //   const USDC = tokens.getTokenBySymbol(Network.ArbitrumOne, 'USDC');
    //   const p = AccountRiskProfile.from([
    //     TokenBalance.fromFloat(1, ETH),
    //     TokenBalance.fromFloat(-1200, USDC),
    //   ]);

    //   const limit = 60;
    //   const deposit = p.getDepositRequiredToMaintainRiskFactor(ETH, {
    //     riskFactor: 'loanToValue',
    //     limit,
    //   });

    //   expect(p.simulate([deposit]).loanToValue()).toBeApprox(limit, 0.01);
    // });

    // it.each(profiles)('Withdraw Maintain Factor', ({ balances, expected }) => {
    // it.each(profiles)('Deleverage Maintain Factor', ({ balances, expected }) => {

    // it.each(profiles)('Borrow Capacity', ({ balances, expected }) => {
  }
);
