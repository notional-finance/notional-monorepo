import { AccountDefinition, FiatKeys } from '@notional-finance/core-entities';
import { CashFlow, xirr } from './xirr';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { getNowSeconds } from '@notional-finance/util';

// output is the IRR
export function calculateAccountIRR(
  account: AccountDefinition,
  baseCurrency: FiatKeys
) {
  const portfolioNetWorth = AccountRiskProfile.from(account.balances)
    .netWorth()
    .toFiat(baseCurrency);
  const totalNetWorth = VaultAccountRiskProfile.getAllRiskProfiles(
    account.balances
  )
    .map((v) => v.netWorth().toFiat(baseCurrency))
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
            .toFiat(baseCurrency)
            .toFloat(),
        };
      } else {
        return {
          date: new Date(h.timestamp * 1000),
          // Withdraws must be a negative cash flow
          amount: h.underlyingAmountRealized
            .abs()
            .neg()
            .toFiat(baseCurrency)
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
