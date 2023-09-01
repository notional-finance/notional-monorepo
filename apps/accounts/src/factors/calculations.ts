import {
  AccountDefinition,
  TokenBalance,
} from '@notional-finance/core-entities';
import { CashFlow, xirr } from './xirr';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { getNowSeconds } from '@notional-finance/util';

export function calculateAccountIRR(
  account: AccountDefinition,
  snapshotTimestamp: number | undefined
) {
  const riskProfile = new AccountRiskProfile(account.balances, account.network);
  const ETH = riskProfile.denom(riskProfile.defaultSymbol);
  const portfolioNetWorth = riskProfile
    .netWorth()
    .toToken(ETH, 'None', snapshotTimestamp);
  const totalNetWorth = VaultAccountRiskProfile.getAllRiskProfiles(
    account.balances
  )
    .map((v) => v.netWorth().toToken(ETH, 'None', snapshotTimestamp))
    .reduce((p, c) => p.add(c), portfolioNetWorth);

  const cashFlows: CashFlow[] = (account.accountHistory || [])
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (h) =>
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer' ||
        h.bundleName === 'Withdraw'
    )
    .map((h) => {
      let balance: TokenBalance;
      if (
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer'
      ) {
        balance = h.underlyingAmountRealized
          .abs()
          .toToken(ETH, 'None', snapshotTimestamp);
      } else {
        balance = h.underlyingAmountRealized
          .abs()
          .neg()
          .toToken(ETH, 'None', snapshotTimestamp);
      }

      return {
        date: new Date(h.timestamp * 1000),
        // This should be a positive cash flow
        amount: balance.toFloat(),
        balance,
      };
    });

  const netDeposits = cashFlows.reduce(
    (s, { balance }) => s.add(balance),
    TokenBalance.from(0, ETH)
  );

  let irr = 0;
  try {
    irr = xirr(
      cashFlows.concat({
        date: new Date(getNowSeconds() * 1000),
        amount: totalNetWorth.toFloat(),
        balance: totalNetWorth,
      })
    );
  } catch (e) {
    console.log('IRR Failed', account.address);
  }

  return {
    irr,
    totalNetWorth,
    netDeposits,
    earnings: totalNetWorth.sub(netDeposits),
  };
}
