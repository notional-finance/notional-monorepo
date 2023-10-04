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

const contestStart = 1695625200;
// const contestEnd = 1698044400;

export const excludeAccounts = [
  '0x7f6f138c955e5b1017a12e4567d90c62abb00074',
  '0x424da3eFC0dC677be66aFE1967Fb631fAbb86799',
  '0x7d7935edd4b6cdb5f34b0e1cceaf85a3c4a11254',
  '0xcece1920d4dbb96baf88705ce0a6eb3203ed2eb1',
  '0x46a6f15b5a5cd0f1c93f87c4af0a0586fc9d07e8',
  '0xdf5a26554ecb1a11614dbb34fc156d0adfc95c07',
  '0xbc58c8ffbe953d3b539b6f61185c2c8575cccde6',
  '0xbc8a4df7cee98f390827990afef987e486f9699f',
  '0x25f45c5bf1e703667b1b2319c770d96fdc9b9cd8',
  '0xe710f634a11e5ab17a193d5d7652c6f7d4b257f6',
  '0xe6fb62c2218fd9e3c948f0549a2959b509a293c8',
  '0x650f94282ee5e8fffe7336eb6a5e30dcfa61201c',
  '0xd74e7325dFab7D7D1ecbf22e6E6874061C50f243',
  '0xbf778fc19d0b55575711b6339a3680d07352b221',
];

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
  const unclaimedNOTE = (
    account.noteClaim?.currentNOTE ||
    TokenBalance.fromSymbol(0, 'NOTE', account.network)
  ).toFiat('ETH');

  const totalNetWorth = allVaultRisk
    .map((v) => v.netWorth().toToken(ETH, 'None', snapshotTimestamp))
    .reduce((p, c) => p.add(c), portfolioNetWorth)
    .add(TokenBalance.from(unclaimedNOTE.n, ETH));

  const cashFlows: CashFlow[] = (account.accountHistory || [])
    .filter((a) => contestStart < a.timestamp)
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (h) =>
        h.bundleName === 'Deposit' ||
        h.bundleName === 'Deposit and Transfer' ||
        h.bundleName === 'Withdraw' ||
        h.bundleName === 'Transfer Incentive' ||
        h.bundleName === 'Transfer Asset'
    )
    .map((h) => {
      if (h.bundleName === 'Transfer Incentive') {
        // Converts the value of NOTE to ETH at the given snapshot time
        const b = h.tokenAmount.toFiat('ETH', snapshotTimestamp).toFloat();
        const balance = TokenBalance.fromFloat(b.toFixed(18), ETH);

        return {
          date: new Date(h.timestamp * 1000),
          // This should be a positive cash flow
          amount: balance.toFloat(),
          balance,
        };
      }

      const balance = h.underlyingAmountRealized
        .toUnderlying()
        .toToken(ETH, 'None', snapshotTimestamp);

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

  // NOTE: groups up the cash flow to sum up flows that occur at the same time
  const allFlows = Array.from(
    groupArrayToMap(
      cashFlows.concat({
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
