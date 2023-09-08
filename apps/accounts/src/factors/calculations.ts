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

  const allVaultRisk = VaultAccountRiskProfile.getAllRiskProfiles(account);

  const totalNetWorth = allVaultRisk
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
      let balance = h.underlyingAmountRealized
        .toUnderlying()
        .toToken(ETH, 'None', snapshotTimestamp);

      if (h.bundleName === 'Deposit and Transfer') {
        balance = balance.neg();
      }

      return {
        date: new Date(h.timestamp * 1000),
        // This should be a positive cash flow
        amount: balance.toFloat(),
        balance,
      };
    });

  const netDeposits = cashFlows
    .reduce((s, { balance }) => s.add(balance), TokenBalance.from(0, ETH))
    .neg();

  const allFlows = cashFlows.concat({
    date: new Date(getNowSeconds() * 1000),
    amount: totalNetWorth.toFloat(),
    balance: totalNetWorth,
  });

  let irr = 0;
  if (!totalNetWorth.isZero()) {
    try {
      irr = xirr(allFlows);
    } catch (e) {
      console.log(
        'IRR Failed',
        account.address,
        allFlows.map(({ amount, date }) => [amount, date.getTime() / 1000])
      );
    }
  }

  return {
    irr,
    totalNetWorth,
    netDeposits,
    earnings: totalNetWorth.sub(netDeposits),
    portfolioRisk: riskProfile.getAllRiskFactors(),
    vaultRisk: allVaultRisk.reduce(
      (a, v) => Object.assign(a, { [v.vaultAddress]: v.getAllRiskFactors() }),
      {}
    ),
  };
}
