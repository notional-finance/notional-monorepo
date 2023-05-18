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
          [-1500, 'USDC'],
        ],
        expected: [
          // { factor: 'netWorth', expected: [0.332, 'ETH'] },
          // { factor: 'freeCollateral', expected: [0.507, 'ETH'] },
          // { factor: 'loanToValue', expected: 27.8 },
          // { factor: 'collateralRatio', expected: 359.7 },
          // { factor: 'healthFactor', expected: 267.3 },
          {
            factor: 'collateralLiquidationThreshold',
            args: ['ETH'],
            expected: null,
          },
        ],
      },
    ];

    it.each(profiles)('Risk Factors: $name', ({ balances, expected }) => {
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
        const actual = p.getRiskFactor(factor as keyof RiskFactors, args);
        console.log(factor, expected);
        if (Array.isArray(expected)) {
          expect(actual).toBeApprox(
            TokenBalance.fromFloat(
              expected[0],
              tokens.getTokenBySymbol(Network.ArbitrumOne, expected[1])
            ),
            1e-2
          );
        } else if (expected === null) {
          expect(actual).toBe(null);
        } else {
          expect(actual).toBeCloseTo(expected, 1);
        }
      });
    });

    // it.each(profiles)('Deposit Maintain Factor', ({ balances, expected }) => {
    // it.each(profiles)('Withdraw Maintain Factor', ({ balances, expected }) => {
    // it.each(profiles)('Deleverage Maintain Factor', ({ balances, expected }) => {

    // it.each(profiles)('Borrow Capacity', ({ balances, expected }) => {
  }
);
