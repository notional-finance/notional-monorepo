import {
  AccountDefinition,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { CashFlow, xirr } from './xirr';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  Network,
  ONE_MINUTE_MS,
  getNowSeconds,
  groupArrayToMap,
} from '@notional-finance/util';
import { calculateAccruedIncentives } from '@notional-finance/notionable/global/account/incentives';
import initialValue from './initialValue.json';

const contestStart = 1704096000;
// const contestEnd = 1698044400;

export const excludeAccounts = ['0xaa322681ada630b045bbeb2980f56c8440959e36'];

export function calculateAccountIRR(
  account: AccountDefinition,
  snapshotTimestamp: number | undefined
) {
  const riskProfile = new AccountRiskProfile(account.balances, account.network);
  const USD = Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'USD');
  const portfolioNetWorth = riskProfile
    .netWorth()
    .toFiat('USD', snapshotTimestamp);

  const allVaultRisk = VaultAccountRiskProfile.getAllRiskProfiles(account);
  const { totalIncentives } = calculateAccruedIncentives(account);
  const valueOfUnclaimedIncentives = Object.keys(totalIncentives).reduce(
    (acc, k) => {
      return acc.add(totalIncentives[k].current.toFiat('USD'));
    },
    TokenBalance.from(0, USD)
  );
  const valueOfClaimedIncentives = (account.accountHistory || [])
    .filter((a) => contestStart < a.timestamp)
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (h) =>
        h.bundleName === 'Transfer Incentive' ||
        h.bundleName === 'Transfer Secondary Incentive'
    )
    .reduce(
      (acc, h) => acc.add(h.tokenAmount.toFiat('USD', snapshotTimestamp)),
      TokenBalance.from(0, USD)
    );

  const initialAccountValue = TokenBalance.fromFloat(
    ((initialValue[account.address.toLowerCase()] || 0) as number).toFixed(6),
    USD
  );

  const totalNetWorth = allVaultRisk
    .map((v) => v.netWorth().toFiat('USD', snapshotTimestamp))
    .reduce((p, c) => p.add(c), portfolioNetWorth)
    .add(valueOfUnclaimedIncentives)
    .add(valueOfClaimedIncentives);

  const cashFlows: CashFlow[] = (account.accountHistory || [])
    .filter((a) => contestStart < a.timestamp)
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (h) =>
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer' ||
        h.bundleName === 'Withdraw' ||
        h.bundleName === 'Transfer Asset'
    )
    .map((h) => {
      const balance = h.underlyingAmountRealized
        .toUnderlying()
        .toFiat('USD', snapshotTimestamp);

      return {
        date: new Date(h.timestamp * 1000),
        // This should be a positive cash flow
        amount: balance.toFloat(),
        balance,
      };
    });

  const netDeposits = cashFlows
    .reduce((s, { balance }) => s.add(balance), TokenBalance.from(0, USD))
    .neg();

  // NOTE: groups up the cash flow to sum up flows that occur at the same time
  const allFlows = Array.from(
    groupArrayToMap(
      [
        {
          date: new Date(contestStart * 1000),
          amount: initialAccountValue.toFloat(),
          balance: initialAccountValue,
        },
      ]
        .concat(cashFlows)
        .concat({
          date: new Date(getNowSeconds() * 1000),
          amount: totalNetWorth.toFloat(),
          balance: totalNetWorth,
        }),
      (t) => t.date.getTime() / 1000
    ).entries()
  )
    .map(([, flow]) => {
      return flow.reduce(
        (f, c, i) => {
          return i > 0
            ? {
                ...f,
                amount: f.amount + c.amount,
                balance: f.balance.add(c.balance),
              }
            : f;
        },
        {
          date: flow[0].date,
          amount: flow[0].amount,
          balance: flow[0].balance,
        }
      );
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const msSinceFirstDeposit =
    getNowSeconds() * 1000 -
    Math.min(...allFlows.map(({ date }) => date.getTime()));
  const minDeposit = TokenBalance.unit(
    Registry.getTokenRegistry().getTokenBySymbol(Network.All, 'USD')
  );

  let irr = 0;
  if (
    totalNetWorth.toFiat('USD').gt(minDeposit) &&
    msSinceFirstDeposit > 15 * ONE_MINUTE_MS
  ) {
    try {
      irr = xirr(allFlows) * 100;
    } catch (e) {
      console.log(
        'IRR Failed',
        account.address,
        allFlows.map(({ amount, date }) => [amount, date.getTime() / 1000])
      );
    }
  }

  console.log(
    'Factors',
    account.address,
    irr,
    totalNetWorth.toString(),
    netDeposits.toString(),
    totalNetWorth.sub(netDeposits).toString(),
    allFlows
  );

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
