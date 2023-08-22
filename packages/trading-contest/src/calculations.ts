import { AccountDefinition } from '@notional-finance/core-entities';
import { CashFlow, xirr } from './xirr';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { getNowSeconds } from '@notional-finance/util';

export function calculateAccountIRR(
  account: AccountDefinition,
  timestamp: number
) {
  const riskProfile = new AccountRiskProfile(account.balances, account.network);
  const ETH = riskProfile.denom(riskProfile.defaultSymbol);
  const portfolioNetWorth = riskProfile
    .netWorth()
    .toToken(ETH, 'None', timestamp);
  const totalNetWorth = VaultAccountRiskProfile.getAllRiskProfiles(
    account.balances
  )
    .map((v) => v.netWorth().toToken(ETH, 'None', timestamp))
    .reduce((p, c) => p.add(c), portfolioNetWorth);

  const cashFlows: CashFlow[] = (account.accountHistory || [])
    .filter(
      (h) =>
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer' ||
        h.bundleName === 'Withdraw'
    )
    .map((h) => {
      if (
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer'
      ) {
        return {
          date: new Date(h.timestamp * 1000),
          // This should be a positive cash flow
          amount: h.underlyingAmountRealized
            .abs()
            .toToken(ETH, 'None', timestamp)
            .toFloat(),
        };
      } else {
        return {
          date: new Date(h.timestamp * 1000),
          // Withdraws must be a negative cash flow
          amount: h.underlyingAmountRealized
            .abs()
            .neg()
            .toToken(ETH, 'None', timestamp)
            .toFloat(),
        };
      }
    })
    .concat({
      date: new Date(getNowSeconds() * 1000),
      amount: totalNetWorth.toFloat(),
    });

  return xirr(cashFlows);
}
